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

async function freshAchievements() {
  vi.resetModules()
  return await import('../src/interactions/achievements.js')
}

const EMPTY_CTX = {
  collected: [],
  collectedCount: 0,
  totalCreatures: 14,
  bonds: {},
  bondExps: [],
  maxBondExp: 0,
  unlockedEventCount: 0,
  ravens: { clueIds: [], revealed: false },
  ravenClueCount: 0,
  godMatch: null,
  rumorBook: null,
  runeRecord: null,
  worldTree: {},
  worldTreeProgress: 0
}

function pick(board, id) {
  return board.find(a => a.id === id)
}

describe('成就看板', () => {
  it('注册表 15 项、四大类齐全、rookie 默认解锁', async () => {
    const { getAchievementBoard } = await freshAchievements()
    const board = getAchievementBoard(EMPTY_CTX)
    expect(board).toHaveLength(16)
    expect(new Set(board.map(a => a.category))).toEqual(new Set(['探索', '羁绊', '智识', '进度']))
    expect(pick(board, 'rookie').unlocked).toBe(true)
    expect(board.filter(a => a.unlocked)).toHaveLength(1)
  })

  it('未解锁且带 progress 的成就展示进度', async () => {
    const { getAchievementBoard } = await freshAchievements()
    const board = getAchievementBoard({ ...EMPTY_CTX, collectedCount: 5 })
    expect(pick(board, 'collector-3').unlocked).toBe(true)
    expect(pick(board, 'collector-8').unlocked).toBe(false)
    expect(pick(board, 'collector-8').progress).toEqual({ current: 5, total: 8 })
    expect(pick(board, 'collector-all').progress).toEqual({ current: 5, total: 14 })
  })

  it('羁绊类成就消费 P3 bond 数据（试探/里程碑/信任/满级）', async () => {
    const { getAchievementBoard } = await freshAchievements()
    const ctx = {
      ...EMPTY_CTX,
      bonds: {
        fenrir: { bondExp: 34, unlockedEvents: ['stage-30'] },
        garmr: { bondExp: 65, unlockedEvents: [] },
        surtr: { bondExp: 100, unlockedEvents: ['stage-30', 'stage-60', 'stage-100'] }
      }
    }
    ctx.bondExps = [34, 65, 100]
    ctx.maxBondExp = 100
    ctx.unlockedEventCount = 4
    const board = getAchievementBoard(ctx)
    expect(pick(board, 'bond-first').unlocked).toBe(true)
    expect(pick(board, 'bond-milestone').unlocked).toBe(true)
    expect(pick(board, 'bond-trust').unlocked).toBe(false)  // 65/100 两只 ≥60，差一只
    expect(pick(board, 'bond-trust').progress).toEqual({ current: 2, total: 3 })
    expect(pick(board, 'bond-companion').unlocked).toBe(true)
  })

  it('bond-trust 需要 3 只达到信任', async () => {
    const { getAchievementBoard } = await freshAchievements()
    const two = getAchievementBoard({ ...EMPTY_CTX, bondExps: [70, 65] })
    expect(pick(two, 'bond-trust').unlocked).toBe(false)
    const three = getAchievementBoard({ ...EMPTY_CTX, bondExps: [70, 65, 60] })
    expect(pick(three, 'bond-trust').unlocked).toBe(true)
  })

  it('智识/探索/进度类判定', async () => {
    const { getAchievementBoard } = await freshAchievements()
    const board = getAchievementBoard({
      ...EMPTY_CTX,
      godMatch: { primary: { id: 'odin' } },
      rumorBook: { accuracy: 85 },
      runeRecord: { runeName: 'Fehu' },
      ravenClueCount: 3,
      ravens: { clueIds: ['a', 'b', 'c'], revealed: true },
      worldTreeProgress: 45
    })
    expect(pick(board, 'god-matched').unlocked).toBe(true)
    expect(pick(board, 'lore-master').unlocked).toBe(true)
    expect(pick(board, 'rune-listener').unlocked).toBe(true)
    expect(pick(board, 'raven-revealed').unlocked).toBe(true)
    expect(pick(board, 'world-traveler').unlocked).toBe(true)
    expect(pick(board, 'world-pilgrim').unlocked).toBe(false)
    expect(pick(board, 'world-pilgrim').progress).toEqual({ current: 45, total: 70 })
  })
})

describe('称号推导（沿用原优先级）', async () => {
  it('世界树 70 > 40 > 神格匹配 > 谣言之书 > 默认', async () => {
    const { getTitle } = await freshAchievements()
    expect(getTitle({ worldTreeProgress: 75 })).toBe('世界树巡礼者')
    expect(getTitle({ worldTreeProgress: 50 })).toBe('九界旅人')
    expect(getTitle({ worldTreeProgress: 10, godMatch: { primary: {} } })).toBe('神格显现者')
    expect(getTitle({ worldTreeProgress: 10, rumorBook: { accuracy: 60 } })).toBe('传闻辨析者')
    expect(getTitle({})).toBe('见习记录员')
  })
})

describe('上下文构建（真实 StateDB 集成）', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('从 StateDB 各命名空间读取并聚合', async () => {
    const { state } = await import('../src/state/index.js')
    const { buildContext, getAchievementBoard, getUnlockedCount } = await freshAchievements()
    state.set('progress.collectedCreatures', ['fenrir', 'garmr', 'surtr'])
    state.set('bond.fenrir', { bondExp: 35, interactionStats: {}, unlockedEvents: ['stage-30'], updatedAt: 1 })
    state.set('game.runeRecord', { runeName: 'Fehu', date: 1 })

    const ctx = buildContext({ totalCreatures: 14 })
    expect(ctx.collectedCount).toBe(3)
    expect(ctx.bondExps).toEqual([35])
    expect(ctx.maxBondExp).toBe(35)
    expect(ctx.unlockedEventCount).toBe(1)

    const board = getAchievementBoard({ totalCreatures: 14 })
    expect(pick(board, 'collector-3').unlocked).toBe(true)
    expect(pick(board, 'bond-first').unlocked).toBe(true)
    expect(pick(board, 'bond-milestone').unlocked).toBe(true)
    expect(pick(board, 'rune-listener').unlocked).toBe(true)
    expect(getUnlockedCount({ totalCreatures: 14 })).toBe(5) // + rookie
  })
})
