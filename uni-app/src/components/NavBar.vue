<template>
  <view>
    <view class="nb-fixed">
      <view class="nb-back" @click="goBack">
        <text class="nb-back-icon">‹</text>
      </view>
      <text class="nb-title">{{ title }}</text>
      <view class="nb-side"></view>
    </view>
    <view class="nb-spacer"></view>
  </view>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({ url: '/pages/index/index' })
      }
    }
  }
}
</script>

<style scoped>
.nb-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: calc(88rpx + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  display: flex;
  align-items: center;
  background: rgba(17, 26, 36, 0.92);
  backdrop-filter: blur(12rpx);
  border-bottom: 1px solid #27384A;
  box-sizing: border-box;
}

.nb-back {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.nb-back:active {
  transform: scale(0.9);
  opacity: 0.7;
}

.nb-back-icon {
  color: #C6A15B;
  font-size: 52rpx;
  font-weight: 300;
  line-height: 1;
}

.nb-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #F2F4F6;
  font-size: 30rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.nb-side {
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
}

.nb-spacer {
  height: calc(88rpx + env(safe-area-inset-top));
}
</style>
