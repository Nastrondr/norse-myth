// 神祇数据 - 北欧神话
export const norseGods = [
  {
    id: 'odin',
    name: '奥丁',
    originalName: 'Odin',
    title: '众神之父，智慧、战争与死亡之神',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['智慧', '战争', '死亡', '诗歌', '魔法', '王权'],
    symbols: ['长矛', '渡鸦', '独眼', '八足马', '世界树'],
    artifact: ['冈格尼尔', '德罗普尼尔'],
    description: '奥丁是阿萨神族的主神，也是北欧神话中最复杂的神之一。他追求智慧、预言与命运的真相，为此献出一只眼睛，也曾将自己悬挂在世界树上以获得卢恩文字。',
    relationships: { parents: ['bor', 'bestla'], spouse: ['frigg'], children: ['thor', 'baldr', 'hodr', 'vidar', 'vali'], allies: ['mimir', 'heimdall'], enemies: ['fenrir', 'surtr'] },
    attributes: { wisdom: 98, combat: 82, magic: 95, authority: 100, fate: 96 },
    stories: ['odin-runes', 'creation-of-world', 'ragnarok']
  },
  {
    id: 'thor',
    name: '索尔',
    originalName: 'Thor',
    title: '雷霆、力量与人类守护之神',
    faction: '阿萨神族',
    realm: ['asgard', 'midgard'],
    domain: ['雷霆', '力量', '守护', '战争', '风暴'],
    symbols: ['雷神之锤', '山羊战车', '雷电'],
    artifact: ['妙尔尼尔', '力量腰带', '铁手套'],
    description: '索尔是奥丁之子，也是北欧神话中最具力量感的神祇。他经常与巨人对抗，被视为诸神与人类世界的重要守护者。',
    relationships: { parents: ['odin', 'jord'], spouse: ['sif'], children: ['magni', 'modi', 'thrud'], allies: ['loki', 'heimdall'], enemies: ['jormungandr', 'giants'] },
    attributes: { wisdom: 58, combat: 100, magic: 45, authority: 78, fate: 85 },
    stories: ['thor-fishing', 'mjolnir-forging', 'ragnarok']
  },
  {
    id: 'loki',
    name: '洛基',
    originalName: 'Loki',
    title: '诡计、变形与灾变的边界者',
    faction: '巨人血统 / 阿萨同伴',
    realm: ['asgard', 'jotunheim'],
    domain: ['诡计', '变形', '火', '混乱', '边界'],
    symbols: ['火焰', '面具', '锁链', '蛇'],
    artifact: [],
    description: '洛基是北欧神话中最难被归类的角色。他既是诸神的同伴，也是灾难的引发者；既带来解决问题的机智，也最终走向与诸神为敌的位置。',
    relationships: { parents: ['farbauti', 'laufey'], spouse: ['sigyn', 'angrboda'], children: ['fenrir', 'jormungandr', 'hel', 'sleipnir'], allies: ['thor'], enemies: ['heimdall', 'odin'] },
    attributes: { wisdom: 90, combat: 62, magic: 88, authority: 45, fate: 99 },
    stories: ['loki-children', 'baldr-death', 'loki-punishment', 'ragnarok']
  },
  {
    id: 'freya',
    name: '弗雷娅',
    originalName: 'Freyja',
    title: '爱、美、战争与魔法女神',
    faction: '华纳神族',
    realm: ['vanaheim', 'asgard'],
    domain: ['爱情', '美', '战争', '财富', '魔法', '死亡'],
    symbols: ['项链', '猫车', '羽衣', '黄金'],
    artifact: ['布里希嘉曼项链', '鹰羽衣'],
    description: '弗雷娅是华纳神族的重要女神，与爱、美、财富和魔法有关，同时也分享战死者的归属。她不是单纯柔美的女神，而是兼具欲望、力量与死亡意味的复杂存在。',
    relationships: { parents: ['njord'], spouse: ['odr'], children: ['hnoss', 'gersemi'], allies: ['freyr'], enemies: [] },
    attributes: { wisdom: 86, combat: 76, magic: 98, authority: 82, fate: 78 },
    stories: ['aesir-vanir-war', 'freya-necklace']
  },
  {
    id: 'frigg',
    name: '弗丽嘉',
    originalName: 'Frigg',
    title: '婚姻、王后、预知与沉默的女神',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['婚姻', '母性', '预知', '王权', '家庭'],
    symbols: ['纺锤', '王座', '云雾', '钥匙'],
    artifact: [],
    description: '弗丽嘉是奥丁的妻子，也是阿斯加德的王后。她拥有预知能力，却往往不直接说出命运的结果。她的形象兼具母性、权威、沉默与悲剧感。',
    relationships: { parents: [], spouse: ['odin'], children: ['baldr', 'hodr'], allies: [], enemies: [] },
    attributes: { wisdom: 92, combat: 36, magic: 82, authority: 90, fate: 95 },
    stories: ['baldr-death']
  },
  {
    id: 'baldr',
    name: '巴德尔',
    originalName: 'Baldr',
    title: '光明、纯净与死亡预兆之神',
    faction: '阿萨神族',
    realm: ['asgard', 'helheim'],
    domain: ['光明', '纯净', '美', '死亡预兆'],
    symbols: ['白光', '槲寄生', '梦境'],
    artifact: [],
    description: '巴德尔是奥丁与弗丽嘉之子，以光明、美与纯净著称。他的死亡是诸神黄昏到来的重要前兆，也使北欧神话的悲剧结构变得不可逆。',
    relationships: { parents: ['odin', 'frigg'], spouse: ['nanna'], children: ['forseti'], allies: [], enemies: ['loki', 'hodr'] },
    attributes: { wisdom: 75, combat: 42, magic: 50, authority: 78, fate: 100 },
    stories: ['baldr-death', 'hermod-helheim']
  },
  {
    id: 'tyr',
    name: '提尔',
    originalName: 'Tyr',
    title: '战争、誓言与法律之神',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['战争', '法律', '誓言', '牺牲', '勇气'],
    symbols: ['断手', '剑', '誓约'],
    artifact: [],
    description: '提尔常与战争、法律和誓言相关。他最著名的故事是为了束缚芬里尔而将手放入狼口，以自己的身体承担诸神誓言中的代价。',
    relationships: { parents: [], spouse: [], children: [], allies: ['odin', 'thor'], enemies: ['fenrir'] },
    attributes: { wisdom: 78, combat: 88, magic: 30, authority: 86, fate: 82 },
    stories: ['binding-fenrir']
  },
  {
    id: 'heimdall',
    name: '海姆达尔',
    originalName: 'Heimdall',
    title: '彩虹桥的守望者',
    faction: '阿萨神族',
    realm: ['asgard'],
    domain: ['守望', '边界', '听觉', '警戒', '末日号角'],
    symbols: ['彩虹桥', '号角', '金牙', '守望塔'],
    artifact: ['加拉尔号角'],
    description: '海姆达尔是守望彩虹桥的神。他几乎不需要睡眠，能看见极远处，也能听见草木生长。他的存在象征边界、警觉与诸神最后的预警。',
    relationships: { parents: [], spouse: [], children: [], allies: ['odin', 'thor'], enemies: ['loki'] },
    attributes: { wisdom: 80, combat: 72, magic: 65, authority: 76, fate: 93 },
    stories: ['ragnarok']
  },
  {
    id: 'freyr',
    name: '弗雷',
    originalName: 'Freyr',
    title: '丰饶、和平与王权之神',
    faction: '华纳神族',
    realm: ['vanaheim', 'alfheim'],
    domain: ['丰饶', '和平', '阳光', '王权', '繁盛'],
    symbols: ['野猪', '宝船', '麦穗', '阳光'],
    artifact: ['斯基德普拉特尼', '古林博斯帝'],
    description: '弗雷是华纳神族的重要神祇，与丰饶、和平、阳光和繁盛有关。他的气质不像阿萨神族那样锋利，更接近自然秩序中的富足与平衡。',
    relationships: { parents: ['njord'], spouse: ['gerdr'], children: [], allies: ['freya'], enemies: ['surtr'] },
    attributes: { wisdom: 76, combat: 68, magic: 72, authority: 84, fate: 80 },
    stories: ['aesir-vanir-war', 'freyr-alfheim', 'ragnarok']
  },
  {
    id: 'hel',
    name: '海拉',
    originalName: 'Hel',
    title: '亡者之地的统治者',
    faction: '洛基之女 / 冥界统治者',
    realm: ['helheim', 'niflheim'],
    domain: ['死亡', '亡者', '寒冷', '不可逆命运'],
    symbols: ['半生半死之面', '黑蓝长袍', '亡者大厅'],
    artifact: [],
    description: '海拉是洛基与女巨人安格尔波达之女，掌管亡者之地。她并不只是邪恶象征，更像是死亡秩序本身的化身，冷静、沉默、不可被讨价还价。',
    relationships: { parents: ['loki', 'angrboda'], spouse: [], children: [], allies: [], enemies: [] },
    attributes: { wisdom: 84, combat: 70, magic: 90, authority: 92, fate: 98 },
    stories: ['baldr-death', 'hermod-helheim', 'ragnarok']
  }
]

// 筛选选项
export const godFactions = [
  { id: '', label: '全部' },
  { id: '阿萨神族', label: '阿萨神族' },
  { id: '华纳神族', label: '华纳神族' },
  { id: '巨人血统 / 阿萨同伴', label: '巨人血统 / 阿萨同伴' },
  { id: '洛基之女 / 冥界统治者', label: '洛基之女 / 冥界统治者' }
]

// 工具函数
export function getGodById(id) {
  return norseGods.find(god => god.id === id)
}

export function getGodsByFaction(faction) {
  if (!faction) return norseGods
  return norseGods.filter(god => god.faction === faction)
}

export default norseGods