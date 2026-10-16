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
        <view class="row-header">
          <text class="card-title">最近神格</text>
          <view class="pill-button" @click="goGodMatch"><text>查看结果</text></view>
        </view>
        <text class="row-line">{{ savedGodMatch.primary.name }} · {{ savedGodMatch.primary.originalName }} · 匹配度 {{ savedGodMatch.primary.matchPercent }}%</text>
      </view>

      <view class="profile-card" v-else>
        <view class="row-header">
          <text class="card-title">神格匹配</text>
          <view class="pill-button" @click="goGodMatch"><text>前往匹配</text></view>
        </view>
        <text class="row-line">尚未完成测试 · 寻找你的神格回响</text>
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
        <view class="badge-header">
          <text class="card-title">称号墙</text>
          <text class="badge-count">已解锁 {{ unlockedAchievements }} / {{ achievements.length }}</text>
        </view>
        <BadgeShelf :badges="shelfBadges" />
      </view>

      <view class="profile-card">
        <text class="card-title">存档备份</text>
        <text class="archive-desc">导出进度为文本存档，换设备时粘贴导入即可恢复。</text>
        <view v-if="!archiveImporting" class="archive-actions">
          <view class="primary-button" @click="onExportArchive"><text>导出存档</text></view>
          <view class="ghost-button" @click="startArchiveImport"><text>导入存档</text></view>
        </view>
        <view v-else class="archive-import">
          <textarea class="archive-textarea" v-model="archiveText" placeholder="粘贴存档文本…" :maxlength="-1" />
          <view class="archive-actions">
            <view class="primary-button" @click="confirmArchiveImport"><text>确认导入</text></view>
            <view class="ghost-button" @click="cancelArchiveImport"><text>取消</text></view>
          </view>
        </view>
      </view>

      <view class="settings-entry" @click="goSettings">
        <view class="settings-entry-icon">
          <SettingsIcon :size="20" :stroke-width="1.8" />
        </view>
        <view class="settings-entry-info">
          <text class="settings-entry-title">设置</text>
          <text class="settings-entry-desc">外观模式 · 背景音乐</text>
        </view>
        <text class="settings-entry-arrow">›</text>
      </view>
    </view>
  </scroll-view>

  <TabBar current="profile" />
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { db } from '@/db'
import { state } from '@/state'
import { exportArchive as buildArchive, importArchive as restoreArchive } from '@/backup'
import { getAchievementBoard, getTitle } from '@/interactions/achievements.js'
import AnimNumber from '@/components/AnimNumber.vue'
import BadgeShelf from '@/components/BadgeShelf.vue'
import { Settings as SettingsIcon } from 'lucide-vue-next'
export default {
  components: { TabBar, PageHeader, AnimNumber, BadgeShelf, SettingsIcon },
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
      dailyMessage: '',
      archiveImporting: false,
      archiveText: '',
      achievements: []
    }
  },
  computed: {
    unlockedAchievements() {
      return this.achievements.filter(badge => badge.unlocked).length
    },
    // 上墙规则：已解锁在前；未解锁的需已有进度（current > 0）才展示，纯开关型与 0 进度不上墙
    shelfBadges() {
      return this.achievements
        .filter(badge => badge.unlocked || (badge.progress && badge.progress.current > 0))
        .sort((a, b) => (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0))
    }
  },
  onShow() {
    this.loadProfileData()
  },
  methods: {
    loadProfileData() {
      this.savedGodMatch = state.get('game.godMatch', null)
      this.worldTreeProgress = state.get('progress.worldTree', null)
      this.rumorBookRecord = state.get('game.rumorBook', null)
      this.runeRecord = state.get('game.runeRecord', null)
      this.ravensProgress = state.get('progress.ravens', null)

      this.refreshAchievements()
      this.initDailyRune()
    },
    // 统一成就引擎（src/interactions/achievements.js）：称号墙与称号推导共用
    refreshAchievements() {
      this.achievements = getAchievementBoard({ totalCreatures: db.count('creatures') })
      const progress = this.worldTreeProgress
      const total = progress && progress.totalProgress ? progress.totalProgress : 0
      this.profileStats.title = getTitle()
      this.profileStats.totalProgress = total || 36
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
    },
    goSettings() {
      uni.navigateTo({ url: '/pages/settings/settings' })
    },
    // ===== 存档备份 =====
    onExportArchive() {
      const text = buildArchive()
      uni.setClipboardData({
        data: text,
        success: () => uni.showToast({ title: '存档已复制到剪贴板', icon: 'success' }),
        fail: () => uni.showToast({ title: '复制失败，请重试', icon: 'none' })
      })
    },
    startArchiveImport() {
      this.archiveImporting = true
      this.archiveText = ''
    },
    cancelArchiveImport() {
      this.archiveImporting = false
      this.archiveText = ''
    },
    confirmArchiveImport() {
      const text = (this.archiveText || '').trim()
      if (!text) {
        uni.showToast({ title: '请先粘贴存档文本', icon: 'none' })
        return
      }
      uni.showModal({
        title: '导入存档',
        content: '导入将覆盖当前的文献修改、收集进度与游戏存档，确定继续吗？',
        confirmText: '覆盖导入',
        cancelText: '取消',
        success: (res) => {
          if (!res.confirm) return
          try {
            const result = restoreArchive(text)
            this.archiveImporting = false
            this.archiveText = ''
            uni.showToast({ title: '存档已恢复', icon: 'success' })
            // 内容层集合数据在页面 data 中有缓存，刷新页面让全部页面重新读库
            setTimeout(() => {
              // #ifdef H5
              window.location.reload()
              // #endif
              // #ifndef H5
              this.loadProfileData()
              // #endif
            }, 600)
          } catch (e) {
            uni.showToast({ title: '存档无效，请检查文本', icon: 'none' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 50% 12%, rgba(var(--accent-rgb),0.10), transparent 34%),
    var(--bg-outer);
  color: var(--text-primary);
  padding-bottom: 180rpx;
}

.profile-content {
  padding: 32rpx;
  box-sizing: border-box;
}

.profile-card {
  margin-top: 20rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
}

.card-title {
  display: block;
  color: var(--text-primary);
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 16rpx;
}

/* ===== 单行卡片（标题 + 右侧胶囊按钮） ===== */
.row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row-header .card-title {
  margin-bottom: 0;
}

.pill-button {
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.pill-button:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.pill-button text {
  color: var(--bg-outer);
  font-size: 22rpx;
  font-weight: 800;
  line-height: 1;
}

.row-line {
  display: block;
  margin-top: 14rpx;
  color: var(--text-secondary);
  font-size: 24rpx;
}

.daily-rune {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 20rpx;
}

.rune-symbol {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: rgba(var(--accent-strong-rgb), 0.08);
  border: 1rpx solid rgba(var(--accent-rgb), 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
  font-size: 44rpx;
  color: var(--accent-strong);
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
  color: var(--text-primary);
  margin-bottom: 8rpx;
}

.rune-keywords {
  display: block;
  font-size: 24rpx;
  color: var(--accent);
}

.rune-message {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
  line-height: 1.7;
  padding: 20rpx;
  background: var(--bg-inset);
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}

.rune-note {
  display: block;
  font-size: 22rpx;
  color: var(--text-muted);
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
  background: rgba(var(--bg-inset-rgb),0.58);
  border: 1px solid rgba(var(--border-rgb),0.72);
  text-align: center;
  min-width: 0;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.fun-item:active {
  transform: scale(0.96);
  border-color: rgba(var(--accent-rgb),0.55);
}

.fun-icon {
  width: 56rpx;
  height: 56rpx;
  margin: 0 auto 10rpx;
  border-radius: 14rpx;
  background: rgba(var(--accent-rgb),0.15);
  border: 1px solid rgba(var(--accent-rgb),0.32);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fun-icon text {
  color: var(--accent);
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1;
}

.fun-name {
  display: block;
  color: var(--text-primary);
  font-size: 24rpx;
  font-weight: 800;
}

.fun-desc {
  display: block;
  margin-top: 4rpx;
  color: var(--text-muted);
  font-size: 18rpx;
}

.stat-item {
  width: calc((100% - 28rpx) / 3);
  padding: 16rpx;
  border-radius: 16rpx;
  background: rgba(var(--bg-inset-rgb),0.58);
  border: 1px solid rgba(var(--border-rgb),0.72);
  box-sizing: border-box;
}

.stat-label {
  display: block;
  color: var(--text-muted);
  font-size: 22rpx;
}

.stat-value {
  display: block;
  margin-top: 8rpx;
  color: var(--accent);
  font-size: 28rpx;
  font-weight: 800;
}

.badge-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.badge-header .card-title {
  margin-bottom: 0;
}

.badge-count {
  color: var(--text-muted);
  font-size: 22rpx;
}

.primary-button {
  height: 76rpx;
  margin-top: 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  color: var(--bg-outer);
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

/* ===== 存档备份 ===== */
.archive-desc {
  display: block;
  color: var(--text-muted);
  font-size: 22rpx;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.archive-actions {
  display: flex;
  gap: 16rpx;
}

.archive-actions .primary-button,
.archive-actions .ghost-button {
  flex: 1;
  margin-top: 0;
}

.ghost-button {
  height: 76rpx;
  border-radius: 999rpx;
  background: rgba(var(--accent-rgb), 0.08);
  border: 1rpx solid rgba(var(--accent-rgb), 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.ghost-button:active {
  transform: scale(0.97);
  opacity: 0.9;
}

.ghost-button text {
  color: var(--accent);
  font-size: 26rpx;
  font-weight: 700;
}

.archive-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  box-sizing: border-box;
  background: var(--bg-inset);
  border: 1rpx solid var(--border-soft);
  border-radius: 12rpx;
  color: var(--text-primary);
  font-size: 22rpx;
  margin-bottom: 16rpx;
}

/* ===== 设置入口 ===== */
.settings-entry {
  margin-top: 20rpx;
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  gap: 20rpx;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.settings-entry:active {
  transform: scale(0.98);
  border-color: rgba(var(--accent-rgb), 0.55);
}

.settings-entry-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(var(--accent-rgb), 0.12);
  border: 1px solid rgba(var(--accent-rgb), 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.settings-entry-info {
  flex: 1;
  min-width: 0;
}

.settings-entry-title {
  display: block;
  color: var(--text-primary);
  font-size: 28rpx;
  font-weight: 700;
}

.settings-entry-desc {
  display: block;
  margin-top: 4rpx;
  color: var(--text-muted);
  font-size: 22rpx;
}

.settings-entry-arrow {
  color: var(--text-muted);
  font-size: 40rpx;
  line-height: 1;
}



















</style>
