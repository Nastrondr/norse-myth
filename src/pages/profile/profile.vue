<template>
  <scroll-view scroll-y class="profile-page">
    <view class="profile-content">
      <view class="profile-hero">
        <text class="hero-kicker">EXPLORER ARCHIVE</text>
        <text class="hero-title">{{ profileStats.title }}</text>
        <text class="hero-subtitle">世界树等级 Lv.{{ profileStats.level }} | {{ profileStats.totalProgress }}% 探索度</text>
      </view>

      <view class="profile-card">
        <text class="card-title">数据统计</text>
        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-value">{{ getProgress().realms.current }}/{{ getProgress().realms.total }}</text>
            <text class="stat-label">九界探索</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getProgress().gods.current }}/{{ getProgress().gods.total }}</text>
            <text class="stat-label">神祇收录</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getProgress().creatures.current }}/{{ getProgress().creatures.total }}</text>
            <text class="stat-label">图鉴发现</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getProgress().stories.current }}/{{ getProgress().stories.total }}</text>
            <text class="stat-label">故事阅读</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getProgress().runes.current }}/{{ getProgress().runes.total }}</text>
            <text class="stat-label">卢恩收集</text>
          </view>
        </view>
      </view>

      <view class="profile-card" v-if="savedGodMatch && savedGodMatch.primary">
        <text class="card-title">最近神格</text>
        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-value">{{ savedGodMatch.primary.name }}</text>
            <text class="stat-label">{{ savedGodMatch.primary.originalName }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ savedGodMatch.primary.matchPercent }}%</text>
            <text class="stat-label">匹配度</text>
          </view>
        </view>
        <view class="primary-button" @click="goGodMatch">
          <text>查看结果</text>
        </view>
      </view>

      <view class="profile-card" v-else>
        <text class="card-title">神格匹配</text>
        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-value">--</text>
            <text class="stat-label">尚未完成</text>
          </view>
        </view>
        <view class="primary-button" @click="goGodMatch">
          <text>前往匹配</text>
        </view>
      </view>

      <view class="profile-card">
        <text class="card-title">趣味互动</text>
        <view class="fun-grid">
          <view class="fun-item" @click="goGodMatch">
            <text class="fun-icon">&#9731;</text>
            <text class="fun-name">神祇匹配</text>
            <text class="fun-desc">寻找你的神格回响</text>
          </view>
          <view class="fun-item" @click="goRumorBook">
            <text class="fun-icon">&#9998;</text>
            <text class="fun-name">谣言之书</text>
            <text class="fun-desc">验证传闻真伪</text>
          </view>
          <view class="fun-item" @click="goRuneDivination">
            <text class="fun-icon">&#9830;</text>
            <text class="fun-name">卢恩占卜</text>
            <text class="fun-desc">三符文指引</text>
          </view>
        </view>
      </view>

      <view class="profile-card">
        <text class="card-title">探索记录</text>
        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-value">{{ rumorBookRecord ? '已完成' : '未开始' }}</text>
            <text class="stat-label">谣言之书</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getRavensClueCount() }} / 3</text>
            <text class="stat-label">渡鸦线索</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ runeRecord ? runeRecord.runeName || '已完成' : '尚未占卜' }}</text>
            <text class="stat-label">最近卢恩</text>
          </view>
        </view>
      </view>

      <view class="profile-card">
        <text class="card-title">称号墙</text>
        <view class="badge-grid">
          <view
            v-for="badge in allBadges"
            :key="badge.id"
            class="badge-item"
            :class="{ locked: !badge.unlocked }"
          >
            <text class="badge-name">{{ badge.name }}</text>
            <text class="badge-desc">{{ badge.desc }}</text>
          </view>
        </view>
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
        <text class="tab-label">档案</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      profileStats: {
        title: '见习记录员',
        level: 3,
        totalProgress: 36
      },
      savedGodMatch: null,
      worldTreeProgress: null,
      rumorBookRecord: null,
      runeRecord: null,
      ravensProgress: null
    }
  },
  computed: {
    allBadges() {
      return [
        {
          id: 'rookie',
          name: '见习记录员',
          desc: '默认拥有',
          unlocked: true
        },
        {
          id: 'god-matched',
          name: '神格显现者',
          desc: '完成神祇匹配',
          unlocked: !!this.savedGodMatch
        },
        {
          id: 'rumor-solved',
          name: '传闻辨析者',
          desc: '完成谣言之书',
          unlocked: !!this.rumorBookRecord
        },
        {
          id: 'raven-finder',
          name: '渡鸦线索发现者',
          desc: '发现渡鸦线索',
          unlocked: this.getRavensClueCount() > 0
        },
        {
          id: 'world-traveler',
          name: '九界旅人',
          desc: '世界树进度40%',
          unlocked: this.profileStats.totalProgress >= 40
        },
        {
          id: 'world-pilgrim',
          name: '世界树巡礼者',
          desc: '世界树进度70%',
          unlocked: this.profileStats.totalProgress >= 70
        },
        {
          id: 'lore-master',
          name: '九界考据者',
          desc: '谣言之书正确率80%',
          unlocked: this.rumorBookRecord && this.rumorBookRecord.accuracy >= 80
        },
        {
          id: 'rune-listener',
          name: '卢恩聆听者',
          desc: '完成三符文占卜',
          unlocked: !!this.runeRecord
        }
      ]
    }
  },
  onShow() {
    this.loadProfileData()
  },
  methods: {
    loadProfileData() {
      this.savedGodMatch = uni.getStorageSync('norse_god_match_result') || null
      this.worldTreeProgress = uni.getStorageSync('norse_world_tree_progress') || null
      this.rumorBookRecord = uni.getStorageSync('norse_rumor_book_completion') || null
      this.runeRecord = uni.getStorageSync('norse_rune_record') || null
      this.ravensProgress = uni.getStorageSync('ravens_clue_progress') || null

      this.updateProfileTitle()
    },
    updateProfileTitle() {
      const progress = this.worldTreeProgress
      const total = progress && progress.totalProgress ? progress.totalProgress : 0

      let title = '见习记录员'

      if (total >= 70) title = '世界树巡礼者'
      else if (total >= 40) title = '九界旅人'
      else if (this.savedGodMatch && this.savedGodMatch.primary) title = '神格显现者'
      else if (this.rumorBookRecord) title = '传闻辨析者'

      this.profileStats.title = title
      this.profileStats.totalProgress = total || 36
    },
    getDefaultProgress() {
      return {
        totalProgress: 36,
        realms: { current: 3, total: 9 },
        gods: { current: 6, total: 12 },
        creatures: { current: 8, total: 20 },
        stories: { current: 5, total: 18 },
        runes: { current: 4, total: 24 }
      }
    },
    getProgress() {
      return this.worldTreeProgress || this.getDefaultProgress()
    },
    getRavensClueCount() {
      const p = this.ravensProgress
      return p && Array.isArray(p.clueIds) ? p.clueIds.length : 0
    },
    goGodMatch() {
      uni.navigateTo({ url: '/pages/fun/god-match' })
    },
    goRumorBook() {
      uni.navigateTo({ url: '/pages/fun/quiz' })
    },
    goRuneDivination() {
      uni.navigateTo({ url: '/pages/fun/rune-divination' })
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
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 12%, rgba(198,161,91,0.10), transparent 34%),
    #0B1118;
  color: #F2F4F6;
  padding-bottom: 180rpx;
}

