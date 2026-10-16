// 状态层 StateDB：角色互动 / 收集进度 / 游戏存档 / 设置 的统一存取
//
// 与内容层 LocalDB（src/db）的分工：
// - 内容层存"文献"（种子驱动，可被发版更新），状态层存"玩家的数据"（永不因发版丢失）
// - 写入按命名空间分片（norse_state_v2::<ns>），改一个命名空间只重写一个 key，
//   避免整库序列化的写放大
//
// 快速上手：
//   import { state } from '@/state'
//   state.get('progress.collectedCreatures', [])   // 取值（对象返回深拷贝，缺省回退 fallback）
//   state.set('progress.collectedCreatures', ids)  // 整体写入叶子
//   state.patch('bond.jormungandr', { trust: 3 })  // 对象叶子浅合并
//   state.remove('progress.dailyTasks')            // 删除叶子 / 整个命名空间
//   state.exportState() / state.importState(json)  // 存档备份 / 恢复（整库备份见 src/backup）
//
// schema 版本：
// - v2：命名空间分片（当前）。升级时在 MIGRATIONS 注册迁移函数即可。
// - 旧版应用留下的裸 storage key 首次访问时自动搬家（见 LEGACY_KEYS），搬完即删。
// - 底层存储经 src/storage 统一门面（uni / IndexedDB 可切换，无环境时内存模式）。

import { storage } from '@/storage'

const STATE_VERSION = 2
const META_KEY = 'norse_state_v2'
const SHARD_PREFIX = 'norse_state_v2::'

// 旧裸 key → 新路径。新增状态一律走 state.set，不再直接使用 uni storage。
const LEGACY_KEYS = [
  ['collectedCreatures', 'progress.collectedCreatures'],
  ['ravens_clue_progress', 'progress.ravens'],
  ['norse_world_tree_progress', 'progress.worldTree'],
  ['norse_daily_tasks', 'progress.dailyTasks'],
  ['norse_god_match_result', 'game.godMatch'],
  ['norse_rumor_book_completion', 'game.rumorBook'],
  ['norse_rune_record', 'game.runeRecord'],
  ['norse_custom_rumors', 'game.customRumors'],
  ['jormungandr_high_risk_state', 'bond.jormungandr'],
  ['elf_spirit_state', 'bond.elfSpirit'],
  ['norse_bgm_enabled', 'settings.bgmEnabled'],
  ['norse_bgm_volume', 'settings.bgmVolume']
]

// 预留：STATE_VERSION 升级时的迁移函数表 { fromVersion: (shards) => shards }
const MIGRATIONS = {}

function rawGet(key) {
  return storage.get(key)
}

function rawSet(key, value) {
  storage.set(key, value)
}

function rawRemove(key) {
  storage.remove(key)
}

function deepClone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value))
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function splitPath(path) {
  const parts = String(path || '').split('.').filter(Boolean)
  if (!parts.length) {
    throw new Error('[state] 路径不能为空，应为 "namespace.leaf" 形式')
  }
  return parts
}

// ===== 命名空间分片读写 =====

function readShard(ns) {
  const shard = rawGet(SHARD_PREFIX + ns)
  if (isPlainObject(shard) && shard.v === STATE_VERSION && isPlainObject(shard.data)) {
    return shard.data
  }
  return {}
}

function writeShard(ns, data) {
  rawSet(SHARD_PREFIX + ns, { v: STATE_VERSION, ns, updatedAt: Date.now(), data })
}

function readLeaf(data, leafParts) {
  let cursor = data
  for (const key of leafParts) {
    if (!isPlainObject(cursor) || !(key in cursor)) return undefined
    cursor = cursor[key]
  }
  return cursor
}

function writeLeaf(data, leafParts, value) {
  let cursor = data
  for (let i = 0; i < leafParts.length - 1; i++) {
    const key = leafParts[i]
    if (!isPlainObject(cursor[key])) cursor[key] = {}
    cursor = cursor[key]
  }
  cursor[leafParts[leafParts.length - 1]] = value
}

function deleteLeaf(data, leafParts) {
  let cursor = data
  for (let i = 0; i < leafParts.length - 1; i++) {
    const key = leafParts[i]
    if (!isPlainObject(cursor[key])) return false
    cursor = cursor[key]
  }
  return delete cursor[leafParts[leafParts.length - 1]]
}

// ===== v1 裸 key 自动迁移（一次性） =====

let migrated = false

