<template>
  <view
    class="shelf-viewport"
    @touchstart="onTouchStart"
    @touchmove.stop="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @mousedown="onMouseDown"
  >
    <view class="shelf-stage">
      <view
        v-for="(badge, i) in badges"
        :key="badge.id"
        class="shelf-item"
        :class="{ sealed: !badge.unlocked, active: i === current }"
        :style="getItemStyle(i)"
        @click="onItemClick(i)"
      >
        <!-- 卡面装饰：暗色羊皮纸纹理 + 四角小三角 -->
        <view class="shelf-corner shelf-corner-tl" />
        <view class="shelf-corner shelf-corner-tr" />
        <view class="shelf-corner shelf-corner-bl" />
        <view class="shelf-corner shelf-corner-br" />

        <!-- 圆形分类徽记（已解锁显示对应图标的实心章，未解锁显示锁章） -->
        <view class="shelf-emblem" :class="'cat-' + badge.category">
          <Lock v-if="!badge.unlocked" :size="26" :stroke-width="2" />
          <component v-else :is="emblemMap[badge.category] || Compass" :size="28" :stroke-width="1.6" />
        </view>

        <!-- 称号铭文 + 装饰 -->
        <view class="shelf-inscription">
          <view class="badge-divider" :class="{ dim: !badge.unlocked }" />
          <text class="badge-name">{{ badge.name }}</text>
          <text class="badge-desc" v-if="badge.unlocked">{{ badge.desc }}</text>
        </view>

        <!-- 未解锁卡：进度条 -->
        <view class="shelf-progress" v-if="!badge.unlocked && badge.progress">
          <view class="shelf-progress-track">
            <view class="shelf-progress-fill" :style="{ width: getProgressPct(badge) + '%' }" />
          </view>
          <text class="shelf-progress-num">{{ badge.progress.current }}/{{ badge.progress.total }}</text>
        </view>
      </view>
    </view>

    <view class="shelf-dots" v-if="badges.length > 1">
      <view
        v-for="(badge, i) in badges"
        :key="'dot-' + badge.id"
        class="shelf-dot"
        :class="{ on: i === current }"
        @click="snapTo(i)"
      />
    </view>
  </view>
</template>

<script>
/**
 * BadgeShelf 展柜式称号墙
 *
 * 核心模型：所有卡片绝对定位于舞台中心，由浮点索引 pos 统一驱动：
 *   x = (i - pos) * step        水平位移（step < 卡宽，侧项向后堆叠）
 *   scale = 1 - 0.15 * |d|      距离衰减（下限 0.58）
 *   translateZ = -26 * |d| px   配合容器 perspective 形成 3D 纵深
 *   zIndex = 100 - ceil(|d|)*5  层级随距离降级
 * 拖拽时 pos 无过渡直接跟手；松手按速度外推落点后启用
 * cubic-bezier(0.22,1,0.36,1) 过渡吸附到整数索引。
 *
 * 卡片视觉（手游收集卡风格）：
 * - 已解锁：实色深蓝渐变卡底 + 金色称号 + 金色分隔线
 * - 未解锁（有进度）：去饱和卡底 + 锁标 + 进度条，称号名 + 进度可见
 */
import { Lock, Compass, Eye, Heart, Trophy } from 'lucide-vue-next'

const ITEM_W_RPX = 340   // 卡片宽度
const STEP_RPX = 150     // 相邻两位中心的水平间距（小于卡宽 → 堆叠露边）
const DEPTH_PX = 26      // 每级向后推移的像素
const FLING_MS = 240     // 惯性外推时间常量
const SNAP_MS = 520      // 吸附动画时长

