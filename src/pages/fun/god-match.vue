<template>
  <view class="match-page">
    <view class="match-nav">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">神祇匹配</text>
      <text class="nav-placeholder"></text>
    </view>

    <scroll-view v-if="!testStarted && !testCompleted" scroll-y class="match-scroll">
      <view class="match-hero">
        <text class="hero-kicker">神格测试</text>
        <text class="hero-title">寻找你的神格回响</text>
        <text class="hero-desc">本功能为基于北欧神话象征的人格气质匹配，不属于严肃心理测评。</text>
        <view class="status-chip">
          <text class="status-text">预计答题时间：约 3 分钟</text>
          <text class="status-divider">|</text>
          <text class="status-text">{{ questions.length }} 道情境题</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">测试维度</text>
        <view class="dimension-grid">
          <view v-for="item in dimensions" :key="item.key" class="dimension-card">
            <text class="dimension-name">{{ item.name }}</text>
            <text class="dimension-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view class="start-button" @click="startTest">
        <text>开始测试</text>
      </view>

      <!-- Saved match card hidden for demo release -->
      <view v-if="false" class="saved-match-card">
        <text class="saved-kicker">最近神格</text>
        <text class="saved-name">{{ savedMatchResult.primary.name }}</text>
        <text class="saved-title">{{ savedMatchResult.primary.title }}</text>
        <text class="saved-percent">{{ savedMatchResult.primary.matchPercent }}% 匹配度</text>
        <view class="saved-actions">
          <view class="saved-button" @click="restoreSavedResult">
            <text>查看结果</text>
          </view>
          <view class="saved-button" @click="startTest">
            <text>重新测试</text>
          </view>
        </view>
      </view>

      <!-- Dev test button hidden for release -->
      <view v-if="false" class="dev-test-button" @click="simulateGodMatch(1000)">
        <text>开发测试：模拟 1000 次</text>
      </view>
    </scroll-view>

    <view v-if="testStarted && !testCompleted" class="question-panel">
      <view class="question-progress">
        <text class="progress-text">第 {{ currentQuestionIndex + 1 }} / {{ questions.length }} 题</text>
        <text class="progress-percent">{{ getProgressPercent() }}%</text>
      </view>

      <view class="question-bar">
        <view class="question-bar-fill" :style="{ width: getProgressPercent() + '%' }"></view>
      </view>

      <view v-if="getCurrentQuestion()" class="question-card">
        <text class="question-title">{{ getCurrentQuestion().title }}</text>

        <view class="option-list">
          <view
            v-for="option in getCurrentQuestion().options"
            :key="option.id"
            class="option-card"
            @click="selectOption(option)"
          >
            <text class="option-index">{{ option.id.toUpperCase() }}</text>
            <text class="option-text">{{ option.text }}</text>
          </view>
        </view>
      </view>

      <view class="question-actions">
        <view class="ghost-button" :class="{ disabled: currentQuestionIndex === 0 }" @click="goPrevQuestion">
          <text>上一题</text>
        </view>
      </view>
    </view>

    <view v-if="testCompleted && matchResult" class="result-page">
      <view class="result-hero">
        <text class="result-kicker">你的神格回响</text>
        <text class="result-name">{{ matchResult.primary.name }}</text>
        <text class="result-original">{{ matchResult.primary.originalName }}</text>
        <text class="result-title">{{ matchResult.primary.title }}</text>

        <view class="match-percent-ring">
          <text class="match-percent">{{ matchResult.primary.matchPercent }}%</text>
          <text class="match-label">匹配度</text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">神格解读</text>
        <text class="section-text">{{ matchResult.primary.summary }}</text>
      </view>

      <view class="section-card">
        <text class="section-title">你的六维倾向</text>
        <view v-for="item in getUserScoreList()" :key="item.key" class="score-row">
          <view class="score-header">
            <text class="score-name">{{ item.name }}</text>
            <text class="score-value">{{ item.value }}</text>
          </view>
          <view class="score-bar">
            <view class="score-fill" :style="{ width: item.value + '%' }"></view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">神格气质</text>
        <text class="section-text">{{ getGenderAffinityLabel() }}</text>
      </view>

      <view class="section-card">
        <text class="section-title">你的优势</text>
        <view class="tag-list">
          <text v-for="item in matchResult.primary.strength" :key="item" class="result-tag">
            {{ item }}
          </text>
        </view>
      </view>

      <view class="section-card">
        <text class="section-title">阴影面</text>
        <view class="tag-list">
          <text v-for="item in matchResult.primary.shadow" :key="item" class="shadow-tag">
            {{ item }}
          </text>
        </view>
      </view>

      <view class="compare-grid">
        <view class="mini-result-card">
          <text class="mini-label">相近神祇</text>
          <text class="mini-name">{{ matchResult.secondary.name }}</text>
          <text class="mini-desc">{{ matchResult.secondary.title }}</text>
        </view>

        <view class="mini-result-card">
          <text class="mini-label">反差神祇</text>
          <text class="mini-name">{{ matchResult.contrast.name }}</text>
          <text class="mini-desc">{{ matchResult.contrast.title }}</text>
        </view>
      </view>

      <view class="result-actions">
        <view class="primary-button" @click="goToMatchedGod">
          <text>查看神祇详情</text>
        </view>
        <view class="ghost-button" @click="startTest">
          <text>重新测试</text>
        </view>
        <view class="share-toggle" @click="toggleShareCard">
          <text>{{ showShareCard ? '收起分享卡' : '展开分享卡' }}</text>
        </view>
      </view>

      <view v-if="showShareCard" class="share-card">
        <text class="share-title">分享我的神格</text>
        <text class="share-god-name">{{ matchResult.primary.name }}</text>
        <text class="share-god-en">{{ matchResult.primary.originalName }}</text>
        <text class="share-percent">{{ matchResult.primary.matchPercent }}% 匹配度</text>
        <text class="share-role">{{ matchResult.primary.title }}</text>
        <view class="share-dimensions">
          <text v-for="dim in getTopDimensions()" :key="dim.key" class="share-dim-tag">
            {{ dim.name }} {{ dim.value }}
          </text>
        </view>
        <text class="share-declaration">"{{ getResultDeclaration() }}"</text>
        <text class="share-app">九界神话档案</text>
      </view>
    </view>
  </view>
</template>

