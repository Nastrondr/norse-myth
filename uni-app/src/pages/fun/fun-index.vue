<template>
  <view class="container">
    <view class="header">
      <text class="title">趣味互动</text>
      <text class="subtitle">探索北欧神话的神秘力量</text>
    </view>

    <view class="daily-rune-section">
      <text class="section-label">今日符文</text>
      <text class="daily-date">{{ todayKey }}</text>
      <view class="daily-card" v-if="dailyRuneData">
        <text class="daily-symbol">{{ dailyRuneData.symbol }}</text>
        <text class="daily-name">{{ dailyRuneData.name }}</text>
        <text class="daily-name-en">{{ dailyRuneData.originalName }}</text>
        <text class="daily-keywords">{{ dailyRuneData.keywords.join(' · ') }}</text>
        <text class="daily-message">{{ dailyMessage }}</text>
      </view>
      <text class="daily-note">今日符文会随日期与你的个人气息而变化。</text>
    </view>

    <view class="fun-list">
      <view class="fun-card" @click="goToRuneDivination">
        <view class="fun-icon">R</view>
        <view class="fun-info">
          <text class="fun-title">卢恩占卜</text>
          <text class="fun-desc">抽取卢恩符文，获得神明的指引</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="fun-card" @click="goToGodMatch">
        <view class="fun-icon">G</view>
        <view class="fun-info">
          <text class="fun-title">神祇匹配</text>
          <text class="fun-desc">通过九界情境选择，找到与你气质最接近的北欧神祇</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view v-if="savedGodMatch && savedGodMatch.primary" class="saved-match-card">
        <text class="saved-kicker">最近神格</text>
        <text class="saved-name">{{ savedGodMatch.primary.name }}</text>
        <text class="saved-title">{{ savedGodMatch.primary.title }}</text>
        <text class="saved-percent">{{ savedGodMatch.primary.matchPercent }}%</text>
      </view>

      <view class="fun-card" @click="goToQuiz">
        <view class="fun-icon">Q</view>
        <view class="fun-info">
          <text class="fun-title">谣言之书</text>
          <text class="fun-desc">翻开九界流传的旧闻，辨认哪些是真相，哪些只是后世误读。</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="bottom-tab">
      <view class="tab-item" @click="goToTab('home')">
        <view class="tab-icon-box"><view class="css-icon icon-home"></view></view>
        <text class="tab-label">首页</text>
      </view>
      <view class="tab-item" @click="goToTab('gods')">
        <view class="tab-icon-box"><view class="css-icon icon-gods"></view></view>
        <text class="tab-label">神祇</text>
      </view>
      <view class="tab-item" @click="goToTab('stories')">
        <view class="tab-icon-box"><view class="css-icon icon-stories"></view></view>
        <text class="tab-label">故事</text>
      </view>
      <view class="tab-item" @click="goToTab('bestiary')">
        <view class="tab-icon-box"><view class="css-icon icon-bestiary"></view></view>
        <text class="tab-label">图鉴</text>
      </view>
      <view class="tab-item active">
        <view class="tab-icon-box"><view class="css-icon icon-fun"></view></view>
        <text class="tab-label">趣味</text>
      </view>
    </view>
  </view>
</template>

<script>
import { runes as runeData } from '@/data/runes.js'

