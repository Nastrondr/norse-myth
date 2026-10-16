import { describe, it, expect, beforeEach, vi } from 'vitest'

function createUniMock() {
  const store = new Map()
  return {
    store,
    uni: {
      setStorageSync(key, value) { store.set(key, JSON.parse(JSON.stringify(value))) },
      getStorageSync(key) { return store.has(key) ? JSON.parse(JSON.stringify(store.get(key))) : '' },
      removeStorageSync(key) { store.delete(key) },
      getStorageInfoSync() { return { keys: [...store.keys()] } }
    }
  }
}

async function freshBond() {
  vi.resetModules()
  return await import('../src/interactions/bond.js')
}

describe('羁绊阶段模型', () => {
  it('四阶段阈值划分', async () => {
    const { getBondStage } = await freshBond()
    expect(getBondStage(0).name).toBe('初识')
    expect(getBondStage(29).name).toBe('初识')
    expect(getBondStage(30).name).toBe('试探')
    expect(getBondStage(60).name).toBe('信任')
    expect(getBondStage(99).name).toBe('信任')
    expect(getBondStage(100).name).toBe('同行')
    expect(getBondStage(undefined).name).toBe('初识')
  })

  it('进度百分比封顶 100', async () => {
    const { getBondProgress } = await freshBond()
    expect(getBondProgress(50, { bondMax: 100 })).toBe(50)
    expect(getBondProgress(150, { bondMax: 100 })).toBe(100)
    expect(getBondProgress(0, {})).toBe(0)
  })
})

describe('喜好 / 禁忌联动', () => {
  it('命中喜好 ×1.5 并返回提示', async () => {
    const { computeGain } = await freshBond()
    const r = computeGain({ bond: 10, tags: ['肉食'] }, { likes: ['肉食'], dislikes: [] })
    expect(r.amount).toBe(15)
    expect(r.note).toContain('正合它的心意')
  })

  it('命中禁忌减半（至少 1）并返回提示', async () => {
    const { computeGain } = await freshBond()
    const r = computeGain({ bond: 3, tags: ['锁链'] }, { likes: [], dislikes: ['锁链'] })
    expect(r.amount).toBe(2)
    expect(r.note).toContain('效果减半')
    const min = computeGain({ bond: 1, tags: ['锁链'] }, { likes: [], dislikes: ['锁链'] })
    expect(min.amount).toBe(1)
  })

  it('无匹配按基础值，无 tags 安全', async () => {
    const { computeGain } = await freshBond()
    expect(computeGain({ bond: 7 }, { likes: ['肉食'] })).toEqual({ amount: 7, note: '' })
    expect(computeGain(null, null).amount).toBe(5)
  })
})

describe('里程碑事件', () => {
  it('数据 bondEvents 覆写优先于类型模板', async () => {
    const { getStageEvents } = await freshBond()
    const custom = [{ id: 'x', threshold: 50, name: '专属', description: '...' }]
    expect(getStageEvents({ bondEvents: custom }, 'danger')).toBe(custom)
    const template = getStageEvents({}, 'craftsman')
    expect(template).toHaveLength(3)
    expect(template.map(e => e.threshold)).toEqual([30, 60, 100])
    // 未知类型回退 person 模板
    expect(getStageEvents({}, 'unknown-type')).toHaveLength(3)
  })

  it('只解锁跨过阈值的事件', async () => {
    const { newlyUnlockedEvents } = await freshBond()
    const events = [
      { id: 'a', threshold: 30 },
      { id: 'b', threshold: 60 },
      { id: 'c', threshold: 100 }
    ]
    expect(newlyUnlockedEvents(events, 0, 30).map(e => e.id)).toEqual(['a'])
    expect(newlyUnlockedEvents(events, 29, 61).map(e => e.id)).toEqual(['a', 'b'])
    expect(newlyUnlockedEvents(events, 30, 60).map(e => e.id)).toEqual(['b'])
    expect(newlyUnlockedEvents(events, 80, 100).map(e => e.id)).toEqual(['c'])
    expect(newlyUnlockedEvents(events, 100, 100)).toEqual([])
  })

  it('阶段描述按类型且未知阶段回退初识', async () => {
    const { getStageDescription } = await freshBond()
    expect(getStageDescription('beast', '试探')).toContain('停留')
    expect(getStageDescription('unknown', '不存在')).toBe(getStageDescription('unknown', '初识'))
  })
})

describe('羁绊状态持久化（StateDB bond.<id>）', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('get / save / reset 全链路', async () => {
    const { getBondState, saveBondState, resetBondState } = await freshBond()
    expect(getBondState('fenrir').bondExp).toBe(0)
    saveBondState('fenrir', { bondExp: 35, unlockedEvents: ['stage-30'] })
    expect(getBondState('fenrir').bondExp).toBe(35)
    expect(getBondState('fenrir').unlockedEvents).toEqual(['stage-30'])
    expect(getBondState('fenrir').updatedAt).toBeTruthy()
    // save 为局部合并，不清空其他字段
    saveBondState('fenrir', { bondExp: 70 })
    expect(getBondState('fenrir').unlockedEvents).toEqual(['stage-30'])
    resetBondState('fenrir')
    expect(getBondState('fenrir').bondExp).toBe(0)
  })
})

describe('生物数据完整性（likes/dislikes 与动作词表对齐）', () => {
  it('普通生物均已配置 likes/dislikes 词条', async () => {
    const { norseCreatures } = await import('../src/data/norseCreatures.js')
    const { getStageEvents } = await freshBond()
    const bondCreatures = norseCreatures.filter(c =>
      c.interactionType !== 'abyss' && c.id !== 'jormungandr' &&
      !(c.interactionType === 'spirit' && c.spiritConfig) && c.id !== 'raven'
    )
    bondCreatures.forEach(c => {
      expect(Array.isArray(c.likes) && c.likes.length > 0, `${c.id} 缺少 likes`).toBeTruthy()
      expect(Array.isArray(c.dislikes) && c.dislikes.length > 0, `${c.id} 缺少 dislikes`).toBeTruthy()
    })
    // bondEvents 若配置必须含 threshold 数值
    norseCreatures.forEach(c => {
      (c.bondEvents || []).forEach(e => {
        expect(typeof e.threshold, `${c.id}.bondEvents ${e.id} threshold 须为数字`).toBe('number')
      })
    })
  })
})
