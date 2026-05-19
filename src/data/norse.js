// 北欧神话数据库 v2.0
// 包含：神祇、故事、生物、九界、卢恩符文

// ========== 九界数据 ==========
export const realms = [
  {
    id: 'asgard',
    name: '阿斯加德',
    originalName: 'Asgard',
    description: '阿萨神族的家园，金宫所在地。众神在此裁决九界命运。',
    type: '神域',
    relatedGods: ['odin', 'thor', 'freya', 'heimdall', 'tyr'],
    relatedCreatures: [],
    relatedStories: ['ragnarok'],
    unlocked: true
  },
  {
    id: 'midgard',
    name: '米德加德',
    originalName: 'Midgard',
    description: '人类居住的世界，位于世界树尤克特拉希尔之中。',
    type: '人间',
    relatedGods: ['odin'],
    relatedCreatures: ['elf', 'dwarf'],
    relatedStories: ['creation'],
    unlocked: true
  },
  {
    id: 'jotunheim',
    name: '约顿海姆',
    originalName: 'Jötunheim',
    description: '巨人的领地，充满原始与野性之力。',
    type: '巨人领域',
    relatedGods: [],
    relatedCreatures: ['jotun'],
    relatedStories: ['thors-hammer'],
    unlocked: true
  },
  {
    id: 'vanaheim',
    name: '华纳海姆',
    originalName: 'Vanaheim',
    description: '华纳神族的家园，魔法与自然的圣地。',
    type: '神域',
    relatedGods: ['freya'],
    relatedCreatures: [],
    relatedStories: [],
    unlocked: false
  },
  {
    id: 'alfheim',
    name: '亚尔夫海姆',
    originalName: 'Álfheim',
    description: '光明精灵的居所，永恒的荣耀之地。',
    type: '精灵领域',
    relatedGods: [],
    relatedCreatures: ['elf'],
    relatedStories: [],
    unlocked: false
  },
  {
    id: 'svartalfheim',
    name: '斯瓦特海姆',
    originalName: 'Svartalfheim',
    description: '黑暗精灵与矮人的地下王国，锻造与工艺之神殿。',
    type: '矮人领域',
    relatedGods: [],
    relatedCreatures: ['dwarf'],
    relatedStories: ['thors-hammer'],
    unlocked: false
  },
  {
    id: 'niflheim',
    name: '尼福尔海姆',
    originalName: 'Niflheim',
    description: '冰雪与雾的冥界，宇宙初开时的起源地之一。',
    type: '冥界',
    relatedGods: [],
    relatedCreatures: ['hel'],
    relatedStories: ['creation'],
    unlocked: false
  },
  {
    id: 'muspelheim',
    name: '穆斯贝尔海姆',
    originalName: 'Muspelheim',
    description: '火焰与熔岩之国，火焰巨人苏尔特的领地。',
    type: '火焰国',
    relatedGods: [],
    relatedCreatures: [],
    relatedStories: ['ragnarok'],
    unlocked: false
  },
  {
    id: 'helheim',
    name: '赫尔海姆',
    originalName: 'Helheim',
    description: '死亡女王海尔统治的冥府亡者之国。',
    type: '亡者领域',
    relatedGods: [],
    relatedCreatures: ['hel', 'fenrir'],
    relatedStories: ['ragnarok'],
    unlocked: false
  }
]