<script>
const dimensions = [
  { key: 'action', name: '行动力', desc: '你会主动介入局势，还是先观察变化。' },
  { key: 'insight', name: '洞察力', desc: '你更容易看见事实，还是隐藏结构。' },
  { key: 'order', name: '秩序感', desc: '你是否重视规则、誓言与边界。' },
  { key: 'empathy', name: '共情值', desc: '你在选择中会多大程度考虑他人。' },
  { key: 'risk', name: '风险性', desc: '你是否愿意越过边界承担后果。' },
  { key: 'ambition', name: '野心值', desc: '你是否渴望影响、掌控或改变局势。' }
]
// God Match stable question set
// 18 questions, 17 deity profiles
// Last simulation: all deities visible, max under 20%
const questions = [
{
  id: 'q20',
    title: '当你进入一片寒冷、陌生、资源有限的荒野时，你会优先依靠什么？',
    options: [
      { id: 'a', text: '观察地形，判断风向、路径和危险源。', scores: { insight: 2, order: 1, risk: -1 }, tendency: ['ullr', 'heimdall'] },
      { id: 'b', text: '保持体力，慢慢建立稳定的行动节奏。', scores: { order: 2, risk: -1 }, tendency: ['idunn', 'sif'] },
      { id: 'c', text: '直接寻找突破口，尽快离开困境。', scores: { action: 2, risk: 1 }, tendency: ['thor', 'hermod'] },
      { id: 'd', text: '利用环境的不确定性，反过来制造机会。', scores: { insight: 1, risk: 2 }, tendency: ['loki', 'ullr'] }
    ]
  },
  {
    id: 'q21',
    title: '一段重要经历即将被众人遗忘，你会怎么做？',
    options: [
      { id: 'a', text: '把它写成故事，让后来的人还能理解其中意义。', scores: { insight: 2, empathy: 1, ambition: 1 }, tendency: ['bragi', 'odin'] },
      { id: 'b', text: '保存关键细节，避免记忆被夸大或扭曲。', scores: { insight: 2, order: 1 }, tendency: ['bragi', 'heimdall'] },
      { id: 'c', text: '让亲历者先被安置好，记忆可以慢慢整理。', scores: { empathy: 2, order: 1 }, tendency: ['idunn', 'sif'] },
      { id: 'd', text: '如果遗忘能让人继续生活，我会接受它。', scores: { empathy: 1, risk: -1, insight: 1 }, tendency: ['njord', 'hel'] }
    ]
  },
  {
    id: 'q22',
    title: '若有人托你穿越险地，送出一则关乎生死的消息，你会？',
    options: [
      { id: 'a', text: '立刻启程，消息若延误，代价只会更大。', scores: { action: 2, empathy: 1, risk: 1 }, tendency: ['hermod', 'thor'] },
      { id: 'b', text: '先确认路线、风险与代价，再决定如何送达。', scores: { insight: 1, order: 2 }, tendency: ['ullr', 'tyr'] },
      { id: 'c', text: '寻找更稳妥的传递方式，避免牵连更多人。', scores: { empathy: 1, order: 1, risk: -1 }, tendency: ['njord', 'frigg'] },
      { id: 'd', text: '若规则挡住去路，我会寻找另一条路径。', scores: { insight: 1, risk: 2, order: -1 }, tendency: ['loki', 'hermod'] }
    ]
  },
  {
    id: 'q23',
    title: '一场灾难之后，你最想先做什么？',
    options: [
      { id: 'a', text: '重建基本秩序，让人们重新有地方生活。', scores: { order: 2, empathy: 1 }, tendency: ['sif', 'freyr'] },
      { id: 'b', text: '照顾受损的人，让他们慢慢恢复生命力。', scores: { empathy: 2, risk: -1 }, tendency: ['idunn', 'sif'] },
      { id: 'c', text: '记录灾难发生的原因，避免它再次重演。', scores: { insight: 2, order: 1 }, tendency: ['bragi', 'heimdall'] },
      { id: 'd', text: '找到真正的责任方，让代价回到它该去的地方。', scores: { action: 1, order: 1, ambition: 1 }, tendency: ['tyr', 'vidar'] }
    ]
  },
  {
    id: 'q1',
    title: '你在边境发现一道陌生的裂隙，你会？',
    options: [
      { id: 'a', text: '立刻靠近查看，判断是否有危险。', scores: { action: 2, risk: 2 }, tendency: ['thor', 'loki'] },
      { id: 'b', text: '先记录异象，再寻找相似的古老记载。', scores: { insight: 2, risk: -1 }, tendency: ['heimdall', 'bragi'] },
      { id: 'c', text: '通知同伴，设立边界后再处理。', scores: { order: 2, empathy: 1 }, tendency: ['tyr', 'heimdall'] },
      { id: 'd', text: '等待裂隙变化，不急于干预。', scores: { insight: 1, action: -1 }, tendency: ['frigg', 'hel'] }
    ]
  },
  {
    id: 'q2',
    title: '当一群人陷入混乱、无人能决定方向时，你通常会？',
    options: [
      { id: 'a', text: '站出来决定方向。', scores: { action: 2, ambition: 1 }, tendency: ['thor', 'hermod'] },
      { id: 'b', text: '找出混乱背后的真正原因。', scores: { insight: 2, order: 1 }, tendency: ['odin', 'frigg'] },
      { id: 'c', text: '维持秩序和公平，先让局面稳定下来。', scores: { order: 2, empathy: 1 }, tendency: ['tyr', 'heimdall'] },
      { id: 'd', text: '不一定站在台前，但会悄悄影响局势走向。', scores: { insight: 1, risk: 2 }, tendency: ['loki', 'frigg'] }
    ]
  },
  {
    id: 'q3',
    title: '如果必须付出代价才能获得智慧，你会？',
    options: [
      { id: 'a', text: '愿意，只要答案足够重要。', scores: { insight: 2, ambition: 2, risk: 1 }, tendency: ['odin', 'bragi'] },
      { id: 'b', text: '先判断代价是否公平。', scores: { order: 2, insight: 1 }, tendency: ['tyr', 'vidar'] },
      { id: 'c', text: '如果能保护重要的人，我愿意。', scores: { empathy: 2, action: 1 }, tendency: ['frigg', 'thor'] },
      { id: 'd', text: '我会先找找有没有不必付出同样代价的办法。', scores: { risk: 2, insight: 1, order: -1 }, tendency: ['loki', 'bragi'] }
    ]
  },
  {
    id: 'q8',
    title: '进入陌生环境时，你会优先寻找什么？',
    options: [
      { id: 'a', text: '出口和危险源。', scores: { order: 1, risk: -2 }, tendency: ['heimdall', 'ullr'] },
      { id: 'b', text: '有影响力的人或中心位置。', scores: { ambition: 2, action: 1 }, tendency: ['freyr', 'freyja'] },
      { id: 'c', text: '可以信任的人。', scores: { empathy: 2 }, tendency: ['baldr', 'njord'] },
      { id: 'd', text: '隐藏规则和漏洞。', scores: { insight: 2, risk: 1 }, tendency: ['loki', 'hel'] }
    ]
  },
  {
    id: 'q10',
    title: '面对一个未知而强大的存在时，你会？',
    options: [
      { id: 'a', text: '试着建立联系。', scores: { empathy: 2, action: 1 }, tendency: ['baldr', 'freyja'] },
      { id: 'b', text: '保持敬畏，观察边界。', scores: { risk: -2, insight: 1 }, tendency: ['ullr', 'heimdall'] },
      { id: 'c', text: '先判断它是否可能成为盟友，或至少不是敌人。', scores: { ambition: 1, order: 1 }, tendency: ['tyr', 'freyr'] },
      { id: 'd', text: '测试它的反应。', scores: { risk: 2, insight: 1 }, tendency: ['loki', 'hermod'] }
    ]
  },
  {
    id: 'q11',
    title: '你更希望别人如何评价你？',
    options: [
      { id: 'a', text: '可靠、强大、值得依靠。', scores: { action: 1, empathy: 1, order: 1 }, tendency: ['thor', 'tyr'] },
      { id: 'b', text: '深刻、聪明、看得很远。', scores: { insight: 2, ambition: 1 }, tendency: ['odin', 'bragi'] },
      { id: 'c', text: '温柔、可靠，让人感到安心。', scores: { empathy: 2, risk: -1 }, tendency: ['baldr', 'idunn'] },
      { id: 'd', text: '特别、自由、不可预测。', scores: { risk: 2, order: -1 }, tendency: ['loki', 'freyja'] }
    ]
  },
  {
    id: 'q12',
    title: '如果你的命运已经写定，你会？',
    options: [
      { id: 'a', text: '仍然迎战。', scores: { action: 2, order: 1 }, tendency: ['thor', 'vidar'] },
      { id: 'b', text: '找到命运背后的结构。', scores: { insight: 2, ambition: 1 }, tendency: ['odin', 'bragi'] },
      { id: 'c', text: '在终局前保护能保护的人。', scores: { empathy: 2, risk: -1 }, tendency: ['frigg', 'sif'] },
      { id: 'd', text: '让命运也付出代价。', scores: { risk: 2, ambition: 1 }, tendency: ['loki', 'hel'] }
    ]
  },
  {
    id: 'q13',
    title: '如果你负责守护一片土地，你最看重什么？',
    options: [
      { id: 'a', text: '让这里丰饶、安定，适合人们生活。', scores: { empathy: 2, order: 1, risk: -1 }, tendency: ['freyr', 'njord'] },
      { id: 'b', text: '建立清晰的规则，让所有人知道边界。', scores: { order: 2, action: 1 }, tendency: ['tyr', 'heimdall'] },
      { id: 'c', text: '保留自然的自由，不要过度干预。', scores: { empathy: 1, risk: 1, order: -1 }, tendency: ['freyja', 'freyr'] },
      { id: 'd', text: '让这片土地成为秩序与意志能够延伸的地方。', scores: { ambition: 2, order: 1 }, tendency: ['odin', 'hel'] }
    ]
  },
  {
    id: 'q14',
    title: '当重要的人被卷入一场几乎无法脱身的危险时，你会？',
    options: [
      { id: 'a', text: '亲自前往，哪怕希望渺茫。', scores: { action: 2, empathy: 2, risk: 1 }, tendency: ['hermod', 'thor'] },
      { id: 'b', text: '寻找规则中的漏洞，争取一次例外。', scores: { insight: 2, empathy: 1, order: -1 }, tendency: ['loki', 'frigg'] },
      { id: 'c', text: '保持冷静，判断哪些代价已无法避免。', scores: { order: 1, insight: 1, risk: -1 }, tendency: ['hel', 'tyr'] },
      { id: 'd', text: '先确认这场危机是否仍有被扭转的可能。', scores: { insight: 2, ambition: 1 }, tendency: ['hel'] }
    ]
  },
  {
    id: 'q15',
    title: '你更愿意用哪种方式留下影响？',
    options: [
      { id: 'a', text: '通过诗歌、语言或故事被记住。', scores: { insight: 2, empathy: 1, ambition: 1 }, tendency: ['bragi', 'odin'] },
      { id: 'b', text: '通过守护、陪伴和可靠被记住。', scores: { empathy: 2, order: 1 }, tendency: ['sif', 'baldr'] },
      { id: 'c', text: '通过行动和胜利来证明自己。', scores: { action: 2, ambition: 1 }, tendency: ['thor', 'vidar'] },
      { id: 'd', text: '不必被记住，只要结果延续下去。', scores: { order: 1, risk: -1, empathy: 1 }, tendency: ['idunn', 'njord'] }
    ]
  },
  {
    id: 'q16',
    title: '面对漫长的等待，你通常会？',
    options: [
      { id: 'a', text: '保持节奏，慢慢积累。', scores: { order: 2, risk: -1 }, tendency: ['idunn', 'sif'] },
      { id: 'b', text: '把等待变成准备，寻找最佳时机。', scores: { insight: 2, order: 1 }, tendency: ['heimdall', 'vidar'] },
      { id: 'c', text: '感到不耐烦，想主动打破停滞。', scores: { action: 2, risk: 1 }, tendency: ['thor', 'loki'] },
      { id: 'd', text: '接受等待本身，它也是过程的一部分。', scores: { empathy: 1, insight: 1, risk: -1 }, tendency: ['frigg', 'idunn'] }
    ]
  },
  {
    id: 'q17',
    title: '你在冲突中更接近哪种姿态？',
    options: [
      { id: 'a', text: '沉默很久，但关键时刻会出手。', scores: { action: 1, insight: 1, order: 1 }, tendency: ['vidar', 'hel'] },
      { id: 'b', text: '保持距离，用技巧和判断解决问题。', scores: { insight: 1, risk: -1, action: 1 }, tendency: ['ullr', 'heimdall'] },
      { id: 'c', text: '用语言化解紧张，让局势重新变得可沟通。', scores: { empathy: 2, insight: 1 }, tendency: ['bragi', 'njord'] },
      { id: 'd', text: '直接介入，避免问题继续扩大。', scores: { action: 2, empathy: 1 }, tendency: ['thor', 'tyr'] }
    ]
  },
  {
    id: 'q18',
    title: '你最害怕失去什么？',
    options: [
      { id: 'a', text: '生命力、青春和继续生长的可能。', scores: { empathy: 1, risk: -1, order: 1 }, tendency: ['idunn', 'freyr'] },
      { id: 'b', text: '家园、亲密关系和稳定的生活。', scores: { empathy: 2, order: 1 }, tendency: ['sif', 'frigg'] },
      { id: 'c', text: '荣誉、能力和被认可的位置。', scores: { ambition: 2, action: 1 }, tendency: ['hermod', 'thor'] },
      { id: 'd', text: '真相、记忆和理解命运的机会。', scores: { insight: 2, ambition: 1 }, tendency: ['bragi', 'odin'] }
    ]
  },
  {
    id: 'q19',
    title: '你认为自己的神格气质更偏向于？',
    options: [
      { id: 'a', text: '锋利、外放、行动、开拓、正面冲突和远征。', scores: { action: 1, ambition: 1 }, genderAffinity: 'masculine', tendency: ['odin', 'thor', 'tyr', 'heimdall', 'freyr', 'hermod', 'vidar', 'ullr'] },
      { id: 'b', text: '柔韧、感知、守护、滋养、预知和生命延续。', scores: { empathy: 1, insight: 1 }, genderAffinity: 'feminine', tendency: ['frigg', 'freyja', 'idunn', 'sif'] },
      { id: 'c', text: '边界、调和、平衡、克制，不特别偏向锋利或柔韧，更重视边界的稳定。', scores: { order: 1, insight: 1 }, genderAffinity: 'neutral', tendency: ['njord', 'bragi', 'heimdall', 'baldr', 'freyr'] },
      { id: 'd', text: '变化、流动、复杂、游移，不愿被固定身份、单一秩序或明确标签归类。', scores: { risk: 1, insight: 1 }, genderAffinity: 'fluid', tendency: ['loki', 'hel'] }
    ]
  }
]

