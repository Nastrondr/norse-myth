import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalDB } from '../src/db/localDB.js'
import { vi } from 'vitest'

// 模拟 uni storage（含 remove 与 key 枚举），可检视内部 key
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

async function freshState() {
  vi.resetModules()
  return await import('../src/state/index.js')
}

describe('state 引擎基础', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('get / set / has / remove 按点分路径读写', async () => {
    const { state } = await freshState()
    expect(state.has('progress.collectedCreatures')).toBe(false)
    state.set('progress.collectedCreatures', ['fenrir', 'jormungandr'])
    expect(state.has('progress.collectedCreatures')).toBe(true)
    expect(state.get('progress.collectedCreatures')).toEqual(['fenrir', 'jormungandr'])
    state.remove('progress.collectedCreatures')
    expect(state.has('progress.collectedCreatures')).toBe(false)
  })

  it('get 返回深拷贝，外部修改不污染存储', async () => {
    const { state } = await freshState()
    state.set('bond.jormungandr', { observation: 5, messages: ['a'] })
    const value = state.get('bond.jormungandr')
    value.observation = 99
    value.messages.push('b')
    expect(state.get('bond.jormungandr').observation).toBe(5)
    expect(state.get('bond.jormungandr').messages).toEqual(['a'])
  })

  it('patch 对象叶子浅合并，缺省走 fallback', async () => {
    const { state } = await freshState()
    state.patch('bond.elfSpirit', { trust: 3 })
    state.patch('bond.elfSpirit', { disturbance: 1 })
    expect(state.get('bond.elfSpirit')).toEqual({ trust: 3, disturbance: 1 })
    expect(state.get('progress.ravens', { clueIds: [], revealed: false })).toEqual({ clueIds: [], revealed: false })
    expect(() => state.patch('settings.bgmVolume', '不是对象')).toThrow()
  })

  it('写入按命名空间分片：只落一个 norse_state_v2:: key', async () => {
    const { state } = await freshState()
    state.set('game.godMatch', { primary: 'odin' })
    state.set('game.runeRecord', { runeName: 'Fehu' })
    state.set('progress.worldTree', { totalProgress: 40 })
    const keys = [...mock.store.keys()]
    expect(keys.filter(k => k.startsWith('norse_state_v2::'))).toEqual(
      expect.arrayContaining(['norse_state_v2::game', 'norse_state_v2::progress'])
    )
    // meta key 存在且记录版本
    expect(mock.store.get('norse_state_v2').version).toBe(2)
  })

  it('exportState / importState 全量备份恢复', async () => {
    const { state } = await freshState()
    state.set('game.godMatch', { primary: 'odin' })
    state.set('progress.collectedCreatures', ['fenrir'])
    const dump = state.exportState()

    // 模拟换设备：清空存储后重新加载
    mock.store.clear()
    const { state: state2 } = await freshState()
    expect(state2.has('game.godMatch')).toBe(false)
    const result = state2.importState(dump)
    expect(result.applied).toContain('game')
    expect(state2.get('game.godMatch').primary).toBe('odin')
    expect(state2.get('progress.collectedCreatures')).toEqual(['fenrir'])
    expect(() => state2.importState('{ "bad": 1 }')).toThrow(/格式不正确/)
  })
})