// ========== 神祇数据 v2.0 ==========
export const gods = [
  {
    id: 'odin',
    name: '奥丁',
    originalName: 'Óðinn',
    title: '众神之父',
    faction: '阿萨神族',
    realm: ['asgard', 'midgard'],
    domain: ['智慧', '战争', '诗歌', '死亡'],
    symbols: ['永恒之枪', '渡鸦', '狼', '八足马'],
    artifact: ['永恒之枪冈古尼尔', '指环德罗普尼尔'],
    description: '阿萨神族的领袖智慧的之父。为获得智慧之泉的奥秘，他牺牲了一只眼睛，换来无尽的智慧与诗歌。',
    image: '/static/gods/odin.png',
    relationships: {
      parents: ['包尔'],
      spouse: ['弗丽嘉'],
      children: ['thor', 'loki', 'balder'],
      allies: ['heimdall', 'tyr'],
      enemies: ['loki']
    },
    attributes: {
      wisdom: 100,
      combat: 85,
      magic: 90,
      authority: 100,
      fate: 95
    },
    stories: ['creation', 'ragnarok', 'odin-wisdom']
  },
  {
    id: 'thor',
    name: '索尔',
    originalName: 'Þór',
    title: '雷神',
    faction: '阿萨神族',
    realm: ['asgard', 'midgard'],
    domain: ['雷电', '力量', '风暴'],
    symbols: ['雷神之锤', '山羊车', '力量腰带'],
    artifact: ['雷神之锤妙尼尔', '雅恩格利'],
    description: '奥丁之子，阿萨神族最强大的战士。乘坐山羊车巡视九界，抵御巨人的入侵。',
    image: '/static/gods/thor.png',
    relationships: {
      parents: ['odin'],
      spouse: ['西芙'],
      children: ['modi', 'thrud'],
      allies: ['odin'],
      enemies: ['jormungandr', 'loki']
    },
    attributes: {
      wisdom: 60,
      combat: 100,
      magic: 70,
      authority: 85,
      fate: 50
    },
    stories: ['thors-hammer', 'ragnarok']
  },
  {
    id: 'loki',
    name: '洛基',
    originalName: 'Loki',
    title: '诡计之神',
    faction: '巨人',
    realm: ['asgard'],
    domain: ['诡计', '欺骗', '变形'],
    symbols: ['火', '银色皮肤'],
    artifact: [],
    description: '巨人之后，却成为奥丁的兄弟。既是诸神的朋友，也是诸神黄昏的导火索。',
    image: '/static/gods/loki.png',
    relationships: {
      parents: ['法拉博尔坦'],
      spouse: ['西格露恩'],
      children: ['fenrir', 'jormungandr', 'hel'],
      allies: [],
      enemies: ['heimdall', 'thor']
    },
    attributes: {
      wisdom: 95,
      combat: 50,
      magic: 100,
      authority: 60,
      fate: 90
    },
    stories: ['thors-hammer', 'ragnarok']
  },
  {
    id: 'freya',
    name: '弗雷娅',
    originalName: 'Freyja',
    title: '爱与美之女神',
    faction: '华纳神族',
    realm: ['vanaheim', 'asgard'],
    domain: ['爱', '美', '战争', '魔法'],
    symbols: ['项链', '战甲', '猫', '羽毛衣'],
    artifact: ['项链布利辛格', '斯拉姆德'],
    description: '华纳神族最尊贵的神，掌管爱与美，同时司掌战争与魔法。',
    image: '/static/gods/freya.png',
    relationships: {
      parents: ['尼德'],
      spouse: ['弗雷'],
      children: [],
      allies: ['odin'],
      enemies: []
    },
    attributes: {
      wisdom: 85,
      combat: 75,
      magic: 90,
      authority: 80,
      fate: 70
    },
    stories: []
  },
  {
    id: 'heimdall',
    name: '海姆达尔',
    originalName: 'Heimdallr',
    title: '彩虹桥守护者',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['界限', '守护'],
    symbols: ['号角', '彩虹桥'],
    artifact: ['号角加拉尔'],
    description: '彩虹桥比弗罗斯特的守护者。拥有超凡的感官，能听到草生长的声音。',
    image: '/static/gods/heimdall.png',
    relationships: {
      parents: [' nine mothers'],
      spouse: [],
      children: [],
      allies: ['odin'],
      enemies: ['loki', 'fenrir']
    },
    attributes: {
      wisdom: 80,
      combat: 85,
      magic: 65,
      authority: 90,
      fate: 75
    },
    stories: ['ragnarok']
  },
  {
    id: 'tyr',
    name: '提尔',
    originalName: 'Týr',
    title: '战争与正义之神',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['战争', '正义', '荣誉'],
    symbols: ['断臂', '狼'],
    artifact: [],
    description: '为封印恶狼芬里尔，他牺牲了自己的手臂。象征勇气与牺牲。',
    image: '/static/gods/tyr.png',
    relationships: {
      parents: ['奥丁'],
      spouse: [],
      children: [],
      allies: ['odin'],
      enemies: ['fenrir', 'loki']
    },
    attributes: {
      wisdom: 75,
      combat: 90,
      magic: 50,
      authority: 85,
      fate: 60
    },
    stories: []
  },
  {
    id: 'freyr',
    name: '弗雷',
    originalName: 'Freyr',
    title: '丰饶之神',
    faction: '华纳神族',
    realm: ['vanaheim', 'alfheim'],
    domain: ['丰饶', '和平', '阳光'],
    symbols: [' boar', '船'],
    artifact: [' корабль斯基德布拉德尼尔'],
    description: '弗雷娅的兄弟，华纳神族的领袖。主管丰饶与和平。',
    image: '/static/gods/freyr.png',
    relationships: {
      parents: ['尼德'],
      spouse: ['格尔萝德'],
      children: [],
      allies: ['freya'],
      enemies: []
    },
    attributes: {
      wisdom: 70,
      combat: 75,
      magic: 65,
      authority: 80,
      fate: 65
    },
    stories: []
  },
  {
    id: 'frigg',
    name: '弗丽嘉',
    originalName: 'Frigg',
    title: '众之后',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['婚姻', '预知', '智慧'],
    symbols: ['隼羽衣'],
    artifact: [],
    description: '奥丁之妻，主管婚姻与智慧。能预知未来，却无法改变命运。',
    image: '/static/gods/frigg.png',
    relationships: {
      parents: ['菲斯托'],
      spouses: ['odin'],
      children: ['balder'],
      allies: ['odin'],
      enemies: []
    },
    attributes: {
      wisdom: 90,
      combat: 30,
      magic: 85,
      authority: 90,
      fate: 70
    },
    stories: []
  }
]

