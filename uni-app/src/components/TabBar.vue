<template>
  <view class="bottom-tab">
    <view
      v-for="tab in tabs"
      :key="tab.id"
      class="tab-item"
      :class="{ active: current === tab.id }"
      @click="handleTabClick(tab)"
    >
      <view class="tab-icon-box">
        <component :is="tab.icon" :size="22" :stroke-width="1.8" />
      </view>
      <text class="tab-label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script>
import { Home, Library, BookOpen, Gamepad2 } from 'lucide-vue-next'

export default {
  name: 'TabBar',
  props: {
    current: {
      type: String,
      default: 'home'
    }
  },
  emits: ['change'],
  data() {
    return {
      tabs: [
        { id: 'home', label: '首页', icon: Home, path: '/pages/index/index' },
        { id: 'codex', label: '图鉴', icon: Library, path: '/pages/codex/codex-index' },
        { id: 'stories', label: '故事', icon: BookOpen, path: '/pages/stories/story-list' },
        { id: 'profile', label: '档案', icon: Gamepad2, path: '/pages/profile/profile' }
      ]
    }
  },
  methods: {
    handleTabClick(tab) {
      if (tab.id === this.current) return
      this.$emit('change', tab)
      uni.switchTab({ url: tab.path })
    }
  }
}
</script>

<style scoped>
.bottom-tab {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #0F1822;
  border-top: 1rpx solid #1E2B3A;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  height: 100%;
  color: #66727F;
  transition: color 0.2s ease, transform 0.15s ease;
}

.tab-item:active {
  transform: scale(0.92);
}

.tab-item.active {
  color: #C6A15B;
}

.tab-icon-box {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.tab-item.active .tab-icon-box {
  transform: translateY(-2rpx);
}

.tab-label {
  font-size: 22rpx;
  line-height: 1;
}
</style>
