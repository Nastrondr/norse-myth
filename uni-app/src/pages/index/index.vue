<template>
  <view class="page page-enter">
    <scroll-view class="scroll-view" scroll-y>
      <PageHeader kicker="NINE REALMS" title="九界探索" subtitle="沿世界树的枝干，进入诸神、巨人与亡者的国度。" />
      <view class="hero-section">
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
          <view class="progress-title">世界树探索 <AnimNumber :value="worldTreeProgress.totalProgress" />%</view>
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
        <view
          class="world-card stagger-item"
          v-for="(world, index) in visibleWorlds"
          :key="world.id"
          :style="[
            { animationDelay: Math.min(index, 12) * 0.05 + 's' },
            world.mapImage
              ? { backgroundImage: 'linear-gradient(rgba(16,24,34,0.86), rgba(16,24,34,0.86)), url(' + world.mapImage + ')' }
              : null
          ]"
          @click="enterWorld(world)"
          :class="world.progress >= 50 ? 'high-progress' : ''"
        >
          <text class="world-rune">{{ world.rune }}</text>
          <view class="world-card-head">
            <text class="world-name">{{ world.name }}</text>
            <text class="world-name-en">{{ world.nameEn }}</text>
          </view>
          <text class="world-desc">{{ world.desc }}</text>
          <view class="world-progress-row">
            <view class="world-progress-bar">
              <view class="world-progress-fill" :style="{ width: world.progress + '%' }"></view>
            </view>
            <text class="world-progress-text">{{ world.progress }}%</text>
          </view>
        </view>
      </view>

      <view class="worlds-toggle" @click="toggleWorlds">
        <text class="worlds-toggle-text">{{ worldsExpanded ? '收起九界' : '探索更多' }}</text>
        <text class="worlds-toggle-arrow" :class="{ expanded: worldsExpanded }">∨</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <TabBar current="home" />

    <view
      v-if="isEnteringWorld"
      class="world-enter-overlay"
      @click="skipEnterWorld"
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
      <text class="gate-skip-hint">轻触任意处立即进入</text>
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
      <text>{{ getSafeVolumePercent() }}%</text>
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
        @touchstart.stop="handleVolumeTouchStart"
        @touchmove.stop="handleVolumeTouchMove"
        @touchend.stop="handleVolumeTouchEnd"
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
import { db } from '@/db'
import TabBar from '../../components/TabBar.vue'
import PageHeader from '../../components/PageHeader.vue'
import AnimNumber from '../../components/AnimNumber.vue'