// ========== 故事数据 v2.0 ==========
export const stories = [
  {
    id: 'creation',
    title: '世界的创造',
    category: '创世',
    summary: '从虚无中诞生世界，九界形成的史诗。',
    content: `在最早的时期，世界上只有冰与火。

尼福尔海姆是冰雪的世界，而穆海尔是火焰的世界。两者之间的空隙叫做金恩加格洛。

奥丁、维利和威三位阿萨神族创造了世界。他们杀死了巨人尤弥尔，用他的身体创造了：
- 他的血液变成了海洋
- 他的骨头变成了山脉
- 他的牙齿变成了岩石
- 他的头发变成了树木
- 他的头盖骨变成了天空

然后他们创造了中庭——人类居住的世界。世界树尤克特拉希尔将九界连接在一起。`,
    characters: ['odin', 'vili', 've'],
    realms: ['niflheim', 'muspelheim', 'midgard', 'asgard'],
    readingTime: '3分钟',
    notes: ['尤弥尔是宇宙中最古老的巨人', '世界树贯穿九界'],
    relatedGods: ['odin'],
    relatedCreatures: []
  },
  {
    id: 'ragnarok',
    title: '诸神黄昏',
    category: '诸神黄昏',
    summary: '世界末日与重生的终极预言。',
    content: `诸神黄昏是北欧神话中最著名的预言，预示着世界的终结与重生。

征兆：
- 芬里尔挣脱锁链
- 洛基带领巨人入侵
- 地球震动，世界树颤抖
- 天空出现三个太阳

战斗：
- 索尔与耶梦加德同归于尽
- 奥丁被芬里尔吞噬
- 海姆达尔与洛基同归于尽

之后：
- 世界沉入海底
- 火焰吞噬天空
- 从海水中升起新的土地
- 新的众神诞生
- 幸存的人类重新繁衍`,
    characters: ['odin', 'thor', 'loki', 'heimdall', 'fenrir', 'jormungandr'],
    realms: ['asgard', 'midgard', 'niflheim', 'muspelheim'],
    readingTime: '4分钟',
    notes: ['诸神黄昏也是新的开始', '预言不可改变但可抗争'],
    relatedGods: ['odin', 'thor', 'loki', 'heimdall'],
    relatedCreatures: ['fenrir', 'jormungandr', 'hel']
  },
  {
    id: 'thors-hammer',
    title: '雷神之锤的诞生',
    category: '神器',
    summary: '矮人打造的神器，索尔力量的来源。',
    content: `洛基剪掉了索尔的妻子西芙的头发，这激怒了索尔。

洛基被迫去找矮人帮忙打造新的头发。他找到了艾特里家族—— 世界上最优秀的铁匠。

矮人们用四种特殊材料打造了神器：
- 雷神之锤（Mjölnir）—— 最强大的武器，能击碎任何敌人
- 永恒之枪（Gungnir）—— 永远命中目标
- 德罗普尼尔（Draupnar）—— 一枚变九枚的金戒指
- 斯基德布拉德尼尔（Ski）—— 最快的船

洛基试图偷走这些宝藏，但矮人们认出了他。`,
    characters: ['loki', 'thor', 'sif'],
    realms: ['svartalfheim'],
    readingTime: '2分钟',
    notes: ['矮人的锻造技艺举世无双', '雷神之锤是索尔的象征'],
    relatedGods: ['loki', 'thor'],
    relatedCreatures: ['dwarf']
  },
  {
    id: 'odin-wisdom',
    title: '奥丁寻找智慧',
    category: '众神',
    summary: '为智慧牺牲眼睛的史诗。',
    content: `奥丁渴求智慧。他听说在智慧之泉边可以学到一切。

通往智慧之泉的唯一道路是经过巨人米米尔的地方。巨人守护着那泓泉水。

奥丁请求喝一口智慧之泉的水。米米尔同意，但条件是奥丁要用他的一只眼睛来交换。

奥丁同意了这个条件。他把一只眼睛留在了智慧之泉边，喝下了泉水。

从此，他知道了世界上所有的秘密和智慧：
- 卢恩文字的奥秘
- 过去、现在、未来的秘密
- 所有生物的名字
- 战争与和平的智慧

他牺牲了一只眼睛，换来了无穷的智慧。`,
    characters: ['odin'],
    realms: ['midgard'],
    readingTime: '2分钟',
    notes: ['智慧总是有代价的', '奥丁的独眼是他的标志'],
    relatedGods: ['odin'],
    relatedCreatures: []
  }
]

