// 故事数据 - 北欧神话
export const norseStories = [
  {
    id: 'creation-of-world',
    title: '世界的生成',
    category: '创世',
    summary: '冰与火在虚空中相遇，原初巨人伊米尔诞生。诸神杀死伊米尔，并以他的身体塑造世界。',
    content: '在一切尚未成形之前，寒冷的尼福尔海姆与炽热的穆斯贝尔海姆隔着巨大的虚空相望。冰与火的气息在虚空中相遇，孕育出原初巨人伊米尔。后来，奥丁与他的兄弟杀死伊米尔，以他的血成为海，以他的肉成为大地，以他的骨成为山，以他的头骨撑起天空。世界并非从温柔中诞生，而是从一场古老的牺牲与分割中成形。',
    characters: ['odin', 'ymir'],
    realms: ['niflheim', 'muspelheim', 'midgard'],
    readingTime: '4 分钟',
    notes: ['伊米尔是原初巨人，常被视为世界生成前混沌生命的象征。', '北欧创世叙事带有强烈的身体化特征：世界来自巨人的身体。'],
    relatedGods: ['odin'],
    relatedCreatures: ['ymir']
  },
  {
    id: 'odin-runes',
    title: '奥丁取得卢恩',
    category: '众神',
    summary: '为了获得卢恩的秘密，奥丁将自己悬挂在世界树上，以痛苦换取智慧。',
    content: '奥丁并不满足于王权和胜利。他追寻更深的智慧，也追寻命运背后那些隐秘的纹路。为了取得卢恩的秘密，他将自己悬挂在世界树上，以长矛刺伤自己，九夜无人相助。直到痛苦抵达尽头，符文才从黑暗中显现。奥丁由此获得了语言、咒术和命运的知识。但这份智慧不是恩赐，而是代价。',
    characters: ['odin'],
    realms: ['asgard'],
    readingTime: '3 分钟',
    notes: ['卢恩在这里不是装饰图案，而是知识、语言和命运的象征。', '奥丁的智慧常常与牺牲绑定。'],
    relatedGods: ['odin'],
    relatedCreatures: []
  },
  {
    id: 'thor-fishing',
    title: '索尔钓起世界之蛇',
    category: '众神',
    summary: '索尔乘船出海，试图钓起环绕米德加德的巨蛇耶梦加得。',
    content: '索尔与巨人出海时，将牛头作为诱饵投向深海。水下的耶梦加得咬住钩子，海面随之翻涌。索尔紧握钓线，将那条环绕人间的巨蛇拉向船边。雷神与世界之蛇在海上短暂对峙，像是诸神黄昏的预演。最终巨蛇回到海中，真正的决战被推迟到命运指定的时刻。',
    characters: ['thor', 'jormungandr'],
    realms: ['midgard', 'jotunheim'],
    readingTime: '4 分钟',
    notes: ['耶梦加得是洛基之子，也是索尔在诸神黄昏中的宿敌。', '这则故事常被理解为终末决战的提前显影。'],
    relatedGods: ['thor', 'loki'],
    relatedCreatures: ['jormungandr']
  },
  {
    id: 'baldr-death',
    title: '巴德尔之死',
    category: '死亡',
    summary: '光明之神巴德尔被槲寄生所伤，他的死亡成为诸神黄昏的前兆。',
    content: '巴德尔开始梦见自己的死亡。弗丽嘉为保护儿子，让世间万物发誓不伤害他，却唯独忽略了看似柔弱的槲寄生。诸神以向巴德尔投掷武器为乐，因为没有任何东西能伤害他。洛基得知漏洞后，引导盲眼的霍德尔掷出槲寄生。巴德尔倒下，阿斯加德的光也随之黯淡。那不是一次偶然死亡，而是命运开始收紧的声音。',
    characters: ['baldr', 'frigg', 'loki', 'hodr', 'hel'],
    realms: ['asgard', 'helheim'],
    readingTime: '5 分钟',
    notes: ['巴德尔之死是北欧神话中最重要的悲剧之一。', '槲寄生在故事中象征被忽视的微小漏洞。'],
    relatedGods: ['baldr', 'frigg', 'loki', 'hel'],
    relatedCreatures: []
  },
  {
    id: 'hermod-helheim',
    title: '赫尔莫德前往冥界',
    category: '死亡',
    summary: '巴德尔死后，赫尔莫德骑上斯莱普尼尔前往赫尔海姆，请求海拉释放巴德尔。',
    content: '巴德尔死后，诸神陷入沉默。赫尔莫德骑上奥丁的八足马斯莱普尼尔，穿过寒冷与黑暗，前往亡者之地。他请求海拉让巴德尔返回。海拉提出条件：若世间万物都为巴德尔哭泣，他便可以离开。几乎所有存在都哭了，唯有一个身影拒绝落泪。于是巴德尔仍留在亡者之地，直到旧世界结束之后。',
    characters: ['baldr', 'hel', 'odin'],
    realms: ['asgard', 'helheim'],
    readingTime: '4 分钟',
    notes: ['海拉在这个故事中不是被情感说服的反派，而是死亡秩序的执行者。', '巴德尔无法返回，使诸神黄昏进一步不可避免。'],
    relatedGods: ['baldr', 'hel', 'odin'],
    relatedCreatures: ['sleipnir']
  },
  {
    id: 'binding-fenrir',
    title: '芬里尔被缚',
    category: '众神',
    summary: '诸神畏惧芬里尔的成长，最终用矮人打造的细索将他束缚，提尔为此失去一只手。',
    content: '芬里尔成长得太快，诸神从他身上看见未来的灾难。他们多次尝试束缚他，却都失败了。最后，矮人打造出一条看似柔软的细索。芬里尔察觉其中有诈，要求一位神将手放入他的口中作为保证。提尔伸出了手。当锁链收紧，芬里尔无法挣脱，便咬下了提尔的手。诸神赢得了暂时的安全，却也留下了背誓的伤口。',
    characters: ['tyr', 'fenrir', 'odin'],
    realms: ['asgard'],
    readingTime: '5 分钟',
    notes: ['提尔的断手象征誓言、法律与代价。', '芬里尔被缚并没有消除终末，只是推迟了它。'],
    relatedGods: ['tyr', 'odin', 'loki'],
    relatedCreatures: ['fenrir']
  },
  {
    id: 'mjolnir-forging',
    title: '雷神之锤的锻造',
    category: '神器',
    summary: '洛基的恶作剧引出矮人的锻造竞赛，最终诞生了雷神之锤妙尔尼尔。',
    content: '洛基剪去了希芙的金发，为了弥补过错，他前往地下世界，请矮人打造新的金发和神器。随后，一场锻造竞赛展开。矮人打造出奥丁的长矛、弗雷的宝船和索尔的锤子。妙尔尼尔的锤柄虽短，却拥有可怕的力量，成为索尔守护诸神与人类的重要武器。',
    characters: ['loki', 'thor', 'odin', 'freyr'],
    realms: ['svartalfheim', 'asgard'],
    readingTime: '4 分钟',
    notes: ['许多神器都与矮人的地下锻造技艺有关。', '洛基经常既制造问题，也间接带来解决问题的工具。'],
    relatedGods: ['loki', 'thor', 'odin', 'freyr'],
    relatedCreatures: ['dwarves']
  },
  {
    id: 'ragnarok',
    title: '诸神黄昏',
    category: '诸神黄昏',
    summary: '旧世界走向终末，诸神、巨人与怪物迎来最后的战斗。',
    content: '当漫长的严冬降临，誓言崩解，亲族相残，旧世界开始走向终点。芬里尔挣脱束缚，耶梦加得从海中翻身，洛基与亡者之船驶向战场，苏尔特从火焰之地而来。奥丁被芬里尔吞噬，索尔杀死世界之蛇后也中毒倒下，海姆达尔与洛基同归于尽。火焰焚尽世界。但终末之后，大地将再次从海中升起，少数神与人幸存，新的秩序在废墟上开始。',
    characters: ['odin', 'thor', 'loki', 'heimdall', 'freyr', 'hel'],
    realms: ['asgard', 'midgard', 'jotunheim', 'muspelheim', 'helheim'],
    readingTime: '6 分钟',
    notes: ['诸神黄昏不是单纯毁灭，而是旧秩序的终结与新世界的开始。', '北欧神话的悲剧感来自"知道终末仍然迎战"。'],
    relatedGods: ['odin', 'thor', 'loki', 'heimdall', 'freyr', 'hel'],
    relatedCreatures: ['fenrir', 'jormungandr', 'surtr', 'garmr']
  }
]

// 分类选项
export const storyCategories = [
  { id: '', label: '全部' },
  { id: '创世', label: '创世' },
  { id: '众神', label: '众神' },
  { id: '死亡', label: '死亡' },
  { id: '神器', label: '神器' },
  { id: '诸神黄昏', label: '诸神黄昏' }
]

// 工具函数
export function getStoryById(id) {
  return norseStories.find(story => story.id === id)
}

export function getStoriesByCategory(category) {
  if (!category) return norseStories
  return norseStories.filter(story => story.category === category)
}

export default norseStories