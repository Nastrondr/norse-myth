<template>
  <view class="page-header">
    <view v-if="back" class="ph-back" @click="goBack">
      <text class="ph-back-icon">‹</text>
    </view>
    <view v-if="kicker" class="ph-kicker-row">
      <view class="ph-line"></view>
      <view class="ph-diamond"></view>
      <text class="ph-kicker">{{ kicker }}</text>
      <view class="ph-diamond"></view>
      <view class="ph-line"></view>
    </view>
    <text class="ph-title">{{ title }}</text>
    <text v-if="subtitle" class="ph-subtitle">{{ subtitle }}</text>
  </view>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    kicker: {
      type: String,
      default: ''
    },
    // 是否显示返回按钮（用于从图鉴 hub 等页面 navigateTo 进入的子页面）
    back: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/codex/codex-index' })
      }
    }
  }
}
</script>

<style scoped>
.page-header {
  position: relative;
  padding: 48rpx 32rpx 32rpx;
  text-align: center;
  background: radial-gradient(circle at 50% 30%, rgba(var(--accent-rgb), 0.10), transparent 55%);
}

.ph-back {
  position: absolute;
  left: 32rpx;
  top: 44rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 1rpx solid var(--border-soft);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.ph-back:active {
  transform: scale(0.9);
  opacity: 0.7;
}

.ph-back-icon {
  color: var(--accent);
  font-size: 44rpx;
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

.ph-kicker-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.ph-line {
  width: 72rpx;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb), 0.5));
}

.ph-kicker-row .ph-line:last-child {
  background: linear-gradient(90deg, rgba(var(--accent-rgb), 0.5), transparent);
}

.ph-diamond {
  width: 10rpx;
  height: 10rpx;
  background: rgba(var(--accent-rgb), 0.72);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.ph-kicker {
  color: var(--text-muted);
  font-size: 22rpx;
  letter-spacing: 10rpx;
  font-family: 'Cinzel', Georgia, 'Palatino Linotype', serif;
  font-weight: 600;
}

.ph-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 4rpx;
  text-shadow: 0 2rpx 16rpx rgba(var(--accent-rgb), 0.4);
}

.ph-subtitle {
  display: block;
  margin-top: 16rpx;
  color: var(--text-secondary);
  font-size: 24rpx;
  line-height: 1.7;
}
</style>
