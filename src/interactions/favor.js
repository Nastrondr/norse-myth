// 神祇互动引擎（眷顾系统）：神祇详情页的信仰数值、阶段、
// 供品加成与神谕事件的纯逻辑，与 bond.js（生物羁绊）同构。
//
// 持久化约定（StateDB）：
//   state.get('favor.<godId>') →
//   { favorExp, offeringStats: { <offeringKey>: count }, unlockedEvents: [eventId], updatedAt }
//
// 阶段模型（favorMax 默认 100）：
//   0 立于神前 → 30 蒙神注视 → 60 神恩加身 → 100 眷顾之人
//
// 与羁绊的区别：神不可被"驯服"，眷顾表达的是"被神留意 → 被神认可"。
// 阶段与事件文案按神的 domain 首项推导；神祇数据可用 favorEvents / favorLikes /
// favorDislikes 字段覆写（见 norse.js 各神注释）。

import { state } from '@/state'

export const FAVOR_STAGES = [
  { min: 0, level: 1, name: '立于神前' },
  { min: 30, level: 2, name: '蒙神注视' },
  { min: 60, level: 3, name: '神恩加身' },
  { min: 100, level: 4, name: '眷顾之人' }
]

export function getFavorMax(god) {
  return Number(god && god.favorMax) || 100
}

/** 当前眷顾阶段（返回 FAVOR_STAGES 中最后满足 min 的项） */
export function getFavorStage(exp) {
  const value = Number(exp) || 0
  let current = FAVOR_STAGES[0]
  FAVOR_STAGES.forEach(stage => {
    if (value >= stage.min) current = stage
  })
  return current
}

/** 眷顾总进度百分比（0-100） */
export function getFavorProgress(exp, god) {
  const value = Number(exp) || 0
  const max = getFavorMax(god)
  return Math.min(100, Math.round((value / max) * 100))
}

// 各神域的供品集：神祇数据无 favorLikes 时按神职领域（domain 首项）取默认
const OFFERINGS_BY_DOMAIN = {
  智慧: ['蜂蜜酒', '诗歌残页', '盘缠', '卢恩刻痕'],
  战争: ['战利品', '誓言之刃', '麦酒', '伤口的盐'],
  死亡: ['亡者之名', '黑麦面包', '清水', '沉默'],
  诗歌: ['新写的诗行', '蜂蜜酒', '故事', '琴弦'],
  魔法: ['塞德之歌', '乌鸦羽', '月光下的水', '蜡与符文'],
  王权: ['忠诚之言', '金环', '宴席的头位', '决断'],
  雷霆: ['麦酒', '山羊奶', '雷雨夜的守约', '力量的证明'],
  力量: ['角力后的汗', '磐石', '麦酒', '不加欺瞒的比试'],
  守护: ['门槛的加固', '誓约', '麦酒', '孩童的平安'],
  风暴: ['桅杆上的许愿', '海盐', '雷雨夜的守约', '航路图'],
  诡计: ['有趣的谎言', '变装的面具', '尖锐的实话', '一小把火'],
  变形: ['鸟羽', '鲑鳞', '陌生的脚印', '不追问'],
  火: ['篝火的第一捧', '不打扰的灰烬', '一小把火', '夜路的灯'],
  混乱: ['打乱的秩序', '意外之言', '尖锐的实话', '大笑'],
  边界: ['界石', '门楣的刻痕', '不清点来客', '一首过界之歌'],
  爱情: ['玫瑰与蜂蜜', '真诚的赞美', '眼泪', '红线'],
  美: ['晨露', '真诚的赞美', '镜子', '不凋的花'],
  财富: ['金环', '琥珀', '分予他人之物', '账目清明'],
  婚姻: ['缠好的线团', '共食的面包', '誓言', '屋顶不漏'],
  预知: ['不言说的克制', '缠好的线团', '清水', '亡者之名'],
}
const DEFAULT_OFFERINGS = ['蜂蜜酒', '麦酒', '誓言', '清水']

/** 神祇的供品偏好：favorLikes/favorDislikes 覆写优先，否则按 domain 推导 */
export function getGodPreferences(god) {
  if (god && Array.isArray(god.favorLikes) && god.favorLikes.length) {
    return {
      likes: god.favorLikes,
      dislikes: Array.isArray(god.favorDislikes) ? god.favorDislikes : []
    }
  }
  const domains = (god && god.domain) || []
  const likes = []
  domains.forEach(d => {
    const list = OFFERINGS_BY_DOMAIN[d]
    if (list) list.forEach(item => { if (!likes.includes(item)) likes.push(item) })
  })
  return { likes: likes.length ? likes : DEFAULT_OFFERINGS, dislikes: [] }
}

// 阶段描述：按神域推导（眷顾卡文案）
const STAGE_DESCRIPTIONS = {
  智慧: { '立于神前': '你的言辞被独眼者听去了一半。', '蒙神注视': '渡鸦落在你能看见的地方。', '神恩加身': '一个问题在恰当的时刻自行解开。', '眷顾之人': '智慧不再对你藏起它的代价。' },
  战争: { '立于神前': '你尚在战场的边缘。', '蒙神注视': '你的名字被长矛点过。', '神恩加身': '恐惧来临时，你比它慢了半步。', '眷顾之人': '凡有战处，皆有你的一席。' },
  雷霆: { '立于神前': '雷声尚在别处。', '蒙神注视': '你被称作"客"，而非"外人"。', '神恩加身': '风暴绕开了你的屋顶。', '眷顾之人': '雷霆行走时，认得你的门。' },
  死亡: { '立于神前': '你的名字还不值得被记下。', '蒙神注视': '寒雾里有一次短暂的驻足。', '神恩加身': '你见过边界，边界也见过你。', '眷顾之人': '亡者之国的门前，为你留着一盏灯。' },
  诡计: { '立于神前': '谎言还不曾为你绕路。', '蒙神注视': '某个谎言里掺进了你的影子。', '神恩加身': '捷径开始在你脚下出现。', '眷顾之人': '连灾变都愿意与你分享玩笑。' },
  爱情: { '立于神前': '祈愿随风散去。', '蒙神注视': '回望时，目光不曾落空。', '神恩加身': '你想要答案时，猫先来了。', '眷顾之人': '泪水与黄金都认得你的手。' }
}