describe('state v1 裸 key 自动迁移', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('旧 key 首次访问时搬家到新路径并删除旧 key', async () => {
    mock.uni.setStorageSync('collectedCreatures', ['fenrir'])
    mock.uni.setStorageSync('ravens_clue_progress', { clueIds: ['relation'], revealed: false })
    mock.uni.setStorageSync('norse_bgm_volume', 0.7)
    mock.uni.setStorageSync('norse_god_match_result', { primary: 'odin' })

    const { state } = await freshState()
    expect(state.get('progress.collectedCreatures')).toEqual(['fenrir'])
    expect(state.get('progress.ravens').clueIds).toEqual(['relation'])
    expect(state.get('settings.bgmVolume')).toBe(0.7)
    expect(state.get('game.godMatch').primary).toBe('odin')

    // 旧 key 已清理
    expect(mock.store.has('collectedCreatures')).toBe(false)
    expect(mock.store.has('ravens_clue_progress')).toBe(false)
    expect(mock.store.has('norse_bgm_volume')).toBe(false)
    expect(mock.store.has('norse_god_match_result')).toBe(false)
  })

  it('空旧 key 不产生数据，迁移只执行一次', async () => {
    mock.uni.setStorageSync('norse_daily_tasks', [])
    const { state } = await freshState()
    expect(state.has('progress.dailyTasks')).toBe(true)
    // 迁移已落 meta，重复访问不会再扫旧 key
    mock.uni.setStorageSync('collectedCreatures', ['later'])
    expect(state.has('progress.collectedCreatures')).toBe(false)
    expect(mock.store.has('collectedCreatures')).toBe(true)
  })
})

describe('localDB v2 分片 diff 持久化', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('update 只写该集合的分片 key，且只存 diff', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    local.update('gods', 'odin', { description: '本地修改' })

    const keys = [...mock.store.keys()]
    expect(keys).toContain('norse_local_db_v2::gods')
    expect(keys.filter(k => k.startsWith('norse_local_db_v2::'))).toHaveLength(1)
    expect(mock.store.has('norse_local_db_v1')).toBe(false)

    const shard = mock.store.get('norse_local_db_v2::gods')
    expect(shard.ops.full).toBeNull()
    expect(shard.ops.patches.odin).toEqual({ description: '本地修改' })
    // diff 体积远小于整库
    expect(JSON.stringify(shard.ops).length).toBeLessThan(JSON.stringify(SEED_GODS).length + 80)
  })

  it('insert / remove / replaceCollection 的 diff 重放一致', () => {
    const first = createLocalDB().defineCollection('gods', SEED_GODS)
    first.insert('gods', { id: 'tyr', name: '提尔' })
    first.remove('gods', 'thor')
    first.update('gods', 'odin', { description: '改' })

    const second = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(second.collectionNames()).toEqual(['gods'])
    expect(second.count('gods')).toBe(2)
    expect(second.findById('gods', 'tyr').name).toBe('提尔')
    expect(second.findById('gods', 'odin').description).toBe('改')
    expect(second.findById('gods', 'thor')).toBeNull()

    second.replaceCollection('gods', [{ id: 'odin', name: '奥丁' }])
    const third = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(third.count('gods')).toBe(1)
  })

  it('种子更新后旧 diff 失效，恢复新种子', () => {
    const first = createLocalDB().defineCollection('gods', SEED_GODS)
    first.update('gods', 'odin', { description: '本地修改' })

    const newSeed = SEED_GODS.map(g => ({ ...g, description: '种子已更新' }))
    const second = createLocalDB().defineCollection('gods', newSeed)
    expect(second.findById('gods', 'odin').description).toBe('种子已更新')
  })

  it('v1 整库存档自动迁移为 v2 分片并清理旧 key', () => {
    const first = createLocalDB().defineCollection('gods', SEED_GODS)
    first.update('gods', 'odin', { description: '旧版本修改' })
    // 取出 seedHash，模拟 v1 环境：只有单 key 整库存档
    const shard = JSON.parse(JSON.stringify(mock.store.get('norse_local_db_v2::gods')))
    mock.store.clear()
    mock.uni.setStorageSync('norse_local_db_v1', {
      version: 1,
      collections: {
        gods: { seedHash: shard.seedHash, data: first.findAll('gods') }
      }
    })

    const second = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(second.findById('gods', 'odin').description).toBe('旧版本修改')
    expect(mock.store.has('norse_local_db_v1')).toBe(false)
    expect(mock.store.has('norse_local_db_v2::gods')).toBe(true)
  })
})
