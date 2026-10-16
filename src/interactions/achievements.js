// 统一成就引擎：把收集进度、羁绊里程碑（P3）、游戏记录、渡鸦线索与世界树进度
// 汇聚为同一套成就注册表，供档案页「称号墙」与称号推导消费。
//
// 设计：
// - 成就 = { id, name, desc, category, check(ctx), progress?(ctx) }
//   check 返回是否解锁；progress 返回 { current, total } 用于未解锁时展示进度
// - ctx 由 buildContext 从 StateDB 各命名空间构建，支持 overrides 便于测试与扩展
// - 称号（getTitle）沿用原档案页优先级：世界树进度 > 神格匹配 > 谣言之书 > 默认
//
// 数据来源（StateDB 路径）：
//   progress.collectedCreatures / progress.ravens / progress.worldTree
//   bond.<id>（羁绊状态，含 unlockedEvents）
//   game.godMatch / game.rumorBook / game.runeRecord

import { state } from '@/state'

// 成就分类：探索 / 羁绊 / 智识 / 进度
const ACHIEVEMENTS = [
  // ===== 探索 =====
  {
    id: 'rookie',
    name: '见习记录员',
    desc: '踏上九界的记录之旅',
    category: '探索',
    check: () => true
  },
  {
    id: 'collector-3',
    name: '初阶收藏家',
    desc: '收集 3 只神话生物',
    category: '探索',
    check: ctx => ctx.collectedCount >= 3,
    progress: ctx => ({ current: ctx.collectedCount, total: 3 })
  },
  {
    id: 'collector-8',
    name: '图鉴编纂者',
    desc: '收集 8 只神话生物',
    category: '探索',
    check: ctx => ctx.collectedCount >= 8,
    progress: ctx => ({ current: ctx.collectedCount, total: 8 })
  },
  {
    id: 'collector-all',
    name: '九界全景',
    desc: '集齐全部神话生物',
    category: '探索',
    check: ctx => ctx.collectedCount >= ctx.totalCreatures,
    progress: ctx => ({ current: ctx.collectedCount, total: ctx.totalCreatures })
  },
  {
    id: 'raven-finder',
    name: '渡鸦线索发现者',
    desc: '发现第一条渡鸦线索',
    category: '探索',
    check: ctx => ctx.ravenClueCount > 0,
    progress: ctx => ({ current: ctx.ravenClueCount, total: 3 })
  },
  {
    id: 'raven-revealed',
    name: '渡鸦之友',
    desc: '让渡鸦的真实身份显现',
    category: '探索',
    check: ctx => ctx.ravens.revealed === true
  },

  // ===== 羁绊（消费 P3 通用羁绊引擎的数据） =====
  {
    id: 'bond-first',
    name: '初结羁绊',
    desc: '任一生物羁绊达到「试探」',
    category: '羁绊',
    check: ctx => ctx.bondExps.some(exp => exp >= 30),
    progress: ctx => ({ current: ctx.maxBondExp, total: 30 })
  },
  {
    id: 'bond-milestone',
    name: '里程碑记录者',
    desc: '解锁第一个羁绊里程碑事件',
    category: '羁绊',
    check: ctx => ctx.unlockedEventCount >= 1,
    progress: ctx => ({ current: ctx.unlockedEventCount, total: 1 })
  },
  {
    id: 'bond-trust',
    name: '三位挚友',
    desc: '3 只生物羁绊达到「信任」',
    category: '羁绊',
    check: ctx => ctx.bondExps.filter(exp => exp >= 60).length >= 3,
    progress: ctx => ({ current: ctx.bondExps.filter(exp => exp >= 60).length, total: 3 })
  },
  {
    id: 'bond-companion',
    name: '同行者',
    desc: '任一生物羁绊满级（同行）',
    category: '羁绊',
    check: ctx => ctx.bondExps.some(exp => exp >= 100),
    progress: ctx => ({ current: ctx.maxBondExp, total: 100 })
  },

  // ===== 智识 =====
  {
    id: 'god-matched',
    name: '神格显现者',
    desc: '完成神祇匹配',
    category: '智识',
    check: ctx => !!(ctx.godMatch && ctx.godMatch.primary)
  },
  {
    id: 'rumor-solved',
    name: '传闻辨析者',
    desc: '完成谣言之书',
    category: '智识',
    check: ctx => !!ctx.rumorBook
  },
  {
    id: 'lore-master',
    name: '九界考据者',
    desc: '谣言之书正确率 80% 以上',
    category: '智识',
    check: ctx => !!(ctx.rumorBook && Number(ctx.rumorBook.accuracy) >= 80)
  },
  {
    id: 'rune-listener',
    name: '卢恩聆听者',
    desc: '完成三符文占卜',
    category: '智识',
    check: ctx => !!ctx.runeRecord
  },

  // ===== 进度 =====
  {
    id: 'world-traveler',
    name: '九界旅人',
    desc: '世界树进度达到 40%',
    category: '进度',
    check: ctx => ctx.worldTreeProgress >= 40,
    progress: ctx => ({ current: ctx.worldTreeProgress, total: 40 })
  },
  {
    id: 'world-pilgrim',
    name: '世界树巡礼者',
    desc: '世界树进度达到 70%',
    category: '进度',
    check: ctx => ctx.worldTreeProgress >= 70,
    progress: ctx => ({ current: ctx.worldTreeProgress, total: 70 })
  }
]

