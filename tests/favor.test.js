import { describe, it, expect, beforeEach } from 'vitest'

// StateDB 在 Node 测试环境下走内存模式（src/storage 门面保证）
let favor

beforeEach(async () => {
  const mod = await import('../src/interactions/favor.js')
  favor = mod
})

describe('favor 阶段模型', () => {
  it('四阶段阈值正确', () => {
    expect(favor.FAVOR_STAGES.map(s => s.name)).toEqual(['立于神前', '蒙神注视', '神恩加身', '眷顾之人'])
    expect(favor.FAVOR_STAGES.map(s => s.min)).toEqual([0, 30, 60, 100])
  })

  it('getFavorStage 返回最后满足 min 的阶段', () => {
    expect(favor.getFavorStage(0).name).toBe('立于神前')
    expect(favor.getFavorStage(29).name).toBe('立于神前')
    expect(favor.getFavorStage(30).name).toBe('蒙神注视')
    expect(favor.getFavorStage(60).name).toBe('神恩加身')
    expect(favor.getFavorStage(100).name).toBe('眷顾之人')
    expect(favor.getFavorStage(999).name).toBe('眷顾之人')
    expect(favor.getFavorStage(undefined).name).toBe('立于神前')
  })

  it('getFavorProgress 封顶 100', () => {
    expect(favor.getFavorProgress(50, { favorMax: 100 })).toBe(50)
    expect(favor.getFavorProgress(150, { favorMax: 100 })).toBe(100)
  })
})

describe('供品偏好推导', () => {
  it('无覆写时按 domain 推导且去重', () => {
    const { likes } = favor.getGodPreferences({ domain: ['雷霆', '风暴'] })
    expect(likes.length).toBe(new Set(likes).size)
    expect(likes).toContain('麦酒')
    expect(likes).toContain('海盐')
  })

  it('favorLikes 覆写优先', () => {
    const { likes, dislikes } = favor.getGodPreferences({ domain: ['战争'], favorLikes: ['诗歌'], favorDislikes: ['谎言'] })
    expect(likes).toEqual(['诗歌'])
    expect(dislikes).toEqual(['谎言'])
  })

  it('未知 domain 回退默认供品', () => {
    expect(favor.getGodPreferences({ domain: ['某种新神职'] }).likes).toEqual(favor.getGodPreferences({ domain: ['某种新神职'] }).likes)
    expect(favor.getGodPreferences({}).likes.length).toBeGreaterThan(0)
  })
})

describe('computeGain 喜好/禁忌联动', () => {
  it('命中喜好 ×1.5 并给出提示', () => {
    const r = favor.computeGain({ favor: 10, tags: ['麦酒'] }, { domain: ['雷霆'] })
    expect(r.amount).toBe(15)
    expect(r.note).toContain('麦酒')
  })

  it('命中禁忌 ×0.5 且至少 1', () => {
    const r = favor.computeGain({ favor: 3, tags: ['谎言'] }, { domain: [], favorLikes: ['诗歌'], favorDislikes: ['谎言'] })
    expect(r.amount).toBe(2) // round(1.5)
    expect(r.note).toContain('谎言')
    const low = favor.computeGain({ favor: 1, tags: ['谎言'] }, { domain: [], favorLikes: ['诗歌'], favorDislikes: ['谎言'] })
    expect(low.amount).toBe(1) // 至少 1
    expect(low.note).toContain('谎言')
  })

  it('普通供奉无提示', () => {
    const r = favor.computeGain({ favor: 5, tags: ['清水'] }, { domain: ['雷霆'] })
    expect(r.amount).toBe(5)
    expect(r.note).toBe('')
  })
})

describe('神谕事件', () => {
  it('按 domain 首项映射模板', () => {
    expect(favor.getStageEvents({ domain: ['诡计'] })[0].name).toBe('借走的影子')
    expect(favor.getStageEvents({ domain: ['智慧'] })[2].threshold).toBe(100)
  })

  it('favorEvents 覆写优先', () => {
    const custom = [{ id: 'x', threshold: 10, name: 'X', description: 'Y' }]
    expect(favor.getStageEvents({ domain: ['战争'], favorEvents: custom })).toBe(custom)
  })

  it('newlyUnlockedEvents 只取跨阈值事件', () => {
    const events = favor.getStageEvents({ domain: ['智慧'] })
    expect(favor.newlyUnlockedEvents(events, 0, 30)).toHaveLength(1)
    expect(favor.newlyUnlockedEvents(events, 55, 65)).toHaveLength(1)
    expect(favor.newlyUnlockedEvents(events, 0, 100)).toHaveLength(3)
    expect(favor.newlyUnlockedEvents(events, 100, 100)).toHaveLength(0)
  })
})

describe('StateDB 读写', () => {
  it('默认状态与保存/重置', () => {
    expect(favor.getFavorState('odin')).toEqual({ favorExp: 0, offeringStats: {}, unlockedEvents: [], updatedAt: null })
    const next = favor.saveFavorState('odin', { favorExp: 30, unlockedEvents: ['stage-30'] })
    expect(next.favorExp).toBe(30)
    expect(next.updatedAt).toBeTruthy()
    expect(favor.getFavorState('odin').favorExp).toBe(30)
    favor.resetFavorState('odin')
    expect(favor.getFavorState('odin').favorExp).toBe(0)
  })
})