const deityProfiles = [
  {
    id: 'odin',
    name: '奥丁',
    originalName: 'Odin',
    title: '智慧、代价与命运的追问者',
    scores: { action: 58, insight: 88, order: 66, empathy: 48, risk: 55, ambition: 78 },
    genderGroup: 'masculine',
    summary: '你不满足于简单答案。你会不断追问局势背后的结构，也愿意为了真相承担代价。',
    strength: ['深度思考', '长期规划', '洞察复杂关系'],
    shadow: ['容易过度承担', '可能为了目标忽略情感代价']
  },
  {
    id: 'thor',
    name: '索尔',
    originalName: 'Thor',
    title: '雷神、守护者与正义之锤',
    scores: { action: 95, insight: 35, order: 70, empathy: 75, risk: 55, ambition: 45 },
    genderGroup: 'masculine',
    summary: '你相信直接的力量，也相信保护弱小的责任。正面迎战是你的本能，但你也懂得何时该克制。',
    strength: ['果断行动', '保护弱小', '可靠如山'],
    shadow: ['可能过于冲动', '不喜欢绕弯子的解决方案']
  },
  {
    id: 'loki',
    name: '洛基',
    originalName: 'Loki',
    title: '诡计与变化之子',
    scores: { action: 66, insight: 82, order: 28, empathy: 42, risk: 72, ambition: 68 },
    genderGroup: 'fluid',
    summary: '规则在你眼中并非铁律，而是可以被理解和利用的结构。你在混乱中感到自在，也擅长制造混乱。',
    strength: ['灵活应变', '看穿规则漏洞', '创造意外可能'],
    shadow: ['为达目的不择手段', '难以建立深度信任']
  },
  {
    id: 'frigg',
    name: '弗丽嘉',
    originalName: 'Frigg',
    title: '预言之母与天空之后',
    scores: { action: 45, insight: 88, order: 75, empathy: 90, risk: 35, ambition: 55 },
    genderGroup: 'feminine',
    summary: '你兼具洞察力与包容心。你能看到事物的多种可能，也理解情感在决策中的重量。',
    strength: ['深度共情', '全观视角', '温柔的力量'],
    shadow: ['可能过度担忧', '难以在冲突中做出强硬决定']
  },
  {
    id: 'freyja',
    name: '芙蕾雅',
    originalName: 'Freyja',
    title: '爱与战利品女神',
    scores: { action: 68, insight: 72, order: 42, empathy: 82, risk: 62, ambition: 68 },
    genderGroup: 'feminine',
    summary: '你兼具魅力与决断力。你理解情感的力量，也知道何时该出手掌控局势。',
    strength: ['情感智慧', '灵活掌控', '在爱与战争中找到平衡'],
    shadow: ['可能过于计较得失', '在感情上容易执着']
  },
  {
    id: 'tyr',
    name: '提尔',
    originalName: 'Tyr',
    title: '契约之神与正义的代价',
    scores: { action: 78, insight: 55, order: 95, empathy: 70, risk: 45, ambition: 50 },
    genderGroup: 'masculine',
    summary: '你将誓言与秩序看得比个人安危更重。你愿意为了正确的代价付出一切，即使那意味着牺牲。',
    strength: ['坚守信念', '公正无私', '为大局牺牲小我'],
    shadow: ['可能过于教条', '不擅长处理灰色地带']
  },
  {
    id: 'heimdall',
    name: '海姆达尔',
    originalName: 'Heimdall',
    title: '彩虹桥守卫与世界之眼',
    scores: { action: 50, insight: 85, order: 90, empathy: 45, risk: 20, ambition: 40 },
    genderGroup: 'masculine',
    summary: '你是永恒的观察者，守护边界是你的天性。你不易被动摇，但也可能因此错过生命的流动。',
    strength: ['高度警觉', '坚守岗位', '看穿伪装'],
    shadow: ['可能过于冷漠', '难以放下职责享受当下']
  },
  {
    id: 'baldr',
    name: '巴德尔',
    originalName: 'Baldr',
    title: '光明之神与被爱之人',
    scores: { action: 48, insight: 50, order: 62, empathy: 90, risk: 22, ambition: 32 },
    genderGroup: 'neutral',
    summary: '你拥有让人安心的光明力量，共情是你的本能。但光明也有阴影，过度被爱有时也是一种重负。',
    strength: ['温暖如光', '高度共情', '让人信赖'],
    shadow: ['可能缺乏主见', '难以面对冲突与阴暗']
  },
  {
    id: 'hel',
    name: '海拉',
    originalName: 'Hel',
    title: '冥府女王与死亡的接纳',
    scores: { action: 34, insight: 76, order: 82, empathy: 30, risk: 38, ambition: 58 },
    genderGroup: 'fluid',
    summary: '你不回避生命中的阴暗面，也因此拥有独特的承受力。你理解死是生的一部分，这让你在动荡中保持冷静。',
    strength: ['冷静接纳', '理解复杂人性', '在逆境中保持坚韧'],
    shadow: ['可能过于疏离', '难以表达温情']
  },
  {
    id: 'njord',
    name: '尼约德',
    originalName: 'Njord',
    title: '海风之神与财富之主',
    scores: { action: 38, insight: 50, order: 54, empathy: 68, risk: 24, ambition: 36 },
    genderGroup: 'neutral',
    summary: '你在躁动与安宁之间找到平衡。财富与繁荣是你的赐予，你也懂得何时该收网、何时该放手。',
    strength: ['务实稳健', '带来繁荣', '平衡内外'],
    shadow: ['可能过于保守', '在风平浪静中容易松懈']
  },
  {
    id: 'freyr',
    name: '弗雷',
    originalName: 'Freyr',
    title: '丰饶、和平与生命秩序的守护者',
    scores: { action: 58, insight: 60, order: 68, empathy: 82, risk: 42, ambition: 55 },
    genderGroup: 'masculine',
    summary: '你倾向于创造稳定、丰饶和适合他人生活的环境。你并不总是追求冲突中的胜利，更重视关系、土地和长久的繁盛。',
    strength: ['调和关系', '创造稳定环境', '重视生命力与长期繁荣'],
    shadow: ['可能回避尖锐冲突', '容易为了和平压下真实需求']
  },
  {
    id: 'hermod',
    name: '赫尔莫德',
    originalName: 'Hermod',
    title: '奔赴冥界的信使与营救者',
    scores: { action: 80, insight: 52, order: 58, empathy: 82, risk: 58, ambition: 38 },
    genderGroup: 'masculine',
    summary: '你愿意为了重要的人踏上危险旅程。你的力量来自忠诚、行动与不轻言放弃。',
    strength: ['勇于奔赴', '重视承诺', '在危机中保持行动'],
    shadow: ['可能承担过多情感责任', '容易在希望渺茫时仍不肯停下']
  },
  {
    id: 'bragi',
    name: '布拉吉',
    originalName: 'Bragi',
    title: '诗歌、语言与记忆的保存者',
    scores: { action: 38, insight: 82, order: 60, empathy: 72, risk: 28, ambition: 50 },
    genderGroup: 'neutral',
    summary: '你擅长用语言整理经验，也愿意让故事替人保存意义。你的力量不是冲锋，而是表达、记忆与传承。',
    strength: ['表达能力', '叙事与记忆', '温和沟通'],
    shadow: ['可能停留在语言中', '行动力不足时容易错过时机']
  },
  {
    id: 'idunn',
    name: '伊敦',
    originalName: 'Idunn',
    title: '青春、延续与生命果实的守护者',
    scores: { action: 35, insight: 55, order: 72, empathy: 86, risk: 22, ambition: 35 },
    genderGroup: 'feminine',
    summary: '你重视滋养、恢复和长久延续。你不一定站在舞台中央，却常常是他人重新获得生命力的来源。',
    strength: ['疗愈与滋养', '稳定陪伴', '守护生命力'],
    shadow: ['容易被他人依赖', '可能低估外界的掠夺性']
  },
  {
    id: 'sif',
    name: '希芙',
    originalName: 'Sif',
    title: '家园、丰收与沉静尊严的象征',
    scores: { action: 42, insight: 48, order: 78, empathy: 78, risk: 24, ambition: 36 },
    genderGroup: 'feminine',
    summary: '你重视关系中的稳定、尊严和日常秩序。你的力量并不张扬，却能让生活重新扎根。',
    strength: ['稳定关系', '维护家园', '沉静可靠'],
    shadow: ['可能过度忍耐', '不善于表达被冒犯后的愤怒']
  },
  {
    id: 'vidar',
    name: '维达',
    originalName: 'Vidar',
    title: '沉默、复仇与终末后的坚韧者',
    scores: { action: 72, insight: 68, order: 70, empathy: 42, risk: 50, ambition: 58 },
    genderGroup: 'masculine',
    summary: '你不急于表达自己，但会在关键时刻行动。你的力量来自耐心、压抑后的爆发，以及承受沉重命运的能力。',
    strength: ['关键时刻出手', '忍耐力强', '能承受长期压力'],
    shadow: ['情绪表达过少', '可能把痛苦转化为沉默的执念']
  },
  {
    id: 'ullr',
    name: '乌勒尔',
    originalName: 'Ullr',
    title: '狩猎、技艺与寒境中的独行者',
    scores: { action: 68, insight: 64, order: 66, empathy: 42, risk: 36, ambition: 58 },
    genderGroup: 'masculine',
    summary: '你善于在复杂局势中保持距离，用冷静的判断和熟练的技艺寻找突破口。你未必依赖群体的庇护，却能在陌生、艰难的环境里稳定行动。',
    strength: ['技艺精确', '独立判断', '适应艰难环境'],
    shadow: ['可能显得疏离', '不容易向他人求助']
  }
]

