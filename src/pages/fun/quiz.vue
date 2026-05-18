<template>
  <view class="quiz-page">
    <view class="quiz-nav">
      <text class="back-btn" @click="goBack">‹</text>
      <text class="nav-title">谣言之书</text>
      <text class="nav-placeholder"></text>
    </view>

    <view class="quiz-content">
      <view v-if="quizState === 'intro'" class="intro-panel">
        <text class="archive-kicker">ARCHIVE OF RUMORS</text>
        <text class="intro-title">翻开谣言之书</text>
        <text class="intro-desc">每一页都记录着流传于九界的传闻。它们有的接近真相，有的来自误读。</text>

        <view class="book-preview">
          <text class="preview-kicker">传闻样本</text>
          <view class="preview-card">
            <text class="preview-text">{{ rumorQuestions[0].rumor }}</text>
            <view class="preview-tags">
              <text class="preview-tag">真实</text>
              <text class="preview-tag">谣言</text>
            </view>
          </view>
        </view>

        <view class="primary-btn" @click="startRumorQuiz">
          <text>开始辨闻</text>
        </view>

        <view class="secondary-btn" @click="quizState = 'submitRumor'">
          <text>成为洛基，写下传闻</text>
        </view>

        <view v-if="customRumors.length > 0" class="custom-info">
          <text>已收录自定义传闻：{{ customRumors.length }} 条</text>
          <text class="clear-link" @click="clearCustomRumors">清空</text>
        </view>
      </view>

      <view v-if="quizState === 'submitRumor'" class="question-panel">
        <view class="archive-card">
          <text class="archive-kicker">LOKI'S WHISPER</text>
          <text class="archive-title">洛基的低语</text>
          <text class="archive-desc">写下一条真假难辨的传闻，让后来的记录员去辨析。</text>

          <textarea v-model="newRumor.rumor" class="rumor-input large" placeholder="写下你的传闻..."></textarea>

          <view class="judgement-title">这是否为真</view>
          <view class="answer-row">
            <view class="answer-button" :class="{ active: newRumor.answer === true }" @click="newRumor.answer = true">
              <text>真实</text>
            </view>
            <view class="answer-button" :class="{ active: newRumor.answer === false }" @click="newRumor.answer = false">
              <text>谣言</text>
            </view>
          </view>

          <input v-model="newRumor.factTitle" class="rumor-input" placeholder="事实标题" />
          <textarea v-model="newRumor.fact" class="rumor-input large" placeholder="事实解释"></textarea>
          <input v-model="newRumor.relatedText" class="rumor-input" placeholder="相关标签，用顿号或逗号分隔" />

          <view class="primary-button" @click="submitCustomRumor">收入谣言之书</view>
          <view class="secondary-link" @click="quizState = 'intro'">返回</view>
        </view>
      </view>

      <view v-if="quizState === 'question'" class="question-panel">
        <view class="page-indicator">
          <text class="page-num">第 {{ currentRumorIndex + 1 }} / {{ getAllRumorQuestions().length }} 页</text>
          <view class="page-bar">
            <view class="page-bar-fill" :style="{ width: ((currentRumorIndex + 1) / getAllRumorQuestions().length * 100) + '%' }"></view>
          </view>
        </view>

        <view class="rumor-scroll-card">
          <view class="scroll-rod top"></view>

          <view class="scroll-paper">
            <view class="rumor-image-placeholder">
              <text class="placeholder-symbol">{{ getCurrentRumorImageSymbol() }}</text>
            </view>

            <view class="rumor-text-area">
              <view class="paper-arrow left" @click="goPrevRumor">‹</view>
              <view class="paper-arrow right" @click="goNextRumor">›</view>
              <text class="rumor-quote" :class="animationDirection">“{{ getCurrentRumor().rumor }}”</text>
            </view>

            <view v-if="getCurrentRumor().source === '洛基的低语'" class="loki-source-tag">
              <text>洛基的低语</text>
            </view>

            <view class="scroll-answer-row">
              <view class="scroll-answer-btn" @click="selectRumorAnswer(true)">
                <text>真实</text>
              </view>
              <view class="scroll-answer-btn" @click="selectRumorAnswer(false)">
                <text>谣言</text>
              </view>
            </view>
          </view>

          <view class="scroll-rod bottom"></view>
        </view>
      </view>

      <view v-if="quizState === 'reveal'" class="reveal-panel">
        <view class="result-modal" :class="isCurrentCorrect() ? 'correct' : 'wrong'">
          <view class="modal-icon">
            <text>{{ isCurrentCorrect() ? '✓' : '✗' }}</text>
          </view>
          <text class="modal-title">{{ isCurrentCorrect() ? '判断正确' : '传闻被误读了' }}</text>
          <text class="modal-subtitle">{{ isCurrentCorrect() ? '你识破了九界的迷雾' : '真相藏在更深的地方' }}</text>
        </view>

        <view class="original-rumor">
          <text class="original-label">原传闻</text>
          <text class="original-text">{{ getCurrentRumor().rumor }}</text>
          <view class="answer-review">
            <view class="answer-row">
              <text class="answer-label">你的判断：</text>
              <text class="answer-value">{{ selectedAnswer ? '真实' : '谣言' }}</text>
            </view>
            <view class="answer-row">
              <text class="answer-label">正确答案：</text>
              <text class="answer-value correct">{{ getCurrentRumor().answer ? '真实' : '谣言' }}</text>
            </view>
          </view>
        </view>

        <view class="fact-archive">
          <text class="fact-kicker">事实揭示</text>
          <text class="fact-title">{{ getCurrentRumor().factTitle }}</text>
          <text class="fact-text">{{ getCurrentRumor().fact }}</text>
          <view class="fact-tags">
            <text v-if="getCurrentRumor().source" class="fact-tag source">{{ getCurrentRumor().source }}</text>
            <text v-for="tag in getCurrentRumor().related" :key="tag" class="fact-tag">{{ tag }}</text>
          </view>
        </view>

        <view class="next-btn" @click="goNextRumor">
          <text>{{ currentRumorIndex < getAllRumorQuestions().length - 1 ? '翻到下一页' : '完成辨闻' }}</text>
        </view>
      </view>

      <view v-if="quizState === 'summary'" class="summary-panel">
        <text class="archive-kicker">ARCHIVE CLOSED</text>
        <text class="summary-title">谣言之书已合上</text>
        
        <view class="score-display">
          <view class="score-circle">
            <text class="score-num">{{ correctCount }}</text>
            <text class="score-divider">/</text>
            <text class="score-total">{{ getAllRumorQuestions().length }}</text>
          </view>
          <text class="score-percent">{{ Math.round(correctCount / getAllRumorQuestions().length * 100) }}%</text>
        </view>

        <view class="rank-badge">
          <text class="rank-title">{{ getRankTitle() }}</text>
          <text class="rank-desc">{{ getRankDesc() }}</text>
        </view>

        <text class="summary-closing">你辨认了九界传闻中的真相与误读，新的记录已被收入档案。</text>

        <view class="primary-btn" @click="restartRumorQuiz">
          <text>重新翻阅</text>
        </view>

        <view class="ghost-btn" @click="goBack">
          <text>返回趣味互动</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      quizState: 'intro',
      currentRumorIndex: 0,
      selectedAnswer: null,
      correctCount: 0,
      answeredIds: [],
      customRumorStorageKey: 'norse_custom_rumors',
      customRumors: [],
      animationDirection: '',
      isAnimating: false,
      newRumor: {
        rumor: '',
        answer: false,
        factTitle: '',
        fact: '',
        relatedText: '',
        difficulty: '自定义'
      },
      rumorQuestions: [
        {
          id: 'thor-war-god',
          rumor: '索尔是北欧神话中的战争之神。',
          answer: false,
          factTitle: '雷神不是战争之神',
          fact: '索尔最著名的身份是雷霆、风暴与守护之神。他常与巨人战斗，但北欧神话中更接近战争、誓言与正义象征的是提尔，奥丁也与战争和战死者密切相关。',
          related: ['索尔', '提尔', '奥丁'],
          difficulty: '基础'
        },
        {
          id: 'loki-thor-brother',
          rumor: '洛基是索尔的亲兄弟。',
          answer: false,
          factTitle: '洛基不是索尔的亲兄弟',
          fact: '许多现代影视作品把洛基塑造成索尔的兄弟，但在传统北欧神话中，洛基与奥丁有结义关系，并不是索尔的亲兄弟。',
          related: ['洛基', '索尔', '奥丁'],
          difficulty: '基础'
        },
        {
          id: 'odin-one-eye',
          rumor: '奥丁为了获得智慧而失去一只眼睛。',
          answer: true,
          factTitle: '智慧需要代价',
          fact: '奥丁以一只眼睛作为代价，从密米尔之泉获得智慧。这也是他作为智慧、代价与命运追问者的重要象征。',
          related: ['奥丁', '密米尔'],
          difficulty: '基础'
        },
        {
          id: 'valhalla-all-dead',
          rumor: '所有死者都会进入英灵殿。',
          answer: false,
          factTitle: '英灵殿并非所有死者的归宿',
          fact: '英灵殿主要接纳部分战死者。北欧神话中死者归宿复杂，可能与奥丁、弗蕾雅、赫尔等不同神祇或领域相关。',
          related: ['英灵殿', '奥丁', '赫尔'],
          difficulty: '进阶'
        },
        {
          id: 'ragnarok-rebirth',
          rumor: '诸神黄昏只是世界毁灭，没有重生。',
          answer: false,
          factTitle: '终末之后仍有新世界',
          fact: '诸神黄昏包含毁灭，也包含重生。旧世界沉没之后，新的大地再次升起，幸存者与归来的神明开启新的秩序。',
          related: ['诸神黄昏', '巴德尔'],
          difficulty: '进阶'
        },
        {
          id: 'yggdrasil-nine-realms',
          rumor: '世界树连接着北欧神话中的九个国度。',
          answer: true,
          factTitle: '世界树是九界结构的核心',
          fact: '世界树 Yggdrasil 连接诸界，是北欧神话宇宙结构的重要象征。九界围绕它的枝干与根系展开。',
          related: ['世界树', '九界'],
          difficulty: '基础'
        }
      ]
    }
  },
  onLoad() {
    this.loadCustomRumors()
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length <= 1) {
        uni.switchTab({
          url: '/pages/index/index'
        })
      } else {
        uni.navigateBack()
      }
    },
    startRumorQuiz() {
      this.quizState = 'question'
      this.currentRumorIndex = 0
      this.selectedAnswer = null
      this.correctCount = 0
      this.answeredIds = []
    },
    getCurrentRumor() {
      return this.getAllRumorQuestions()[this.currentRumorIndex] || null
    },
    selectRumorAnswer(value) {
      const rumor = this.getCurrentRumor()
      if (!rumor) return

      this.selectedAnswer = value

      if (value === rumor.answer) {
        this.correctCount += 1
      }

      if (!this.answeredIds.includes(rumor.id)) {
        this.answeredIds.push(rumor.id)
      }

      this.quizState = 'reveal'
    },
    goPrevRumor() {
      const total = this.getAllRumorQuestions().length
      if (this.currentRumorIndex > 0 && !this.isAnimating) {
        this.isAnimating = true
        this.animationDirection = 'slide-left'
        setTimeout(() => {
          this.currentRumorIndex -= 1
          this.selectedAnswer = null
          if (this.quizState === 'reveal') {
            this.quizState = 'question'
          }
          this.animationDirection = 'slide-right-back'
          setTimeout(() => {
            this.animationDirection = ''
            this.isAnimating = false
          }, 300)
        }, 300)
      }
    },
    goNextRumor() {
      const total = this.getAllRumorQuestions().length
      if (this.currentRumorIndex < total - 1 && !this.isAnimating) {
        this.isAnimating = true
        this.animationDirection = 'slide-right'
        setTimeout(() => {
          this.currentRumorIndex += 1
          this.selectedAnswer = null
          if (this.quizState === 'reveal') {
            this.quizState = 'question'
          }
          this.animationDirection = 'slide-left-back'
          setTimeout(() => {
            this.animationDirection = ''
            this.isAnimating = false
          }, 300)
        }, 300)
      } else if (this.currentRumorIndex >= total - 1) {
        this.quizState = 'summary'
      }
    },
    restartRumorQuiz() {
      this.startRumorQuiz()
    },
    getProgressText() {
      return `${this.currentRumorIndex + 1} / ${this.getAllRumorQuestions().length}`
    },
    isCurrentCorrect() {
      const rumor = this.getCurrentRumor()
      return rumor && this.selectedAnswer === rumor.answer
    },
    getRankTitle() {
      const percent = this.correctCount / this.rumorQuestions.length * 100
      if (percent >= 80) return '九界考据者'
      if (percent >= 50) return '传闻辨析者'
      return '见习记录员'
    },
    getRankDesc() {
      const percent = this.correctCount / this.rumorQuestions.length * 100
      if (percent >= 80) return '你对九界传闻了如指掌，真相在你面前无处遁形。'
      if (percent >= 50) return '你能分辨部分真相，但仍有成长空间。'
      return '你刚开始记录九界的传闻，继续探索吧。'
    },
    getCurrentRumorImageSymbol() {
      const rumor = this.getCurrentRumor ? this.getCurrentRumor() : null
      if (!rumor) return 'R'

      const text = (rumor.rumor || '') + ' ' + ((rumor.related || []).join(' '))

      if (text.includes('索尔')) return 'TH'
      if (text.includes('洛基')) return 'LK'
      if (text.includes('奥丁')) return 'OD'
      if (text.includes('巴德尔')) return 'BD'
      if (text.includes('诸神黄昏')) return 'RG'
      if (text.includes('世界树')) return 'YG'

      return 'MY'
    },
    loadCustomRumors() {
      const saved = uni.getStorageSync(this.customRumorStorageKey)
      this.customRumors = Array.isArray(saved) ? saved : []
    },
    saveCustomRumors() {
      uni.setStorageSync(this.customRumorStorageKey, this.customRumors)
    },
    getAllRumorQuestions() {
      return [
        ...this.rumorQuestions,
        ...this.customRumors
      ]
    },
    submitCustomRumor() {
      const rumorText = (this.newRumor.rumor || '').trim()
      const factTitle = (this.newRumor.factTitle || '').trim()
      const fact = (this.newRumor.fact || '').trim()

      if (!rumorText || !factTitle || !fact) {
        uni.showToast({
          title: '请补全传闻与事实解释',
          icon: 'none'
        })
        return
      }

      const related = (this.newRumor.relatedText || '')
        .split(/[、,，]/)
        .map(item => item.trim())
        .filter(Boolean)

      const item = {
        id: 'custom-' + Date.now(),
        rumor: rumorText,
        answer: !!this.newRumor.answer,
        factTitle,
        fact,
        related,
        difficulty: '自定义',
        source: '洛基的低语'
      }

      this.customRumors.unshift(item)
      this.saveCustomRumors()

      this.newRumor = {
        rumor: '',
        answer: false,
        factTitle: '',
        fact: '',
        relatedText: '',
        difficulty: '自定义'
      }

      uni.showToast({
        title: '传闻已收入谣言之书',
        icon: 'none'
      })

      this.quizState = 'intro'
    },
    clearCustomRumors() {
      this.customRumors = []
      uni.removeStorageSync(this.customRumorStorageKey)
      uni.showToast({
        title: '已清空自定义传闻',
        icon: 'none'
      })
    }
  }
}
</script>

