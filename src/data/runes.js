export const runeData = [
  {
    id: 'fehu',
    symbol: 'ᚠ',
    name: '费胡',
    originalName: 'Fehu',
    meaning: '财富与流动',
    keywords: ['财富', '资源', '拥有', '交换', '流动'],
    element: '火',
    uprightMeaning: '你正在接近一种可被掌握的资源。它可能是金钱，也可能是能力、人脉、时间或机会。真正的问题不是你是否拥有它，而是你能否让它流动起来。财富的本质在于交换，而非囤积。',
    reversedMeaning: '资源正在停滞，或者你对"拥有"的执念正在变重。此时不适合盲目扩张，更适合重新检查交换关系是否公平。有时候放手一些东西，才能让新的能量进入。',
    // 三段式解读（箴言体）：oracle 神谕 / reading 解读 / advice 指引；UI 优先读，缺失回退旧字段
    upright: {
      oracle: '财富如水，滞则成渊',
      reading: '一份资源正流入你的掌握——钱财、能力、人或时机。它问的不是拥有，而是流动。',
      advice: '宜审视你的交换是否公平，不宜囤积。'
    },
    reversed: {
      oracle: '握紧之沙，漏于指间',
      reading: '流动正在停滞，"拥有"的执念变重。不是失去，是该放手而未放。',
      advice: '宜舍一物，为新能量开门。'
    },
    dailyMessage: '今天适合整理资源。看清你已经拥有的东西，再决定下一步要交换什么。',
    deeper: '费胡代表着原始的生命力与物质基础。它提醒我们，真正的富足不在于拥有多少，而在于资源能否顺畅地流动和转化。'
  },
  {
    id: 'urisaz',
    symbol: 'ᚢ',
    name: '乌里斯',
    originalName: 'Uruz',
    meaning: '力量与野牛',
    keywords: ['力量', '勇气', '野性', '潜能', '突破'],
    element: '土',
    uprightMeaning: '一股原始的力量正在你体内苏醒。它不是粗暴的蛮力，而是来自生命深处的韧性与勇气。你有能力突破看似坚固的障碍。',
    reversedMeaning: '力量可能被压抑或误用。你是否在逃避需要勇气的决定？或者在用力量控制他人而非成就自己？真正的力量不伤害弱小。',
    upright: {
      oracle: '野牛踏冰，其角自锋',
      reading: '原始力量在你体内苏醒——不是蛮力，是深处的韧性。看似坚固的障碍，已在你的角锋之下。',
      advice: '宜直面，不宜迂回。'
    },
    reversed: {
      oracle: '力不在拳，而在所护',
      reading: '力量正被压抑或误用。你在逃避那个需要勇气的决定，或在用强控制他人。',
      advice: '真正的力量，不伤害弱小。'
    },
    dailyMessage: '今天请相信你的本能。有些挑战需要的不是技巧，而是直面的勇气。',
    deeper: '乌里斯以野牛为象征，代表未经雕琢的原始力量。它提醒我们，每个人都拥有与生俱来的强大潜能，只需找到释放它的方式。'
  },
  {
    id: 'thurisaz',
    symbol: 'ᚦ',
    name: '图里萨兹',
    originalName: 'Thurisaz',
    meaning: '巨人、冲突与防御',
    keywords: ['冲突', '防御', '巨人', '边界', '警惕'],
    element: '水',
    uprightMeaning: '你正在面对一股粗粝而直接的力量。它未必是坏事，但它要求你建立边界。不要用柔软去消化所有攻击，有时候荆棘也是必要的保护。',
    reversedMeaning: '你可能正在把外部冲突转向自己，或者把防御变成了过度攻击。先停下，判断真正的威胁在哪里，不要被恐惧驱使。',
    upright: {
      oracle: '荆棘在手，亦可为篱',
      reading: '一股粗粝的力量迎面而来。它未必恶意，但要求边界——不要用柔软去消化所有攻击。',
      advice: '宜立界，不宜退让。'
    },
    reversed: {
      oracle: '恐惧所向，非敌所在',
      reading: '冲突正转向内部，防御沦为过攻。真正的威胁，不在你以为的地方。',
      advice: '宜停下辨察，不宜先出手。'
    },
    dailyMessage: '今天适合划清边界。温和不等于无条件退让。',
    deeper: '图里萨兹代表巨人的力量，是边界与冲突的守护者。它提醒我们，必要的对抗是维护自我完整性的方式。'
  },
  {
    id: 'ansuz',
    symbol: 'ᚨ',
    name: '安苏兹',
    originalName: 'Ansuz',
    meaning: '语言、神谕与启示',
    keywords: ['语言', '沟通', '启示', '神谕', '智慧'],
    element: '风',
    uprightMeaning: '某个信息正在抵达你身边。它可能来自一句话、一封消息、一次谈话，也可能来自你突然理解的某个细节。注意语言背后的真实意图，有时候沉默比话语更有力量。',
    reversedMeaning: '误解、沉默或错误信息正在影响判断。不要急于回应，先确认你听见的是事实，还是他人的情绪投射。清晰的沟通需要倾听。',
    upright: {
      oracle: '一言抵渡，胜过千帆',
      reading: '一个信息正在抵达——话语、消息，或突然的理解。注意语言背后的真实意图。',
      advice: '倾听沉默，它在说话。'
    },
    reversed: {
      oracle: '闻者非言，乃人之惧',
      reading: '误解与情绪投射正染判断。你听见的，是事实，还是他人的恐惧？',
      advice: '宜确认，不宜急答。'
    },
    dailyMessage: '今天请认真对待语言。该说清楚的事，不要只留给对方猜。',
    deeper: '安苏兹是奥丁的符文，代表神圣的沟通与智慧。它提醒我们，语言不仅是表达工具，更是连接心灵与更高维度的桥梁。'
  },
  {
    id: 'raido',
    symbol: 'ᚱ',
    name: '莱多',
    originalName: 'Raidho',
    meaning: '旅程、秩序与方向',
    keywords: ['旅程', '路径', '秩序', '迁移', '节奏'],
    element: '火',
    uprightMeaning: '你正处在一段过程之中，而不是终点面前。不要只问结果，也要确认路径是否正确。节奏比速度更重要，有时候绕行是为了找到更适合的路。',
    reversedMeaning: '路线可能出现偏差，或者你正在重复一段没有意义的行程。此时适合重新规划，而不是继续硬走。承认走错路，是智慧的开始。',
    upright: {
      oracle: '路正，何惧程远',
      reading: '你在过程之中，而非终点之前。路径比结果更值得确认，节奏比速度重要。',
      advice: '绕行亦是路，不必硬直。'
    },
    reversed: {
      oracle: '错路亦路，认之为智',
      reading: '路线已偏，或在重复一段无意义的行程。承认走错，是智慧的开始。',
      advice: '宜重规划，不宜硬走。'
    },
    dailyMessage: '今天适合调整方向。走得慢一点，也比走错路更好。',
    deeper: '莱多代表人生的旅程与命运的轨迹。它提醒我们，旅程本身即是目的，而非抵达终点的手段。'
  },
  {
    id: 'kenaz',
    symbol: 'ᚲ',
    name: '肯纳兹',
    originalName: 'Kenaz',
    meaning: '火炬、技艺与看见',
    keywords: ['火炬', '创造', '技艺', '洞察', '学习'],
    element: '火',
    uprightMeaning: '有一束光正在照亮问题的局部。你不需要立刻看清全部，只要先看清下一步。技艺、学习和创造会给你带来突破。火光虽小，足以照亮前路。',
    reversedMeaning: '你可能正在回避某个已经被照亮的问题。也可能是创作、学习或表达进入短暂停滞。不要急着否定自己，休息也是创造的一部分。',
    upright: {
      oracle: '火光虽微，足照下一步',
      reading: '一束光正照亮问题的局部。不必看清全部，先看清下一步；技艺与创造会带来突破。',
      advice: '宜学宜作，火种在你手中。'
    },
    reversed: {
      oracle: '炬暗之时，亦是歇时',
      reading: '你在回避一个已被照亮的问题，或创造陷入停滞。',
      advice: '休息亦是创造的一部分。'
    },
    dailyMessage: '今天适合学习、打磨、修正。小小的火光也能照出路径。',
    deeper: '肯纳兹以火炬为象征，代表照亮黑暗的智慧之光。它提醒我们，真正的看见不仅是用眼睛，更是用心和手去创造。'
  },
  {
    id: 'gebo',
    symbol: 'ᚷ',
    name: '盖博',
    originalName: 'Gebo',
    meaning: '赠予、契约与交换',
    keywords: ['赠予', '关系', '契约', '平衡', '互惠'],
    element: '风',
    uprightMeaning: '一段关系或合作正在要求更清晰的平衡。真正的赠予不是牺牲自己，而是在双方都清醒的情况下完成交换。健康的关系是双向流动的。',
    reversedMeaning: '如果一段关系只有单方面付出，那么它不是礼物，而是消耗。盖博提醒我们，真正的契约需要双方的尊重与承诺。',
    upright: {
      oracle: '礼尚往来，水方长流',
      reading: '一段关系正要求更清晰的平衡。真正的赠予不是自我牺牲，而是双方清醒的交换。',
      advice: '健康的联结，双向流动。'
    },
    reversed: {
      oracle: '单向之赠，终成重负',
      reading: '若只有单方付出，那不是礼物，是消耗。',
      advice: '契约须两愿，尊重须双方。'
    },
    dailyMessage: '今天请留意关系中的交换。你给出了什么，又得到了什么？',
    deeper: '盖博是礼物与契约的符文，代表人际间最纯粹的连接。它提醒我们，所有真正的关系都建立在平等与互惠之上。'
  },
  {
    id: 'wunjo',
    symbol: 'ᚹ',
    name: '温约',
    originalName: 'Wunjo',
    meaning: '喜悦、和谐与胜利',
    keywords: ['喜悦', '胜利', '和谐', '友情', '达成'],
    element: '火',
    uprightMeaning: '你正在经历一段和谐的时期。目标正在达成，关系正在加深，内心感到满足。请珍惜这份喜悦，它是对你努力的肯定。',
    reversedMeaning: '喜悦可能被延迟，或者你把成功的标准定得太高。有时候快乐不在远处，而在当下的每一个小确幸中。',
    upright: {
      oracle: '喜自耕耘，不假外求',
      reading: '一段和谐时期正在展开——目标将成，关系在加深。这份喜悦是对努力的回应。',
      advice: '珍惜此刻，它是路标。'
    },
    reversed: {
      oracle: '远处寻欢，近处有光',
      reading: '喜悦被延迟，或标准定得太高。快乐未必在远处。',
      advice: '低头看看当下的小确幸。'
    },
    dailyMessage: '今天请允许自己享受当下。不是所有时候都需要追逐未来。',
    deeper: '温约代表纯粹的喜悦与和谐，是北欧神话中最温柔的符文之一。它提醒我们，真正的幸福在于内心的平静，而非外在的成就。'
  },
  {
    id: 'hagalaz',
    symbol: 'ᚺ',
    name: '哈加拉兹',
    originalName: 'Hagalaz',
    meaning: '冰雹、破坏与重组',
    keywords: ['破坏', '突变', '冰雹', '重组', '不可控'],
    element: '水',
    uprightMeaning: '某种不可控的变化可能已经发生，或正在接近。它会打乱原有秩序，但也会迫使虚假的稳定露出裂缝。破坏是重组的前提。',
    reversedMeaning: '哈加拉兹不强调逆位。它的重点不是躲开破坏，而是在破坏后辨认什么仍然值得保留。废墟中也有新生的种子。',
    upright: {
      oracle: '雹落之后，沃土初成',
      reading: '不可控的变化正打乱秩序，也逼虚假的稳定露出裂缝。破坏是重组的前提。',
      advice: '不必躲，辨认何者值得保留。'
    },
    reversed: {
      oracle: '废墟之中，藏有种子',
      reading: '雹不择人，正逆皆然。重点从来不是躲开，而是过后辨认。',
      advice: '灾后清点，留真去伪。'
    },
    dailyMessage: '今天不必急着恢复原状。有些秩序被打破，正是因为它已经不适合你。',
    deeper: '哈加拉兹代表冰雹的毁灭性力量，是北欧符文体系中最具变革性的符文。它提醒我们，有时候必须经历破碎，才能迎来真正的蜕变。'
  },
  {
    id: 'nauthiz',
    symbol: 'ᚾ',
    name: '纳乌提兹',
    originalName: 'Nauthiz',
    meaning: '需求、约束与忍耐',
    keywords: ['需求', '约束', '忍耐', '匮乏', '等待'],
    element: '土',
    uprightMeaning: '你正处在一段看似受限的时期。资源可能暂时匮乏，机会似乎遥不可及。但约束也是成长的土壤，忍耐会带来智慧。',
    reversedMeaning: '你可能正在抗拒必要的限制，或者把匮乏当作不作为的借口。有时候限制不是敌人，而是让你专注于真正重要之事的助力。',
    upright: {
      oracle: '约束为炉，炼出真金',
      reading: '一段受限时期：资源暂缺，机会遥远——但约束也是成长的土壤。',
      advice: '忍耐非屈从，是蓄力。'
    },
    reversed: {
      oracle: '匮非借口，乃过滤器',
      reading: '你在抗拒必要的限制，或把匮乏当作不作为的理由。',
      advice: '限制正在替你筛掉不重要的。'
    },
    dailyMessage: '今天请练习忍耐。有些事情需要时间才能成熟。',
    deeper: '纳乌提兹代表需求与忍耐，是关于内在成长的符文。它提醒我们，真正的力量往往在限制中诞生，而非在无限的自由中。'
  },
  {
    id: 'isa',
    symbol: 'ᛁ',
    name: '伊萨',
    originalName: 'Isa',
    meaning: '冰、静止与冻结',
    keywords: ['冰', '静止', '冻结', '暂停', '反思'],
    element: '水',
    uprightMeaning: '一切似乎都在冻结中。行动受阻，决策暂停。这不是失败，而是一个必要的停顿。在静止中，你可以看清事物的本质。',
    reversedMeaning: '冻结的状态正在开始解冻。被压抑的能量即将释放，但请小心不要急于行动。解冻需要时间，以免脆弱的新生命受到伤害。',
    upright: {
      oracle: '冰封之下，水未曾死',
      reading: '行动受阻，决策暂停。这不是失败，是必要的停顿。',
      advice: '宜静观，不宜破冰。'
    },
    reversed: {
      oracle: '冰将融，勿踏新芽',
      reading: '冻结开始松动，被压抑的能量将释放。',
      advice: '徐行，给脆弱的新生留时间。'
    },
    dailyMessage: '今天请允许自己暂停。不是所有问题都需要立刻解决。',
    deeper: '伊萨是冰的符文，代表静止与反思的力量。它提醒我们，在快节奏的世界中，学会静止是一种珍贵的能力。'
  },
  {
    id: 'jera',
    symbol: 'ᛃ',
    name: '耶拉',
    originalName: 'Jera',
    meaning: '收获、周期与回报',
    keywords: ['收获', '周期', '回报', '耐心', '完成'],
    element: '土',
    uprightMeaning: '你正在收获过去播种的成果。无论是物质上的回报还是心灵上的成长，这都是一个丰收的时刻。请感恩并分享你的收获。',
    reversedMeaning: '收获可能延迟，或者你在收获前就放弃了。有时候看似没有进展，其实种子正在地下生长。继续耕耘，耐心等待。',
    upright: {
      oracle: '春种一粒，秋收有时',
      reading: '你正在收获过去播种的成果——物质的回报，或心灵的成长。',
      advice: '感恩，并与人分享。'
    },
    reversed: {
      oracle: '种在土中，非是荒芜',
      reading: '收获延迟，或你在成熟前就想放弃。看似无进展，其实根在生长。',
      advice: '继续耕耘，周期自会到。'
    },
    dailyMessage: '今天适合回顾过去的努力。你已经走了很远的路。',
    deeper: '耶拉代表农业的周期，是关于时间与耐心的符文。它提醒我们，所有真诚的付出终将得到回报，只是时间未到。'
  },
  {
    id: 'eihwaz',
    symbol: 'ᛇ',
    name: '艾哈兹',
    originalName: 'Eihwaz',
    meaning: '紫杉、门户与死亡',
    keywords: ['紫杉', '门户', '死亡', '转变', '重生'],
    element: '土',
    uprightMeaning: '你正站在一扇门前。它可能代表一段关系的结束、一个阶段的完成，或者某种旧身份的死亡。穿过这扇门，你将获得新生。',
    reversedMeaning: '你可能在抗拒必要的转变，或者迟迟不愿穿过那扇门。死亡不是终结，而是通往新开始的必经之路。',
    upright: {
      oracle: '门后非尽，乃另一程',
      reading: '你站在一扇门前——一段关系、一个阶段或旧身份的结束。',
      advice: '穿过去，那就是新生。'
    },
    reversed: {
      oracle: '拒门者，困于门内',
      reading: '你在抗拒必要的转变，迟迟不愿穿过那扇门。',
      advice: '死亡不是终结，是通路。'
    },
    dailyMessage: '今天请拥抱变化。有些结束是为了更好的开始。',
    deeper: '艾哈兹以紫杉树为象征，代表生与死的永恒循环。它提醒我们，所有的结束都是新的开始，死亡只是生命形态的转变。'
  },
  {
    id: 'perthro',
    symbol: 'ᛈ',
    name: '佩尔斯',
    originalName: 'Perthro',
    meaning: '命运、奥秘与内在成长',
    keywords: ['命运', '奥秘', '内在', '成长', '潜能'],
    element: '水',
    uprightMeaning: '你正在面对生命中的某个奥秘。答案不在外部，而在你的内心深处。信任你的直觉，它会引导你发现隐藏的潜能。',
    reversedMeaning: '你可能在回避内心的真相，或者过于依赖外部的答案。有时候最深刻的智慧来自向内探索，而非向外寻求。',
    upright: {
      oracle: '答案不在外，在骰未落处',
      reading: '你面对生命的一个奥秘。答案不在外部，在内心深处。',
      advice: '信任直觉，它认得路。'
    },
    reversed: {
      oracle: '外求千卷，不如内照一盏',
      reading: '你在回避内心的真相，或过于依赖外部答案。',
      advice: '最深的智慧，向内寻。'
    },
    dailyMessage: '今天请倾听内心的声音。它比你想象的更有智慧。',
    deeper: '佩尔斯是关于命运与内在奥秘的符文。它提醒我们，每个人都拥有未被发掘的潜能，只需勇敢地向内探索。'
  },
  {
    id: 'algiz',
    symbol: 'ᛉ',
    name: '阿尔吉兹',
    originalName: 'Algiz',
    meaning: '守护、警觉与神圣边界',
    keywords: ['守护', '保护', '警觉', '边界', '庇护'],
    element: '风',
    uprightMeaning: '你正在获得某种保护，也可能需要主动保护某件重要的事。保持警觉，但不要让恐惧主导所有判断。神圣的守护环绕着你。',
    reversedMeaning: '边界可能变得薄弱，或者你把安全感交给了不可靠的人。此时需要收回注意力，重新确认什么值得信任。',
    upright: {
      oracle: '鹿角为屏，护你所珍',
      reading: '你正获得某种保护，或需要主动守护一件重要的事。',
      advice: '警觉，但勿让恐惧代位。'
    },
    reversed: {
      oracle: '城墙有隙，先自查之',
      reading: '边界变薄，或你把安全感托付给不可靠之人。',
      advice: '收回注意，重估所信。'
    },
    dailyMessage: '今天请保护你的精力。不是所有请求都需要被答应。',
    deeper: '阿尔吉兹以麋鹿为象征，代表神圣的守护与警觉。它提醒我们，建立健康的边界不仅是保护自己，也是尊重他人。'
  },
  {
    id: 'sowilo',
    symbol: 'ᛊ',
    name: '索维洛',
    originalName: 'Sowilo',
    meaning: '太阳、光明与胜利',
    keywords: ['太阳', '光明', '胜利', '希望', '清晰'],
    element: '火',
    uprightMeaning: '阳光正在照耀你的道路。真相正在显现，困惑正在消散。这是一个充满希望与机会的时刻。勇敢地走向光明。',
    reversedMeaning: '阳光被云层遮挡，或者你正在逃避某个显而易见的真相。有时候直面现实需要勇气，但只有看清真相，才能找到出路。',
    upright: {
      oracle: '日悬中天，影自消散',
      reading: '真相正在显现，困惑正在退去。这是充满希望的时刻。',
      advice: '向光而行，无须回头。'
    },
    reversed: {
      oracle: '云后之日，未曾熄灭',
      reading: '光被遮挡，或你在逃避一个显而易见的真相。',
      advice: '直面它，看清才有出路。'
    },
    dailyMessage: '今天请面向光明。阴影会自己消失。',
    deeper: '索维洛是太阳的符文，代表纯粹的光明与力量。它提醒我们，即使在最黑暗的时刻，内心的光芒也永不熄灭。'
  },
  {
    id: 'teiwaz',
    symbol: 'ᛏ',
    name: '提瓦兹',
    originalName: 'Tiwaz',
    meaning: '正义、勇气与牺牲',
    keywords: ['正义', '勇气', '牺牲', '公正', '誓言'],
    element: '火',
    uprightMeaning: '你正面临一个需要勇气与公正的抉择。有时候为了更高的原则，需要做出艰难的牺牲。提尔的勇气在于面对必要的损失。',
    reversedMeaning: '你可能在逃避责任，或者用正义的名义行自私之事。真正的勇气不是盲目行动，而是在明知代价的情况下仍然选择正确的道路。',
    upright: {
      oracle: '一手可失，一诺不移',
      reading: '一个需要勇气与公正的抉择在前。更高的原则要求艰难的牺牲——如提尔将手放入狼口。',
      advice: '明知代价，仍择其正。'
    },
    reversed: {
      oracle: '借义之名，行私之实',
      reading: '你在逃避责任，或以正义之名行自私之事。',
      advice: '真勇气先问自己，再问天下。'
    },
    dailyMessage: '今天请做正确的事，即使它不容易。',
    deeper: '提瓦兹是战神提尔的符文，代表正义与牺牲的勇气。它提醒我们，真正的力量不在于战胜他人，而在于坚守原则。'
  },
  {
    id: 'berkanan',
    symbol: 'ᛒ',
    name: '贝尔卡纳',
    originalName: 'Berkano',
    meaning: '桦树、成长与新生',
    keywords: ['桦树', '成长', '新生', '生育', '滋养'],
    element: '土',
    uprightMeaning: '你正在经历一段快速成长的时期。新的想法、新的关系或新的机会正在萌芽。像桦树一样，保持柔软而坚韧，让成长自然发生。',
    reversedMeaning: '成长可能受阻，或者你对自己的成长过于苛刻。有时候放慢脚步，给自己时间和空间，反而能更好地成长。',
    upright: {
      oracle: '桦木初生，柔而顶霜',
      reading: '新的想法、关系或机会正在萌芽，一段快速生长期。',
      advice: '柔软而坚韧，任其生长。'
    },
    reversed: {
      oracle: '根需时日，不必催芽',
      reading: '成长受阻，或你对自己过于苛刻。',
      advice: '放慢些，给生长留空间。'
    },
    dailyMessage: '今天请允许自己成长。你不必立刻完美。',
    deeper: '贝尔卡纳以桦树为象征，代表女性的力量与生命的循环。它提醒我们，成长需要耐心和滋养，而非强迫。'
  },
  {
    id: 'ehwaz',
    symbol: 'ᛖ',
    name: '艾哈兹',
    originalName: 'Ehwaz',
    meaning: '马、伙伴关系与信任',
    keywords: ['马', '伙伴', '信任', '合作', '旅程'],
    element: '风',
    uprightMeaning: '你与他人的关系正在加强。信任是这段关系的基石。无论是工作伙伴、朋友还是伴侣，共同的旅程会让你们更加紧密。',
    reversedMeaning: '信任可能受损，或者伙伴关系出现裂痕。此时需要坦诚沟通，而不是回避问题。真正的伙伴关系能够承受考验。',
    upright: {
      oracle: '双骑同途，马力倍之',
      reading: '你与他人的联结正在加强，信任是基石。共同的旅程让你们更紧密。',
      advice: '并辔而行，信字当先。'
    },
    reversed: {
      oracle: '鞍鞯未正，先正而后骑',
      reading: '信任受损，伙伴关系出现裂痕。',
      advice: '坦诚相对，回避才是伤害。'
    },
    dailyMessage: '今天请珍惜你的伙伴。好的关系需要双方的维护。',
    deeper: '艾哈兹代表马与骑手的关系，是关于信任与合作的符文。它提醒我们，真正的伙伴关系建立在相互尊重与共同目标之上。'
  },
  {
    id: 'mannaz',
    symbol: 'ᛗ',
    name: '曼纳兹',
    originalName: 'Mannaz',
    meaning: '人类、自我与社群',
    keywords: ['人类', '自我', '社群', '身份', '连接'],
    element: '风',
    uprightMeaning: '你正在探索自己的身份与在社群中的位置。自我认知是成长的关键，但也要记得你是更大整体的一部分。',
    reversedMeaning: '你可能在过度关注自我，或者与社群脱节。记住，人类是社会性的存在，连接与独立同样重要。',
    upright: {
      oracle: '知己为人，亦知人在己中',
      reading: '你在探索身份与位置。自我认知是成长之钥，但你也是更大整体的一部分。',
      advice: '独处时修己，群体中成人。'
    },
    reversed: {
      oracle: '只见自我，不见众人',
      reading: '过度关注自我，或与社群脱节。',
      advice: '连接与独立，同样重要。'
    },
    dailyMessage: '今天请思考你与他人的关系。我们彼此需要。',
    deeper: '曼纳兹是人类的符文，代表自我意识与社群的平衡。它提醒我们，真正的自我实现离不开与他人的连接。'
  },
  {
    id: 'laguz',
    symbol: 'ᛚ',
    name: '拉古兹',
    originalName: 'Laguz',
    meaning: '水、直觉与流动',
    keywords: ['水', '直觉', '流动', '情感', '梦境'],
    element: '水',
    uprightMeaning: '你的直觉正在变得清晰。情感像水一样流动，梦境充满启示。学会倾听内心的声音，它比理性更了解你的真实需求。',
    reversedMeaning: '你可能在压抑情感，或者被情绪淹没。水既能滋养，也能淹没，学会在流动中保持平衡。',
    upright: {
      oracle: '水知去处，不问地图',
      reading: '直觉正变得清晰，情感如水流动，梦境充满启示。',
      advice: '听内心的声音，它更懂你。'
    },
    reversed: {
      oracle: '水可载舟，亦可覆舟',
      reading: '你在压抑情感，或被情绪淹没。',
      advice: '在流动中学平衡，勿筑坝亦勿沉溺。'
    },
    dailyMessage: '今天请倾听你的直觉。它知道答案。',
    deeper: '拉古兹是水的符文，代表直觉与情感的流动。它提醒我们，理性之外还有更深的智慧，需要用心去感受。'
  },
  {
    id: 'ingwaz',
    symbol: 'ᛜ',
    name: '英格瓦兹',
    originalName: 'Ingwaz',
    meaning: '内在力量、潜能与完成',
    keywords: ['内在', '潜能', '完成', '整合', '新生'],
    element: '土',
    uprightMeaning: '你已经完成了一个重要的内在旅程。潜能正在转化为现实，整合正在发生。这是一个新周期的开始。',
    reversedMeaning: '整合可能受阻，或者你在完成前就放弃了。有时候最困难的一步是最后一步，坚持下去。',
    upright: {
      oracle: '种子既熟，破土有时',
      reading: '一段重要的内在旅程已然完成，潜能正转化为现实。',
      advice: '收束即开始，新周期已启。'
    },
    reversed: {
      oracle: '行百里者，半于九十',
      reading: '整合受阻，或你在完成之前放弃。',
      advice: '最难的一步，往往是最后一步。'
    },
    dailyMessage: '今天请庆祝你的成长。你已经走了很远。',
    deeper: '英格瓦兹代表内在的神圣力量，是关于完成与新生的符文。它提醒我们，真正的力量来自内在的整合与自我接纳。'
  },
  {
    id: 'dagaz',
    symbol: 'ᛞ',
    name: '达加兹',
    originalName: 'Dagaz',
    meaning: '黎明、觉醒与转变',
    keywords: ['黎明', '觉醒', '转变', '突破', '光明'],
    element: '火',
    uprightMeaning: '黎明即将到来。你正在经历一次深刻的觉醒，黑暗正在消散。这是一个充满希望的时刻，新的可能性正在显现。',
    reversedMeaning: '觉醒可能延迟，或者你在抗拒必要的转变。有时候需要经历最深的黑暗，才能迎来最明亮的黎明。',
    upright: {
      oracle: '长夜尽处，天光自白',
      reading: '一次深刻的觉醒正在发生，黑暗正在消散，新的可能显现。',
      advice: '迎上去，黎明属于醒着的人。'
    },
    reversed: {
      oracle: '至暗时刻，离晓最近',
      reading: '觉醒延迟，或你在抗拒必要的转变。',
      advice: '再撑一刻，光是必然。'
    },
    dailyMessage: '今天请保持希望。黎明前的黑暗不会持续太久。',
    deeper: '达加兹是黎明的符文，代表从黑暗到光明的转变。它提醒我们，无论处境多么艰难，希望永远存在。'
  },
  {
    id: 'othala',
    symbol: 'ᛟ',
    name: '奥萨拉',
    originalName: 'Othala',
    meaning: '遗产、祖先与家园',
    keywords: ['遗产', '祖先', '家园', '传承', '根基'],
    element: '土',
    uprightMeaning: '你正在连接你的根源。祖先的智慧、家族的传承或文化的根基正在为你提供力量。珍惜你的遗产，它是你的一部分。',
    reversedMeaning: '你可能在否认自己的根源，或者与家园脱节。有时候回到起点，才能找到前进的方向。',
    upright: {
      oracle: '根深者，不惧风',
      reading: '祖先的智慧、家族的传承正为你供力。珍惜你的遗产，它是你的一部分。',
      advice: '从根处取力，再向高处生长。'
    },
    reversed: {
      oracle: '忘归途者，难辨去路',
      reading: '你在否认根源，或与家园脱节。',
      advice: '有时回到起点，才找到方向。'
    },
    dailyMessage: '今天请回顾你的根源。它们塑造了现在的你。',
    deeper: '奥萨拉是遗产与家园的符文，代表我们与过去的连接。它提醒我们，每个人都站在前人的肩膀上，传承是责任也是礼物。'
  }
]

export function getRuneById(id) {
  return runeData.find(rune => rune.id === id)
}

export function drawThreeRunes() {
  const shuffled = [...runeData].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export function getDailyRune() {
  const today = new Date()
  const index = today.getDate() % runeData.length
  return runeData[index]
}

export function generateInterpretation(rune1, rune2, rune3) {
  const timeLabels = ['过去', '现在', '未来']
  const runes = [rune1, rune2, rune3]
  
  let combinedText = '这组三符文揭示了你的生命旅程正在经历的转变。从【' + rune1.meaning + '】到【' + rune2.meaning + '】，再到【' + rune3.meaning + '】，每一步都蕴含着深刻的启示。\n\n'
  
  runes.forEach((rune, index) => {
    combinedText += '【' + timeLabels[index] + '】' + rune.name + ' (' + rune.meaning + '):\n' + rune.uprightMeaning + '\n\n'
  })
  
  return {
    past: rune1,
    present: rune2,
    future: rune3,
    combined: combinedText
  }
}

export const runes = runeData

export default runeData