/** 从 StateDB 构建成就上下文；overrides 可覆盖任意字段（测试 / 扩展用） */
export function buildContext(overrides) {
  const collected = state.get('progress.collectedCreatures', [])
  const bonds = state.get('bond', {}) || {}
  const bondList = Object.values(bonds)
  const ravens = state.get('progress.ravens', { clueIds: [], revealed: false }) || { clueIds: [], revealed: false }
  const worldTree = state.get('progress.worldTree', {}) || {}
  const bondExps = bondList.map(b => Number(b && b.bondExp) || 0)
  const ctx = {
    collected,
    collectedCount: collected.length,
    totalCreatures: 14,
    bonds,
    bondExps,
    maxBondExp: bondExps.length ? Math.max(...bondExps) : 0,
    unlockedEventCount: bondList.reduce((sum, b) => sum + ((b && b.unlockedEvents && b.unlockedEvents.length) || 0), 0),
    ravens,
    ravenClueCount: (ravens.clueIds || []).length,
    godMatch: state.get('game.godMatch'),
    rumorBook: state.get('game.rumorBook'),
    runeRecord: state.get('game.runeRecord'),
    worldTree,
    worldTreeProgress: Number(worldTree.totalProgress) || 0
  }
  return Object.assign(ctx, overrides || {})
}

/** 全部成就看板：[{ id, name, desc, category, unlocked, progress? }] */
export function getAchievementBoard(overrides) {
  const ctx = buildContext(overrides)
  return ACHIEVEMENTS.map(def => {
    const item = {
      id: def.id,
      name: def.name,
      desc: def.desc,
      category: def.category,
      unlocked: false
    }
    try {
      item.unlocked = !!def.check(ctx)
    } catch (e) {
      item.unlocked = false
    }
    if (!item.unlocked && def.progress) {
      const p = def.progress(ctx)
      if (p && Number.isFinite(p.current) && p.total > 0) item.progress = p
    }
    return item
  })
}

/** 已解锁数量 */
export function getUnlockedCount(overrides) {
  return getAchievementBoard(overrides).filter(a => a.unlocked).length
}

/** 探索者称号（沿用档案页原优先级语义） */
export function getTitle(overrides) {
  const ctx = buildContext(overrides)
  if (ctx.worldTreeProgress >= 70) return '世界树巡礼者'
  if (ctx.worldTreeProgress >= 40) return '九界旅人'
  if (ctx.godMatch && ctx.godMatch.primary) return '神格显现者'
  if (ctx.rumorBook) return '传闻辨析者'
  return '见习记录员'
}

export default { buildContext, getAchievementBoard, getUnlockedCount, getTitle }
