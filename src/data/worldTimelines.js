export const worldTimelines = {
	asgard: [
		{
			id: 'creation',
			title: '世界初成',
			subtitle: '九界秩序尚未稳定',
			stage: '起源',
			mapTone: 'mist',
			summary: '在世界树的枝干间，诸界逐渐显现。阿斯加德尚未成为众神秩序的中心，一切仍处在初成与分化之中。',
			events: [
				'世界树连接诸界',
				'阿萨神族逐渐建立自身秩序',
				'诸神开始划分神域与边界'
			],
			related: [
				{ type: 'god', id: 'odin', name: '奥丁' },
				{ type: 'realm', id: 'midgard', name: '米德加德' }
			]
		},
		{
			id: 'building-asgard',
			title: '神域筑城',
			subtitle: '阿斯加德成为阿萨神族的居所',
			stage: '建城',
			mapTone: 'forest',
			summary: '阿斯加德逐渐成为众神聚集与议事之地。神域、殿堂、桥梁与边界被建立，诸神的秩序开始稳定。',
			events: [
				'神域边界被确立',
				'众神殿堂逐渐成形',
				'彩虹桥连接神域与其他国度'
			],
			related: [
				{ type: 'god', id: 'heimdall', name: '海姆达尔' },
				{ type: 'god', id: 'odin', name: '奥丁' }
			]
		},
		{
			id: 'golden-age',
			title: '黄金时代',
			subtitle: '诸神秩序达到鼎盛',
			stage: '鼎盛',
			mapTone: 'gold',
			summary: '阿斯加德进入相对稳定与繁盛的时期。诸神各司其职，战争、誓言、预言、丰饶与守护共同构成神域秩序。',
			events: [
				'奥丁统御神域与战争',
				'索尔守护诸界边界',
				'弗丽嘉、提尔、海姆达尔等神祇维持不同层面的秩序'
			],
			related: [
				{ type: 'god', id: 'thor', name: '索尔' },
				{ type: 'god', id: 'frigg', name: '弗丽嘉' },
				{ type: 'god', id: 'tyr', name: '提尔' }
			]
		},
		{
			id: 'omens',
			title: '裂痕与预兆',
			subtitle: '秩序开始出现无法弥合的裂缝',
			stage: '预兆',
			mapTone: 'dusk',
			summary: '随着洛基、芬里尔、耶梦加得以及巴德尔之死等事件逐渐逼近，阿斯加德的黄金秩序开始显露裂痕。',
			events: [
				'芬里尔被束缚',
				'巴德尔之死成为终末的重要信号',
				'诸神开始意识到命运不可完全逆转'
			],
			related: [
				{ type: 'god', id: 'loki', name: '洛基' },
				{ type: 'god', id: 'baldr', name: '巴德尔' },
				{ type: 'creature', id: 'fenrir', name: '芬里尔' }
			]
		},
		{
			id: 'ragnarok',
			title: '诸神黄昏',
			subtitle: '神域燃烧，旧秩序走向终点',
			stage: '终末',
			mapTone: 'fire',
			summary: '诸神黄昏中，阿斯加德与诸神秩序迎来毁灭性的冲击。终末不是单纯的结束，也为新的世界留下重生的可能。',
			events: [
				'诸神与巨人迎来终末之战',
				'索尔与耶梦加得同归于尽',
				'奥丁面对芬里尔',
				'旧世界崩塌，新世界的种子出现'
			],
			related: [
				{ type: 'story', id: 'ragnarok', name: '诸神黄昏' },
				{ type: 'god', id: 'odin', name: '奥丁' },
				{ type: 'god', id: 'thor', name: '索尔' },
				{ type: 'creature', id: 'jormungandr', name: '耶梦加得' }
			]
		}
	]
}