export default {
  name: 'BadgeShelf',
  components: {
    Lock,
    Compass,
    Eye,
    Heart,
    Trophy
  },
  props: {
    badges: { type: Array, default: () => [] }
  },
  data() {
    return {
      pos: 0,        // 中心浮点索引
      current: 0,    // 吸附后的当前索引
      animating: false,
      dragging: false,
      moved: false,
      axis: '',      // 首帧轴向判定：'x' 接管 / 'y' 放行页面滚动
      startX: 0,
      startY: 0,
      startPos: 0,
      lastT: 0,
      lastX: 0,
      velocity: 0,   // px/ms，向右为正
      step: 1
    }
  },
  computed: {
    // 分类 → 图标组件映射（computed 避免 HMR 下 method hoist 抖动）
    emblemMap() {
      return {
        探索: Compass,
        智识: Eye,
        羁绊: Heart,
        进度: Trophy
      }
    }
  },
  watch: {
    // 存档导入等场景下列表可能变化，收敛越界的 pos
    badges() {
      this.snapTo(Math.min(this.current, this.badges.length - 1))
    }
  },
  mounted() {
    this.measure()
    // H5 桌面端：鼠标拖拽（快速移动会脱离元素，挂 document 上）
    if (typeof document !== 'undefined') {
      this._onDocMove = e => { if (this.dragging) this.handleMove(e.clientX) }
      this._onDocUp = () => { if (this.dragging) this.handleEnd() }
      document.addEventListener('mousemove', this._onDocMove)
      document.addEventListener('mouseup', this._onDocUp)
    }
  },
  beforeUnmount() {
    clearTimeout(this._settleTimer)
    if (typeof document !== 'undefined' && this._onDocMove) {
      document.removeEventListener('mousemove', this._onDocMove)
      document.removeEventListener('mouseup', this._onDocUp)
    }
  },
  methods: {
    measure() {
      // rpx→px 依赖屏宽，触摸/resize 时重测保证不同屏幕尺寸一致
      this.step = uni.upx2px(STEP_RPX) || STEP_RPX
    },
    getProgressPct(badge) {
      const p = badge.progress
      if (!p || !p.total) return 0
      return Math.min(100, Math.round((p.current / p.total) * 100))
    },
    beginDrag(x) {
      clearTimeout(this._settleTimer)
      this.animating = false // 抓取即停动画，从当前目标位继续
      this.dragging = true
      this.moved = false
      this.axis = ''
      this.startX = this.lastX = x
      this.startPos = this.pos
      this.lastT = Date.now()
      this.velocity = 0
    },
    handleMove(x) {
      const dx = x - this.startX
      if (!this.moved && Math.abs(dx) > 6) this.moved = true
      if (!this.moved) return
      // 速度采样：EMA 平滑 + 上限钳制，抑制单帧抖动与异常采样
      const now = Date.now()
      const dt = now - this.lastT
      if (dt > 0 && dt < 100) {
        const v = this.velocity * 0.6 + ((x - this.lastX) / dt) * 0.4
        this.velocity = Math.max(-3, Math.min(3, v))
      }
      this.lastT = now
      this.lastX = x
      // 边界橡皮筋：越界位移按 35% 衰减，松手自然回弹
      let pos = this.startPos - dx / this.step
      const min = 0
      const max = this.badges.length - 1
      if (pos < min) pos = min + (pos - min) * 0.35
      else if (pos > max) pos = max + (pos - max) * 0.35
      this.pos = pos
    },
    handleEnd() {
      if (!this.dragging) return
      this.dragging = false
      if (!this.moved) return // 未构成拖拽 → 交给 click
      // 惯性：按松手速度外推 FLING_MS 的位移，取整即落点
      const projected = this.pos - (this.velocity * FLING_MS) / this.step
      this.snapTo(projected)
    },
    snapTo(index) {
      const n = this.badges.length
      if (!n) return
      const target = Math.max(0, Math.min(n - 1, Math.round(index)))
      this.velocity = 0
      this.animating = true
      this.pos = target
      this.current = target
      clearTimeout(this._settleTimer)
      this._settleTimer = setTimeout(() => { this.animating = false }, SNAP_MS + 60)
    },
    // ===== 触摸（移动端）=====
    onTouchStart(e) {
      const t = e.touches && e.touches[0]
      if (!t) return
      this.measure()
      this.startY = t.clientY
      this.beginDrag(t.clientX)
    },
    onTouchMove(e) {
      const t = e.touches && e.touches[0]
      if (!t || !this.dragging) return
      // 首帧判定轴向：水平才接管并阻断页面滚动，垂直立即放行
      if (!this.axis) {
        const dx = t.clientX - this.startX
        const dy = t.clientY - this.startY
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          this.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        }
      }
      if (this.axis === 'x') {
        if (e.preventDefault) e.preventDefault()
        this.handleMove(t.clientX)
      } else if (this.axis === 'y') {
        this.dragging = false
      }
    },
    onTouchEnd() {
      this.handleEnd()
    },
    // ===== 鼠标（H5 桌面）=====
    onMouseDown(e) {
      this.measure()
      this.startY = e.clientY
      this.beginDrag(e.clientX)
    },
    onItemClick(i) {
      if (this.moved) return // 拖拽尾帧不触发点击
      if (i !== this.current) this.snapTo(i) // 点两侧卡片直接转至中心
    },
    getItemStyle(i) {
      const d = i - this.pos
      const ad = Math.abs(d)
      const scale = Math.max(0.58, 1 - 0.15 * ad)
      const depth = Math.round(Math.min(ad, 4) * DEPTH_PX)
      const x = d * this.step
      const style = {
        transform: 'translateX(' + x.toFixed(1) + 'px) translateZ(' + (-depth) + 'px) scale(' + scale.toFixed(3) + ')',
        zIndex: 100 - Math.min(Math.ceil(ad), 10) * 5,
        transition: this.animating
          ? 'transform ' + SNAP_MS + 'ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease'
          : 'none'
      }
      // 视口外（3.2 位开外）不参与绘制，长列表也只渲染可见窗口
      if (ad > 3.2) style.visibility = 'hidden'
      return style
    }
  }
}
</script>

