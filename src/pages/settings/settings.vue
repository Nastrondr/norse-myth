<template>
  <view class="settings-page page-enter-deep">
    <NavBar title="设置" />

    <!-- 外观模式 -->
    <view class="settings-card">
      <view class="card-header">
        <view class="card-icon">
          <PaletteIcon :size="18" :stroke-width="1.8" />
        </view>
        <text class="card-title">外观模式</text>
      </view>

      <view class="segmented">
        <view class="segment-indicator" :class="{ light: theme === 'light' }"></view>
        <view class="segment" :class="{ active: theme === 'dark' }" @click="setTheme('dark')">
          <MoonIcon :size="17" :stroke-width="1.8" />
          <text class="segment-label">深色 · 夜幕</text>
        </view>
        <view class="segment" :class="{ active: theme === 'light' }" @click="setTheme('light')">
          <SunIcon :size="17" :stroke-width="1.8" />
          <text class="segment-label">浅色 · 羊皮卷</text>
        </view>
      </view>

      <text class="card-hint">夜幕笼罩世界树，或让金辉洒落羊皮卷。选择将即刻生效并被记住。</text>
    </view>

    <!-- 档案管理 -->
    <view class="settings-card">
      <view class="card-header">
        <view class="card-icon">
          <ScrollIcon :size="18" :stroke-width="1.8" />
        </view>
        <text class="card-title">探索者档案</text>
      </view>

      <view class="setting-row">
        <view class="setting-info">
          <text class="setting-name">当前档案</text>
          <text class="setting-desc">{{ currentUser ? currentUser.name + (currentUser.guest ? '（访客）' : '') : '未登录' }}</text>
        </view>
      </view>

      <view class="setting-row" v-if="userCount > 0">
        <view class="setting-info">
          <text class="setting-name">已建档案</text>
          <text class="setting-desc">{{ userCount }} 个 · 进度随档案切换保存</text>
        </view>
      </view>

      <view class="profile-actions">
        <view class="profile-action-btn" @click="goSwitch">
          <text>切换 / 新建档案</text>
        </view>
        <view class="profile-action-btn danger" v-if="currentUser" @click="onLogout">
          <text>登出当前档案</text>
        </view>
      </view>
    </view>

    <!-- 声音 -->
    <view class="settings-card">
      <view class="card-header">
        <view class="card-icon">
          <MusicIcon :size="18" :stroke-width="1.8" />
        </view>
        <text class="card-title">声音</text>
      </view>

      <view class="setting-row">
        <view class="setting-info">
          <text class="setting-name">背景音乐</text>
          <text class="setting-desc">在漫游九界时聆听低吟的弦音</text>
        </view>
        <view class="toggle" :class="{ on: bgmEnabled }" @click="onToggleBgm">
          <view class="toggle-thumb">
            <MusicIcon v-if="bgmEnabled" :size="12" :stroke-width="2" />
          </view>
        </view>
      </view>

      <view class="setting-row">
        <view class="setting-info">
          <text class="setting-name">交互音效</text>
          <text class="setting-desc">翻页、解锁与占卜时的金石轻响</text>
        </view>
        <view class="toggle" :class="{ on: sfxEnabled }" @click="onToggleSfx">
          <view class="toggle-thumb"></view>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="settings-card">
      <view class="card-header">
        <view class="card-icon">
          <ScrollIcon :size="18" :stroke-width="1.8" />
        </view>
        <text class="card-title">关于</text>
      </view>

      <view class="setting-row">
        <view class="setting-info">
          <text class="setting-name">传说之境</text>
          <text class="setting-desc">北欧神话 · 智识与传说的卷轴</text>
        </view>
        <text class="about-value">v1.0.0</text>
      </view>
    </view>

    <text class="page-foot-rune">ᛊ ᛖ ᛏ ᛏ ᛁ ᚾ ᚷ ᛊ</text>
  </view>
</template>

<script>
import NavBar from '../../components/NavBar.vue'
import { state } from '../../state'
import { getBgmEnabled, toggleBgm } from '../../utils/audioManager.js'
import { getSfxEnabled, setSfxEnabled, sfxTap } from '../../utils/sfx.js'
import { getCurrentUser, getUserList, logout } from '@/auth/user.js'
import {
  Palette as PaletteIcon,
  Moon as MoonIcon,
  Sun as SunIcon,
  Music as MusicIcon,
  Scroll as ScrollIcon
} from 'lucide-vue-next'

