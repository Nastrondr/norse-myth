// IndexedDB 存储后端：大配额（数百 MB），为玩家自制内容 / 大量题库预留
//
// 通过 src/storage 统一门面使用，不直接被业务代码引用。
// 工作方式：
// - 预热（ready）：把 IndexedDB 全部 key 载入内存缓存；首次启用时自动把
//   uni storage（localStorage）里的 norse_* 数据迁入，平滑升级
// - 写入：内存立即生效，批量（去抖）异步落盘 IndexedDB
// - 预热完成前，门面读取会回落到 uni storage 同步镜像，保证启动早期可读
// - 删除：记录 pendingDeletes，落盘时统一应用
const DB_NAME = 'norse_kv'
const STORE = 'kv'
const MIGRATE_PREFIX = 'norse_'
const FLUSH_DELAY = 200

const mem = new Map()
const pendingDeletes = new Set()
let warmed = false
let dbPromise = null
let flushTimer = null

const hasIDB = () => typeof indexedDB !== 'undefined'
const hasUni = () => typeof uni !== 'undefined'

function uniGet(key) {
  if (!hasUni()) return ''
  try {
    return uni.getStorageSync(key)
  } catch (e) {
    return ''
  }
}

function uniKeys() {
  if (!hasUni()) return []
  try {
    const info = typeof uni.getStorageInfoSync === 'function' ? uni.getStorageInfoSync() : null
    return info && Array.isArray(info.keys) ? info.keys : []
  } catch (e) {
    return []
  }
}

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }
  return dbPromise
}

async function ready() {
  if (warmed) return
  if (hasIDB()) {
    try {
      const db = await open()
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const store = tx.objectStore(STORE)
        const keysReq = store.getAllKeys()
        const valsReq = store.getAll()
        tx.oncomplete = () => {
          keysReq.result.forEach((key, i) => mem.set(key, valsReq.result[i]))
          resolve()
        }
        tx.onerror = () => reject(tx.error)
      })
      // 首次启用：迁入 uni storage 中的既有数据（IDB 里没有的）
      let migrated = false
      uniKeys()
        .filter(key => key.indexOf(MIGRATE_PREFIX) === 0)
        .forEach(key => {
          if (mem.has(key)) return
          const value = uniGet(key)
          if (value !== '' && value !== null && value !== undefined) {
            mem.set(key, value)
            migrated = true
          }
        })
      if (migrated) scheduleFlush()
    } catch (e) {
      // IndexedDB 不可用（隐私模式等）：仅内存 + uni 镜像（由门面维护）
    }
  }
  warmed = true
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    flushTimer = null
    if (!hasIDB()) return
    try {
      const db = await open()
      const puts = [...mem.entries()]
      const deletes = [...pendingDeletes]
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        const store = tx.objectStore(STORE)
        puts.forEach(([key, value]) => store.put(value, key))
        deletes.forEach(key => store.delete(key))
        tx.oncomplete = resolve
        tx.onerror = () => reject(tx.error)
      })
      deletes.forEach(key => pendingDeletes.delete(key))
    } catch (e) {
      // 落盘失败：内存与 uni 镜像仍是权威数据，下次写入会重试
    }
  }, FLUSH_DELAY)
}

export const idbBackend = {
  /** 预热是否完成（门面据此决定读内存还是回落 uni 镜像） */
  warmed: () => warmed,
  /** 预热：载入 IDB 全量 + 迁移 uni storage 旧数据 */
  ready,
  /** 读内存缓存（预热后有效）；无值返回 undefined */
  memGet: key => mem.get(key),
  /** 全量 key（预热后有效） */
  keys: () => [...mem.keys()],
  /** 写：内存立即生效 + 异步落盘 */
  set(key, value) {
    pendingDeletes.delete(key)
    mem.set(key, value)
    scheduleFlush()
  },
  /** 删：内存立即生效 + 异步落盘 */
  remove(key) {
    if (mem.delete(key)) pendingDeletes.add(key)
    scheduleFlush()
  }
}

export default idbBackend