<style scoped>
.shelf-viewport {
  width: 100%;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

/* perspective 让 translateZ 产生近大远小 */
.shelf-stage {
  position: relative;
  height: 244rpx;
  perspective: 900px;
  perspective-origin: 50% 42%;
}

/* ===== 收集卡本体（实色底，不透出下层） ===== */
.shelf-item {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 340rpx;
  height: 244rpx;
  margin-left: -170rpx;
  margin-top: -122rpx;
  padding: 16rpx 22rpx;
  box-sizing: border-box;
  border-radius: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 已解锁卡：跨主题统一调性
   * 暗色版：宝石蓝（elevated 与 card 混用出层次）+ 金色描边
   * 浅色版：羊皮米色（card 与 inset 混用出层次）+ 金棕描边
   * 角向金辉与中心光晕跟随主题 accent，深色光晕强度适配浅色背景 */
  background:
    radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb), 0.20), transparent 55%),
    linear-gradient(168deg, var(--bg-elevated) 0%, var(--bg-card) 48%, var(--bg-inset) 100%);
  border: 2px solid var(--accent);
  box-shadow:
    inset 0 1px 0 rgba(var(--text-primary-rgb), 0.10),
    inset 0 0 0 1px rgba(var(--accent-rgb), 0.30),
    0 10rpx 22rpx rgba(var(--bg-outer-rgb), 0.5);
  will-change: transform;
  backface-visibility: hidden;
  cursor: pointer;
  overflow: hidden;
}

/* 顶部高光带 */
.shelf-item::before {
  content: '';
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 4rpx;
  height: 40%;
  background: linear-gradient(180deg, rgba(var(--text-primary-rgb), 0.18), rgba(var(--text-primary-rgb), 0));
  border-radius: 14rpx 14rpx 60% 60%;
  pointer-events: none;
}

/* 角向斜光带 */
.shelf-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 35%, rgba(var(--accent-rgb), 0.10) 50%, transparent 65%);
  pointer-events: none;
}

/* 暗色版专属：宝石蓝径向晕染 + 暗色版网格纹理（卡牌花纹） */
:root:not([data-theme="light"]) .shelf-item {
  background:
    radial-gradient(ellipse at 50% 30%, rgba(91, 138, 198, 0.25), transparent 60%),
    radial-gradient(ellipse at 50% 0%, rgba(var(--accent-rgb), 0.20), transparent 55%),
    linear-gradient(168deg, var(--bg-elevated) 0%, var(--bg-card) 48%, var(--bg-inset) 100%);
}

/* 浅色版专属：羊皮纸纹理（SVG 噪点感，用 radial-gradient 模拟细密颗粒） */
:root[data-theme="light"] .shelf-item {
  background:
    radial-gradient(circle at 20% 30%, rgba(184, 150, 107, 0.08) 0, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(184, 150, 107, 0.08) 0, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(138, 110, 47, 0.05) 0, transparent 50%),
    linear-gradient(168deg, var(--bg-elevated) 0%, var(--bg-card) 48%, var(--bg-inset) 100%);
}

/* 中心项：强化光晕 */
.shelf-item.active {
  border-color: var(--accent-strong);
  box-shadow:
    inset 0 1px 0 rgba(var(--text-primary-rgb), 0.18),
    inset 0 0 0 1px rgba(var(--accent-rgb), 0.50),
    0 26rpx 56rpx rgba(var(--bg-outer-rgb), 0.6),
    0 0 60rpx rgba(var(--accent-rgb), 0.35);
}

/* 未解锁（有进度）：去饱和卡 */
.shelf-item.sealed {
  background: linear-gradient(168deg, var(--bg-card) 0%, var(--bg-outer) 58%, var(--bg-inset) 100%);
  border: 1px solid var(--border-soft);
  box-shadow: inset 0 1px 0 rgba(var(--text-primary-rgb), 0.04), 0 8rpx 20rpx rgba(var(--bg-outer-rgb), 0.38);
}

.shelf-item.sealed::before,
.shelf-item.sealed::after {
  display: none;
}

/* ===== 四角装饰小三角（卡面「包边钉」感） ===== */
.shelf-corner {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid var(--accent);
  pointer-events: none;
  z-index: 2;
}