export default {
  components: { TabBar, PageHeader, AnimNumber },
  data() {
    return {
      bgmEnabled: false,
      volumePanelVisible: false,
      bgmVolume: 0.45,
      isDraggingVolume: false,
      worldsExpanded: false,
      worlds: [
        { id: 'asgard', rune: 'ᚨ', name: '阿斯加德', nameEn: 'Asgard', type: '神域', desc: '奥丁与阿萨神族的居所', progress: 85 },
        { id: 'midgard', rune: 'ᛗ', name: '米德加德', nameEn: 'Midgard', type: '人域', desc: '人类与生物的中庭世界', progress: 92 },
        { id: 'jotunheim', rune: 'ᚦ', name: '约顿海姆', nameEn: 'Jotunheim', type: '巨人国', desc: '霜巨人之国', progress: 45 },
        { id: 'vanaheim', rune: 'ᚢ', name: '华纳海姆', nameEn: 'Vanaheim', type: '神域', desc: '华纳神族的领地', progress: 30 },
        { id: 'alfheim', rune: 'ᛚ', name: '亚尔夫海姆', nameEn: 'Alfheim', type: '精灵国', desc: '光明精灵的家园', progress: 55 },
        { id: 'svartalfheim', rune: 'ᚲ', name: '斯瓦塔尔夫海姆', nameEn: 'Svartalfheim', type: '矮人国', desc: '黑暗精灵与矮人的锻炉', progress: 20 },
        { id: 'niflheim', rune: 'ᚾ', name: '尼福尔海姆', nameEn: 'Niflheim', type: '雾国', desc: '冰冷的雾之国', progress: 15 },
        { id: 'muspelheim', rune: 'ᛊ', name: '穆斯贝尔海姆', nameEn: 'Muspelheim', type: '火国', desc: '苏尔特尔的火焰之国', progress: 10 },
        { id: 'helheim', rune: 'ᛉ', name: '赫尔海姆', nameEn: 'Helheim', type: '冥府', desc: '亡者之地', progress: 25 }
      ],
      worldTreeProgress: {
        totalProgress: 36,
        // 总数以数据库为准（单一事实源），current 为占位进度
        realms: { current: 3, total: db.count('realms') },
        gods: { current: 6, total: db.count('gods') },
        creatures: { current: 8, total: db.count('creatures') },
        stories: { current: 5, total: db.count('stories') },
        runes: { current: 4, total: db.count('runeDetails') }
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
        }
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
  computed: {
    visibleWorlds() {
      return this.worldsExpanded ? this.worlds : this.worlds.slice(0, 4)
    }
  },
  created() {
    // 手绘地图缩略图与九界数据同源：worlds 集合填好 mapImage 后，首页卡片自动带图
    db.findAll('worlds').forEach(source => {
      if (!source.mapImage) return
      const target = this.worlds.find(w => w.id === source.id)
      if (target) target.mapImage = source.mapImage
    })
  },
  onShow() {
    // 从其他页面返回时刷新任务与进度展示
    this.loadHomeProgress()
  },
  mounted() {
    this.bgmEnabled = getBgmEnabled()
    const safeVolume = getBgmVolume()
    setBgmVolume(safeVolume)
    this.bgmVolume = safeVolume
    // 只在用户曾开启过 BGM 时才预创建 audio context，
    // 避免浏览器 autoplay policy 触发 ERR_ABORTED
    if (this.bgmEnabled) {
      initAudio()
    }
    this.loadHomeProgress()
  },
  beforeUnmount() {
    if (this.enterTimer) {
      clearTimeout(this.enterTimer)
    }
  },
  methods: {
    toggleWorlds() {
      this.worldsExpanded = !this.worldsExpanded
    },
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
    handleVolumeTouchStart(e) {
      this.isDraggingVolume = true
      const touch = e.touches && e.touches[0]
      if (touch) {
        this.updateVolumeByClientY(Number(touch.clientY))
      }
    },
    handleVolumeTouchMove(e) {
      if (!this.isDraggingVolume) return
      const touch = e.touches && e.touches[0]
      if (touch) {
        this.updateVolumeByClientY(Number(touch.clientY))
      }
    },
    handleVolumeTouchEnd() {
      this.isDraggingVolume = false
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
        this.navigateToEnteringWorld()
      }, 1200)
    },
    skipEnterWorld() {
      if (!this.isEnteringWorld) return
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
      this.navigateToEnteringWorld()
    },
    navigateToEnteringWorld() {
      const world = this.enteringWorld
      if (this.enterTimer) {
        clearTimeout(this.enterTimer)
        this.enterTimer = null
      }
      this.isEnteringWorld = false
      this.enteringWorld = null
      if (world && world.id) {
        uni.navigateTo({
          url: `/pages/world/world-detail?id=${world.id}`
        })
      }
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
      // tabBar 页面必须用 switchTab，navigateTo 会跳转失败
      const tabRoutes = {
        story: '/pages/stories/story-list'
      }
      const pageRoutes = {
        realm: '/pages/world/world-detail?id=asgard',
        bestiary: '/pages/bestiary/bestiary-list'
      }
      this.completeTask(task.id)
      if (tabRoutes[task.type]) {
        uni.switchTab({ url: tabRoutes[task.type] })
      } else if (pageRoutes[task.type]) {
        uni.navigateTo({ url: pageRoutes[task.type] })
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
        // 以当前默认任务为基准，只同步完成状态，
        // 避免旧版本缓存（如已下线的任务）重新出现在列表中
        const completedMap = {}
        savedTasks.forEach(task => {
          if (task && task.id) {
            completedMap[task.id] = !!task.completed
          }
        })
        this.dailyTasks.forEach(task => {
          task.completed = !!completedMap[task.id]
        })
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
      // 延迟弹出，避免与页面跳转动画叠加导致用户错过反馈
      setTimeout(() => {
        uni.showToast({
          title: '任务已完成',
          icon: 'success'
        })
      }, 300)
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
  padding: 8rpx 32rpx 28rpx;
  text-align: center;
  background: #0B1118;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 8rpx 32rpx 0;
}

.world-card {
  position: relative;
  min-height: 208rpx;
  padding: 26rpx 24rpx 22rpx;
  background: linear-gradient(160deg, #1A2838, #141F2B);
  /* 配合内联 backgroundImage：手绘地图缩略图铺底，上面盖一层深色保证文字可读 */
  background-size: cover;
  background-position: center;
  border: 1px solid #27384A;
  border-radius: 22rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.world-card.high-progress {
  border-color: rgba(198,161,91,0.42);
  box-shadow: inset 0 0 40rpx rgba(198,161,91,0.05);
}

.world-card:active {
  transform: scale(0.97);
  border-color: rgba(198,161,91,0.55);
}

.world-rune {
  position: absolute;
  right: 14rpx;
  top: 2rpx;
  font-family: serif;
  font-size: 104rpx;
  line-height: 1;
  color: rgba(198,161,91,0.12);
  pointer-events: none;
  transition: color 0.18s ease;
}

.world-card.high-progress .world-rune {
  color: rgba(198,161,91,0.22);
}

.world-card-head {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  padding-right: 72rpx;
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
  font-size: 20rpx;
  letter-spacing: 1rpx;
}

.world-desc {
  display: block;
  margin-top: 12rpx;
  color: #A8B3BD;
  font-size: 22rpx;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.world-progress-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: auto;
  padding-top: 20rpx;
}

.world-progress-bar {
  flex: 1;
  height: 6rpx;
  background: rgba(39,56,74,0.9);
  border-radius: 3rpx;
  overflow: hidden;
}

.world-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C6A15B, #D8C27A);
  border-radius: 3rpx;
  transition: width 0.4s ease;
}

.world-progress-text {
  color: #66727F;
  font-size: 20rpx;
  flex-shrink: 0;
}

.world-card.high-progress .world-progress-text {
  color: #C6A15B;
}

.worlds-toggle {
  margin: 26rpx 32rpx 0;
  height: 84rpx;
  border-radius: 999rpx;
  border: 1px solid rgba(198,161,91,0.32);
  background: rgba(198,161,91,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: transform 0.15s ease, background 0.15s ease;
}

.worlds-toggle:active {
  transform: scale(0.97);
  background: rgba(198,161,91,0.16);
}

.worlds-toggle-text {
  color: #C6A15B;
  font-size: 26rpx;
  letter-spacing: 2rpx;
}

.worlds-toggle-arrow {
  color: #C6A15B;
  font-size: 24rpx;
  line-height: 1;
  transition: transform 0.25s ease;
}

.worlds-toggle-arrow.expanded {
  transform: rotate(180deg);
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
  min-width: 104rpx;
  height: 60rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(198,161,91,0.16);
  border: 1px solid rgba(198,161,91,0.42);
  color: #C6A15B;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.15s ease, background 0.15s ease;
}

.task-btn:active {
  transform: scale(0.94);
  background: rgba(198,161,91,0.3);
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

.gate-skip-hint {
  position: relative;
  z-index: 2;
  display: block;
  margin-top: 20rpx;
  color: rgba(102,114,127,0.9);
  font-size: 22rpx;
  letter-spacing: 2rpx;
  animation: hintFadeUp 0.55s ease-out 0.35s both;
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

.bgm-toggle:active .toggle-dot {
  transform: translateY(-50%) scale(0.9);
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
  min-width: 74rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(11,17,24,0.82);
  border: 1px solid rgba(198,161,91,0.38);
  color: #C6A15B;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background 0.15s ease;
}

.volume-entry:active {
  transform: scale(0.94);
  background: rgba(198,161,91,0.18);
}

.volume-mask {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0,0,0,0.20);
  animation: volumeMaskIn 0.2s ease-out both;
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
  animation: volumePanelIn 0.24s ease-out both;
}

@keyframes volumeMaskIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes volumePanelIn {
  from {
    opacity: 0;
    transform: translateY(24rpx) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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