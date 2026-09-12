<template>
  <scroll-view scroll-y class="profile-page page-enter">
    <view class="profile-content">
      <PageHeader
        kicker="EXPLORER ARCHIVE"
        :title="profileStats.title"
        :subtitle="'世界树等级 Lv.' + profileStats.level + ' | ' + profileStats.totalProgress + '% 探索度'"
      />

      <view class="profile-card">
        <text class="card-title">数据统计</text>
        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-value"><AnimNumber :value="getProgress().realms.current" />/<AnimNumber :value="getProgress().realms.total" /></text>
            <text class="stat-label">九界探索</text>
          </view>
          <view class="stat-item">
            <text class="stat-value"><AnimNumber :value="getProgress().gods.current" />/<AnimNumber :value="getProgress().gods.total" /></text>
            <text class="stat-label">神祇收录</text>
          </view>
          <view class="stat-item">
            <text class="stat-value"><AnimNumber :value="getProgress().creatures.current" />/<AnimNumber :value="getProgress().creatures.total" /></text>
            <text class="stat-label">图鉴发现</text>
          </view>
          <view class="stat-item">
            <text class="stat-value"><AnimNumber :value="getProgress().stories.current" />/<AnimNumber :value="getProgress().stories.total" /></text>
            <text class="stat-label">故事阅读</text>
          </view>
          <view class="stat-item">
            <text class="stat-value"><AnimNumber :value="getProgress().runes.current" />/<AnimNumber :value="getProgress().runes.total" /></text>
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
        <text class="card-title">今日符文</text>
        <view class="daily-rune" v-if="dailyRune">
          <text class="rune-symbol">{{ dailyRune.symbol }}</text>
          <view class="rune-info">
            <text class="rune-name">{{ dailyRune.name }} · {{ dailyRune.originalName }}</text>
            <text class="rune-keywords">{{ dailyRune.keywords.join(' · ') }}</text>
          </view>
        </view>
        <text class="rune-message" v-if="dailyMessage">{{ dailyMessage }}</text>
        <text class="rune-note">{{ todayKey }} · 符文随日期流转</text>
      </view>

      <view class="profile-card">
        <text class="card-title">趣味互动</text>
        <view class="fun-grid">
          <view class="fun-item" @click="goGodMatch">
            <view class="fun-icon"><text>G</text></view>
            <text class="fun-name">神祇匹配</text>
            <text class="fun-desc">寻找你的神格回响</text>
          </view>
          <view class="fun-item" @click="goRumorBook">
            <view class="fun-icon"><text>Q</text></view>
            <text class="fun-name">谣言之书</text>
            <text class="fun-desc">验证传闻真伪</text>
          </view>
          <view class="fun-item" @click="goRuneDivination">
            <view class="fun-icon"><text>R</text></view>
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
  </scroll-view>

  <TabBar current="profile" />
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { db } from '@/db'
import AnimNumber from '@/components/AnimNumber.vue'
export default {
  components: { TabBar, PageHeader, AnimNumber },
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
      ravensProgress: null,
      dailyRune: null,
      todayKey: '',
      dailyMessage: ''
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
      this.initDailyRune()
    },
    initDailyRune() {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      this.todayKey = `${y}-${m}-${d}`

      const runes = db.findAll('runeDetails')
      if (!runes.length) return

      // 以日期为种子稳定取符，同一天结果不变
      let hash = 0
      const seed = 'rune|' + this.todayKey
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i)
        hash |= 0
      }
      this.dailyRune = runes[Math.abs(hash) % runes.length]
      this.dailyMessage = this.dailyRune.dailyMessage || `今天，「${this.dailyRune.name}」在呼唤你的注意。`
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
      // 总数以数据库为准（单一事实源），current 为占位进度
      return {
        totalProgress: 36,
        realms: { current: 3, total: db.count('realms') },
        gods: { current: 6, total: db.count('gods') },
        creatures: { current: 8, total: db.count('creatures') },
        stories: { current: 5, total: db.count('stories') },
        runes: { current: 4, total: db.count('runeDetails') }
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

.daily-rune {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.rune-symbol {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: rgba(216, 194, 122, 0.08);
  border: 1rpx solid rgba(198, 161, 91, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
  font-size: 56rpx;
  color: #D8C27A;
  flex-shrink: 0;
}

.rune-info {
  flex: 1;
  min-width: 0;
}

.rune-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #F2F4F6;
  margin-bottom: 8rpx;
}

.rune-keywords {
  display: block;
  font-size: 24rpx;
  color: #C6A15B;
}

.rune-message {
  display: block;
  font-size: 26rpx;
  color: #C8D0D8;
  line-height: 1.7;
  padding: 20rpx;
  background: #0B1118;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.rune-note {
  display: block;
  font-size: 22rpx;
  color: #66727F;
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
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.fun-item:active {
  transform: scale(0.96);
  border-color: rgba(198,161,91,0.55);
}

.fun-icon {
  width: 56rpx;
  height: 56rpx;
  margin: 0 auto 10rpx;
  border-radius: 14rpx;
  background: rgba(198,161,91,0.15);
  border: 1px solid rgba(198,161,91,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fun-icon text {
  color: #C6A15B;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
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
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.primary-button:active {
  transform: scale(0.97);
  opacity: 0.9;
}



















</style>
