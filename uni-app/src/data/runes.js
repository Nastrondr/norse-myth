// 精选卢恩符文数据 - 北欧神话
export const runeData = [
  {
    id: 'fehu',
    symbol: 'ᚠ',
    name: '费胡',
    originalName: 'Fehu',
    meaning: '财富与流动',
    keywords: ['财富', '资源', '拥有', '交换', '流动'],
    uprightMeaning: '你正在接近一种可被掌握的资源。它可能是金钱，也可能是能力，人脉，时间或机会。真正的问题不是你是否拥有它，而是你能否让它流动起来。',
    reversedMeaning: '资源正在停滞，或者你对"拥有"的执念正在变重。此时不适合盲目扩张，更适合重新检查交换关系是否公平。',
    dailyMessage: '今天适合整理资源。看清你已经拥有的东西，再决定下一步要交换什么。'
  },
  {
    id: 'ansuz',
    symbol: 'ᚨ',
    name: '安苏兹',
    originalName: 'Ansuz',
    meaning: '语言，神谕与启示',
    keywords: ['语言', '沟通', '启示', '神谕', '智慧'],
    uprightMeaning: '某个信息正在抵达你身边。它可能来自一句话，一封消息、一次谈话，也可能来自你突然理解的某个细节。注意语言背后的真实意图。',
    reversedMeaning: '误解、沉默或错误信息正在影响判断。不要急于回应，先确认你听见的是事实，还是他人的情绪。',
    dailyMessage: '今天请认真对待语言。该说清楚的事，不要只留给对方猜。'
  },
  {
    id: 'thurisaz',
    symbol: 'ᚦ',
    name: '图里萨兹',
    originalName: 'Thurisaz',
    meaning: '巨人、冲突与防御',
    keywords: ['冲突', '防御', '巨人', '边界', '警惕'],
    uprightMeaning: '你正在面对一股粗粝而直接的力量。它未必是坏事，但它要求你建立边界。不要用柔软去消化所有攻击。',
    reversedMeaning: '你可能正在把外部冲突转向自己，或者把防御变成了过度攻击。先停下，判断真正的威胁在哪里。',
    dailyMessage: '今天适合划清边界。温和不等于无条件退让。'
  },
  {
    id: 'raido',
    symbol: 'ᚱ',
    name: '莱多',
    originalName: 'Raidho',
    meaning: '旅程、秩序与方向',
    keywords: ['旅程', '路径', '秩序', '迁移', '节奏'],
    uprightMeaning: '你正处在一段过程之中，而不是终点面前。不要只问结果，也要确认路径是否正确。节奏比速度更重要。',
    reversedMeaning: '路线可能出现偏差，或者你正在重复一段没有意义的行程。此时适合重新规划，而不是继续硬走。',
    dailyMessage: '今天适合调整方向。走得慢一点，也比走错路更好。'
  },
  {
    id: 'kenaz',
    symbol: 'ᚲ',
    name: '肯纳兹',
    originalName: 'Kenaz',
    meaning: '火炬、技艺与看见',
    keywords: ['火炬', '创造', '技艺', '洞察', '学习'],
    uprightMeaning: '有一束光正在照亮问题的局部。你不需要立刻看清全部，只要先看清下一步。技艺，学习和创造会给你带来突破。',
    reversedMeaning: '你可能正在回避某个已经被照亮的问题。也可能是创作，学习或表达进入短暂停滞。不要急着否定自己。',
    dailyMessage: '今天适合学习，打磨、修正。小小的火光也能照出路径。'
  },
  {
    id: 'gebo',
    symbol: 'ᚷ',
    name: '盖博',
    originalName: 'Gebo',
    meaning: '赠予、契约与交换',
    keywords: ['赠予', '关系', '契约', '平衡', '互惠'],
    uprightMeaning: '一段关系或合作正在要求更清晰的平衡。真正的赠予不是牺牲自己，而是在双方都清醒的情况下完成交换。',
    reversedMeaning: '盖博通常不设逆位，但它会提醒你：如果一段关系只有单方面付出，那么它不是礼物，而是消耗。',
    dailyMessage: '今天请留意关系中的交换。你给出了什么，又得到了什么？'
  },
  {
    id: 'hagalaz',
    symbol: 'ᚺ',
    name: '哈加拉兹',
    originalName: 'Hagalaz',
    meaning: '冰雹、破坏与重组',
    keywords: ['破坏', '突变', '冰雹', '重组', '不可控'],
    uprightMeaning: '某种不可控的变化可能已经发生，或正在接近。它会打乱原有秩序，但也会迫使虚假的稳定露出裂缝。',
    reversedMeaning: '哈加拉兹通常不强调逆位。它的重点不是躲开破坏，而是在破坏后辨认什么仍然值得保留。',
    dailyMessage: '今天不必急着恢复原状。有些秩序被打破，正是因为它已经不适合你。'
  },
  {
    id: 'algiz',
    symbol: 'ᛉ',
    name: '阿尔吉兹',
    originalName: 'Algiz',
    meaning: '守护、警觉与神圣边界',
    keywords: ['守护', '保护', '警觉', '边界', '庇护'],
    uprightMeaning: '你正在获得某种保护，也可能需要主动保护某件重要的事。保持警觉，但不要让恐惧主导所有判断。',
    reversedMeaning: '边界可能变得薄弱，或者你把安全感交给了不可靠的人。此时需要收回注意力，重新确认什么值得信任。',
    dailyMessage: '今天请保护你的精力。不是所有请求都需要被答应。'
  }
]

// 工具函数
export function getRuneById(id) {
  return runeData.find(rune => rune.id === id)
}

export function drawThreeRunes() {
  const shuffled = [...runeData].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export function getDailyRune() {
  const rune = runeData.find(r => r.id === 'ansuz')
  return rune || runeData[0]
}

export function generateInterpretation(rune1, rune2, rune3) {
  const timeLabels = ['过去', '现在', '未来']
  const runes = [rune1, rune2, rune3]
  
  let combinedText = '这组三符文显示，你正在从【' + rune1.meaning + '】进入【' + rune2.meaning + '】，并逐渐走向【' + rune3.meaning + '】。请把重点放在当前最需要被看见的问题上，而不是急于得到一个绝对答案。\n\n'
  
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