// ========== 生物数据 v2.0 ==========
export const creatures = [
  {
    id: 'fenrir',
    name: '芬里尔',
    originalName: 'Fenrir',
    type: '巨狼',
    realm: 'helheim',
    dangerLevel: '极危',
    interactionType: 'danger',
    description: '洛基与安格波达的儿子，是一只巨大的魔狼。诸神试图用链条锁住他，但前两条都被他挣脱。第三条由侏儒打造，他无法挣脱。',
    power: '吞噬天地',
    relatedStories: ['ragnarok'],
    collected: true
  },
  {
    id: 'jormungandr',
    name: '耶梦加得',
    originalName: 'Jörmungandr',
    type: '巨蛇',
    realm: 'midgard',
    dangerLevel: '极危',
    interactionType: 'abyss',
    description: '洛基与安格尔波达之子，被奥丁投入大海，最终长成环绕人间世界的巨蛇。',
    power: '毒液环绕世界',
    relatedStories: ['ragnarok'],
    collected: true,
    status: 'observed',
    abyssAwareness: 0,
    abyssMax: 100,
    riskLevel: 0,
    riskMax: 100,
    abyssFrozen: false,
    missing: false,
    lastSignal: '无',
    interactionCount: 0,
    highRiskCount: 0,
    abyssStage: '海雾之下',
    mood: '不可测',
    likes: ['深海', '边界', '潮汐'],
    dislikes: ['雷霆', '挑衅', '靠近'],
    interactionStats: {
      distantView: 0,
      tideListen: 0,
      worship: 0,
      record: 0,
      retreat: 0,
      touch: 0
    },
    badges: [
      { id: 'abyss-witness', name: '海渊见证者', type: 'complete', unlocked: false, desc: '你见证了盘绕米德加德的世界之蛇，却没有试图占有它。' },
      { id: 'tide-recorder', name: '潮汐记录者', type: 'cautious', unlocked: false, desc: '你以克制的方式记录世界之蛇，没有惊动深海。' },
      { id: 'boundary-toucher', name: '边界触碰者', type: 'risk', unlocked: false, desc: '你越过了安全距离，也因此理解了灾厄为何不可被靠近。' },
      { id: 'abyss-reverent', name: '深海敬畏者', type: 'reverent', unlocked: false, desc: '你明白有些存在不能靠近，只能以敬畏与退让维持边界。' },
      { id: 'empty-sea-trace', name: '空海遗痕', type: 'missing', unlocked: false, desc: '世界之蛇沉入外海。你留下的，只是一段无法继续的记录。' }
    ]
  },
  {
    id: 'hel',
    name: '海尔',
    originalName: 'Hel',
    type: '亡灵',
    realm: 'helheim',
    dangerLevel: '高',
    interactionType: 'underworld',
    description: '洛基与安格波达的女儿，统治着冥界尼福尔海姆。她半边是美丽的女人，半边是腐烂的尸体。',
    power: '死亡支配',
    relatedStories: ['ragnarok'],
    collected: true
  },
  {
    id: 'dwarf',
    name: '矮人',
    originalName: 'Dwarves',
    type: '矮人',
    realm: 'svartalfheim',
    dangerLevel: '低',
    interactionType: 'craftsman',
    description: '矮人是出色的工匠，他们居住在斯瓦特海姆地下，打造了无数的神器。',
    power: '锻造',
    relatedStories: ['thors-hammer'],
    collected: true
  },
  {
    id: 'elf',
    name: '精灵',
    originalName: 'Elves',
    type: '精灵',
    realm: 'alfheim',
    dangerLevel: '低',
    interactionType: 'spirit',
    description: '精灵分为光明精灵和黑暗精灵。光明精灵住在阿尔夫海姆，美丽而善良。',
    power: '魔法',
    relatedStories: [],
    collected: true,
    bondLevel: 0,
    bondExp: 0,
    bondMax: 100,
    mood: '疏离',
    bondStage: '未发现踪迹',
    likes: ['安静', '洁净的赠礼', '阳光'],
    dislikes: ['喧哗', '铁器噪声'],
    interactionStats: {
      listen: 0,
      gift: 0,
      wait: 0,
      resonate: 0,
      guard: 0
    },
    badges: [
      { id: 'elf-listener', name: '林间倾听者', type: 'listen', unlocked: false, desc: '你学会了不急于靠近，而是先听见光与风的语言。' },
      { id: 'elf-giver', name: '微光赠予者', type: 'gift', unlocked: false, desc: '你的赠礼没有索取回报，因此被精灵接受。' },
      { id: 'elf-watcher', name: '静默守候者', type: 'wait', unlocked: false, desc: '你用等待证明了尊重，光明精灵因此允许你停留。' },
      { id: 'elf-resonance', name: '光之共鸣者', type: 'resonate', unlocked: false, desc: '你短暂理解了亚尔夫海姆的节奏。' },
      { id: 'elf-warden', name: '亚尔夫守林人', type: 'guard', unlocked: false, desc: '你守护了林地，也获得了精灵的认可。' },
      { id: 'elf-friend', name: '亚尔夫之友', type: 'balanced', unlocked: false, desc: '你与光明精灵建立了平衡、克制而长久的联系。' }
    ]
  },
  {
    id: 'jotun',
    name: '巨人',
    originalName: 'Jötnar',
    type: '巨人',
    realm: 'jotunheim',
    dangerLevel: '高',
    interactionType: 'person',
    description: '巨人是北欧神话中最古老的种族，他们与阿萨神族长期战斗。许多巨人都有着强大的力量。',
    power: '自然之力',
    relatedStories: ['thors-hammer'],
    collected: true
  },
  {
    id: 'raven',
    name: '渡鸦',
    originalName: 'Ravens',
    type: '鸟类',
    realm: 'asgard',
    dangerLevel: '低',
    interactionType: 'beast',
    description: '奥丁的使者，代表思想与记忆。每天早晨飞向世界，夜晚回到奥丁肩头汇报。',
    power: '全知',
    relatedStories: ['odin-wisdom'],
    collected: false,
    unlocked: false,
    clueProfile: {
      clueName: '天空的影子',
      clueType: '飞行生物',
      clueStatus: '身份未明',
      clueDesc: '你只在高处见过它们的影子。它们似乎总是在清晨离开，又在夜色降临前归来。',
      clues: [
        {
          id: 'trace',
          title: '出没迹象',
          text: '它们常在高处、殿堂边缘与王座附近出现，像是在等待某种命令。'
        },
        {
          id: 'ability',
          title: '能力传闻',
          text: '它们似乎与记忆、消息和远方视野有关，总能带回不应被轻易知晓的见闻。'
        },
        {
          id: 'relation',
          title: '关系暗示',
          text: '有人说，它们替一位独眼神明观看世界，也替他带回思想与记忆。'
        }
      ],
      unlockHints: [
        '前往阿斯加德相关页面',
        '阅读与奥丁相关的故事',
        '完成一次"观察天空"'
      ]
    }
  },
  {
    id: 'wolf',
    name: '狼',
    originalName: 'Wolves',
    type: '狼',
    realm: 'asgard',
    dangerLevel: '中',
    interactionType: 'beast',
    description: '奥丁身边有两匹狼，格力和 Geri，象征着贪婪与食欲。它们是奥丁的忠实伙伴。',
    power: '守护',
    relatedStories: [],
    collected: false
  }
]