export default {
  data() {
    return {
      dimensions,
      questions,
      deityProfiles,
      testStarted: false,
      currentQuestionIndex: 0,
      answers: [],
      dimensionScores: {
        action: 0,
        insight: 0,
        order: 0,
        empathy: 0,
        risk: 0,
        ambition: 0
      },
      testCompleted: false,
      matchResult: null,
      matchStorageKey: 'norse_god_match_result',
      savedMatchResult: null,
      genderAffinity: 'none',
      showShareCard: false
    }
  },
  onLoad() {
    this.loadSavedMatchResult()
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    startTest() {
      this.testStarted = true
      this.testCompleted = false
      this.currentQuestionIndex = 0
      this.answers = []
      this.dimensionScores = {
        action: 0,
        insight: 0,
        order: 0,
        empathy: 0,
        risk: 0,
        ambition: 0
      }
      this.matchResult = null
      this.genderAffinity = 'none'
    },
    getCurrentQuestion() {
      return this.questions[this.currentQuestionIndex] || null
    },
    getProgressPercent() {
      if (!this.questions.length) return 0
      return Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100)
    },
    selectOption(option) {
      const question = this.getCurrentQuestion()
      if (!question || !option) return

      if (option.genderAffinity) {
        this.genderAffinity = option.genderAffinity
      }

      this.answers.push({
        questionId: question.id,
        optionId: option.id,
        scores: option.scores || {},
        tendency: option.tendency || [],
        genderAffinity: option.genderAffinity || null
      })

      const scores = option.scores || {}
      Object.keys(scores).forEach(key => {
        if (this.dimensionScores[key] === undefined) {
          this.dimensionScores[key] = 0
        }
        this.dimensionScores[key] += Number(scores[key] || 0)
      })

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex += 1
      } else {
        this.finishTest()
      }
    },
    goPrevQuestion() {
      if (this.currentQuestionIndex <= 0) return

      const lastAnswer = this.answers.pop()

      if (lastAnswer && lastAnswer.scores) {
        Object.keys(lastAnswer.scores).forEach(key => {
          this.dimensionScores[key] -= Number(lastAnswer.scores[key] || 0)
        })
      }

      this.currentQuestionIndex -= 1
    },
    finishTest() {
      this.testCompleted = true
      this.testStarted = false
      this.matchResult = this.calculateMatchResult()
      this.saveMatchResult()
      this.applyMatchUnlocks()
    },
    normalizeScores(rawScores) {
      const normalized = {}
      Object.keys(rawScores).forEach(key => {
        const raw = Number(rawScores[key] || 0)
        const value = Math.max(0, Math.min(100, Math.round((raw + 12) / 24 * 100)))
        normalized[key] = value
      })
      return normalized
    },
    calculateMatchResult() {
      const userScores = this.normalizeScores(this.dimensionScores)
      const tendencyCounts = this.getTendencyCountsFromAnswers()

      const results = this.deityProfiles.map(deity => {
        const deityScores = deity.scores || {}
        const keys = ['action', 'insight', 'order', 'empathy', 'risk', 'ambition']

        const diffTotal = keys.reduce((sum, key) => {
          return sum + Math.abs(Number(userScores[key] || 0) - Number(deityScores[key] || 0))
        }, 0)

        const avgDiff = diffTotal / keys.length
        const baseScore = Math.max(0, Math.min(100, Math.round(100 - avgDiff)))

        const tendencyCount = Number(tendencyCounts[deity.id] || 0)
        const tendencyBonus = Math.min(14, tendencyCount * 3)

        let strongTendencyBonus = 0
        if (tendencyCount >= 4) {
          strongTendencyBonus = 2
        } else if (tendencyCount >= 3) {
          strongTendencyBonus = 1
        }

        const rareBoostMap = {
          odin: 0,
          thor: 2,
          loki: 0,
          hermod: 1,
          ullr: 1,
          freyja: 1,
          baldr: 1
        }
        const rareBoost = Number(rareBoostMap[deity.id] || 0)

        let genderBonus = 0
        if (this.genderAffinity && this.genderAffinity !== 'none') {
          if (deity.genderGroup === this.genderAffinity) {
            genderBonus = 5
          } else if (this.genderAffinity === 'fluid' && deity.id === 'loki') {
            genderBonus = 8
          } else {
            genderBonus = -1
          }
        }

        let matchPercent = Math.round(baseScore + tendencyBonus + strongTendencyBonus + rareBoost + genderBonus)
        matchPercent = Math.max(0, Math.min(100, matchPercent))

        return {
          ...deity,
          matchPercent
        }
      })

      results.sort((a, b) => b.matchPercent - a.matchPercent)

      return {
        primary: results[0],
        secondary: results[1],
        contrast: results[results.length - 1],
        userScores
      }
    },
    getTendencyCountsFromAnswers() {
      const counts = {}
      ;(this.answers || []).forEach(answer => {
        ;(answer.tendency || []).forEach(id => {
          counts[id] = (counts[id] || 0) + 1
        })
      })
      return counts
    },
    getDimensionRanges() {
      const keys = ['action', 'insight', 'order', 'empathy', 'risk', 'ambition']
      const ranges = {}
      keys.forEach(key => {
        ranges[key] = { min: 0, max: 0 }
      })
      ;(this.questions || []).forEach(question => {
        keys.forEach(key => {
          const values = (question.options || []).map(option => {
            return Number((option.scores && option.scores[key]) || 0)
          })
          if (values.length > 0) {
            ranges[key].min += Math.min(...values)
            ranges[key].max += Math.max(...values)
          }
        })
      })
      return ranges
    },
    normalizeScores(rawScores) {
      const ranges = this.getDimensionRanges()
      const normalized = {}
      Object.keys(ranges).forEach(key => {
        const raw = Number(rawScores[key] || 0)
        const min = Number(ranges[key].min || 0)
        const max = Number(ranges[key].max || 1)
        const span = max - min || 1
        const value = Math.round(((raw - min) / span) * 100)
        normalized[key] = Math.max(0, Math.min(100, value))
      })
      return normalized
    },
    getUserScoreList() {
      const scores = this.matchResult && this.matchResult.userScores
        ? this.matchResult.userScores
        : {}

      return [
        { key: 'action', name: '行动力', value: scores.action || 0 },
        { key: 'insight', name: '洞察力', value: scores.insight || 0 },
        { key: 'order', name: '秩序感', value: scores.order || 0 },
        { key: 'empathy', name: '共情值', value: scores.empathy || 0 },
        { key: 'risk', name: '风险性', value: scores.risk || 0 },
        { key: 'ambition', name: '野心值', value: scores.ambition || 0 }
      ]
    },
    getGenderAffinityLabel() {
      const map = {
        masculine: '男性化的：雷霆与远征',
        feminine: '女性化的：预知与丰饶',
        neutral: '中性化的：边界与调和',
        fluid: '无法被定义的：变化与流动',
        none: '未设定'
      }
      return map[this.genderAffinity] || '未设定'
    },
    simulateGodMatch(rounds = 1000) {
      const resultCounts = {}
      const dimensionTotals = {}
      const keys = ['action', 'insight', 'order', 'empathy', 'risk', 'ambition']

      this.deityProfiles.forEach(deity => {
        resultCounts[deity.id] = 0
      })

      keys.forEach(key => {
        dimensionTotals[key] = 0
      })

      for (let i = 0; i < rounds; i += 1) {
        const dimensionScores = {
          action: 0,
          insight: 0,
          order: 0,
          empathy: 0,
          risk: 0,
          ambition: 0
        }

        let genderAffinity = 'none'
        const tendencyCounts = {}

        this.questions.forEach(question => {
          const options = question.options || []
          if (!options.length) return

          const randomIndex = Math.floor(Math.random() * options.length)
          const option = options[randomIndex]
          const scores = option.scores || {}

          Object.keys(scores).forEach(key => {
            if (dimensionScores[key] === undefined) {
              dimensionScores[key] = 0
            }
            dimensionScores[key] += Number(scores[key] || 0)
          })

          if (option.genderAffinity) {
            genderAffinity = option.genderAffinity
          }

          ;(option.tendency || []).forEach(id => {
            tendencyCounts[id] = (tendencyCounts[id] || 0) + 1
          })
        })

        keys.forEach(key => {
          dimensionTotals[key] += Number(dimensionScores[key] || 0)
        })

        const match = this.calculateMatchResultForSimulation(dimensionScores, genderAffinity, tendencyCounts)

        if (match && match.primary && match.primary.id) {
          resultCounts[match.primary.id] = (resultCounts[match.primary.id] || 0) + 1
        }
      }

      const rows = this.deityProfiles.map(deity => {
        const count = resultCounts[deity.id] || 0
        return {
          id: deity.id,
          name: deity.name,
          count,
          percent: Number(((count / rounds) * 100).toFixed(1))
        }
      }).sort((a, b) => b.count - a.count)

      const avgDimensions = {}
      keys.forEach(key => {
        avgDimensions[key] = Number((dimensionTotals[key] / rounds).toFixed(2))
      })

      console.log('===== 神祇匹配模拟测试 =====')
      console.log('模拟轮数：', rounds)
      console.log('平均原始维度分数：', avgDimensions)
      console.table(rows)

      return {
        rounds,
        rows,
        avgDimensions
      }
    },
    calculateMatchResultForSimulation(rawScores, genderAffinity = 'none', tendencyCounts = {}) {
      const userScores = this.normalizeScores(rawScores)

      const results = this.deityProfiles.map(deity => {
        const deityScores = deity.scores || {}
        const keys = ['action', 'insight', 'order', 'empathy', 'risk', 'ambition']

        const diffTotal = keys.reduce((sum, key) => {
          return sum + Math.abs(Number(userScores[key] || 0) - Number(deityScores[key] || 0))
        }, 0)

        const avgDiff = diffTotal / keys.length
        const baseScore = Math.max(0, Math.min(100, Math.round(100 - avgDiff)))

        const tendencyCount = Number(tendencyCounts[deity.id] || 0)
        const tendencyBonus = Math.min(14, tendencyCount * 3)

        let strongTendencyBonus = 0
        if (tendencyCount >= 4) {
          strongTendencyBonus = 2
        } else if (tendencyCount >= 3) {
          strongTendencyBonus = 1
        }

        const rareBoostMap = {
          odin: 0,
          thor: 2,
          loki: 0,
          hermod: 1,
          ullr: 1,
          freyja: 1,
          baldr: 1
        }
        const rareBoost = Number(rareBoostMap[deity.id] || 0)

        let genderBonus = 0
        if (genderAffinity && genderAffinity !== 'none') {
          if (deity.genderGroup === genderAffinity) {
            genderBonus = 5
          } else if (genderAffinity === 'fluid' && deity.id === 'loki') {
            genderBonus = 8
          } else {
            genderBonus = -1
          }
        }

        let matchPercent = Math.round(baseScore + tendencyBonus + strongTendencyBonus + rareBoost + genderBonus)
        matchPercent = Math.max(0, Math.min(100, matchPercent))

        return {
          ...deity,
          matchPercent
        }
      })

      results.sort((a, b) => b.matchPercent - a.matchPercent)

      return {
        primary: results[0],
        secondary: results[1],
        contrast: results[results.length - 1],
        userScores
      }
    },
    normalizeScores(raw) {
      const maxScores = {
        action: 0,
        insight: 0,
        order: 0,
        empathy: 0,
        risk: 0,
        ambition: 0
      }

      Object.keys(raw).forEach(key => {
        maxScores[key] = Math.max(maxScores[key], Math.abs(raw[key]))
      })

      const result = {}
      const scaleFactor = 50

      Object.keys(maxScores).forEach(key => {
        if (maxScores[key] > 0) {
          result[key] = Math.round((raw[key] / maxScores[key]) * scaleFactor)
        } else {
          result[key] = 50
        }
      });

      ['action', 'insight', 'order', 'empathy', 'risk', 'ambition'].forEach(key => {
        if (result[key] === undefined) {
          result[key] = 50
        }
      })

      return result
    },
    goToMatchedGod() {
      const god = this.matchResult && this.matchResult.primary

      if (!god || !god.id) {
        uni.showToast({
          title: '神祇详情暂不可用',
          icon: 'none'
        })
        return
      }

      uni.navigateTo({
        url: `/pages/gods/god-detail?id=${god.id}`
      })
    },
    loadSavedMatchResult() {
      const saved = uni.getStorageSync(this.matchStorageKey)
      if (saved && saved.primary) {
        this.savedMatchResult = saved
      }
    },
    saveMatchResult() {
      if (!this.matchResult || !this.matchResult.primary) return

      const payload = {
        savedAt: Date.now(),
        primary: this.matchResult.primary,
        secondary: this.matchResult.secondary,
        contrast: this.matchResult.contrast,
        userScores: this.matchResult.userScores
      }

      uni.setStorageSync(this.matchStorageKey, payload)
    },
    restoreSavedResult() {
      if (!this.savedMatchResult) return

      this.matchResult = {
        primary: this.savedMatchResult.primary,
        secondary: this.savedMatchResult.secondary,
        contrast: this.savedMatchResult.contrast,
        userScores: this.savedMatchResult.userScores
      }

      this.testCompleted = true
      this.testStarted = false
    },
    applyMatchUnlocks() {
      const god = this.matchResult && this.matchResult.primary
      if (!god || !god.id) return

      if (god.id === 'odin') {
        this.unlockRavensRelationClue()
      }
    },
    unlockRavensRelationClue() {
      const key = 'ravens_clue_progress'
      const saved = uni.getStorageSync(key)
      const progress = saved && typeof saved === 'object'
        ? saved
        : { clueIds: [], revealed: false }

      const clueIds = progress.clueIds || []
      let added = false

      if (!clueIds.includes('relation')) {
        clueIds.push('relation')
        added = true
      }

      progress.clueIds = clueIds

      if (clueIds.length >= 3) {
        progress.revealed = true
      }

      uni.setStorageSync(key, progress)

      if (added) {
        uni.showToast({
          title: progress.revealed ? '渡鸦身份已显现' : '发现线索：独眼神明的使者',
          icon: 'none'
        })
      }
    },
    toggleShareCard() {
      this.showShareCard = !this.showShareCard
    },
    getTopDimensions() {
      const scores = this.matchResult && this.matchResult.userScores
        ? this.matchResult.userScores
        : {}

      const names = {
        action: '行动力',
        insight: '洞察力',
        order: '秩序感',
        empathy: '共情值',
        risk: '风险性',
        ambition: '野心值'
      }

      return Object.keys(scores)
        .map(key => ({
          key,
          name: names[key] || key,
          value: Number(scores[key] || 0)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 2)
    },
    getResultDeclaration() {
      const god = this.matchResult && this.matchResult.primary
      if (!god) return '我在九界中找到了自己的神格回响。'

      const map = {
        odin: '我追问命运，也愿意为真相付出代价。',
        thor: '我以行动回应危机，以力量守护重要之物。',
        loki: '我看见规则的裂缝，也敢让局势重新洗牌。',
        frigg: '我在沉默中守护，也在预感中安排一切。',
        freyja: '我追求魅力与力量，也敢在爱与战中抉择。',
        tyr: '我坚守誓言，即使代价是失去自己。',
        heimdall: '我做永恒的守护者，不让任何人越过边界。',
        baldr: '我拥有光明的力量，也承受着光的重量。',
        hel: '我接纳死亡的必然，也在阴影中找到力量。',
        njord: '我在动荡与安宁间找到平衡，让繁荣流动。',
        freyr: '我创造丰饶与和平，让生命之树扎根。',
        hermod: '我为重要的人而奔行，绝不放弃。',
        bragi: '我用语言保存真相，让故事流传。',
        idunn: '我守护生命的种子，让青春延续。',
        sif: '我维护家园的尊严，让生活扎根。',
        vidar: '我在沉默中积蓄力量，在关键时刻出手。',
        ullr: '我靠技艺与距离感，在复杂中保持精准。'
      }

      return map[god.id] || '我在九界中找到了自己的神格回响。'
    }
  }
}
</script>