.profile-content {
  padding: 32rpx;
  box-sizing: border-box;
}

.profile-hero {
  padding: 36rpx 32rpx;
  border-radius: 28rpx;
  background:
    radial-gradient(circle at 80% 20%, rgba(198,161,91,0.16), transparent 34%),
    #172230;
  border: 1px solid #27384A;
}

.hero-kicker {
  color: #C6A15B;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.hero-title {
  display: block;
  margin-top: 14rpx;
  color: #F2F4F6;
  font-size: 44rpx;
  font-weight: 900;
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  color: #A8B3BD;
  font-size: 26rpx;
}

.profile-card {
  margin-top: 28rpx;
  padding: 28rpx;
  border-radius: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
}

.card-title {
  display: block;
  color: #F2F4F6;
  font-size: 30rpx;
  font-weight: 800;
  margin-bottom: 20rpx;
}

.stat-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.fun-grid {
  display: flex;
  gap: 14rpx;
}

.fun-item {
  flex: 1;
  padding: 20rpx 14rpx;
  border-radius: 16rpx;
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.72);
  text-align: center;
  min-width: 0;
}

.fun-icon {
  display: block;
  color: #C6A15B;
  font-size: 36rpx;
  margin-bottom: 8rpx;
}

.fun-name {
  display: block;
  color: #F2F4F6;
  font-size: 24rpx;
  font-weight: 800;
}

.fun-desc {
  display: block;
  margin-top: 4rpx;
  color: #66727F;
  font-size: 18rpx;
}

.stat-item {
  width: calc(50% - 7rpx);
  padding: 18rpx;
  border-radius: 16rpx;
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.72);
  box-sizing: border-box;
}

.stat-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
}

.stat-value {
  display: block;
  margin-top: 8rpx;
  color: #C6A15B;
  font-size: 28rpx;
  font-weight: 800;
}

.badge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.badge-item {
  width: calc(50% - 7rpx);
  padding: 18rpx;
  border-radius: 16rpx;
  background: rgba(198,161,91,0.10);
  border: 1px solid rgba(198,161,91,0.28);
  box-sizing: border-box;
}

.badge-item.locked {
  opacity: 0.46;
  background: rgba(11,17,24,0.48);
  border-color: #27384A;
}

.badge-name {
  display: block;
  color: #F2F4F6;
  font-size: 24rpx;
  font-weight: 700;
}

.badge-desc {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 21rpx;
  line-height: 1.45;
}

.primary-button {
  height: 76rpx;
  margin-top: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A, #C6A15B);
  color: #0B1118;
  font-size: 26rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-tab {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 108rpx;
  background: #172230;
  border-top: 1rpx solid #27384A;
  display: flex;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
}

.tab-item.active .tab-label {
  color: #C6A15B;
}

.tab-item.active .css-icon {
  color: #C6A15B;
}

.tab-icon-box {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.tab-label {
  color: #66727F;
  font-size: 20rpx;
}

.css-icon {
  width: 40rpx;
  height: 40rpx;
  color: #66727F;
  position: relative;
}

.icon-home::after {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 10rpx;
  width: 12rpx;
  height: 12rpx;
  border-left: 3rpx solid currentColor;
  border-bottom: 3rpx solid currentColor;
  transform: rotate(-135deg);
}

.icon-gods::after {
  content: '';
  position: absolute;
  left: 6rpx;
  top: 8rpx;
  width: 14rpx;
  height: 14rpx;
  border: 3rpx solid currentColor;
  border-radius: 50%;
}

.icon-stories::after {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  width: 12rpx;
  height: 16rpx;
  border: 3rpx solid currentColor;
  border-radius: 2rpx;
}

.icon-bestiary::after {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  width: 12rpx;
  height: 12rpx;
  border: 3rpx solid currentColor;
  transform: rotate(45deg);
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
</style>