export default {
  components: {
    NavBar,
    PaletteIcon,
    MoonIcon,
    SunIcon,
    MusicIcon,
    ScrollIcon
  },
  data() {
    return {
      theme: 'dark',
      bgmEnabled: true,
      sfxEnabled: true,
      currentUser: null,
      userCount: 0
    }
  },
  onLoad() {
    this.theme = state.get('settings.theme', 'dark')
    this.bgmEnabled = getBgmEnabled()
    this.sfxEnabled = getSfxEnabled()
  },
  onShow() {
    this.currentUser = getCurrentUser()
    this.userCount = getUserList().length
  },
  methods: {
    setTheme(value) {
      if (this.theme === value) return
      this.theme = value
      state.set('settings.theme', value)
      // #ifdef H5
      document.documentElement.setAttribute('data-theme', value)
      // #endif
    },
    onToggleBgm() {
      this.bgmEnabled = toggleBgm()
    },
    onToggleSfx() {
      this.sfxEnabled = !this.sfxEnabled
      setSfxEnabled(this.sfxEnabled)
      // 开启时给一声反馈
      if (this.sfxEnabled) sfxTap()
    },
    goSwitch() {
      uni.navigateTo({ url: '/pages/auth/login' })
    },
    onLogout() {
      logout()
      this.currentUser = null
      uni.reLaunch({ url: '/pages/auth/login' })
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 24rpx 28rpx 80rpx;
  background: var(--bg-outer);
  box-sizing: border-box;
}

.settings-card {
  padding: 30rpx;
  margin-bottom: 28rpx;
  border-radius: 28rpx;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 26rpx;
}

.card-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  background: rgba(var(--accent-rgb), 0.12);
  border: 1px solid rgba(var(--accent-rgb), 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}

.card-title {
  color: var(--accent);
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

/* ===== 分段切换 ===== */
.segmented {
  position: relative;
  display: flex;
  padding: 6rpx;
  border-radius: 999rpx;
  background: var(--bg-inset);
  border: 1px solid var(--border-soft);
}

.segment-indicator {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: calc(50% - 6rpx);
  height: calc(100% - 12rpx);
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  transition: transform 0.3s ease;
}

.segment-indicator.light {
  transform: translateX(100%);
}

.segment {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  color: var(--text-muted);
  font-size: 25rpx;
  font-weight: 600;
  transition: color 0.3s ease;
}

.segment.active {
  color: var(--bg-outer);
}

.segment-label {
  font-size: 25rpx;
}

.card-hint {
  display: block;
  margin-top: 20rpx;
  color: var(--text-muted);
  font-size: 22rpx;
  line-height: 1.6;
}

/* ===== 通用设置行 ===== */
.setting-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.setting-info {
  flex: 1;
  min-width: 0;
}

.setting-name {
  display: block;
  color: var(--text-primary);
  font-size: 28rpx;
  font-weight: 700;
}

.setting-desc {
  display: block;
  margin-top: 6rpx;
  color: var(--text-muted);
  font-size: 22rpx;
  line-height: 1.5;
}

/* ===== 开关 ===== */
.toggle {
  width: 92rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: var(--bg-inset);
  border: 1px solid var(--border-soft);
  padding: 4rpx;
  box-sizing: border-box;
  flex-shrink: 0;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.toggle.on {
  background: rgba(var(--accent-rgb), 0.25);
  border-color: rgba(var(--accent-rgb), 0.55);
}

.toggle-thumb {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-outer);
  transition: transform 0.25s ease, background 0.25s ease;
}

.toggle.on .toggle-thumb {
  transform: translateX(40rpx);
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
}

.about-value {
  color: var(--accent);
  font-size: 24rpx;
  font-weight: 700;
}

/* ===== 页脚符文 ===== */
.page-foot-rune {
  display: block;
  text-align: center;
  margin-top: 20rpx;
  color: var(--text-muted);
  font-size: 22rpx;
  letter-spacing: 12rpx;
  opacity: 0.55;
}
/* ===== 档案管理 ===== */
.profile-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 20rpx;
}

.profile-action-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 16rpx;
  border: 1rpx solid var(--border-soft);
  background: var(--bg-inset);
}

.profile-action-btn text {
  color: var(--text-secondary);
  font-size: 24rpx;
  letter-spacing: 2rpx;
}

.profile-action-btn.danger {
  border-color: rgba(201, 122, 107, 0.4);
}

.profile-action-btn.danger text {
  color: #C97A6B;
}
</style>
