// 通用羁绊引擎：普通生物（非 spirit/abyss 专属系统）的羁绊数值、阶段、
// 喜好加成与里程碑事件的纯逻辑，供 creature-detail 页面调用。
//
// 持久化约定（StateDB）：
//   state.get('bond.<creatureId>') →
//   { bondExp, interactionStats: { <actionKey>: count }, unlockedEvents: [eventId], updatedAt }
//
// 阶段模型（bondMax 默认 100）：
//   0 初识 → 30 试探 → 60 信任 → 100 同行

import { state } from '@/state'

export const BOND_STAGES = [
  { min: 0, level: 1, name: '初识' },
  { min: 30, level: 2, name: '试探' },
  { min: 60, level: 3, name: '信任' },
  { min: 100, level: 4, name: '同行' }
]

export function getBondMax(creature) {
  return Number(creature && creature.bondMax) || 100
}

/** 当前羁绊阶段（返回 BOND_STAGES 中最后满足 min 的项） */
export function getBondStage(exp) {
  const value = Number(exp) || 0
  let current = BOND_STAGES[0]
  BOND_STAGES.forEach(stage => {
    if (value >= stage.min) current = stage
  })
  return current
}

/** 羁绊进度百分比（阶段内进度） */
export function getBondProgress(exp, creature) {
  const value = Number(exp) || 0
  const max = getBondMax(creature)
  return Math.min(100, Math.round((value / max) * 100))
}

// 各互动类型的阶段描述（用于羁绊卡文案）
const STAGE_DESCRIPTIONS = {
  beast: { '初识': '它仍保持警觉，但开始熟悉你的气息。', '试探': '它允许你在一定距离内停留。', '信任': '它会在你面前放下戒备。', '同行': '它把你的存在当作领地的一部分。' },
  danger: { '初识': '你们之间只有谨慎的距离。', '试探': '它记住了你不曾冒犯。', '信任': '不是驯服，而是彼此承认边界。', '同行': '你在它眼中不再只是猎物或威胁。' },
  divine: { '初识': '你的礼节被看见了。', '试探': '神性开始留意你的选择。', '信任': '立场与代价换来了认可。', '同行': '它愿意在你需要时现身。' },
  craftsman: { '初识': '一次清晰的交换胜过空话。', '试探': '可靠的承诺开始累积。', '信任': '它愿意为你留出工位。', '同行': '你们已是彼此信赖的合作者。' },
  underworld: { '初识': '你以合适的礼节靠近了死亡边界。', '试探': '沉默开始回应你的沉默。', '信任': '寒雾深处不再拒绝你的脚步。', '同行': '亡者之路对你敞开。' },
  person: { '初识': '关系仍在试探之中。', '试探': '交谈开始有了默契。', '信任': '它愿意与你分享见闻。', '同行': '你是它可以托付后背的存在。' },
  spirit: { '初识': '微光在树影间短暂显现。', '试探': '雾中传来尚不成形的回应。', '信任': '微光开始在你身旁停留。', '同行': '冷光成为你与林地的纽带。' }
}

export function getStageDescription(interactionType, stageName) {
  const table = STAGE_DESCRIPTIONS[interactionType] || STAGE_DESCRIPTIONS.person
  return table[stageName] || table['初识']
}