export default {
  data() {
    return {
      userProfile: {
        nickname: 'Guest',
        birthMonth: '01',
        birthDay: '01',
        intention: 'daily'
      },
      runes: runeData,
      dailyRuneData: null,
      todayKey: '',
      dailyMessage: '',
      savedGodMatch: null
    }
  },
  onLoad() {
    this.initDailyRune()
  },
  onShow() {
    this.loadSavedGodMatch()
  },
  methods: {
    initDailyRune() {
      this.todayKey = this.getTodayKey()
      this.dailyRuneData = this.getDailyRune()
      this.dailyMessage = this.getDailyMessage()
    },

    getTodayKey() {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    hashString(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i)
        hash |= 0
      }
      return Math.abs(hash)
    },

    getDailyRune() {
      const profile = this.userProfile || {}
      const seed = [
        this.getTodayKey(),
        profile.nickname || 'Guest',
        profile.birthMonth || '',
        profile.birthDay || '',
        profile.intention || 'daily'
      ].join('|')

      const list = this.runes || []
      if (!list.length) return null

      const index = this.hashString(seed) % list.length
      return list[index]
    },

    getDailyMessage() {
      const rune = this.dailyRuneData
      if (!rune) return ''

      const messages = {
        'Ansuz': '今天请认真对待语言。该说清楚的事，不要只留给对方猜。',
        'Fehu': '财富流动的开始。关注你最近忽略的那个人，他可能带来重要机会。',
        'Uruz': '生命力在恢复。适合运动或开始新计划，但注意休息。',
        'Thurisaz': '挑战在前。不要逃避，你比想象中更强。',
        'Ansuz': '语言的力量。 今天适合写作、沟通、表达想法。',
        'Raido': '旅程开始。也许是物理的迁移，也许是内心的转变。',
        'Kenaz': '内在火焰点燃。适合创造性的工作或学习新技能。',
        ' Gebo': '礼物与交换。给予会让你收获，合作比独斗更好。',
        'Wunjo': '喜悦与目标达成。你走在了正确的道路上。'
      }

      return messages[rune.name] || `今天，「${rune.name}」在呼唤你的注意。请审视${rune.keywords}相关的领域。`
    },

    goToRuneDivination() {
      uni.navigateTo({
        url: '/pages/fun/rune-divination'
      })
    },
    goToGodMatch() {
      uni.navigateTo({
        url: '/pages/fun/god-match'
      })
    },
    loadSavedGodMatch() {
      const saved = uni.getStorageSync('norse_god_match_result')
      this.savedGodMatch = saved && saved.primary ? saved : null
    },
    goToQuiz() {
      uni.navigateTo({
        url: '/pages/fun/quiz'
      })
    },
    goToTab(tab) {
      const routes = {
        home: '/pages/index/index',
        gods: '/pages/gods/god-list',
        stories: '/pages/stories/story-list',
        bestiary: '/pages/bestiary/bestiary-list'
      }
      if (routes[tab]) {
        uni.switchTab({ url: routes[tab] })
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #0B1118;
  padding: 32rpx;
  padding-bottom: 160rpx;
  box-sizing: border-box;
}

.header {
  text-align: center;
  padding: 24rpx 0 40rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #C6A15B;
  letter-spacing: 4rpx;
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: #A8B3BD;
}

.daily-rune-section {
  padding: 32rpx;
  background: #172230;
  border: 1rpx solid #27384A;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  text-align: center;
}

.section-label {
  display: block;
  font-size: 26rpx;
  color: #66727F;
  margin-bottom: 8rpx;
}

.daily-date {
  display: block;
  font-size: 22rpx;
  color: #66727F;
  margin-bottom: 24rpx;
}

.daily-card {
  padding: 24rpx;
}

.daily-symbol {
  display: block;
  font-size: 80rpx;
  color: #D8C27A;
  margin-bottom: 16rpx;
}

.daily-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #F2F4F6;
  margin-bottom: 8rpx;
}

.daily-name-en {
  display: block;
  font-size: 24rpx;
  color: #C6A15B;
  margin-bottom: 16rpx;
}

.daily-keywords {
  display: block;
  font-size: 26rpx;
  color: #A8B3BD;
  margin-bottom: 20rpx;
}

.daily-message {
  display: block;
  font-size: 28rpx;
  color: #F2F4F6;
  line-height: 1.7;
  padding: 20rpx;
  background: #0B1118;
  border-radius: 12rpx;
}

.daily-note {
  display: block;
  font-size: 22rpx;
  color: #66727F;
  margin-top: 20rpx;
}

.fun-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.fun-card {
  display: flex;
  align-items: center;
  padding: 28rpx;
  background: #172230;
  border: 1rpx solid #27384A;
  border-radius: 12rpx;
}

.fun-icon {
  width: 64rpx;
  height: 64rpx;
  min-width: 64rpx;
  border-radius: 16rpx;
  background: rgba(198, 161, 91, 0.15);
  border: 1rpx solid rgba(198, 161, 91, 0.3);
  color: #C6A15B;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.fun-info {
  flex: 1;
}

.fun-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #F2F4F6;
  margin-bottom: 8rpx;
}

