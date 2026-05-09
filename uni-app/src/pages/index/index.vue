<template>
  <view class="page">
    <scroll-view class="scroll-view" scroll-y>
      <view class="hero">
        <text class="hero-title">九界探索</text>
        <text class="hero-subtitle">从阿斯加德到赫尔海姆，沿世界树的枝干进入诸神、巨人与亡者的国度。</text>
        <view class="tree-visual">
          <view class="tree-line"></view>
          <text class="tree-symbol">*</text>
          <view class="tree-dots">
            <view class="tree-dot tree-dot-1"></view>
            <view class="tree-dot tree-dot-2"></view>
            <view class="tree-dot tree-dot-3"></view>
            <view class="tree-dot tree-dot-4"></view>
            <view class="tree-dot tree-dot-5"></view>
          </view>
          <text class="tree-name">Yggdrasil</text>
          <text class="tree-subname">世界树</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">诸界之门</text>
      </view>

      <view class="worlds-grid">
        <view class="world-card" v-for="(world, index) in worlds" :key="index" @click="goToWorldDetail(world)">
          <text class="world-name">{{ world.name }}</text>
          <text class="world-name-en">{{ world.nameEn }}</text>
          <text class="world-desc">{{ world.desc }}</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: world.progress + '%' }"></view>
          </view>
          <text class="progress-text">{{ world.progress }}%</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">今日推荐</text>
      </view>

      <view class="recommend-list">
        <view class="recommend-card" v-for="(item, index) in recommends" :key="index">
          <text class="recommend-label">{{ item.label }}</text>
          <text class="recommend-value">{{ item.value }}</text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <view class="bottom-tab">
      <view class="tab-item active">
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
      <view class="tab-item" @click="goToTab('fun')">
        <view class="tab-icon-box"><view class="css-icon icon-fun"></view></view>
        <text class="tab-label">趣味</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      worlds: [
        { id: 'asgard', name: '阿斯加德', nameEn: 'Asgard', type: '神域', desc: '奥丁与阿萨神族的居所', progress: 85 },
        { id: 'midgard', name: '米德加德', nameEn: 'Midgard', type: '人域', desc: '人类与生物的中庭世界', progress: 92 },
        { id: 'jotunheim', name: '约顿海姆', nameEn: 'Jotunheim', type: '巨人国', desc: '霜巨人之国', progress: 45 },
        { id: 'vanaheim', name: '华纳海姆', nameEn: 'Vanaheim', type: '神域', desc: '华纳神族的领地', progress: 30 },
        { id: 'alfheim', name: '亚尔夫海姆', nameEn: 'Alfheim', type: '精灵国', desc: '光明精灵的家园', progress: 55 },
        { id: 'svartalfheim', name: '斯瓦塔尔夫海姆', nameEn: 'Svartalfheim', type: '矮人国', desc: '黑暗精灵与矮人的 forge', progress: 20 },
        { id: 'niflheim', name: '尼福尔海姆', nameEn: 'Niflheim', type: '雾国', desc: '冰冷的雾之国', progress: 15 },
        { id: 'muspelheim', name: '穆斯贝尔海姆', nameEn: 'Muspelheim', type: '火国', desc: '苏尔特尔的火焰之国', progress: 10 },
        { id: 'helheim', name: '赫尔海姆', nameEn: 'Helheim', type: '冥府', desc: '亡者之地', progress: 25 }
      ],
      recommends: [
        { label: '今日神祇', value: '奥丁' },
        { label: '今日故事', value: '巴德尔之死' },
        { label: '今日卢恩', value: 'Ansuz' }
      ]
    }
  },
  methods: {
    goToWorldDetail(world) {
      if (!world || !world.id) return
      uni.navigateTo({
        url: `/pages/world/world-detail?id=${world.id}`
      })
    },
    goToTab(tab) {
      const routes = {
        gods: '/pages/gods/god-list',
        stories: '/pages/stories/story-list',
        bestiary: '/pages/bestiary/bestiary-list',
        fun: '/pages/fun/fun-index'
      }
      if (routes[tab]) {
        uni.switchTab({ url: routes[tab] })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #0B1118;
}

.scroll-view {
  height: 100vh;
  background: #0B1118;
}

.hero {
  padding: 60rpx 40rpx 48rpx;
  background: #0B1118;
  text-align: center;
}

.hero-title {
  display: block;
  font-size: 60rpx;
  font-weight: 700;
  color: #C6A15B;
  letter-spacing: 8rpx;
  margin-bottom: 16rpx;
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: #A8B3BD;
  line-height: 1.6;
  margin-bottom: 48rpx;
}

.tree-visual {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 48rpx;
  background: #172230;
  border: 2rpx solid #27384A;
  border-radius: 12rpx;
}

.tree-line {
  width: 2rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #C6A15B, #27384A);
  margin-bottom: 16rpx;
}

.tree-symbol {
  font-size: 48rpx;
  color: #C6A15B;
  margin-bottom: 16rpx;
}

.tree-dots {
  position: relative;
  width: 120rpx;
  height: 60rpx;
  margin-bottom: 16rpx;
}

.tree-dot {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #C6A15B;
}

.tree-dot-1 {
  left: 0;
  top: 0;
}

.tree-dot-2 {
  left: 28rpx;
  top: 20rpx;
}

.tree-dot-3 {
  left: 56rpx;
  top: 0;
}

.tree-dot-4 {
  left: 84rpx;
  top: 20rpx;
}

.tree-dot-5 {
  left: 56rpx;
  top: 52rpx;
}

.tree-name {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #D8C27A;
  letter-spacing: 4rpx;
}

.tree-subname {
  display: block;
  font-size: 24rpx;
  color: #66727F;
  margin-top: 8rpx;
}

.section {
  padding: 48rpx 40rpx 24rpx;
  background: #0B1118;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #F2F4F6;
}

.worlds-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 8rpx 20rpx;
  background: #0B1118;
}

.world-card {
  width: 320rpx;
  margin: 12rpx;
  padding: 28rpx;
  background: #172230;
  border: 2rpx solid #27384A;
  border-radius: 12rpx;
  box-sizing: border-box;
}

.world-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #F2F4F6;
  margin-bottom: 6rpx;
}