// 里程碑事件模板：按互动类型差异化；生物数据可用 bondEvents 字段整体覆写
const STAGE_EVENT_TEMPLATES = {
  beast: [
    { id: 'stage-30', threshold: 30, name: '共享领地', description: '它第一次在你的注视下进食，没有把猎物拖远。' },
    { id: 'stage-60', threshold: 60, name: '风中的气息', description: '隔着风，你已能分辨它的情绪。' },
    { id: 'stage-100', threshold: 100, name: '同行的兽', description: '它开始在你的路线上留下记号——那是接纳的信号。' }
  ],
  danger: [
    { id: 'stage-30', threshold: 30, name: '未出的爪', description: '它在你面前收起了爪子。这不是温顺，而是评估。' },
    { id: 'stage-60', threshold: 60, name: '边界契约', description: '你们各自后退半步，一条看不见的界线被共同遵守。' },
    { id: 'stage-100', threshold: 100, name: '命运的见证者', description: '传说中与灾厄缔约的人会留下名字。你留下了。' }
  ],
  divine: [
    { id: 'stage-30', threshold: 30, name: '被记下的名字', description: '你的名字出现在一次无关紧要的谈话里。' },
    { id: 'stage-60', threshold: 60, name: '神谕的余音', description: '一句只说给你听的提示，落在了正确的时机。' },
    { id: 'stage-100', threshold: 100, name: '立场的分量', description: '在需要表态的时刻，它站到了你这一侧。' }
  ],
  craftsman: [
    { id: 'stage-30', threshold: 30, name: '公平的第一单', description: '一次分毫不差的交付，换来了下次合作的可能。' },
    { id: 'stage-60', threshold: 60, name: '炉边的位置', description: '锻炉边多了一把属于你的矮凳。' },
    { id: 'stage-100', threshold: 100, name: '署名的协作', description: '它开始在新作品上刻下两个名字。' }
  ],
  underworld: [
    { id: 'stage-30', threshold: 30, name: '守约者', description: '你遵守了一条没人监督的规则。寒雾记住了。' },
    { id: 'stage-60', threshold: 60, name: '低语的回应', description: '亡者的低语第一次绕开了你。' },
    { id: 'stage-100', threshold: 100, name: '边界同行者', description: '你可以带着活人的名字，走过死亡的国度。' }
  ],
  person: [
    { id: 'stage-30', threshold: 30, name: '炉边夜话', description: '一次随口的约定，它第二天真的等在原地。' },
    { id: 'stage-60', threshold: 60, name: '交换的见闻', description: '它把只有本地人知道的路径告诉了你。' },
    { id: 'stage-100', threshold: 100, name: '可托付之人', description: '它的秘密有了第二个保管者。' }
  ],
  spirit: [
    { id: 'stage-30', threshold: 30, name: '微光初现', description: '树影间的冷光第一次朝你的方向偏了偏。' },
    { id: 'stage-60', threshold: 60, name: '雾中同行', description: '你走，光也走；你停，光也停。' },
    { id: 'stage-100', threshold: 100, name: '亚尔夫之友', description: '冷光成为你与林地之间的纽带。' }
  ]
}

/** 生物的里程碑事件列表：数据 bondEvents 覆写优先，否则按互动类型模板 */
export function getStageEvents(creature, interactionType) {
  if (creature && Array.isArray(creature.bondEvents) && creature.bondEvents.length) {
    return creature.bondEvents
  }
  return STAGE_EVENT_TEMPLATES[interactionType] || STAGE_EVENT_TEMPLATES.person
}

/**
 * 计算一次互动的羁绊增量（含喜好/禁忌联动）
 * 动作可带 tags: ['肉食', ...]，与 creature.likes / dislikes 匹配：
 * - 命中喜好：×1.5，返回加成提示
 * - 命中禁忌：×0.5（至少 1），返回冒犯提示
 */
export function computeGain(action, creature) {
  const base = Number(action && action.bond) || 5
  const tags = (action && action.tags) || []
  const likes = (creature && creature.likes) || []
  const dislikes = (creature && creature.dislikes) || []
  const hitLike = tags.find(tag => likes.includes(tag))
  const hitDislike = tags.find(tag => dislikes.includes(tag))
  if (hitLike) {
    return { amount: Math.round(base * 1.5), note: `「${hitLike}」正合它的心意，羁绊大幅提升。` }
  }
  if (hitDislike) {
    return { amount: Math.max(1, Math.round(base * 0.5)), note: `它厌恶「${hitDislike}」，这次互动效果减半。` }
  }
  return { amount: base, note: '' }
}

/** 本次互动跨过阈值、应当新解锁的里程碑事件 */
export function newlyUnlockedEvents(events, prevExp, newExp) {
  return (events || []).filter(event => event.threshold > prevExp && event.threshold <= newExp)
}

// ===== StateDB 读写 =====

export function getBondState(creatureId) {
  return state.get('bond.' + creatureId, {
    bondExp: 0,
    interactionStats: {},
    unlockedEvents: [],
    updatedAt: null
  })
}

export function saveBondState(creatureId, patch) {
  const current = getBondState(creatureId)
  const next = Object.assign({}, current, patch, { updatedAt: Date.now() })
  state.set('bond.' + creatureId, next)
  return next
}

export function resetBondState(creatureId) {
  state.remove('bond.' + creatureId)
}