<style scoped>
.match-page {
  min-height: 100vh;
  background: #0B1118;
  color: #F2F4F6;
}

.match-nav {
  height: 96rpx;
  background: #111A24;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  box-sizing: border-box;
  border-bottom: 1px solid #27384A;
}

.back-btn,
.nav-placeholder {
  width: 56rpx;
  color: #C6A15B;
  font-size: 48rpx;
}

.nav-title {
  color: #F2F4F6;
  font-size: 30rpx;
  font-weight: 700;
}

.match-scroll {
  height: calc(100vh - 96rpx);
  box-sizing: border-box;
}

.match-hero {
  margin: 32rpx;
  padding: 36rpx 32rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 26rpx;
}

.hero-kicker {
  display: block;
  color: #C6A15B;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.hero-title {
  display: block;
  margin-top: 14rpx;
  color: #F2F4F6;
  font-size: 42rpx;
  font-weight: 800;
  line-height: 1.25;
}

.hero-desc {
  display: block;
  margin-top: 18rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
  white-space: normal;
  word-break: break-word;
}

.status-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 24rpx;
  padding: 12rpx 20rpx;
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.72);
  border-radius: 999rpx;
  width: fit-content;
}

.status-text {
  color: #66727F;
  font-size: 20rpx;
}

.status-divider {
  color: #27384A;
  font-size: 20rpx;
}