.shelf-corner-tl { top: 8rpx; left: 8rpx; border-right: none; border-bottom: none; border-top-left-radius: 4rpx; }
.shelf-corner-tr { top: 8rpx; right: 8rpx; border-left: none; border-bottom: none; border-top-right-radius: 4rpx; }
.shelf-corner-bl { bottom: 8rpx; left: 8rpx; border-right: none; border-top: none; border-bottom-left-radius: 4rpx; }
.shelf-corner-br { bottom: 8rpx; right: 8rpx; border-left: none; border-top: none; border-bottom-right-radius: 4rpx; }

.sealed .shelf-corner {
  border-color: var(--border-strong);
  opacity: 0.6;
}

/* ===== 中央分类徽记（实心圆章 + 图标） ===== */
.shelf-emblem {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
  background: var(--emblem-bg, #C9A662);
  color: var(--emblem-fg, #1A1306);
  border: 2rpx solid var(--accent-strong);
  box-shadow:
    inset 0 -4rpx 0 rgba(var(--bg-outer-rgb), 0.30),
    inset 0 3rpx 0 rgba(var(--text-primary-rgb), 0.45),
    0 6rpx 14rpx rgba(var(--bg-outer-rgb), 0.50),
    0 0 0 4rpx rgba(var(--accent-rgb), 0.08);
  z-index: 1;
}

/* 分类色：探索=金棕 智识=蓝 羁绊=粉 进度=金（用主题 accent + 微差变化，避免与背景抢眼） */
.shelf-emblem.cat-探索 { background: linear-gradient(160deg, #F1D88A 0%, #B8966B 100%); }
.shelf-emblem.cat-智识 { background: linear-gradient(160deg, #8FB6D9 0%, #4A6B8E 100%); color: #FAF3E1; }
.shelf-emblem.cat-羁绊 { background: linear-gradient(160deg, #D4A5B5 0%, #8A5F70 100%); color: #FAF3E1; }
.shelf-emblem.cat-进度 { background: linear-gradient(160deg, #F1D88A 0%, #8A6E2F 100%); }

/* 浅色版用统一羊皮调（图标更清晰） */
:root[data-theme="light"] .shelf-emblem {
  border-color: #5A4118;
}
:root[data-theme="light"] .shelf-emblem.cat-智识 { color: #FAF3E1; }
:root[data-theme="light"] .shelf-emblem.cat-羁绊 { color: #FAF3E1; }

/* 未解锁徽记：降为暗色锁章 */
.sealed .shelf-emblem {
  background: var(--bg-outer);
  color: var(--text-muted);
  border-color: var(--border-strong);
  box-shadow: inset 0 0 0 1rpx var(--border-soft);
}

/* ===== 铭文区（分线 + 称号 + 描述） ===== */
.shelf-inscription {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.badge-divider {
  width: 56rpx;
  height: 3rpx;
  margin-bottom: 6rpx;
  border-radius: 2rpx;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}

.badge-divider.dim {
  background: linear-gradient(90deg, transparent, var(--border-strong), transparent);
}

.badge-name {
  display: block;
  text-align: center;
  background: linear-gradient(180deg,
    var(--badge-name-top, #FFE9B8) 0%,
    var(--badge-name-mid, #F1D88A) 45%,
    var(--badge-name-bot, #C6A15B) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 28rpx;
  font-weight: 900;
  letter-spacing: 2rpx;
  line-height: 1.2;
  filter: drop-shadow(0 1rpx 0 var(--badge-name-shadow, #6B4A18)) drop-shadow(0 2rpx 2rpx rgba(var(--bg-outer-rgb), 0.5));
}

.sealed .badge-name {
  background: none;
  -webkit-text-fill-color: var(--text-secondary);
  color: var(--text-secondary);
  filter: none;
  font-size: 26rpx;
}

.badge-desc {
  display: block;
  margin-top: 6rpx;
  text-align: center;
  color: var(--text-secondary);
  font-size: 19rpx;
  line-height: 1.35;
  opacity: 0.92;
}

/* ===== 进度条（未解锁卡） ===== */
.shelf-progress {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 12rpx;
  z-index: 1;
}

.shelf-progress-track {
  flex: 1;
  height: 10rpx;
  border-radius: 999rpx;
  background: var(--bg-inset);
  border: 1px solid var(--border-soft);
  overflow: hidden;
}

.shelf-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, var(--bg-outer), var(--accent));
  transition: width 0.4s ease;
}

.shelf-progress-num {
  color: var(--text-muted);
  font-size: 18rpx;
  font-weight: 700;
  flex-shrink: 0;
}

/* ===== 指示点 ===== */
.shelf-dots {
  display: flex;
  justify-content: center;
  gap: 10rpx;
  margin-top: 20rpx;
}

.shelf-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(var(--border-rgb), 0.9);
  transition: width 0.25s ease, background 0.25s ease;
  cursor: pointer;
}

.shelf-dot.on {
  width: 28rpx;
  background: var(--accent);
}
</style>
