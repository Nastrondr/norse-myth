<template>
  <view class="page">
    <scroll-view class="scroll-view" scroll-y>
      <view class="hero-section">
        <text class="hero-title">九界探索</text>
        <text class="hero-desc">沿世界树的枝干，进入诸神、巨人与亡者的国度。</text>
        <view class="tree-card">
          <text class="tree-label">YGGDRASIL</text>
          <view class="tree-visual-center">
            <view class="tree-trunk"></view>
            <view class="tree-branch tree-branch-left"></view>
            <view class="tree-branch tree-branch-right"></view>
            <view class="tree-crown"></view>
          </view>
          <text class="tree-name">世界树</text>
        </view>
      </view>

      <view class="progress-section">
        <view class="progress-simple">
          <text class="progress-title">世界树探索 {{ worldTreeProgress.totalProgress }}%</text>
          <view class="progress-line">
            <view class="progress-line-fill" :style="{ width: worldTreeProgress.totalProgress + '%' }"></view>
          </view>
        </view>
      </view>

      <view class="task-section">
        <view class="task-card-header">
          <view class="task-header-info">
            <text class="task-header-title">今日任务</text>
            <text class="task-header-desc">完成今日探索，让世界树亮起新的枝干。</text>
          </view>
          <text class="task-count">{{ getCompletedTaskCount() }}/{{ dailyTasks.length }}</text>
        </view>
        <view class="task-list">
          <view
            v-for="task in dailyTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <view class="task-marker">
              <view class="marker-diamond"></view>
            </view>
            <view class="task-content">
              <text class="task-title">{{ task.title }}</text>
              <text class="task-reward">{{ task.completed ? '已领取' : task.reward }}</text>
            </view>
            <view class="task-btn" @click="handleTaskAction(task)">
              <text>{{ task.completed ? '已完成' : task.actionText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">世界树下的九界</text>
        <text class="section-desc">选择一个国度，开启对应的神话路径。</text>
      </view>

      <view class="worlds-grid">
        <view class="world-card" v-for="(world, index) in worlds" :key="index" @click="enterWorld(world)" :class="world.progress >= 50 ? 'high-progress' : ''">
          <view v-if="world.progress > 0" class="world-status-dot" :style="{ opacity: world.progress / 100 + 0.3 }"></view>
          <text class="world-name">{{ world.name }}</text>
          <text class="world-name-en">{{ world.nameEn }}</text>
          <text class="world-desc">{{ world.desc }}</text>
          <view class="world-progress-bar">
            <view class="world-progress-fill" :style="{ width: world.progress + '%' }"></view>
          </view>
          <text class="world-progress-text">{{ world.progress }}%</text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">今日神谕</text>
      </view>

      <view class="oracle-card">
        <view class="oracle-row" v-for="(item, index) in recommends" :key="index">
          <text class="oracle-label">{{ item.label }}</text>
          <text class="oracle-value">{{ item.value }}</text>
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
        <text class="tab-label">档案</text>
      </view>
    </view>

    <view
      v-if="isEnteringWorld"
      class="world-enter-overlay"
    >
      <view class="world-enter-bg"></view>

      <view class="world-gate">
        <view class="gate-ring gate-ring-outer">
          <text
            v-for="(rune, index) in enterRunes"
            :key="'outer-' + index"
            class="gate-rune"
            :style="getGateRuneStyle(index, enterRunes.length)"
          >
            {{ rune }}
          </text>
        </view>

        <view class="gate-ring gate-ring-inner"></view>

        <view class="gate-core">
          <text class="gate-label">正在进入</text>
          <text class="gate-world-name">{{ enteringWorld && enteringWorld.name }}</text>
          <text class="gate-world-original">{{ enteringWorld && enteringWorld.originalName }}</text>
        </view>
      </view>

      <text class="gate-hint">
        {{ getWorldEnterHint(enteringWorld) }}
      </text>
    </view>
  </view>
  <view class="bgm-control">
    <view 
      class="bgm-toggle" 
      :class="{ active: bgmEnabled }" 
      @click="handleToggleBgm"
    >
      <view class="toggle-dot"></view>
    </view>

    <view class="volume-entry" @click="openVolumePanel">
      <text>{{ getVolumePercent() }}%</text>
    </view>
  </view>

  <view 
    v-if="volumePanelVisible" 
    class="volume-mask" 
    @click="closeVolumePanel"
  >
    <view class="volume-panel" @click.stop>
      <text class="volume-title">音量</text>

      <view 
        class="volume-track" 
        @pointerdown.stop="handleVolumePointer" 
        @pointermove.stop="handleVolumePointer"
        @mousedown.stop="handleVolumeMouseDown" 
        @click.stop="handleVolumePointer"
      >
        <view 
          class="volume-fill" 
          :style="{ height: getSafeVolumePercent() + '%' }"
        ></view>
        <view 
          class="volume-thumb" 
          :style="{ bottom: getSafeVolumePercent() + '%' }"
        ></view>
      </view>

      <text class="volume-percent">{{ getSafeVolumePercent() }}%</text>
    </view>
  </view>
</template>

<script>
import { initAudio, getBgmEnabled, toggleBgm, getBgmVolume, setBgmVolume } from '../../utils/audioManager.js'

export default {
  data() {
    return {
      bgmEnabled: false,
      volumePanelVisible: false,
      bgmVolume: 0.45,
      isDraggingVolume: false,
      worlds: [
        { id: 'asgard', name: '阿斯加德', nameEn: 'Asgard', type: '神域', desc: '奥丁与阿萨神族的居所', progress: 85 },
        { id: 'midgard', name: '米德加德', nameEn: 'Midgard', type: '人域', desc: '人类与生物的中庭世界', progress: 92 },
        { id: 'jotunheim', name: '约顿海姆', nameEn: 'Jotunheim', type: '巨人国', desc: '霜巨人之国', progress: 45 },
        { id: 'vanaheim', name: '华纳海姆', nameEn: 'Vanaheim', type: '神域', desc: '华纳神族的领地', progress: 30 },
        { id: 'alfheim', name: '亚尔夫海姆', nameEn: 'Alfheim', type: '精灵国', desc: '光明精灵的家园', progress: 55 },
        { id: 'svartalfheim', name: '斯瓦塔尔夫海姆', nameEn: 'Svartalfheim', type: '矮人国', desc: '黑暗精灵与矮人的锻炉', progress: 20 },
        { id: 'niflheim', name: '尼福尔海姆', nameEn: 'Niflheim', type: '雾国', desc: '冰冷的雾之国', progress: 15 },
        { id: 'muspelheim', name: '穆斯贝尔海姆', nameEn: 'Muspelheim', type: '火国', desc: '苏尔特尔的火焰之国', progress: 10 },
        { id: 'helheim', name: '赫尔海姆', nameEn: 'Helheim', type: '冥府', desc: '亡者之地', progress: 25 }
      ],
      worldTreeProgress: {
        totalProgress: 36,
        realms: { current: 3, total: 9 },
        gods: { current: 6, total: 12 },
        creatures: { current: 8, total: 20 },
        stories: { current: 5, total: 18 },
        runes: { current: 4, total: 24 }
      },
      dailyTasks: [
        {
          id: 'enter-realm',
          title: '进入一个国度',
          desc: '沿世界树枝干探索一个九界国度',
          reward: '世界树经验 +10',
          type: 'realm',
          completed: false,
          actionText: '去探索'
        },
        {
          id: 'read-story',
          title: '阅读一则神话故事',
          desc: '从时间轴中选择一个事件继续阅读',
          reward: '故事碎片 +1',
          type: 'story',
          completed: false,
          actionText: '去阅读'
        },
        {
          id: 'unlock-clue',
          title: '发现一个未知线索',
          desc: '查看图鉴中尚未解锁的神话存在',
          reward: '图鉴线索 +1',
          type: 'bestiary',
          completed: false,
          actionText: '去图鉴'
        },
        {
          id: 'rune-divination',
          title: '完成一次三符文占卜',
          desc: '抽取过去、现在与未来的卢恩',
          reward: '卢恩回响 +1',
          type: 'rune',
          completed: false,
          actionText: '去占卜'
        }
      ],
      recommends: [
        { label: '今日神祇', value: '奥丁' },
        { label: '今日故事', value: '巴德尔之死' },
        { label: '今日卢恩', value: 'Ansuz' }
      ],
      isEnteringWorld: false,
      enteringWorld: null,
      enterTimer: null,
      enterRunes: ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ'],
      storageKeys: {
        dailyTasks: 'norse_daily_tasks',
        worldTreeProgress: 'norse_world_tree_progress'
      }
    }
  },
  mounted() {
    this.bgmEnabled = getBgmEnabled()
    const safeVolume = getBgmVolume()
    setBgmVolume(safeVolume)
    this.bgmVolume = safeVolume
    initAudio()
    this.loadHomeProgress()
  },
  beforeUnmount() {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer)
    }
  },
  methods: {
    handleToggleBgm() {
      this.bgmEnabled = toggleBgm()
      uni.showToast({
        title: this.bgmEnabled ? '乐声已开启' : '乐声已关闭',
        icon: 'none'
      })
    },
    openVolumePanel() {
      this.volumePanelVisible = true
    },
    closeVolumePanel() {
      this.volumePanelVisible = false
    },
    getSafeVolume() {
      const n = Number(this.bgmVolume)
      if (!Number.isFinite(n)) return 0.45
      return Math.max(0, Math.min(1, n))
    },
    getSafeVolumePercent() {
      return Math.round(this.getSafeVolume() * 100)
    },
    updateVolumeByClientY(clientY) {
      if (!Number.isFinite(Number(clientY))) return

      const query = uni.createSelectorQuery().in(this)
      query.select('.volume-track').boundingClientRect(rect => {
        if (!rect || !Number.isFinite(Number(rect.height)) || rect.height <= 0) return
        if (!Number.isFinite(Number(rect.top)) || !Number.isFinite(Number(rect.bottom))) return

        const offset = rect.bottom - clientY
        let ratio = offset / rect.height

        if (!Number.isFinite(Number(ratio))) return

        ratio = Math.max(0, Math.min(1, ratio))

        this.bgmVolume = setBgmVolume(ratio)
      }).exec()
    },
    handleVolumePointer(e) {
      const event = e && e.detail && e.detail.clientY !== undefined ? e.detail : e

      const clientY =
        event && Number.isFinite(Number(event.clientY))
          ? Number(event.clientY)
          : event && event.touches && event.touches[0]
            ? Number(event.touches[0].clientY)
            : event && event.changedTouches && event.changedTouches[0]
              ? Number(event.changedTouches[0].clientY)
              : NaN

      if (!Number.isFinite(clientY)) return

      this.updateVolumeByClientY(clientY)
    },
    handleVolumeMouseDown(e) {
      this.isDraggingVolume = true
      this.handleVolumePointer(e)

      if (typeof window === 'undefined') return

      const moveHandler = event => {
        if (!this.isDraggingVolume) return
        this.updateVolumeByClientY(Number(event.clientY))
      }

      const upHandler = () => {
        this.isDraggingVolume = false
        window.removeEventListener('mousemove', moveHandler)
        window.removeEventListener('mouseup', upHandler)
      }

      window.addEventListener('mousemove', moveHandler)
      window.addEventListener('mouseup', upHandler)
    },
    goToWorldDetail(world) {
      if (!world || !world.id) return
      uni.navigateTo({
        url: `/pages/world/world-detail?id=${world.id}`
      })
    },
    enterWorld(world) {
      if (!world || !world.id || this.isEnteringWorld) return
      this.isEnteringWorld = true
      this.enteringWorld = world
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
      }
      this.enterTimer = setTimeout(() => {
        uni.navigateTo({
          url: `/pages/world/world-detail?id=${world.id}`
        })
        setTimeout(() => {
          this.isEnteringWorld = false
          this.enteringWorld = null
        }, 300)
      }, 1200)
    },
    getGateRuneStyle(index, total) {
      const angle = (360 / total) * index - 90
      const radius = 44
      const x = 50 + radius * Math.cos(angle * Math.PI / 180)
      const y = 50 + radius * Math.sin(angle * Math.PI / 180)
      return {
        left: x + '%',
        top: y + '%',
        transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`
      }
    },
    getWorldEnterHint(world) {
      if (!world || !world.id) return '世界树的枝干正在展开。'
      const hints = {
        asgard: '沿彩虹桥升入诸神的高天国度。',
        midgard: '回到人类与生灵共同居住的中庭世界。',
        jotunheim: '霜风正在引向巨人的边境。',
        vanaheim: '古老的丰饶与魔法在雾中显现。',
        alfheim: '林间微光正在打开通往精灵国度的道路。',
        svartalfheim: '地下炉火与锻造声从黑暗深处传来。',
        niflheim: '寒雾与冰霜正在吞没前路。',
        muspelheim: '火焰之国的边界正在燃起。',
        helheim: '亡者之路在冷寂中缓缓展开。'
      }
      return hints[world.id] || '世界树的枝干正在展开。'
    },
    handleTaskAction(task) {
      if (!task) return
      if (task.completed) {
        uni.showToast({
          title: '今日已完成',
          icon: 'none'
        })
        return
      }
      const routes = {
        realm: '/pages/world/world-detail?id=asgard',
        story: '/pages/stories/story-list',
        bestiary: '/pages/bestiary/bestiary-list',
        rune: '/pages/fun/rune-divination'
      }
      const url = routes[task.type]
      this.completeTask(task.id)
      if (url) {
        uni.navigateTo({ url })
      } else {
        uni.showToast({
          title: '功能正在开发中',
          icon: 'none'
        })
      }
    },
    loadHomeProgress() {
      const savedTasks = uni.getStorageSync(this.storageKeys.dailyTasks)
      const savedProgress = uni.getStorageSync(this.storageKeys.worldTreeProgress)
      if (savedTasks && Array.isArray(savedTasks)) {
        this.dailyTasks = savedTasks
      }
      if (savedProgress && typeof savedProgress === 'object') {
        this.worldTreeProgress = {
          ...this.worldTreeProgress,
          ...savedProgress
        }
      }
      this.recalculateTotalProgress()
    },
    saveHomeProgress() {
      uni.setStorageSync(this.storageKeys.dailyTasks, this.dailyTasks)
      uni.setStorageSync(this.storageKeys.worldTreeProgress, this.worldTreeProgress)
    },
    completeTask(taskId) {
      const task = this.dailyTasks.find(item => item.id === taskId)
      if (!task || task.completed) return
      task.completed = true
      this.applyTaskReward(task)
      this.recalculateTotalProgress()
      this.saveHomeProgress()
      uni.showToast({
        title: '任务已完成',
        icon: 'none'
      })
    },
    applyTaskReward(task) {
      if (!task) return
      if (task.type === 'realm') {
        this.worldTreeProgress.realms.current = Math.min(
          this.worldTreeProgress.realms.current + 1,
          this.worldTreeProgress.realms.total
        )
      }
      if (task.type === 'story') {
        this.worldTreeProgress.stories.current = Math.min(
          this.worldTreeProgress.stories.current + 1,
          this.worldTreeProgress.stories.total
        )
      }
      if (task.type === 'bestiary') {
        this.worldTreeProgress.creatures.current = Math.min(
          this.worldTreeProgress.creatures.current + 1,
          this.worldTreeProgress.creatures.total
        )
      }
      if (task.type === 'rune') {
        this.worldTreeProgress.runes.current = Math.min(
          this.worldTreeProgress.runes.current + 1,
          this.worldTreeProgress.runes.total
        )
      }
    },
    recalculateTotalProgress() {
      const p = this.worldTreeProgress
      const total =
        p.realms.total +
        p.gods.total +
        p.creatures.total +
        p.stories.total +
        p.runes.total
      const current =
        p.realms.current +
        p.gods.current +
        p.creatures.current +
        p.stories.current +
        p.runes.current
      p.totalProgress = Math.min(100, Math.round((current / total) * 100))
    },
    getCompletedTaskCount() {
      return this.dailyTasks.filter(item => item.completed).length
    },
    resetDailyTasks() {
      this.dailyTasks = this.dailyTasks.map(item => ({
        ...item,
        completed: false
      }))
      uni.removeStorageSync(this.storageKeys.dailyTasks)
      uni.removeStorageSync(this.storageKeys.worldTreeProgress)
      this.recalculateTotalProgress()
      uni.showToast({
        title: '已重置',
        icon: 'none'
      })
    },
    goToTab(tab) {
      const routes = {
        gods: '/pages/gods/god-list',
        stories: '/pages/stories/story-list',
        bestiary: '/pages/bestiary/bestiary-list',
        fun: '/pages/profile/profile'
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

.hero-section {
  padding: 56rpx 32rpx 28rpx;
  text-align: center;
  background: radial-gradient(circle at 50% 38%, rgba(198,161,91,0.10), transparent 38%), #0B1118;
}

.hero-title {
  display: block;
  font-size: 54rpx;
  font-weight: 900;
  color: #C6A15B;
  letter-spacing: 4rpx;
}

.hero-desc {
  display: block;
  margin-top: 18rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
}

.tree-card {
  width: 450rpx;
  height: 570rpx;
  margin: 36rpx auto 0;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 42rpx;
  box-sizing: border-box;
}

.tree-visual-center {
  position: relative;
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tree-trunk {
  width: 9rpx;
  height: 180rpx;
  background: linear-gradient(180deg, #C6A15B, #27384A);
}

.tree-branch {
  position: absolute;
  width: 90rpx;
  height: 6rpx;
  background: linear-gradient(90deg, transparent, #C6A15B);
}

.tree-branch-left {
  left: calc(50% - 45rpx);
  top: 50%;
  transform: rotate(-30deg);
  transform-origin: left center;
}

.tree-branch-right {
  right: calc(50% - 45rpx);
  top: 50%;
  transform: rotate(30deg);
  transform-origin: right center;
}

.tree-crown {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid rgba(198,161,91,0.42);
  border-radius: 50%;
}

.tree-label {
  color: #66727F;
  font-size: 30rpx;
  letter-spacing: 4rpx;
}

.tree-name {
  color: #D8C27A;
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.progress-section {
  margin-top: 36rpx;
  padding: 0 32rpx;
}

.progress-simple {
  padding: 20rpx 0;
}

.progress-title {
  color: #C6A15B;
  font-size: 28rpx;
  font-weight: 700;
}

.progress-line {
  height: 8rpx;
  background: #27384A;
  border-radius: 4rpx;
  margin-top: 16rpx;
  overflow: hidden;
}

.progress-line-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 4rpx;
}

.section {
  margin-top: 36rpx;
  padding: 0 32rpx 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #F2F4F6;
}

.section-desc {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 24rpx;
}

.worlds-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 8rpx 20rpx;
  justify-content: space-between;
}

.world-card {
  width: calc(50% - 24rpx);
  min-height: 220rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
  padding: 24rpx;
  box-sizing: border-box;
  position: relative;
}

.world-card.high-progress {
  border-color: rgba(198,161,91,0.42);
}

.world-card:active {
  transform: scale(0.98);
  border-color: rgba(198,161,91,0.55);
}

.world-status-dot {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #C6A15B;
}

.world-name {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #F2F4F6;
}

.world-name-en {
  display: block;
  color: #C6A15B;
  font-size: 22rpx;
  margin-top: 4rpx;
}

.world-desc {
  display: block;
  margin-top: 12rpx;
  color: #A8B3BD;
  font-size: 22rpx;
  line-height: 1.4;
}

.world-progress-bar {
  height: 8rpx;
  background: #27384A;
  border-radius: 4rpx;
  margin-top: 16rpx;
  overflow: hidden;
}

.world-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 4rpx;
}

.world-progress-text {
  display: block;
  margin-top: 8rpx;
  color: #66727F;
  font-size: 20rpx;
  text-align: right;
}

.oracle-card {
  margin: 0 32rpx 36rpx;
  padding: 24rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
}

.oracle-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1px solid rgba(39,56,74,0.5);
}

.oracle-row:last-child {
  border-bottom: none;
}

.oracle-label {
  color: #66727F;
  font-size: 24rpx;
}

.oracle-value {
  color: #C6A15B;
  font-size: 24rpx;
  font-weight: 700;
}

.task-section {
  margin-top: 36rpx;
  padding: 0 32rpx;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.task-header-title {
  color: #F2F4F6;
  font-size: 32rpx;
  font-weight: 700;
}

.task-header-desc {
  display: block;
  margin-top: 6rpx;
  color: #A8B3BD;
  font-size: 22rpx;
}

.task-count {
  color: #C6A15B;
  font-size: 28rpx;
  font-weight: 700;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 20rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 16rpx;
  min-height: 104rpx;
}

.task-item.completed {
  opacity: 0.68;
  border-color: rgba(124,140,116,0.5);
}

.task-marker {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.marker-diamond {
  width: 16rpx;
  height: 16rpx;
  background: #C6A15B;
  transform: rotate(45deg);
}

.task-item.completed .marker-diamond {
  background: #7C8C74;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  display: block;
  color: #F2F4F6;
  font-size: 26rpx;
  font-weight: 700;
}

.task-reward {
  display: block;
  margin-top: 4rpx;
  color: #C6A15B;
  font-size: 20rpx;
}

.task-item.completed .task-reward {
  color: #7C8C74;
}

.task-btn {
  min-width: 96rpx;
  height: 52rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.16);
  border: 1px solid rgba(198,161,91,0.42);
  color: #C6A15B;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-item.completed .task-btn {
  background: rgba(124,140,116,0.16);
  border-color: rgba(124,140,116,0.38);
  color: #7C8C74;
}

.bottom-space {
  height: 180rpx;
  background: #0B1118;
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

.world-card:active {
  transform: scale(0.98);
  border-color: rgba(198, 161, 91, 0.55);
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

.dashboard-card {
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 24rpx;
  padding: 28rpx;
  margin: 28rpx 32rpx;
  box-sizing: border-box;
}

.module-title {
  display: block;
  color: #F2F4F6;
  font-size: 32rpx;
  font-weight: 800;
}

.module-desc {
  display: block;
  margin-top: 8rpx;
  color: #A8B3BD;
  font-size: 24rpx;
  line-height: 1.5;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  align-items: baseline;
}

.progress-percent {
  color: #C6A15B;
  font-size: 36rpx;
  font-weight: 800;
}

.main-progress {
  width: 100%;
  height: 12rpx;
  margin-top: 26rpx;
  background: #0B1118;
  border-radius: 999rpx;
  overflow: hidden;
}

.main-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
}

.progress-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 24rpx;
}

.progress-item {
  width: calc(50% - 7rpx);
  background: rgba(11,17,24,0.58);
  border: 1px solid rgba(39,56,74,0.72);
  border-radius: 16rpx;
  padding: 18rpx;
  box-sizing: border-box;
}

.progress-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
}

.progress-value {
  display: block;
  margin-top: 8rpx;
  color: #F2F4F6;
  font-size: 26rpx;
  font-weight: 700;
}

.task-section {
  margin: 32rpx;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-top: 18rpx;
  padding: 22rpx;
  background: #172230;
  border: 1px solid #27384A;
  border-radius: 20rpx;
  box-sizing: border-box;
}

.task-card.completed {
  opacity: 0.68;
  border-color: rgba(124,140,116,0.5);
}

.task-card.completed .task-action {
  background: rgba(124,140,116,0.16);
  border-color: rgba(124,140,116,0.38);
  color: #7C8C74;
}

.task-count {
  display: block;
  margin-top: 12rpx;
  color: #C6A15B;
  font-size: 26rpx;
  font-weight: 700;
}

.reset-task {
  margin-top: 24rpx;
  padding: 12rpx;
  text-align: center;
}

.reset-task-text {
  color: #66727F;
  font-size: 22rpx;
}

.reset-task:active .reset-task-text {
  color: #66727F;
  opacity: 0.6;
}

.task-main {
  flex: 1;
  min-width: 0;
}

.task-title {
  display: block;
  color: #F2F4F6;
  font-size: 26rpx;
  font-weight: 700;
}

.task-desc {
  display: block;
  margin-top: 6rpx;
  color: #A8B3BD;
  font-size: 22rpx;
  line-height: 1.45;
  white-space: normal;
  word-break: break-word;
}

.task-reward {
  display: block;
  margin-top: 8rpx;
  color: #C6A15B;
  font-size: 20rpx;
}

.task-action {
  min-width: 112rpx;
  height: 52rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.16);
  border: 1px solid rgba(198,161,91,0.42);
  color: #C6A15B;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

.world-enter-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0B1118;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.world-enter-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 42%, rgba(198, 161, 91, 0.16), transparent 32%),
    radial-gradient(circle at 50% 50%, rgba(143, 182, 217, 0.08), transparent 44%),
    #0B1118;
  animation: worldBgPulse 1.2s ease-in-out both;
}

.world-gate {
  position: relative;
  width: 520rpx;
  height: 520rpx;
  border-radius: 50%;
  z-index: 2;
  animation: gateAppear 0.42s ease-out both;
}

.gate-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.gate-ring-outer {
  border: 1px solid rgba(198, 161, 91, 0.45);
  animation: gateRotate 4.8s linear infinite;
}

.gate-ring-inner {
  inset: 86rpx;
  border: 1px solid rgba(216, 194, 122, 0.22);
  box-shadow: inset 0 0 48rpx rgba(198, 161, 91, 0.08), 0 0 42rpx rgba(198, 161, 91, 0.12);
  animation: gateRotateReverse 6s linear infinite;
}

.gate-rune {
  position: absolute;
  color: rgba(216, 194, 122, 0.86);
  font-size: 28rpx;
  line-height: 1;
  font-family: serif;
  text-shadow: 0 0 18rpx rgba(216, 194, 122, 0.28);
}

.gate-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 300rpx;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 3;
}

.gate-label {
  display: block;
  color: #66727F;
  font-size: 22rpx;
  letter-spacing: 4rpx;
}

.gate-world-name {
  display: block;
  margin-top: 16rpx;
  color: #F2F4F6;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1.2;
}

.gate-world-original {
  display: block;
  margin-top: 10rpx;
  color: #C6A15B;
  font-size: 26rpx;
}

.gate-hint {
  position: relative;
  z-index: 2;
  display: block;
  width: 88%;
  margin-top: 48rpx;
  color: #A8B3BD;
  font-size: 26rpx;
  line-height: 1.7;
  text-align: center;
  animation: hintFadeUp 0.55s ease-out 0.18s both;
}

@keyframes gateAppear {
  0% {
    opacity: 0;
    transform: scale(0.82);
    filter: blur(8rpx);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes gateRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes gateRotateReverse {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@keyframes worldBgPulse {
  0% {
    opacity: 0;
    transform: scale(1.04);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes hintFadeUp {
  0% {
    opacity: 0;
    transform: translateY(16rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.bgm-control {
  position: fixed;
  right: 24rpx;
  bottom: 150rpx;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.bgm-toggle {
  width: 88rpx;
  height: 50rpx;
  border-radius: 999rpx;
  background: rgba(11,17,24,0.82);
  border: 2rpx solid rgba(102,114,127,0.48);
  backdrop-filter: blur(8rpx);
  position: relative;
  transition: all 0.3s ease;
}

.bgm-toggle.active {
  border-color: rgba(198,161,91,0.68);
  background: rgba(198,161,91,0.15);
}

.toggle-dot {
  position: absolute;
  left: 4rpx;
  top: 50%;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #66727F;
  transform: translateY(-50%);
  transition: all 0.3s ease;
}

.bgm-toggle.active .toggle-dot {
  left: calc(100% - 46rpx);
  background: #C6A15B;
  box-shadow: 0 0 16rpx rgba(198,161,91,0.5);
}

.volume-entry {
  height: 60rpx;
  min-width: 70rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: rgba(11,17,24,0.82);
  border: 1px solid rgba(198,161,91,0.38);
  color: #C6A15B;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.volume-mask {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0,0,0,0.20);
}

.volume-panel {
  position: fixed;
  right: 28rpx;
  bottom: 230rpx;
  z-index: 9999;
  width: 132rpx;
  height: 360rpx;
  padding: 22rpx 0;
  border-radius: 28rpx;
  background: rgba(14,23,33,0.96);
  border: 1px solid rgba(198,161,91,0.36);
  box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.volume-title {
  color: #A8B3BD;
  font-size: 22rpx;
}

.volume-track {
  position: relative;
  width: 14rpx;
  height: 210rpx;
  margin-top: 22rpx;
  border-radius: 999rpx;
  background: #0B1118;
  overflow: visible;
  touch-action: none;
  cursor: pointer;
}

.volume-fill {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #D8C27A, #C6A15B);
  pointer-events: none;
}

.volume-thumb {
  position: absolute;
  left: 50%;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: #F2F4F6;
  border: 3rpx solid #C6A15B;
  transform: translate(-50%, 50%);
  box-shadow: 0 0 18rpx rgba(198,161,91,0.35);
  pointer-events: none;
}

.volume-percent {
  margin-top: 20rpx;
  color: #C6A15B;
  font-size: 22rpx;
  font-weight: 700;
}
</style>