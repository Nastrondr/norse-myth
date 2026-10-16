// 本地文献数据库引擎（LocalDB）
//
// 设计目标：集中管理项目中的大量文献文本，支持整体替换与运行时更新。
// - 种子数据：src/data/*.js 是文献的"出厂版本"，直接编辑文件即可替换
// - 本地修改：写入自动持久化到 uni storage（H5 下为 localStorage），刷新不丢失
// - 持久化策略（v2）：按集合分片（norse_local_db_v2::<集合名>），只存相对种子的
//   diff（补丁 / 新增 / 删除 / 整体替换），写入一个集合只重写一个 key，
//   避免"改一个字重写整库"的写放大；种子更新（内容哈希变化）后 diff 自动失效
// - 查询安全：查询结果均为深拷贝，页面修改返回值不会污染数据库内部状态
// - 环境兼容：无 uni 全局对象时（如单元测试）自动降级为纯内存模式
// - v1 迁移：旧版单 key 整库存档（norse_local_db_v1）在注册时自动转为 v2 分片

import { storage } from '@/storage'

const DB_VERSION = 2
const SHARD_PREFIX = 'norse_local_db_v2::'
const LEGACY_BLOB_KEY = 'norse_local_db_v1'

function deepClone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value))
}

// djb2 内容哈希 + 长度校验，用于判断种子数据是否被更新
function hashContent(value) {
  const str = JSON.stringify(value) || ''
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0
  }
  return hash.toString(36) + '-' + str.length.toString(36)
}

// 存取统一走 storage 门面（uni / idb 后端可切换，无环境时内存模式）
function readKey(key) {
  const raw = storage.get(key)
  return raw && typeof raw === 'object' ? raw : null
}

function writeKey(key, payload) {
  storage.set(key, payload)
}

function removeKey(key) {
  storage.remove(key)
}

function isQueryMatch(doc, query) {
  return Object.keys(query).every(key => doc[key] === query[key])
}

function toPredicate(queryOrFn) {
  return typeof queryOrFn === 'function'
    ? queryOrFn
    : doc => isQueryMatch(doc, queryOrFn)
}

let idCounter = 0
function generateId() {
  idCounter += 1
  return 'id-' + Date.now().toString(36) + '-' + idCounter.toString(36)
}

// ===== 相对种子的 diff（ops）=====
// { full: 数组/对象 | null, patches: { id: patch }, inserts: [doc], removed: [id] }
// full 非空表示整体替换，其余字段清空。

function emptyOps() {
  return { full: null, patches: {}, inserts: [], removed: [] }
}

function isValidOps(ops, type) {
  if (!ops || !isQueryMatchSafe(ops)) return false
  if (type === 'collection') {
    return Array.isArray(ops.inserts) && Array.isArray(ops.removed) && !!ops.patches && (ops.full === null || Array.isArray(ops.full))
  }
  return ops.full === null || (ops.full && typeof ops.full === 'object' && !Array.isArray(ops.full))
}

function isQueryMatchSafe(ops) {
  return !!ops && typeof ops === 'object'
}

// 将 ops 重放到种子上，得到当前数据
function applyOps(seed, ops, type) {
  if (ops.full !== null && ops.full !== undefined) {
    return deepClone(ops.full)
  }
  let data = deepClone(seed)
  if (type !== 'collection') return data
  if (ops.removed.length) {
    const removed = new Set(ops.removed)
    data = data.filter(doc => !removed.has(doc.id))
  }
  ops.inserts.forEach(doc => {
    if (!data.some(item => item.id === doc.id)) data.push(deepClone(doc))
  })
  Object.keys(ops.patches).forEach(id => {
    const index = data.findIndex(doc => doc.id === id)
    if (index >= 0) {
      data[index] = Object.assign({}, data[index], deepClone(ops.patches[id]))
    }
  })
  return data
}

// ===== v1 单 key 整库存档的懒迁移 =====

let legacyBlobCache

function loadLegacyBlob() {
  // 仅缓存"找到"的结果；未找到时不缓存，避免极早期注册把后续才出现的 v1 存档挡掉
  if (legacyBlobCache === undefined) {
    const raw = readKey(LEGACY_BLOB_KEY)
    if (raw && raw.version === 1 && raw.collections && typeof raw.collections === 'object') {
      legacyBlobCache = raw.collections
    }
  }
  return legacyBlobCache || null
}