// ========== 卢恩符文数据 ==========
export const runes = [
  {
    id: 'fehu',
    symbol: 'ᚠ',
    name: '费胡',
    originalName: 'Fehu',
    meaning: '财富、牛',
    keywords: ['财富', '成功', '物质'],
    uprightMeaning: '财富与繁荣，成功的开始',
    reversedMeaning: '物质损失，贪婪',
    dailyMessage: '今天象征着新的开始。把握机会，让财富流入你的生活。'
  },
  {
    id: 'uruz',
    symbol: 'ᚢ',
    name: '乌鲁',
    originalName: 'Uruz',
    meaning: '野牛',
    keywords: ['力量', '健康', '勇气'],
    uprightMeaning: '内在力量与活力',
    reversedMeaning: '虚弱，疾病',
    dailyMessage: '信任你的内在力量。今天是面对挑战的时刻。'
  },
  {
    id: 'thurisaz',
    symbol: 'ᚦ',
    name: '索苏',
    originalName: 'Thurisaz',
    meaning: '巨人',
    keywords: ['危机', '挑战', '防御'],
    uprightMeaning: '挑战与防御',
    reversedMeaning: '被动攻击',
    dailyMessage: '今天可能有挑战。保持警惕，但不要主动出击。'
  },
  {
    id: 'ansuz',
    symbol: 'ᚨ',
    name: '安苏兹',
    originalName: 'Ansuz',
    meaning: '神喻',
    keywords: ['智慧', '沟通', '信息'],
    uprightMeaning: '智慧与神喻',
    reversedMeaning: '误导，沟通障碍',
    dailyMessage: '倾听。今天宇宙想告诉你一些重要的事情。'
  },
  {
    id: 'raido',
    symbol: 'ᚱ',
    name: '莱多',
    originalName: 'Raido',
    meaning: '旅程',
    keywords: ['旅程', '决定', '行动'],
    uprightMeaning: '旅程与决定',
    reversedMeaning: '延迟，停滞',
    dailyMessage: '今天适合做出重要的决定。是时候前进了。'
  },
  {
    id: 'kaunan',
    symbol: 'ᚲ',
    name: '卡乌南',
    originalName: 'Kaunan',
    meaning: ' torches',
    keywords: ['创造', '转变', '点火'],
    uprightMeaning: '内在光芒与创造',
    reversedMeaning: '破坏，失控',
    dailyMessage: '点燃你内心的火焰。今天是创造的时机。'
  },
  {
    id: 'gebo',
    symbol: 'ᚷ',
    name: '盖博',
    originalName: 'Gebo',
    meaning: '礼物',
    keywords: ['礼物', '伙伴关系', '牺牲'],
    uprightMeaning: '礼物与伙伴关系',
    reversedMeaning: '不平衡的交换',
    dailyMessage: '今天关于给予与接受。慷慨会有回报。'
  },
  {
    id: 'wunjo',
    symbol: 'ᚹ',
    name: '文乔',
    originalName: 'Wunjo',
    meaning: '欢乐',
    keywords: ['欢乐', '成功', '意志力'],
    uprightMeaning: '欢乐与成功',
    reversedMeaning: '错误的方向',
    dailyMessage: '今天会带来欢乐。与所爱之人共度时光。'
  }
]

// ========== 今日推荐 ==========
export const dailyPicks = {
  god: 'odin',
  story: 'odin-wisdom',
  rune: 'ansuz'
}

// ========== 导出所有数据 ==========
export const norseData = {
  realms,
  gods,
  stories,
  creatures,
  runes,
  dailyPicks
}

export default norseData