.section-card {
  margin: 32rpx;
  padding: 28rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
}

.section-title {
  display: block;
  color: #F2F4F6;
  font-size: 32rpx;
  font-weight: 800;
  margin-bottom: 20rpx;
}

.dimension-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.dimension-card {
  width: calc(50% - 7rpx);
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.72);
  border-radius: 16rpx;
  padding: 18rpx;
  box-sizing: border-box;
}

.dimension-name {
  display: block;
  color: #C6A15B;
  font-size: 24rpx;
  font-weight: 700;
}

.dimension-desc {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 22rpx;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}

.start-button {
  height: 92rpx;
  margin: 40rpx 32rpx 180rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A 0%, #C6A15B 100%);
  color: #0B1118;
  font-size: 30rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-panel {
  padding: 32rpx;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.question-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
}

.progress-text {
  color: #A8B3BD;
  font-size: 24rpx;
}

.progress-percent {
  color: #C6A15B;
  font-size: 24rpx;
  font-weight: 700;
}

.question-bar {
  height: 10rpx;
  background: #172230;
  border-radius: 999rpx;
  overflow: hidden;
  margin-bottom: 28rpx;
}

.question-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 999rpx;
}

.question-card {
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 26rpx;
  padding: 30rpx;
}

.question-title {
  display: block;
  color: #F2F4F6;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 1.45;
}

