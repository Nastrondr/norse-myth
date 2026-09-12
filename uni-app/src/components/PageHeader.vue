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
  background: radial-gradient(circle at 50% 30%, rgba(198, 161, 91, 0.10), transparent 55%);
}

.ph-back {
  position: absolute;
  left: 32rpx;
  top: 44rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 1rpx solid #27384A;
  background: rgba(23, 34, 48, 0.9);
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
  color: #C6A15B;
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
  background: linear-gradient(90deg, transparent, rgba(198, 161, 91, 0.5));
}

.ph-kicker-row .ph-line:last-child {
  background: linear-gradient(90deg, rgba(198, 161, 91, 0.5), transparent);
}

.ph-diamond {
  width: 10rpx;
  height: 10rpx;
  background: rgba(198, 161, 91, 0.72);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.ph-kicker {
  color: #66727F;
  font-size: 22rpx;
  letter-spacing: 6rpx;
}

.ph-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #C6A15B;
  letter-spacing: 4rpx;
}

.ph-subtitle {
  display: block;
  margin-top: 16rpx;
  color: #A8B3BD;
  font-size: 24rpx;
  line-height: 1.7;
}
</style>