<style scoped>
.quiz-page {
  min-height: 100vh;
  background: #0B1118;
  color: #F2F4F6;
  padding-bottom: 180rpx;
}

.quiz-nav {
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

.intro-panel {
  padding: 32rpx;
}

.intro-title {
  display: block;
  color: #F2F4F6;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1.3;
}

.intro-desc {
  display: block;
  margin-top: 18rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
}

.intro-preview {
  margin-top: 48rpx;
}

.preview-label {
  display: block;
  color: #66727F;
  font-size: 20rpx;
  letter-spacing: 2rpx;
}

.preview-card {
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
  padding: 26rpx;
}

.preview-text {
  display: block;
  color: #A8B3BD;
  font-size: 24rpx;
  line-height: 1.6;
}

.preview-options {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.preview-option {
  flex: 1;
  padding: 16rpx;
  background: rgba(11,17,24,0.64);
  border: 1px solid #27384A;
  border-radius: 12rpx;
  color: #F2F4F6;
  font-size: 24rpx;
  text-align: center;
}

.start-btn {
  margin-top: 36rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A, #C6A15B);
  color: #0B1118;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-panel {
  padding: 32rpx;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-text {
  color: #66727F;
  font-size: 22rpx;
}

.progress-bar-bg {
  flex: 1;
  height: 6rpx;
  background: #27384A;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 3rpx;
}

.rumor-content {
  padding: 32rpx;
}

.rumor-card {
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 28rpx;
  padding: 34rpx;
  box-sizing: border-box;
}

.rumor-kicker {
  color: #C6A15B;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.rumor-title {
  display: block;
  margin-top: 18rpx;
  color: #F2F4F6;
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.3;
}

.rumor-text {
  display: block;
  margin-top: 28rpx;
  color: #F2F4F6;
  font-size: 34rpx;
  line-height: 1.55;
  white-space: normal;
  word-break: break-word;
}

.answer-row {
  display: flex;
  gap: 18rpx;
  margin-top: 34rpx;
}

.answer-button {
  flex: 1;
  height: 88rpx;
  border-radius: 18rpx;
  background: rgba(11,17,24,0.64);
  border: 1px solid #27384A;
  color: #F2F4F6;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-button:active {
  border-color: rgba(198,161,91,0.65);
}

.reveal-panel {
  padding: 32rpx;
}

.reveal-result {
  padding: 26rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.reveal-result.correct {
  background: rgba(124, 140, 116, 0.18);
  border: 1px solid rgba(124, 140, 116, 0.4);
}

.reveal-result.wrong {
  background: rgba(185, 74, 72, 0.18);
  border: 1px solid rgba(185, 74, 72, 0.4);
}

.result-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 800;
}

.reveal-result.correct .result-icon {
  background: rgba(124, 140, 116, 0.4);
  color: #7C8C74;
}

.reveal-result.wrong .result-icon {
  background: rgba(185, 74, 72, 0.4);
  color: #B94A48;
}

.result-text {
  color: #F2F4F6;
  font-size: 30rpx;
  font-weight: 800;
}

.fact-card {
  margin-top: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
  padding: 30rpx;
}

.fact-title {
  display: block;
  color: #C6A15B;
  font-size: 32rpx;
  font-weight: 800;
}

.fact-text {
  display: block;
  margin-top: 16rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.75;
  white-space: normal;
  word-break: break-word;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.related-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.14);
  color: #C6A15B;
  font-size: 22rpx;
}

.primary-button {
  height: 88rpx;
  margin-top: 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A, #C6A15B);
  color: #0B1118;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-panel {
  padding: 32rpx;
  text-align: center;
}

.summary-title {
  display: block;
  color: #F2F4F6;
  font-size: 38rpx;
  font-weight: 900;
}

.summary-desc {
  display: block;
  margin-top: 14rpx;
  color: #A8B3BD;
  font-size: 26rpx;
}

.score-card {
  margin-top: 36rpx;
  padding: 30rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
}

.score-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
}

.score-value {
  display: block;
  margin-top: 14rpx;
  color: #F2F4F6;
  font-size: 52rpx;
  font-weight: 900;
}

.score-percent {
  display: block;
  margin-top: 6rpx;
  color: #C6A15B;
  font-size: 34rpx;
  font-weight: 800;
}

.rank-card {
  margin-top: 22rpx;
  padding: 28rpx;
  background: rgba(198,161,91,0.08);
  border: 1px solid rgba(198,161,91,0.24);
  border-radius: 22rpx;
}

.rank-title {
  display: block;
  color: #D8C27A;
  font-size: 30rpx;
  font-weight: 800;
}

.rank-desc {
  display: block;
  margin-top: 10rpx;
  color: #A8B3BD;
  font-size: 24rpx;
  line-height: 1.6;
}

.loki-entry {
  margin-top: 24rpx;
  padding: 20rpx;
  text-align: center;
  border: 1px solid rgba(198,161,91,0.24);
  border-radius: 16rpx;
  background: rgba(198,161,91,0.06);
}

.loki-entry text {
  color: #C6A15B;
  font-size: 24rpx;
}

.custom-count {
  margin-top: 20rpx;
  padding: 16rpx;
  text-align: center;
  color: #66727F;
  font-size: 22rpx;
}

.clear-btn {
  margin-left: 16rpx;
  color: #66727F;
  text-decoration: underline;
}

.submit-rumor-page {
  min-height: 100vh;
  background: #0B1118;
  padding: 32rpx;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.rumor-desc {
  display: block;
  margin-top: 12rpx;
  color: #A8B3BD;
  font-size: 24rpx;
  line-height: 1.6;
}

.rumor-input {
  width: 100%;
  margin-top: 20rpx;
  padding: 20rpx;
  background: rgba(11,17,24,0.62);
  border: 1px solid #27384A;
  border-radius: 16rpx;
  color: #F2F4F6;
  font-size: 26rpx;
  box-sizing: border-box;
}

.rumor-input.large {
  min-height: 140rpx;
}

.truth-toggle {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.truth-option {
  flex: 1;
  height: 72rpx;
  border-radius: 16rpx;
  border: 1px solid #27384A;
  color: #A8B3BD;
  display: flex;
  align-items: center;
  justify-content: center;
}

.truth-option.active {
  border-color: rgba(198,161,91,0.65);
  color: #C6A15B;
  background: rgba(198,161,91,0.12);
}

.source-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: transparent;
  border: 1px solid rgba(198,161,91,0.42);
  color: #C6A15B;
  font-size: 20rpx;
}

.ghost-button {
  margin-top: 20rpx;
  height: 72rpx;
  border-radius: 16rpx;
  border: 1px solid #27384A;
  color: #A8B3BD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.quiz-content {
  padding: 40rpx 32rpx 180rpx;
  box-sizing: border-box;
}

.archive-kicker {
  display: block;
  color: #66727F;
  font-size: 20rpx;
  letter-spacing: 4rpx;
}

.book-preview {
  margin-top: 40rpx;
}

.preview-kicker {
  display: block;
  color: #66727F;
  font-size: 20rpx;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
}

.preview-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 20rpx;
}

.preview-tag {
  padding: 8rpx 16rpx;
  background: rgba(11,17,24,0.64);
  border: 1px solid #27384A;
  border-radius: 8rpx;
  color: #A8B3BD;
  font-size: 22rpx;
}

.primary-btn {
  height: 88rpx;
  margin-top: 36rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A, #C6A15B);
  color: #0B1118;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.secondary-btn {
  margin-top: 24rpx;
  padding: 20rpx;
  text-align: center;
  border: 1px solid rgba(198,161,91,0.24);
  border-radius: 16rpx;
  background: rgba(198,161,91,0.06);
}

.secondary-btn text {
  color: #C6A15B;
  font-size: 24rpx;
}

.custom-info {
  margin-top: 20rpx;
  padding: 16rpx;
  text-align: center;
  color: #66727F;
  font-size: 22rpx;
}

.clear-link {
  margin-left: 16rpx;
  color: #66727F;
  text-decoration: underline;
}

.page-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.page-num {
  color: #66727F;
  font-size: 22rpx;
}

.page-bar {
  flex: 1;
  height: 6rpx;
  background: #27384A;
  border-radius: 3rpx;
  margin-left: 20rpx;
  overflow: hidden;
}

.page-bar-fill {
  height: 100%;
  background: #C6A15B;
  border-radius: 3rpx;
}

.rumor-scroll-card {
  position: relative;
  margin: 36rpx auto 0;
  width: 86%;
  max-width: 620rpx;
}

.scroll-paper {
  position: relative;
  min-height: 800rpx;
  padding: 40rpx 32rpx 40rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 50% 18%, rgba(255,255,255,0.16), transparent 26%),
    linear-gradient(180deg, #E8D29B 0%, #D8BD7C 100%);
  border: 2rpx solid rgba(92,62,28,0.45);
  box-shadow:
    inset 0 0 34rpx rgba(88,54,24,0.22),
    0 18rpx 48rpx rgba(0,0,0,0.28);
  color: #2B1E12;
}

.scroll-rod {
  position: relative;
  z-index: 2;
  height: 54rpx;
  margin: 0 -28rpx;
  border-radius: 999rpx;
  background:
    linear-gradient(90deg, #6E4724 0%, #B77A3C 16%, #6E4724 50%, #B77A3C 84%, #6E4724 100%);
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.28);
}

.scroll-rod.top {
  margin-bottom: -10rpx;
}

.scroll-rod.bottom {
  margin-top: -10rpx;
}

.scroll-rod::before,
.scroll-rod::after {
  content: '';
  position: absolute;
  top: -8rpx;
  width: 42rpx;
  height: 70rpx;
  border-radius: 18rpx;
  background: linear-gradient(180deg, #8A5A2E, #5F3B1F);
  box-shadow: inset 0 0 12rpx rgba(0,0,0,0.28);
}

.scroll-rod::before {
  left: -10rpx;
}

.scroll-rod::after {
  right: -10rpx;
}

.rumor-image-placeholder {
  aspect-ratio: 4/3;
  border-radius: 22rpx;
  background:
    radial-gradient(circle at 50% 45%, rgba(142,91,43,0.22), transparent 38%),
    rgba(92,62,28,0.10);
  border: 1px dashed rgba(92,62,28,0.34);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-symbol {
  color: rgba(92,62,28,0.36);
  font-size: 70rpx;
  font-weight: 900;
  letter-spacing: 4rpx;
}

.rumor-text-area {
  position: relative;
  margin-top: 34rpx;
  min-height: 140rpx;
  padding: 0 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rumor-quote {
  color: #2B1E12;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.6;
  text-align: center;
  white-space: normal;
  word-break: break-word;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.rumor-quote.slide-left {
  transform: translateX(-30rpx);
  opacity: 0.3;
}

.rumor-quote.slide-right {
  transform: translateX(30rpx);
  opacity: 0.3;
}

.rumor-quote.slide-left-back {
  animation: slideLeftBack 0.3s ease-out;
}

.rumor-quote.slide-right-back {
  animation: slideRightBack 0.3s ease-out;
}

@keyframes slideLeftBack {
  from {
    transform: translateX(30rpx);
    opacity: 0.3;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideRightBack {
  from {
    transform: translateX(-30rpx);
    opacity: 0.3;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.paper-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  color: rgba(92,62,28,0.45);
  font-size: 38rpx;
  font-weight: 700;
  padding: 20rpx 15rpx;
  width: 60rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-arrow.left {
  left: 0;
}

.paper-arrow.right {
  right: 0;
}

.paper-arrow:active {
  color: rgba(92,62,28,0.75);
}

.loki-source-tag {
  position: absolute;
  left: 28rpx;
  top: 26rpx;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(43,30,18,0.10);
  color: #6B4423;
  font-size: 20rpx;
}

.scroll-answer-row {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
  padding-top: 30rpx;
  border-top: 1px dashed rgba(92,62,28,0.34);
}

.scroll-answer-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  background: rgba(92,62,28,0.22);
  border: 1px solid rgba(92,62,28,0.45);
  color: #1A120A;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scroll-answer-btn:active {
  background: rgba(92,62,28,0.38);
  border-color: rgba(92,62,28,0.68);
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.18);
}

.result-modal {
  position: relative;
  margin-bottom: 32rpx;
  padding: 40rpx;
  border-radius: 28rpx;
  text-align: center;
  overflow: hidden;
}

.result-modal::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
}

.result-modal.correct {
  background: linear-gradient(135deg, rgba(124,140,116,0.18), rgba(124,140,116,0.08));
  border: 1px solid rgba(124,140,116,0.35);
}

.result-modal.correct::before {
  background: radial-gradient(circle at 50% 0%, rgba(124,140,116,0.3), transparent 50%);
}

.result-modal.wrong {
  background: linear-gradient(135deg, rgba(185,74,72,0.18), rgba(185,74,72,0.08));
  border: 1px solid rgba(185,74,72,0.35);
}

.result-modal.wrong::before {
  background: radial-gradient(circle at 50% 0%, rgba(185,74,72,0.3), transparent 50%);
}

.modal-icon {
  width: 100rpx;
  height: 100rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  font-weight: 900;
}

.result-modal.correct .modal-icon {
  background: rgba(124,140,116,0.3);
  color: #7C8C74;
  box-shadow: 0 0 40rpx rgba(124,140,116,0.35);
}

.result-modal.wrong .modal-icon {
  background: rgba(185,74,72,0.3);
  color: #B94A48;
  box-shadow: 0 0 40rpx rgba(185,74,72,0.35);
}

.modal-title {
  display: block;
  color: #F2F4F6;
  font-size: 36rpx;
  font-weight: 900;
}

.modal-subtitle {
  display: block;
  margin-top: 12rpx;
  color: #A8B3BD;
  font-size: 24rpx;
}

.rumor-archive {
  margin-top: 28rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
  padding: 32rpx;
}

.rumor-subtitle {
  display: block;
  margin-top: 12rpx;
  color: #A8B3BD;
  font-size: 24rpx;
}

.judgment-area {
  margin-top: 32rpx;
}

.judgment-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
  margin-bottom: 16rpx;
}

.judgment-btns {
  display: flex;
  gap: 18rpx;
}

.judgment-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 18rpx;
  background: rgba(11,17,24,0.64);
  border: 1px solid #27384A;
  color: #F2F4F6;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.judgment-btn:active {
  border-color: rgba(198,161,91,0.65);
}

.stamp-result {
  padding: 28rpx;
  border-radius: 18rpx;
  text-align: center;
}

.stamp-result.correct {
  background: rgba(124, 140, 116, 0.18);
  border: 1px solid rgba(124, 140, 116, 0.4);
}

.stamp-result.wrong {
  background: rgba(185, 74, 72, 0.18);
  border: 1px solid rgba(185, 74, 72, 0.4);
}

.stamp-title {
  color: #7C8C74;
  font-size: 32rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
}

.stamp-result.wrong .stamp-title {
  color: #B94A48;
}

.original-rumor {
  margin-top: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
  padding: 28rpx;
}

.original-label {
  display: block;
  color: #66727F;
  font-size: 20rpx;
  margin-bottom: 12rpx;
}

.original-text {
  display: block;
  color: #F2F4F6;
  font-size: 28rpx;
  line-height: 1.6;
}

.answer-review {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1px solid rgba(39,56,74,0.5);
}

.answer-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10rpx;
}

.answer-label {
  color: #66727F;
  font-size: 22rpx;
}

.answer-value {
  color: #B94A48;
  font-size: 22rpx;
  font-weight: 700;
}

.answer-value.correct {
  color: #7C8C74;
}

.fact-archive {
  margin-top: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
  padding: 30rpx;
}

.fact-kicker {
  display: block;
  color: #C6A15B;
  font-size: 22rpx;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
}

.fact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.fact-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.14);
  color: #C6A15B;
  font-size: 22rpx;
}

.fact-tag.source {
  background: transparent;
  border: 1px solid rgba(198,161,91,0.42);
}

.next-btn {
  height: 88rpx;
  margin-top: 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A, #C6A15B);
  color: #0B1118;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-display {
  margin-top: 36rpx;
  padding: 32rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.score-circle {
  display: flex;
  align-items: baseline;
}

.score-num {
  color: #F2F4F6;
  font-size: 56rpx;
  font-weight: 900;
}

.score-divider {
  color: #66727F;
  font-size: 36rpx;
  margin: 0 4rpx;
}

.score-total {
  color: #66727F;
  font-size: 36rpx;
}

.rank-badge {
  margin-top: 24rpx;
  padding: 28rpx;
  background: rgba(198,161,91,0.08);
  border: 1px solid rgba(198,161,91,0.24);
  border-radius: 22rpx;
}

.summary-closing {
  display: block;
  margin-top: 32rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
}

.ghost-btn {
  margin-top: 20rpx;
  height: 72rpx;
  border-radius: 16rpx;
  border: 1px solid #27384A;
  color: #A8B3BD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.rumor-page {
  min-height: 100vh;
  background: radial-gradient(circle at 50% 18%, rgba(198,161,91,0.08), transparent 34%), #0B1118;
  color: #F2F4F6;
  padding-bottom: 180rpx;
}

.rumor-content {
  padding: 40rpx 32rpx 180rpx;
  box-sizing: border-box;
}

.archive-card {
  position: relative;
  background: linear-gradient(180deg, rgba(23,34,48,0.98), rgba(14,23,33,0.98));
  border: 1px solid #27384A;
  border-radius: 28rpx;
  padding: 34rpx;
  box-sizing: border-box;
  box-shadow: 0 20rpx 50rpx rgba(0,0,0,0.24);
  overflow: hidden;
}

.archive-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 28rpx;
  bottom: 28rpx;
  width: 4rpx;
  background: rgba(198,161,91,0.55);
  border-radius: 999rpx;
}

.archive-kicker {
  display: block;
  color: #C6A15B;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  font-weight: 700;
}

.archive-title {
  display: block;
  margin-top: 16rpx;
  color: #F2F4F6;
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1.25;
}

.archive-desc {
  display: block;
  margin-top: 18rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
  white-space: normal;
  word-break: break-word;
}

.rumor-sample {
  margin-top: 32rpx;
  padding: 26rpx;
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.86);
  border-radius: 20rpx;
}