.option-list {
  margin-top: 28rpx;
}

.option-card {
  display: flex;
  gap: 18rpx;
  padding: 24rpx;
  margin-bottom: 18rpx;
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.8);
  border-radius: 20rpx;
  box-sizing: border-box;
}

.option-card:active {
  border-color: rgba(198,161,91,0.55);
  transform: scale(0.99);
}

.option-index {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: rgba(198,161,91,0.14);
  color: #C6A15B;
  font-size: 22rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  color: #F2F4F6;
  font-size: 26rpx;
  line-height: 1.55;
  white-space: normal;
  word-break: break-word;
}

.question-actions {
  margin-top: 28rpx;
}

.ghost-button {
  height: 76rpx;
  border-radius: 999rpx;
  border: 1px solid #27384A;
  color: #A8B3BD;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-button.disabled {
  opacity: 0.35;
}

.result-preview {
  margin: 32rpx;
  padding: 36rpx 32rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 26rpx;
  box-sizing: border-box;
}

.result-kicker {
  color: #C6A15B;
  font-size: 22rpx;
}

.result-title {
  display: block;
  margin-top: 14rpx;
  color: #F2F4F6;
  font-size: 38rpx;
  font-weight: 800;
}

.result-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 26rpx;
}

.result-percent {
  display: block;
  margin-top: 18rpx;
  color: #D8C27A;
  font-size: 30rpx;
  font-weight: 800;
}

