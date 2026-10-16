import { describe, it, expect, beforeEach, vi } from 'vitest'

// 模拟 uni storage（含 remove 与 key 枚举）
function createUniMock() {
  const store = new Map()
  return {
    store,
    uni: {
      setStorageSync(key, value) {
        store.set(key, JSON.parse(JSON.stringify(value)))
      },
      getStorageSync(key) {
        return store.has(key) ? JSON.parse(JSON.stringify(store.get(key))) : ''
      },
      removeStorageSync(key) {
        store.delete(key)
      },
      getStorageInfoSync() {
        return { keys: [...store.keys()] }
      }
    }
  }
}

const SEED_GODS = [
  { id: 'odin', name: '奥丁', description: '原始文案' },
  { id: 'thor', name: '索尔', description: '原始文案' }
]

async function freshModules() {
  vi.resetModules()
  const { createLocalDB } = await import('../src/db/localDB.js')
  const { state } = await import('../src/state/index.js')
  const backup = await import('../src/backup/index.js')
  return { createLocalDB, state, backup }
}

// backup 模块内部使用项目 db 单例（src/db/index.js 注册全部集合），
// 单测里通过 mock 单例路径验证格式与往返；真实集合行为由 db/state 各自测试覆盖
describe('backup 整库存档', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('导出包含 kind/version/content/state 结构', async () => {
    const { backup } = await freshModules()
    const text = backup.exportArchive()
    const payload = JSON.parse(text)
    expect(payload.kind).toBe('norse-archive')
    expect(payload.version).toBe(1)
    expect(payload.content.collections).toBeTruthy()
    expect(payload.state.namespaces).toBeTruthy()
    expect(typeof payload.exportedAt).toBe('string')
  })

  it('往返：清空存储后导入可恢复内容与状态', async () => {
    const m1 = await freshModules()
    // 造数据：状态层写入（内容层由项目单例集合覆盖）
    m1.state.set('progress.collectedCreatures', ['fenrir'])
    m1.state.set('game.runeRecord', { runeName: 'Fehu', date: 1 })
    const text = (await import('../src/backup/index.js')).exportArchive()

    // 模拟换设备：全部存储清空
    mock.store.clear()
    const m2 = await freshModules()
    expect(m2.state.has('progress.collectedCreatures')).toBe(false)

    const result = m2.backup.importArchive(text)
    expect(result.namespaces).toEqual(expect.arrayContaining(['progress', 'game']))
    expect(m2.state.get('progress.collectedCreatures')).toEqual(['fenrir'])
    expect(m2.state.get('game.runeRecord').runeName).toBe('Fehu')
    // 内容层集合（项目单例）恢复后可查询
    const { db } = await import('../src/db/index.js')
    expect(db.findById('gods', 'odin').name).toBe('奥丁')
  })

  it('非法输入抛出格式错误', async () => {
    const { backup } = await freshModules()
    expect(() => backup.importArchive('{"kind":"other"}')).toThrow(/格式不正确/)
    expect(() => backup.importArchive('不是json')).toThrow()
  })
})

describe('storage 门面（uni 后端）', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
    vi.resetModules()
  })

  it('get/set/remove/keys 走 uni storage 并支持前缀过滤', async () => {
    const { storage } = await import('../src/storage/index.js')
    expect(storage.backend).toBe('uni')
    expect(storage.get('missing-key')).toBe('')
    storage.set('norse_a', { x: 1 })
    storage.set('norse_b', 2)
    storage.set('other', 3)
    expect(storage.get('norse_a')).toEqual({ x: 1 })
    expect(storage.keys('norse_').sort()).toEqual(['norse_a', 'norse_b'])
    storage.remove('norse_a')
    expect(storage.get('norse_a')).toBe('')
    expect(mock.store.has('norse_a')).toBe(false)
    // ready 为空操作
    await expect(storage.ready()).resolves.toBeUndefined()
  })

  it('无 uni 环境降级内存模式（key 枚举同样可用）', async () => {
    const unset = globalThis.uni
    delete globalThis.uni
    try {
      const { storage } = await import('../src/storage/index.js')
      storage.set('mem_key', { y: 2 })
      expect(storage.get('mem_key')).toEqual({ y: 2 })
      expect(storage.keys('mem_')).toEqual(['mem_key'])
      storage.remove('mem_key')
      expect(storage.get('mem_key')).toBe('')
    } finally {
      globalThis.uni = unset
    }
  })
})
