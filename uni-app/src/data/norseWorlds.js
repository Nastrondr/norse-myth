// 九界数据 - 北欧神话世界观 V2.0
// 包含：九界名称、描述、相关神祇、生物、故事

export const norseWorlds = [
  {
    id: 'asgard',
    name: '阿斯加德',
    originalName: 'Asgard',
    type: '神域',
    subtitle: '阿萨神族的居所，诸神议事与命运交汇之地。',
    description: '阿斯加德是阿萨神族的居所，也是奥丁、索尔、弗丽嘉等主要神祇活动的中心。这里象征秩序、权威、战争、誓言与诸神对命运的抗争。',
    keywords: ['阿萨神族', '秩序', '权威', '战争', '誓言'],
    atmosphere: '高寒、庄严、金属感、神殿感',
    color: '#C6A15B',
    relatedGods: ['odin', 'thor', 'frigg', 'baldr', 'tyr', 'heimdall'],
    relatedCreatures: ['sleipnir'],
    relatedStories: ['odin-wisdom', 'baldr-death', 'ragnarok'],
    unlocked: true,
    progress: 68
  },
  {
    id: 'midgard',
    name: '米德加德',
    originalName: 'Midgard',
    type: '人间',
    subtitle: '人类生活的世界，被巨蛇环绕，也被诸神守望。',
    description: '米德加德是人类所在的世界，位于世界树体系的中层。它既是凡人的居所，也是诸神、巨人和命运不断介入的舞台。',
    keywords: ['人类', '凡世', '守护', '边界', '命运'],
    atmosphere: '寒冷、现实、旷野、村落、海岸',
    color: '#8FB6D9',
    relatedGods: ['thor', 'heimdall', 'loki'],
    relatedCreatures: ['jormungandr'],
    relatedStories: ['thor-fishing', 'creation-of-humans', 'ragnarok'],
    unlocked: true,
    progress: 45
  },
  {
    id: 'jotunheim',
    name: '约顿海姆',
    originalName: 'Jotunheim',
    type: '巨人国度',
    subtitle: '霜巨人与山巨人的世界，诸神的敌人与镜像。',
    description: '约顿海姆是巨人族的居所。巨人并不只是野蛮的敌人，他们也代表古老自然、混沌力量、预言智慧和诸神无法完全控制的另一面。',
    keywords: ['巨人', '混沌', '寒霜', '古老智慧', '敌对'],
    atmosphere: '冰原、山脉、风暴、巨大尺度',
    color: '#B94A48',
    relatedGods: ['loki', 'skadi'],
    relatedCreatures: ['fenrir', 'jormungandr'],
    relatedStories: ['loki-children', 'thor-giants', 'ragnarok'],
    unlocked: true,
    progress: 36
  },
  {
    id: 'vanaheim',
    name: '华纳海姆',
    originalName: 'Vanaheim',
    type: '华纳神族之地',
    subtitle: '丰饶、自然、魔法与古老交换的世界。',
    description: '华纳海姆是华纳神族的居所，与财富、丰收、自然、海洋、欲望和魔法有关。它与阿斯加德之间曾有战争，也最终通过交换人质达成和解。',
    keywords: ['丰饶', '自然', '魔法', '交换', '和平'],
    atmosphere: '湿润、森林、苔藓、河流、低饱和绿',
    color: '#7C8C74',
    relatedGods: ['freya', 'freyr', 'njord'],
    relatedCreatures: [],
    relatedStories: ['aesir-vanir-war', 'freya-necklace'],
    unlocked: false,
    progress: 0
  },
  {
    id: 'alfheim',
    name: '亚尔夫海姆',
    originalName: 'Alfheim',
    type: '光明精灵之地',
    subtitle: '光明精灵的居所，介于自然、灵性与美之间。',
    description: '亚尔夫海姆通常被视为光明精灵的世界，与美、光、灵性和自然生命力相关。它不像阿斯加德那样威严，也不像约顿海姆那样粗粝，而更接近神秘而轻盈的秩序。',
    keywords: ['光明精灵', '灵性', '自然', '美', '轻盈'],
    atmosphere: '冷光、森林、薄雾、银白色',
    color: '#BFD7EA',
    relatedGods: ['freyr'],
    relatedCreatures: ['light-elves'],
    relatedStories: ['freyr-alfheim'],
    unlocked: false,
    progress: 0
  },
  {
    id: 'svartalfheim',
    name: '斯瓦塔尔夫海姆',
    originalName: 'Svartalfheim',
    type: '矮人与暗精灵之地',
    subtitle: '锻造、矿石、神器与地下技艺的世界。',
    description: '斯瓦塔尔夫海姆常与矮人、暗精灵、地下工坊和神器锻造联系在一起。许多重要神器都来自这里，例如雷神之锤、奥丁之矛与弗雷的宝船。',
    keywords: ['矮人', '锻造', '神器', '矿石', '地下'],
    atmosphere: '地下、火光、矿石、铁灰、暗金',
    color: '#8A6F45',
    relatedGods: ['thor', 'odin', 'freyr', 'loki'],
    relatedCreatures: ['dwarves'],
    relatedStories: ['mjolnir-forging', 'loki-hair-trick'],
    unlocked: false,
    progress: 0
  },
  {
    id: 'niflheim',
    name: '尼福尔海姆',
    originalName: 'Niflheim',
    type: '雾与寒冰之地',
    subtitle: '冰、雾、原初寒冷与死亡边界的世界。',
    description: '尼福尔海姆是寒冷与迷雾的世界，在创世叙事中具有原初意义。它与穆斯贝尔海姆的火焰相对，共同构成世界生成前的巨大张力。',
    keywords: ['寒冰', '迷雾', '原初', '死亡', '边界'],
    atmosphere: '极寒、雾气、蓝灰、沉默',
    color: '#6F8FA6',
    relatedGods: ['hel'],
    relatedCreatures: ['nidhogg'],
    relatedStories: ['creation-of-world', 'hel-realm'],
    unlocked: false,
    progress: 0
  },
  {
    id: 'muspelheim',
    name: '穆斯贝尔海姆',
    originalName: 'Muspelheim',
    type: '火焰之地',
    subtitle: '原初火焰、毁灭力量与苏尔特的世界。',
    description: '穆斯贝尔海姆是火焰世界，与创世初始的热力和诸神黄昏中的毁灭力量有关。火巨人苏尔特最终会挥动烈焰之剑，焚烧世界。',
    keywords: ['火焰', '毁灭', '原初', '苏尔特', '终末'],
    atmosphere: '暗红、熔岩、黑烟、火光',
    color: '#A5533D',
    relatedGods: [],
    relatedCreatures: ['surtr'],
    relatedStories: ['creation-of-world', 'ragnarok'],
    unlocked: false,
    progress: 0
  },
  {
    id: 'helheim',
    name: '赫尔海姆',
    originalName: 'Helheim',
    type: '亡者之地',
    subtitle: '未荣归英灵殿者的归处，由海拉掌管。',
    description: '赫尔海姆是亡者之地，由洛基之女海拉掌管。这里不是单纯的地狱，而是寒冷、沉默、不可逆命运与死亡秩序的象征。',
    keywords: ['亡者', '海拉', '命运', '沉默', '不可逆'],
    atmosphere: '冷灰、黑蓝、白雾、静止感',
    color: '#66727F',
    relatedGods: ['hel', 'loki', 'baldr'],
    relatedCreatures: ['garmr'],
    relatedStories: ['baldr-death', 'hermod-helheim', 'ragnarok'],
    unlocked: false,
    progress: 0
  }
]

// 工具函数
export function getWorldById(id) {
  return norseWorlds.find(world => world.id === id)
}

export function getUnlockedWorlds() {
  return norseWorlds.filter(world => world.unlocked)
}

export function getExploredProgress() {
  const unlocked = norseWorlds.filter(w => w.unlocked && w.progress > 0).length
  return Math.round((unlocked / norseWorlds.length) * 100)
}

export default norseWorlds