.result-summary {
  display: block;
  margin-top: 20rpx;
  margin-bottom: 32rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
  white-space: normal;
  word-break: break-word;
}

.result-page {
  padding: 32rpx;
  padding-bottom: 48rpx;
}

.result-hero {
  padding: 36rpx;
  background: #172230;
  border: 1px solid #C6A15B;
  border-radius: 26rpx;
  text-align: center;
}

.result-kicker {
  color: #C6A15B;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.result-name {
  display: block;
  margin-top: 16rpx;
  color: #F2F4F6;
  font-size: 48rpx;
  font-weight: 800;
}

.result-original {
  display: block;
  margin-top: 6rpx;
  color: #66727F;
  font-size: 24rpx;
}

.result-title {
  display: block;
  margin-top: 12rpx;
  color: #A8B3BD;
  font-size: 28rpx;
}

.match-percent-ring {
  margin-top: 24rpx;
  padding: 20rpx 36rpx;
  background: linear-gradient(135deg, #D8C27A 0%, #C6A15B 100%);
  border-radius: 999rpx;
  display: inline-block;
}

.match-percent {
  color: #0B1118;
  font-size: 42rpx;
  font-weight: 800;
}

.match-label {
  display: block;
  color: #0B1118;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.section-card {
  margin-top: 24rpx;
  padding: 28rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
}

.section-title {
  display: block;
  color: #C6A15B;
  font-size: 26rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
}

.section-text {
  display: block;
  color: #F2F4F6;
  font-size: 28rpx;
  line-height: 1.7;
}

.score-row {
  margin-top: 16rpx;
}

.score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.score-name {
  color: #A8B3BD;
  font-size: 24rpx;
}

.score-value {
  color: #F2F4F6;
  font-size: 24rpx;
  font-weight: 700;
}

.score-bar {
  height: 10rpx;
  background: #27384A;
  border-radius: 5rpx;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 5rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.result-tag {
  padding: 12rpx 20rpx;
  background: rgba(198, 161, 91, 0.14);
  border: 1px solid rgba(198, 161, 91, 0.3);
  border-radius: 999rpx;
  color: #C6A15B;
  font-size: 24rpx;
}

.shadow-tag {
  padding: 12rpx 20rpx;
  background: rgba(119, 84, 74, 0.2);
  border: 1px solid rgba(119, 84, 74, 0.4);
  border-radius: 999rpx;
  color: #A8B3BD;
  font-size: 24rpx;
}

.compare-grid {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.mini-result-card {
  flex: 1;
  padding: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
  text-align: center;
}

.mini-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
  margin-bottom: 8rpx;
}

.mini-name {
  display: block;
  color: #F2F4F6;
  font-size: 30rpx;
  font-weight: 700;
}

.mini-desc {
  display: block;
  margin-top: 6rpx;
  color: #A8B3BD;
  font-size: 22rpx;
}

.result-actions {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.primary-button {
  height: 88rpx;
  background: linear-gradient(135deg, #D8C27A 0%, #C6A15B 100%);
  border-radius: 999rpx;
  color: #0B1118;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost-button-result {
  height: 88rpx;
  background: transparent;
  border: 1px solid #27384A;
  border-radius: 999rpx;
  color: #A8B3BD;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.saved-match-card {
  margin: 28rpx 32rpx;
  padding: 26rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 22rpx;
}

.saved-kicker {
  display: block;
  color: #66727F;
  font-size: 22rpx;
}

.saved-name {
  display: block;
  margin-top: 10rpx;
  color: #F2F4F6;
  font-size: 32rpx;
  font-weight: 800;
}

.saved-title {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 24rpx;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}

.saved-percent {
  display: block;
  margin-top: 10rpx;
  color: #C6A15B;
  font-size: 24rpx;
  font-weight: 700;
}

.saved-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 20rpx;
}

.saved-button {
  flex: 1;
  height: 68rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.16);
  border: 1px solid rgba(198,161,91,0.42);
  color: #C6A15B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.share-toggle {
  height: 68rpx;
  background: transparent;
  border: 1px solid #27384A;
  border-radius: 12rpx;
  color: #A8B3BD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.share-card {
  margin-top: 24rpx;
  padding: 32rpx;
  background: linear-gradient(135deg, #172230 0%, #0E1721 100%);
  border: 1px solid rgba(198,161,91,0.32);
  border-radius: 20rpx;
  text-align: center;
}

.share-title {
  display: block;
  color: #66727F;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.share-god-name {
  display: block;
  margin-top: 16rpx;
  color: #F2F4F6;
  font-size: 42rpx;
  font-weight: 800;
}

.share-god-en {
  display: block;
  margin-top: 4rpx;
  color: #C6A15B;
  font-size: 26rpx;
}

.share-percent {
  display: block;
  margin-top: 12rpx;
  color: #D8C27A;
  font-size: 36rpx;
  font-weight: 800;
}

.share-role {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 24rpx;
}

.share-dimensions {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-top: 20rpx;
}

.share-dim-tag {
  padding: 8rpx 16rpx;
  background: rgba(198,161,91,0.12);
  border-radius: 8rpx;
  color: #C6A15B;
  font-size: 22rpx;
}

.share-declaration {
  display: block;
  margin-top: 24rpx;
  color: #F2F4F6;
  font-size: 26rpx;
  font-style: italic;
  line-height: 1.6;
}

.share-app {
  display: block;
  margin-top: 24rpx;
  color: #66727F;
  font-size: 22rpx;
}

.dev-test-button {
  margin: 24rpx 32rpx 180rpx;
  height: 64rpx;
  border-radius: 999rpx;
  border: 1px dashed rgba(102,114,127,0.5);
  color: #66727F;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>