.sample-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
}

.sample-text {
  display: block;
  margin-top: 12rpx;
  color: #F2F4F6;
  font-size: 30rpx;
  line-height: 1.5;
  font-weight: 700;
}

.rumor-progress {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 28rpx;
}

.progress-label {
  color: #A8B3BD;
  font-size: 24rpx;
  flex-shrink: 0;
}

.progress-track {
  flex: 1;
  height: 8rpx;
  background: #172230;
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 999rpx;
}

.rumor-question-text {
  display: block;
  margin-top: 26rpx;
  color: #F2F4F6;
  font-size: 36rpx;
  line-height: 1.55;
  font-weight: 850;
  white-space: normal;
  word-break: break-word;
}

.judgement-title {
  display: block;
  margin: 34rpx 0 16rpx;
  color: #A8B3BD;
  font-size: 24rpx;
}

.answer-row {
  display: flex;
  gap: 18rpx;
}

.answer-button {
  flex: 1;
  height: 88rpx;
  border-radius: 18rpx;
  background: rgba(11,17,24,0.64);
  border: 1px solid #27384A;
  color: #F2F4F6;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-button:active {
  border-color: rgba(198,161,91,0.68);
  box-shadow: 0 0 24rpx rgba(198,161,91,0.12);
}

.answer-button.active {
  border-color: #C6A15B;
  background: rgba(198,161,91,0.12);
}