// 取走并清理 v1 中该集合的存档；返回 { seedHash, data } 或 null
function takeLegacyEntry(name) {
  const blob = loadLegacyBlob()
  if (!blob || !blob[name]) return null
  const entry = blob[name]
  delete blob[name]
  if (Object.keys(blob).length) {
    writeKey(LEGACY_BLOB_KEY, { version: 1, updatedAt: Date.now(), collections: blob })
  } else {
    removeKey(LEGACY_BLOB_KEY)
    legacyBlobCache = null
  }
  return entry
}

export function createLocalDB() {
  // name -> { type, seed, seedHash, data, updatedAt, ops, pending }
  // pending：模块注册时 uni 全局可能尚未注入（uni-app H5 模块加载早于运行时），
  // 此时先挂起，首次访问（查询/写入/导出）再从 storage 补偿加载分片。
  const collections = new Map()

  // 从 storage 加载该集合的持久化 diff（v2 分片优先，其次 v1 整库迁移）
  function loadOps(name, col) {
    let ops = null
    const shard = readKey(SHARD_PREFIX + name)
    if (shard && shard.v === DB_VERSION && shard.seedHash === col.seedHash && isValidOps(shard.ops, col.type)) {
      ops = shard.ops
    }

    // 无 v2 分片时尝试迁移 v1 整库存档（种子未变化才沿用，否则按新种子处理）
    let fromLegacy = false
    if (!ops) {
      const legacy = takeLegacyEntry(name)
      if (legacy && legacy.seedHash === col.seedHash) {
        const legacyData = legacy.data
        const dataValid = col.type === 'collection'
          ? Array.isArray(legacyData)
          : legacyData && typeof legacyData === 'object' && !Array.isArray(legacyData)
        if (dataValid) {
          ops = emptyOps()
          ops.full = legacyData
          fromLegacy = true
        }
      }
    }

    const useOps = ops || emptyOps()
    col.ops = useOps
    col.data = applyOps(col.seed, useOps, col.type)
    col.updatedAt = Date.now()
    if (fromLegacy) persistCollection(name)
  }

  function hydrate(col, name) {
    if (!col.pending) return
    col.pending = false
    loadOps(name, col)
  }

  function getCol(name) {
    const col = collections.get(name)
    if (!col) {
      throw new Error('[localDB] 未注册的集合: ' + name + '，可用集合: ' + [...collections.keys()].join(', '))
    }
    hydrate(col, name)
    return col
  }

  // 全量遍历前的补偿加载（exportJSON / stats / reset 全量）
  function hydrateAll() {
    collections.forEach((col, name) => hydrate(col, name))
  }

  function getArrayCol(name) {
    const col = getCol(name)
    if (col.type !== 'collection') {
      throw new Error('[localDB] ' + name + ' 是文档型集合，请使用 getDoc/saveDoc')
    }
    return col
  }

  function persistCollection(name) {
    const col = getCol(name)
    writeKey(SHARD_PREFIX + name, {
      v: DB_VERSION,
      seedHash: col.seedHash,
      ops: col.ops,
      updatedAt: Date.now()
    })
  }

  // 记录一次对文档的补丁，同步维护 ops
  function recordPatch(col, id, patch) {
    const insertIndex = col.ops.inserts.findIndex(doc => doc.id === id)
    if (insertIndex >= 0) {
      col.ops.inserts[insertIndex] = Object.assign({}, col.ops.inserts[insertIndex], deepClone(patch))
      return
    }
    col.ops.patches[id] = Object.assign({}, col.ops.patches[id] || {}, deepClone(patch))
  }

  function register(name, type, seed) {
    if (collections.has(name)) {
      throw new Error('[localDB] 集合名重复: ' + name)
    }
    const col = {
      type,
      seed: deepClone(seed),
      seedHash: hashContent(seed),
      data: null,
      updatedAt: Date.now(),
      ops: emptyOps(),
      pending: true
    }
    collections.set(name, col)
    // 立即加载（storage 门面负责环境兼容：uni/内存模式直接读，无数据则为种子）
    hydrate(col, name)
  }

  const db = {
    /** 注册数组集合（每条记录需有唯一 id 字段） */
    defineCollection(name, seed = []) {
      if (!Array.isArray(seed)) {
        throw new Error('[localDB] 集合 ' + name + ' 的种子必须是数组')
      }
      register(name, 'collection', seed)
      return db
    },

    /** 注册单文档集合（用于 worldTimelines、dailyPicks 等对象型数据） */
    defineDoc(name, seed = {}) {
      if (!seed || typeof seed !== 'object' || Array.isArray(seed)) {
        throw new Error('[localDB] 文档 ' + name + ' 的种子必须是对象')
      }
      register(name, 'doc', seed)
      return db
    },

    collectionNames() {
      return [...collections.keys()]
    },

    // ===== 查询（均返回深拷贝） =====

    /** 获取集合全部记录 */
    findAll(name) {
      return deepClone(getArrayCol(name).data)
    },

    /** 按 id 查找，未找到返回 null */
    findById(name, id) {
      const found = getArrayCol(name).data.find(doc => doc.id === id)
      return found ? deepClone(found) : null
    },

    /** 条件查询：支持对象（字段相等匹配）或谓词函数 */
    find(name, queryOrFn) {
      const predicate = toPredicate(queryOrFn)
      return deepClone(getArrayCol(name).data.filter(predicate))
    },

    /** 条件查询单条：支持对象（字段相等匹配）或谓词函数 */
    findOne(name, queryOrFn) {
      const predicate = toPredicate(queryOrFn)
      const found = getArrayCol(name).data.find(predicate)
      return found ? deepClone(found) : null
    },

    count(name) {
      return getArrayCol(name).data.length
    },

    /** 获取文档型集合内容 */
    getDoc(name) {
      const col = getCol(name)
      if (col.type !== 'doc') {
        throw new Error('[localDB] ' + name + ' 是数组集合，请使用 findAll/findById')
      }
      return deepClone(col.data)
    },

    // ===== 写入（自动持久化，只重写该集合的分片 key） =====

    /** 新增记录；缺少 id 时自动生成 */
    insert(name, doc) {
      const col = getArrayCol(name)
      if (!doc || typeof doc !== 'object') {
        throw new Error('[localDB] insert 需要对象参数')
      }
      const record = deepClone(doc)
      if (!record.id) record.id = generateId()
      if (col.data.some(item => item.id === record.id)) {
        throw new Error('[localDB] 集合 ' + name + ' 已存在 id: ' + record.id)
      }
      col.data.push(record)
      // 若此前删除过同 id 的种子记录，先撤销删除标记
      const removedIndex = col.ops.removed.indexOf(record.id)
      if (removedIndex >= 0) {
        col.ops.removed.splice(removedIndex, 1)
        delete col.ops.patches[record.id]
      }
      col.ops.inserts.push(deepClone(record))
      col.updatedAt = Date.now()
      persistCollection(name)
      return deepClone(record)
    },

    /** 批量新增 */
    insertMany(name, docs) {
      return docs.map(doc => db.insert(name, doc))
    },

    /** 按 id 局部更新（浅合并），未找到返回 null */
    update(name, id, patch) {
      const col = getArrayCol(name)
      if (patch && patch.id !== undefined && patch.id !== id) {
        throw new Error('[localDB] 不允许通过 update 修改 id')
      }
      const index = col.data.findIndex(doc => doc.id === id)
      if (index < 0) return null
      col.data[index] = Object.assign({}, col.data[index], deepClone(patch))
      recordPatch(col, id, patch || {})
      col.updatedAt = Date.now()
      persistCollection(name)
      return deepClone(col.data[index])
    },

    /** 按条件批量局部更新，返回更新条数 */
    updateWhere(name, queryOrFn, patch) {
      const col = getArrayCol(name)
      const predicate = toPredicate(queryOrFn)
      let updated = 0
      col.data.forEach((doc, index) => {
        if (predicate(doc)) {
          col.data[index] = Object.assign({}, doc, deepClone(patch))
          recordPatch(col, doc.id, patch || {})
          updated += 1
        }
      })
      if (updated > 0) {
        col.updatedAt = Date.now()
        persistCollection(name)
      }
      return updated
    },

    /** 按 id 删除，返回是否删除成功 */
    remove(name, id) {
      const col = getArrayCol(name)
      const index = col.data.findIndex(doc => doc.id === id)
      if (index < 0) return false
      col.data.splice(index, 1)
      const insertIndex = col.ops.inserts.findIndex(doc => doc.id === id)
      if (insertIndex >= 0) {
        col.ops.inserts.splice(insertIndex, 1)
      } else if (col.seed.some(doc => doc.id === id)) {
        col.ops.removed.push(id)
      }
      delete col.ops.patches[id]
      col.updatedAt = Date.now()
      persistCollection(name)
      return true
    },

    /** 整体替换集合内容（批量替换文献文本的主要方式），返回新记录数 */
    replaceCollection(name, docs) {
      if (!Array.isArray(docs)) {
        throw new Error('[localDB] replaceCollection 需要数组参数')
      }
      const ids = new Set()
      docs.forEach(doc => {
        if (!doc || typeof doc !== 'object' || !doc.id) {
          throw new Error('[localDB] 集合 ' + name + ' 中存在缺少 id 的记录')
        }
        if (ids.has(doc.id)) {
          throw new Error('[localDB] 集合 ' + name + ' 中 id 重复: ' + doc.id)
        }
        ids.add(doc.id)
      })
      const col = getArrayCol(name)
      col.data = deepClone(docs)
      col.ops = emptyOps()
      col.ops.full = deepClone(docs)
      col.updatedAt = Date.now()
      persistCollection(name)
      return col.data.length
    },

    /** 保存文档型集合（整体替换） */
    saveDoc(name, doc) {
      const col = getCol(name)
      if (col.type !== 'doc') {
        throw new Error('[localDB] ' + name + ' 是数组集合，请使用 replaceCollection')
      }
      if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
        throw new Error('[localDB] saveDoc 需要对象参数')
      }
      col.data = deepClone(doc)
      col.ops = emptyOps()
      col.ops.full = deepClone(doc)
      col.updatedAt = Date.now()
      persistCollection(name)
      return deepClone(col.data)
    },

    // ===== 维护 =====

    /** 恢复种子数据；传入集合名恢复单个集合，不传恢复全部 */
    reset(name) {
      if (name !== undefined) {
        const col = getCol(name)
        col.data = deepClone(col.seed)
        col.ops = emptyOps()
        col.updatedAt = Date.now()
        persistCollection(name)
      } else {
        hydrateAll()
        collections.forEach((col, colName) => {
          col.data = deepClone(col.seed)
          col.ops = emptyOps()
          col.updatedAt = Date.now()
          persistCollection(colName)
        })
      }
      return true
    },

    /** 导出整个数据库为 JSON 字符串（备份 / 迁移用） */
    exportJSON() {
      hydrateAll()
      const dump = {}
      collections.forEach((col, name) => {
        dump[name] = col.data
      })
      return JSON.stringify(
        { version: DB_VERSION, exportedAt: new Date().toISOString(), collections: dump },
        null,
        2
      )
    },

    /**
     * 从 exportJSON 的内容（字符串或对象）导入，整体替换对应集合
     * 返回 { applied, ignored }
     */
    importJSON(input) {
      const payload = typeof input === 'string' ? JSON.parse(input) : input
      if (!payload || typeof payload !== 'object' || !payload.collections) {
        throw new Error('[localDB] 导入内容格式不正确，需要 { collections: {...} } 结构')
      }
      const applied = []
      const ignored = []
      Object.keys(payload.collections).forEach(name => {
        const col = collections.get(name)
        const data = payload.collections[name]
        if (!col) {
          ignored.push(name)
          return
        }
        const dataValid =
          col.type === 'collection'
            ? Array.isArray(data)
            : data && typeof data === 'object' && !Array.isArray(data)
        if (!dataValid) {
          ignored.push(name)
          return
        }
        col.data = deepClone(data)
        col.ops = emptyOps()
        col.ops.full = deepClone(data)
        col.updatedAt = Date.now()
        persistCollection(name)
        applied.push(name)
      })
      return { applied, ignored }
    },

    /** 各集合概况 */
    stats() {
      hydrateAll()
      const info = {}
      collections.forEach((col, name) => {
        info[name] = {
          type: col.type,
          count: col.type === 'collection' ? col.data.length : 1,
          seedHash: col.seedHash,
          updatedAt: new Date(col.updatedAt).toISOString()
        }
      })
      return info
    }
  }

  return db
}