function migrateLegacy() {
  if (migrated) return
  migrated = true
  if (isPlainObject(rawGet(META_KEY))) return

  const pending = {}
  LEGACY_KEYS.forEach(([legacyKey, target]) => {
    const raw = rawGet(legacyKey)
    if (raw !== '' && raw !== null && raw !== undefined) {
      const parts = splitPath(target)
      const ns = parts[0]
      pending[ns] = pending[ns] || {}
      // 与既有分片合并（正常情况下迁移先于一切写入，这里只是防御）
      const merged = Object.assign(readShard(ns), pending[ns])
      writeLeaf(merged, parts.slice(1), raw)
      pending[ns] = merged
    }
    rawRemove(legacyKey)
  })

  Object.keys(pending).forEach(ns => writeShard(ns, pending[ns]))
  rawSet(META_KEY, { version: STATE_VERSION, migratedAt: Date.now() })
}

// ===== 公开 API =====

export const state = {
  /** 读取路径对应的值；不存在时返回 fallback（对象返回深拷贝） */
  get(path, fallback) {
    migrateLegacy()
    const parts = splitPath(path)
    const value = readLeaf(readShard(parts[0]), parts.slice(1))
    if (value === undefined) return isPlainObject(fallback) || Array.isArray(fallback) ? deepClone(fallback) : fallback
    return deepClone(value)
  },

  /** 是否存在该路径 */
  has(path) {
    migrateLegacy()
    const parts = splitPath(path)
    return readLeaf(readShard(parts[0]), parts.slice(1)) !== undefined
  },

  /** 整体写入叶子（或整个命名空间，此时 value 必须是对象） */
  set(path, value) {
    migrateLegacy()
    const parts = splitPath(path)
    const ns = parts[0]
    const leaf = parts.slice(1)
    const data = readShard(ns)
    if (!leaf.length) {
      if (!isPlainObject(value)) {
        throw new Error('[state] 命名空间级写入需要对象，叶子请用完整路径 "' + path + '.xxx"')
      }
      writeShard(ns, deepClone(value))
      return deepClone(value)
    }
    writeLeaf(data, leaf, deepClone(value))
    writeShard(ns, data)
    return deepClone(value)
  },

  /** 对象叶子浅合并；当前值不是对象时等价于 set */
  patch(path, partial) {
    if (!isPlainObject(partial)) {
      throw new Error('[state] patch 需要对象参数')
    }
    const current = this.get(path)
    const next = isPlainObject(current) ? Object.assign(current, deepClone(partial)) : deepClone(partial)
    return this.set(path, next)
  },

  /** 删除叶子；传命名空间名则清空整个命名空间 */
  remove(path) {
    migrateLegacy()
    const parts = splitPath(path)
    const ns = parts[0]
    const leaf = parts.slice(1)
    if (!leaf.length) {
      rawRemove(SHARD_PREFIX + ns)
      return true
    }
    const data = readShard(ns)
    const removed = deleteLeaf(data, leaf)
    if (removed) writeShard(ns, data)
    return removed
  },

  /** 已有数据的命名空间列表（枚举分片 key，不再依赖硬编码清单） */
  namespaces() {
    migrateLegacy()
    return storage.keys(SHARD_PREFIX).map(key => key.slice(SHARD_PREFIX.length))
  },

  /** 导出全部状态为 JSON 字符串（备份 / 换设备迁移） */
  exportState() {
    migrateLegacy()
    const dump = {}
    this.namespaces().forEach(ns => {
      dump[ns] = readShard(ns)
    })
    return JSON.stringify({ version: STATE_VERSION, exportedAt: new Date().toISOString(), namespaces: dump }, null, 2)
  },

  /**
   * 从 exportState 的内容导入，整体替换对应命名空间
   * 返回 { applied, ignored }
   */
  importState(input) {
    const payload = typeof input === 'string' ? JSON.parse(input) : input
    if (!isPlainObject(payload) || !isPlainObject(payload.namespaces)) {
      throw new Error('[state] 导入内容格式不正确，需要 { namespaces: {...} } 结构')
    }
    const applied = []
    const ignored = []
    Object.keys(payload.namespaces).forEach(ns => {
      const data = payload.namespaces[ns]
      if (!isPlainObject(data)) {
        ignored.push(ns)
        return
      }
      writeShard(ns, deepClone(data))
      applied.push(ns)
    })
    if (applied.length > 0) rawSet(META_KEY, { version: STATE_VERSION, updatedAt: Date.now() })
    return { applied, ignored }
  },

  /** 当前 schema 版本（诊断用） */
  version() {
    migrateLegacy()
    return STATE_VERSION
  }
}

export default state