.rumor-input {
  width: 100%;
  margin-top: 20rpx;
  padding: 20rpx;
  background: rgba(11,17,24,0.62);
  border: 1px solid #27384A;
  border-radius: 16rpx;
  color: #F2F4F6;
  font-size: 26rpx;
  box-sizing: border-box;
}

.rumor-input.large {
  min-height: 140rpx;
}

.verdict-card {
  margin-bottom: 24rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
}

.verdict-card.correct {
  border-color: rgba(124,140,116,0.65);
  background: rgba(124,140,116,0.10);
}

.verdict-card.wrong {
  border-color: rgba(185,74,72,0.62);
  background: rgba(185,74,72,0.10);
}

.verdict-title {
  display: block;
  font-size: 36rpx;
  font-weight: 900;
}

.verdict-card.correct .verdict-title {
  color: #7C8C74;
}

.verdict-card.wrong .verdict-title {
  color: #B94A48;
}

.fact-card {
  margin-top: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
  padding: 30rpx;
}

.fact-title {
  display: block;
  color: #C6A15B;
  font-size: 30rpx;
  font-weight: 800;
}

.fact-subtitle {
  display: block;
  margin-top: 10rpx;
  color: #F2F4F6;
  font-size: 28rpx;
  font-weight: 700;
}

.fact-text {
  display: block;
  margin-top: 16rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.75;
  white-space: normal;
  word-break: break-word;
}

.related-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.related-tag {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.14);
  color: #C6A15B;
  font-size: 22rpx;
}

.primary-button {
  height: 88rpx;
  margin-top: 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A, #C6A15B);
  color: #0B1118;
  font-size: 28rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.secondary-link {
  margin-top: 24rpx;
  color: #66727F;
  font-size: 24rpx;
  text-align: center;
}

.archive-card,
.fact-card,
.verdict-card {
  animation: rumorFadeUp 0.36s ease-out both;
}

@keyframes rumorFadeUp {
  0% {
    opacity: 0;
    transform: translateY(18rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>