.world-name-en {
  display: block;
  font-size: 24rpx;
  color: #C6A15B;
  margin-bottom: 16rpx;
}

.world-type {
  display: block;
  font-size: 22rpx;
  color: #66727F;
  margin-bottom: 12rpx;
}

.world-desc {
  display: block;
  font-size: 26rpx;
  color: #A8B3BD;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.progress-bar {
  height: 6rpx;
  background: #27384A;
  border-radius: 3rpx;
  margin-bottom: 10rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 3rpx;
}

.progress-text {
  display: block;
  font-size: 20rpx;
  color: #66727F;
  text-align: right;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  padding: 8rpx 20rpx;
  background: #0B1118;
}

.recommend-card {
  margin: 12rpx 0;
  padding: 32rpx 28rpx;
  background: #172230;
  border: 2rpx solid #27384A;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommend-label {
  font-size: 28rpx;
  color: #A8B3BD;
}

.recommend-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #C6A15B;
}

.bottom-space {
  height: 200rpx;
  background: #0B1118;
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
  color: #66727F;
}

.tab-item.active .tab-icon-box {
  color: #C6A15B;
}

.tab-label {
  display: block;
  height: 24rpx;
  line-height: 24rpx;
  font-size: 22rpx;
  color: #66727F;
  text-align: center;
}

.tab-item.active .tab-label {
  color: #C6A15B;
}

.css-icon {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  color: inherit;
  box-sizing: border-box;
  transform-origin: center center;
}

.css-icon::before,
.css-icon::after {
  box-sizing: border-box;
  color: inherit;
}

.icon-home::before {
  content: '';
  position: absolute;
  left: 7rpx;
  top: 6rpx;
  width: 18rpx;
  height: 18rpx;
  border-left: 3rpx solid;
  border-top: 3rpx solid;
  transform: rotate(45deg);
  border-radius: 2rpx;
  color: inherit;
}

.icon-home::after {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 17rpx;
  width: 16rpx;
  height: 11rpx;
  border: 3rpx solid;
  border-top: none;
  border-radius: 2rpx;
  color: inherit;
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
</style>