export function getStageDescription(god, stageName) {
  const key = god && god.domain && god.domain[0]
  const table = STAGE_DESCRIPTIONS[key] || STAGE_DESCRIPTIONS.智慧
  return table[stageName] || table['立于神前']
}

// 神谕事件模板：按神域差异化；神祇数据 favorEvents 字段整体覆写
const STAGE_EVENT_TEMPLATES = {
  wisdom: [
    { id: 'stage-30', threshold: 30, name: '被记下的名字', description: '你的名字出现在一次无关紧要的谈话里。' },
    { id: 'stage-60', threshold: 60, name: '神谕的余音', description: '一句只说给你听的提示，落在了正确的时机。' },
    { id: 'stage-100', threshold: 100, name: '立场的分量', description: '在需要表态的时刻，它站到了你这一侧。' }
  ],
  war: [
    { id: 'stage-30', threshold: 30, name: '点过的名字', description: '开战前列阵时，你的名字被念到了。' },
    { id: 'stage-60', threshold: 60, name: '矛影相护', description: '一次本该落下的攻击，莫名偏了半寸。' },
    { id: 'stage-100', threshold: 100, name: '不折之誓', description: '诸神黄昏的战场上，会有属于你的位置。' }
  ],
  nature: [
    { id: 'stage-30', threshold: 30, name: '初春的信物', description: '你门前的大地比别处早绿了三天。' },
    { id: 'stage-60', threshold: 60, name: '丰饶回礼', description: '你播下的种子，回报以超出所求的收成。' },
    { id: 'stage-100', threshold: 100, name: '四季同行', description: '风调雨顺之地，必有你走过的路。' }
  ],
  trickery: [
    { id: 'stage-30', threshold: 30, name: '借走的影子', description: '某个恶作剧里用了你的影子，事后归还了。' },
    { id: 'stage-60', threshold: 60, name: '同行一步', description: '那晚和你并肩走过黑暗的旅人，笑声似曾相识。' },
    { id: 'stage-100', threshold: 100, name: '玩笑之契', description: '它伤人时会避开你在意的一切，这是它的温柔。' }
  ],
  love: [
    { id: 'stage-30', threshold: 30, name: '不落空的回望', description: '你回头时，那道目光恰好也在。' },
    { id: 'stage-60', threshold: 60, name: '猫先来了', description: '你想要一个答案，猫车先停在了你门前。' },
    { id: 'stage-100', threshold: 100, name: '眼泪与黄金', description: '它教会你：两者都有重量，都值得郑重对待。' }
  ]
}

/** 神域 → 事件模板 key：domain 首项映射 */
const DOMAIN_TO_TEMPLATE = {
  智慧: 'wisdom', 诗歌: 'wisdom', 魔法: 'wisdom', 王权: 'wisdom',
  战争: 'war', 雷霆: 'war', 力量: 'war', 守护: 'war', 风暴: 'war',
  爱情: 'love', 美: 'love', 财富: 'love',
  诡计: 'trickery', 变形: 'trickery', 火: 'trickery', 混乱: 'trickery', 边界: 'trickery'
}

/** 神祇的神谕事件列表：数据 favorEvents 覆写优先，否则按神域模板 */
export function getStageEvents(god) {
  if (god && Array.isArray(god.favorEvents) && god.favorEvents.length) {
    return god.favorEvents
  }
  const key = DOMAIN_TO_TEMPLATE[(god && god.domain || [])[0]] || 'nature'
  return STAGE_EVENT_TEMPLATES[key]
}

/**
 * 计算一次供奉的眷顾增量（含喜好/禁忌联动）
 * 供品可带 tags（与 getGodPreferences 匹配）：
 * - 命中喜好：×1.5，返回加成提示
 * - 命中禁忌：×0.5（至少 1），返回冒犯提示
 */
export function computeGain(offering, god) {
  const base = Number(offering && offering.favor) || 5
  const tags = (offering && offering.tags) || []
  const { likes, dislikes } = getGodPreferences(god)
  const hitLike = tags.find(tag => likes.includes(tag))
  const hitDislike = tags.find(tag => dislikes.includes(tag))
  if (hitLike) {
    return { amount: Math.round(base * 1.5), note: `「${hitLike}」正合神意，眷顾大幅提升。` }
  }
  if (hitDislike) {
    return { amount: Math.max(1, Math.round(base * 0.5)), note: `神不喜「${hitDislike}」，这次供奉效果减半。` }
  }
  return { amount: base, note: '' }
}

/** 本次供奉跨过阈值、应当新解锁的神谕事件 */
export function newlyUnlockedEvents(events, prevExp, newExp) {
  return (events || []).filter(event => event.threshold > prevExp && event.threshold <= newExp)
}

// ===== StateDB 读写 =====

export function getFavorState(godId) {
  return state.get('favor.' + godId, {
    favorExp: 0,
    offeringStats: {},
    unlockedEvents: [],
    updatedAt: null
  })
}

export function saveFavorState(godId, patch) {
  const current = getFavorState(godId)
  const next = Object.assign({}, current, patch, { updatedAt: Date.now() })
  state.set('favor.' + godId, next)
  return next
}

export function resetFavorState(godId) {
  state.remove('favor.' + godId)
}