.fun-desc {
  display: block;
  font-size: 24rpx;
  color: #A8B3BD;
}

.arrow {
  font-size: 36rpx;
  color: #66727F;
}

.bottom-tab {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 112rpx;
  background: #111A24;
  border-top: 1px solid #27384A;
  display: flex;
  z-index: 9999;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
}

.tab-item {
  flex: 1;
  height: 112rpx;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: #66727F;
  text-align: center;
}

.tab-item.active {
  color: #C6A15B;
}

.tab-icon-box {
  width: 48rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tab-label {
  display: block;
  height: 24rpx;
  line-height: 24rpx;
  font-size: 22rpx;
  color: currentColor;
  text-align: center;
}

.css-icon {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  color: currentColor;
  box-sizing: border-box;
  transform-origin: center center;
}

.css-icon::before,
.css-icon::after {
  box-sizing: border-box;
}

.icon-home::before {
  content: '';
  position: absolute;
  left: 7rpx;
  top: 6rpx;
  width: 18rpx;
  height: 18rpx;
  border-left: 3rpx solid currentColor;
  border-top: 3rpx solid currentColor;
  transform: rotate(45deg);
  border-radius: 2rpx;
}

.icon-home::after {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 17rpx;
  width: 16rpx;
  height: 11rpx;
  border: 3rpx solid currentColor;
  border-top: none;
  border-radius: 2rpx;
}

.icon-gods::before {
  content: '';
  position: absolute;
  left: 5rpx;
  top: 5rpx;
  width: 22rpx;
  height: 6rpx;
  border-left: 3rpx solid currentColor;
  border-right: 3rpx solid currentColor;
  border-top: 3rpx solid currentColor;
  transform: skewX(-8deg);
}

.icon-gods::after {
  content: '';
  position: absolute;
  left: 6rpx;
  top: 14rpx;
  width: 20rpx;
  height: 14rpx;
  border-left: 3rpx solid currentColor;
  border-right: 3rpx solid currentColor;
  box-shadow: 7rpx 0 0 -4rpx currentColor, -7rpx 0 0 -4rpx currentColor;
}

.icon-stories::before {
  content: '';
  position: absolute;
  left: 5rpx;
  top: 6rpx;
  width: 11rpx;
  height: 22rpx;
  border: 3rpx solid currentColor;
  border-radius: 4rpx 0 0 4rpx;
}

.icon-stories::after {
  content: '';
  position: absolute;
  right: 5rpx;
  top: 6rpx;
  width: 11rpx;
  height: 22rpx;
  border: 3rpx solid currentColor;
  border-radius: 0 4rpx 4rpx 0;
}

.icon-bestiary::before {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 6rpx;
  width: 16rpx;
  height: 16rpx;
  border: 3rpx solid currentColor;
  transform: rotate(45deg);
  border-radius: 3rpx;
}

.icon-bestiary::after {
  content: '';
  position: absolute;
  left: 13rpx;
  top: 11rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: currentColor;
}

.icon-fun::before {
  content: '';
  position: absolute;
  left: 7rpx;
  top: 7rpx;
  width: 18rpx;
  height: 18rpx;
  border: 3rpx solid currentColor;
  border-radius: 50%;
}

.icon-fun::after {
  content: '';
  position: absolute;
  left: 14rpx;
  top: 14rpx;
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: currentColor;
}

.saved-match-card {
  margin: 20rpx 32rpx;
  padding: 22rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 18rpx;
}

.saved-kicker {
  display: block;
  color: #66727F;
  font-size: 20rpx;
}

.saved-name {
  display: block;
  margin-top: 8rpx;
  color: #F2F4F6;
  font-size: 28rpx;
  font-weight: 700;
}

.saved-title {
  display: block;
  margin-top: 6rpx;
  color: #A8B3BD;
  font-size: 22rpx;
}

.saved-percent {
  display: block;
  margin-top: 6rpx;
  color: #C6A15B;
  font-size: 22rpx;
  font-weight: 700;
}
</style>