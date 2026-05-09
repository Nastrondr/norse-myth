export const norseTimeline = [
	{
		id: 'creation-age',
		title: '创世纪元',
		originalTitle: 'Creation Age',
		subtitle: '冰与火相遇，世界从原初混沌中诞生。',
		theme: 'origin',
		color: '#8FB6D9',
		expanded: true,
		events: [
			{
				id: 'ginnungagap',
				title: '金伦加鸿沟',
				originalTitle: 'Ginnungagap',
				summary: '世界尚未形成，寒冰与火焰隔着巨大虚空相望。',
				relatedStory: 'creation-of-world',
				tags: ['原初', '虚空']
			},
			{
				id: 'ymir-born',
				title: '伊米尔诞生',
				originalTitle: 'Ymir',
				summary: '冰与火的气息交汇，原初巨人伊米尔从混沌中出现。',
				relatedStory: 'creation-of-world',
				tags: ['原初巨人', '混沌']
			},
			{
				id: 'world-created',
				title: '世界被塑造',
				originalTitle: 'Creation of the World',
				summary: '奥丁与兄弟杀死伊米尔，以其身体塑造大地、海洋、山脉与天空。',
				relatedStory: 'creation-of-world',
				tags: ['创世', '奥丁']
			},
			{
				id: 'yggdrasil',
				title: '世界树支撑九界',
				originalTitle: 'Yggdrasil',
				summary: '世界树连接诸界，九个国度在它的枝干与根系之间展开。',
				relatedStory: 'world-tree',
				tags: ['世界树', '九界']
			}
		]
	},
	{
		id: 'order-of-gods',
		title: '众神秩序',
		originalTitle: 'Order of the Gods',
		subtitle: '阿萨神族、华纳神族与巨人之间建立权力、交换与边界。',
		theme: 'gods',
		color: '#C6A15B',
		expanded: false,
		events: [
			{
				id: 'aesir-vanir-war',
				title: '阿萨与华纳之战',
				originalTitle: 'Aesir-Vanir War',
				summary: '阿萨神族与华纳神族爆发战争，最终通过交换人质达成和解。',
				relatedStory: 'aesir-vanir-war',
				tags: ['神族战争', '和解']
			},
			{
				id: 'asgard-order',
				title: '阿斯加德秩序形成',
				originalTitle: 'Order of Asgard',
				summary: '奥丁成为众神之父，阿斯加德成为诸神议事与统治的中心。',
				relatedStory: 'asgard-order',
				tags: ['阿斯加德', '王权']
			},
			{
				id: 'valhalla',
				title: '英灵殿接纳战死者',
				originalTitle: 'Valhalla',
				summary: '战死者被女武神引向英灵殿，为终末之战做准备。',
				relatedStory: 'valhalla',
				tags: ['英灵殿', '女武神']
			}
		]
	},
	{
		id: 'trickery-and-artifacts',
		title: '神器与诡计',
		originalTitle: 'Artifacts and Trickery',
		subtitle: '洛基的诡计、矮人的锻造与诸神神器共同改变命运走向。',
		theme: 'artifacts',
		color: '#8A6F45',
		expanded: false,
		events: [
			{
				id: 'mjolnir-forging',
				title: '雷神之锤诞生',
				originalTitle: 'Forging of Mjolnir',
				summary: '洛基的恶作剧引出矮人锻造竞赛，妙尔尼尔由此诞生。',
				relatedStory: 'mjolnir-forging',
				tags: ['神器', '索尔', '洛基']
			},
			{
				id: 'gungnir-draupnir',
				title: '冈格尼尔与德罗普尼尔',
				originalTitle: 'Gungnir and Draupnir',
				summary: '奥丁获得永恒之枪与不断增生的金戒指，神权与誓言被进一步强化。',
				relatedStory: 'divine-artifacts',
				tags: ['奥丁', '神器']
			},
			{
				id: 'idunn-apples',
				title: '伊登的苹果被盗',
				originalTitle: "The Theft of Idunn's Apples",
				summary: '青春苹果被夺，诸神开始衰老，洛基不得不弥补自己的错误。',
				relatedStory: 'idunn-apples',
				tags: ['青春', '洛基']
			}
		]
	},
	{
		id: 'omens',
		title: '不祥预兆',
		originalTitle: 'Omens',
		subtitle: '命运的裂缝开始显现，光明之死与锁链之誓预示终末临近。',
		theme: 'omens',
		color: '#B94A48',
		expanded: false,
		events: [
			{
				id: 'binding-fenrir',
				title: '芬里尔被缚',
				originalTitle: 'Binding of Fenrir',
				summary: '诸神用格莱普尼尔束缚芬里尔，提尔为此失去一只手。',
				relatedStory: 'binding-fenrir',
				tags: ['芬里尔', '提尔', '誓言']
			},
			{
				id: 'baldr-dreams',
				title: '巴德尔的死亡梦境',
				originalTitle: "Baldr's Dreams",
				summary: '光明之神梦见自己的死亡，弗丽嘉试图让万物发誓保护他。',
				relatedStory: 'baldr-death',
				tags: ['巴德尔', '预兆']
			},
			{
				id: 'baldr-death',
				title: '巴德尔之死',
				originalTitle: 'The Death of Baldr',
				summary: '槲寄生成为唯一漏洞，巴德尔被误杀，诸神黄昏的阴影开始落下。',
				relatedStory: 'baldr-death',
				tags: ['死亡', '洛基']
			},
			{
				id: 'loki-punishment',
				title: '洛基受罚',
				originalTitle: 'Punishment of Loki',
				summary: '洛基被束缚，毒液滴落在他身上；他的震动成为灾变的先声。',
				relatedStory: 'loki-punishment',
				tags: ['洛基', '惩罚']
			}
		]
	},
	{
		id: 'ragnarok',
		title: '诸神黄昏',
		originalTitle: 'Ragnarok',
		subtitle: '严冬降临，锁链断裂，诸神、巨人与灾厄生物走向终局。',
		theme: 'ragnarok',
		color: '#A5533D',
		expanded: false,
		events: [
			{
				id: 'fimbulwinter',
				title: '芬布尔之冬',
				originalTitle: 'Fimbulwinter',
				summary: '漫长严冬降临，道德崩坏，亲族相残，旧秩序开始瓦解。',
				relatedStory: 'ragnarok',
				tags: ['严冬', '末日']
			},
			{
				id: 'chains-break',
				title: '锁链断裂',
				originalTitle: 'Breaking of Bonds',
				summary: '芬里尔挣脱束缚，耶梦加得从海中翻涌，洛基率亡者之船归来。',
				relatedStory: 'ragnarok',
				tags: ['芬里尔', '洛基']
			},
			{
				id: 'final-battle',
				title: '终末之战',
				originalTitle: 'Final Battle',
				summary: '奥丁被芬里尔吞噬，索尔杀死世界之蛇后中毒倒下，诸神迎来结局。',
				relatedStory: 'ragnarok',
				tags: ['终战', '诸神']
			},
			{
				id: 'surtr-fire',
				title: '苏尔特焚烧世界',
				originalTitle: "Surtr's Fire",
				summary: '火巨人苏尔特挥动烈焰之剑，旧世界被火焚尽。',
				relatedStory: 'ragnarok',
				tags: ['苏尔特', '火焰']
			}
		]
	},
	{
		id: 'rebirth',
		title: '世界重生',
		originalTitle: 'Rebirth',
		subtitle: '旧世界毁灭之后，大地再次升起，幸存者迎来新的秩序。',
		theme: 'rebirth',
		color: '#7C8C74',
		expanded: false,
		events: [
			{
				id: 'new-earth',
				title: '新大地浮现',
				originalTitle: 'New Earth',
				summary: '大地从海中再次升起，旧世界的废墟成为新秩序的起点。',
				relatedStory: 'rebirth',
				tags: ['重生', '新世界']
			},
			{
				id: 'survivors',
				title: '幸存者延续生命',
				originalTitle: 'Survivors',
				summary: '少数神与人幸存，生命在终末之后继续延展。',
				relatedStory: 'rebirth',
				tags: ['幸存', '延续']
			},
			{
				id: 'baldr-return',
				title: '巴德尔归来',
				originalTitle: "Baldr's Return",
				summary: '巴德尔从亡者之地归来，光明重新回到新世界。',
				relatedStory: 'rebirth',
				tags: ['巴德尔', '光明']
			}
		]
	}
]
