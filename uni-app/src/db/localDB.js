// 本地文献数据库引擎（LocalDB）
//
// 设计目标：集中管理项目中的大量文献文本，支持整体替换与运行时更新。
// - 种子数据：src/data/*.js 是文献的"出厂版本"，直接编辑文件即可替换
// - 本地修改：所有写入操作自动持久化到 uni storage（H5 下为 localStorage），刷新不丢失
// - 种子版本：通过内容哈希识别；种子文件更新后，对应集合自动恢复为新版本
// - 查询安全：查询结果均为深拷贝，页面修改返回值不会污染数据库内部状态
// - 环境兼容：无 uni 全局对象时（如单元测试）自动降级为纯内存模式

const DB_VERSION = 1
const STORAGE_KEY = 'norse_local_db_v1'

const hasUni = () => typeof uni !== 'undefined'

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

function readStorage() {
  if (!hasUni()) return null
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    return raw && typeof raw === 'object' && raw.version === DB_VERSION ? raw : null
  } catch (e) {
    return null
  }
}

function writeStorage(payload) {
  if (!hasUni()) return
  try {
    uni.setStorageSync(STORAGE_KEY, payload)
  } catch (e) {
    // 存储不可用（如空间不足）时静默降级为内存模式
  }
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

export function createLocalDB() {
  const collections = new Map() // name -> { type, seed, seedHash, data, updatedAt }
  let persistedCache = null

  function loadPersisted() {
    if (!persistedCache) persistedCache = readStorage()
    return persistedCache
  }

  function persist() {
    const dump = {}
    collections.forEach((col, name) => {
      dump[name] = { seedHash: col.seedHash, data: col.data }
    })
    writeStorage({ version: DB_VERSION, updatedAt: Date.now(), collections: dump })
  }

  function getCol(name) {
    const col = collections.get(name)
    if (!col) {
      throw new Error('[localDB] 未注册的集合: ' + name + '，可用集合: ' + [...collections.keys()].join(', '))
    }
    return col
  }

  function getArrayCol(name) {
    const col = getCol(name)
    if (col.type !== 'collection') {
      throw new Error('[localDB] ' + name + ' 是文档型集合，请使用 getDoc/saveDoc')
    }
    return col
  }

  function register(name, type, seed) {
    if (collections.has(name)) {
      throw new Error('[localDB] 集合名重复: ' + name)
    }
    const seedHash = hashContent(seed)
    const stored = ((loadPersisted() || {}).collections || {})[name]
    const storedValid =
      stored &&
      stored.seedHash === seedHash &&
      (type === 'collection'
        ? Array.isArray(stored.data)
        : stored.data && typeof stored.data === 'object' && !Array.isArray(stored.data))
    // 种子未变化且存在本地记录 → 沿用本地修改；否则 → 使用最新种子
    const data = storedValid ? stored.data : deepClone(seed)
    collections.set(name, { type, seed: deepClone(seed), seedHash, data, updatedAt: Date.now() })
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

    // ===== 写入（自动持久化） =====

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
      col.updatedAt = Date.now()
      persist()
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
      col.updatedAt = Date.now()
      persist()
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
          updated += 1
        }
      })
      if (updated > 0) {
        col.updatedAt = Date.now()
        persist()
      }
      return updated
    },

    /** 按 id 删除，返回是否删除成功 */
    remove(name, id) {
      const col = getArrayCol(name)
      const index = col.data.findIndex(doc => doc.id === id)
      if (index < 0) return false
      col.data.splice(index, 1)
      col.updatedAt = Date.now()
      persist()
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
      col.updatedAt = Date.now()
      persist()
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
      col.updatedAt = Date.now()
      persist()
      return deepClone(col.data)
    },

    // ===== 维护 =====

    /** 恢复种子数据；传入集合名恢复单个集合，不传恢复全部 */
    reset(name) {
      if (name !== undefined) {
        const col = getCol(name)
        col.data = deepClone(col.seed)
        col.updatedAt = Date.now()
      } else {
        collections.forEach(col => {
          col.data = deepClone(col.seed)
          col.updatedAt = Date.now()
        })
      }
      persist()
      return true
    },

    /** 导出整个数据库为 JSON 字符串（备份 / 迁移用） */
    exportJSON() {
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
        col.updatedAt = Date.now()
        applied.push(name)
      })
      if (applied.length > 0) persist()
      return { applied, ignored }
    },

    /** 各集合概况 */
    stats() {
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
