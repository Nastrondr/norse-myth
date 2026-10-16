// 统一存储门面：LocalDB（内容层）与 StateDB（状态层）的唯一 storage 出入口
//
// 后端选择（改这一处即可整体切换，引擎代码不动）：
// - 'uni'（默认）：uni storage（H5 = localStorage，小程序 = 宿主 storage），
//   同步、简单，当前数据量级（百 KB 级）最优
// - 'idb'：IndexedDB 为主存储（解锁数百 MB 配额），localStorage 作同步镜像：
//   · 预热（storage.ready()）前读取回落 uni 镜像，保证启动早期可读
//   · 写入双写（IDB 异步批量 + uni 同步镜像），切回 'uni' 无需迁移
//   · 需在 App.onLaunch 尽早触发 storage.ready()（已接入）
//
// 无 uni 且无 IDB（node 单测）时自动降级内存模式。
// key 枚举（storage.keys）供导出/迁移使用，uni 后端基于 getStorageInfoSync。
import { idbBackend } from './idbBackend.js'

const BACKEND = 'uni'

const hasUni = () => typeof uni !== 'undefined'

function uniGet(key) {
  if (!hasUni()) return ''
  try {
    return uni.getStorageSync(key)
  } catch (e) {
    return ''
  }
}

function uniSet(key, value) {
  if (!hasUni()) return
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    // 存储不可用（如配额满）时静默降级
  }
}

function uniRemove(key) {
  if (!hasUni()) return
  try {
    if (typeof uni.removeStorageSync === 'function') {
      uni.removeStorageSync(key)
    }
  } catch (e) {
    // 忽略删除失败
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

// 内存模式（单测）
const memStore = new Map()

const active = BACKEND === 'idb' ? idbBackend : null

export const storage = {
  /** 当前后端名：'uni' | 'idb' */
  backend: BACKEND,

  /** 读 key；不存在返回 ''（沿用 uni 约定） */
  get(key) {
    if (active) {
      if (active.warmed()) {
        const value = active.memGet(key)
        return value === undefined ? '' : value
      }
      return uniGet(key)
    }
    if (hasUni()) return uniGet(key)
    return memStore.has(key) ? memStore.get(key) : ''
  },

  /** 写 key（对象/数组/标量均可，JSON 兼容值） */
  set(key, value) {
    if (active) {
      active.set(key, value)
      uniSet(key, value)
      return
    }
    if (hasUni()) {
      uniSet(key, value)
      return
    }
    memStore.set(key, value)
  },

  /** 删 key */
  remove(key) {
    if (active) {
      active.remove(key)
      uniRemove(key)
      return
    }
    if (hasUni()) {
      uniRemove(key)
      return
    }
    memStore.delete(key)
  },

  /** 枚举 key（可按前缀过滤）；uni 后端依赖 getStorageInfoSync */
  keys(prefix) {
    let all
    if (active) {
      all = active.warmed() ? active.keys() : uniKeys()
    } else if (hasUni()) {
      all = uniKeys()
    } else {
      all = [...memStore.keys()]
    }
    return prefix ? all.filter(key => key.indexOf(prefix) === 0) : all
  },

  /** 预热（idb 后端载入/迁移；uni 后端为空操作）。App 启动时尽早调用 */
  async ready() {
    if (active) await active.ready()
  }
}

export default storage
