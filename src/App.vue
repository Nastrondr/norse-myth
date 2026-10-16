<script>
import { storage } from '@/storage'
import { state } from '@/state'

export default {
  onLaunch() {
    // 尽早预热存储后端（idb 模式下载入 IndexedDB 并迁入 uni 旧数据；uni 模式为空操作）
    storage.ready().catch(() => {})
    // 恢复上次选择的主题（H5 通过 html data-theme 驱动 CSS 变量切换）
    // #ifdef H5
    document.documentElement.setAttribute('data-theme', state.get('settings.theme', 'dark'))
    // #endif
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
}
</script>

<style>

/* 碑文西文字体（网络不可用时自动降级 Georgia/serif） */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&display=swap');
/* ===== 主题 token =====
 * 深色（默认）= 现有墨蓝夜色；浅色 = 羊皮卷古籍风。
 * 切换机制：html[data-theme="light"] 覆盖变量，所有 var() 引用自动刷新。
 * --*-rgb 为同色 RGB 通道，供 rgba(var(--accent-rgb), 0.15) 形式的透明变体使用。
 */
:root {
  --bg-outer: #0B1118;
  --bg-card: #172230;
  --bg-elevated: #111A24;
  --bg-inset: #0B1118;
  --border-soft: #27384A;
  --border-faint: #1E2B3A;
  --border-strong: #3B4D63;
  --text-primary: #F2F4F6;
  --text-secondary: #A8B3BD;
  --text-muted: #66727F;
  --accent: #C6A15B;
  --accent-strong: #D8C27A;
  --ink-rune: #D8C27A;
  --shadow-card: 0 8rpx 32rpx rgba(0, 0, 0, 0.32);
  --accent-rgb: 198, 161, 91;
  --accent-strong-rgb: 216, 194, 122;
  --bg-outer-rgb: 11, 17, 24;
  --bg-inset-rgb: 11, 17, 24;
  --border-rgb: 39, 56, 74;
  --muted-rgb: 102, 114, 127;
  --text-primary-rgb: 242, 244, 246;
  --text-secondary-rgb: 168, 179, 189;
  --elevated-rgb: 17, 26, 36;
}

:root[data-theme="light"] {
  --bg-outer: #F0E6D2;
  --bg-card: #F6EEDC;
  --bg-elevated: #FAF3E1;
  --bg-inset: #E7DBC2;
  --border-soft: #D9C9A8;
  --border-faint: #E4D8BC;
  --border-strong: #B8966B;
  --text-primary: #2C2118;
  --text-secondary: #5C4E3C;
  --text-muted: #8A7B65;
  --accent: #8A6E2F;
  --accent-strong: #A8823C;
  --ink-rune: #5C3D14;
  --shadow-card: 0 8rpx 24rpx rgba(60, 42, 18, 0.10);
  --accent-rgb: 138, 110, 47;
  --accent-strong-rgb: 168, 130, 60;
  --bg-outer-rgb: 240, 230, 210;
  --bg-inset-rgb: 231, 219, 194;
  --border-rgb: 217, 201, 168;
  --muted-rgb: 138, 123, 101;
  --text-primary-rgb: 44, 33, 24;
  --text-secondary-rgb: 92, 78, 60;
  --elevated-rgb: 250, 243, 225;
  /* 称号墙徽记（浅色版：深金棕羊皮徽记） */
  --badge-tag-bg-top: #C9A662;
  --badge-tag-bg-bot: #8A6E2F;
  --badge-tag-text: #FAF3E1;
  --badge-tag-border: #5A4118;
  /* 称号浮雕文字（浅色版：深金浮雕） */
  --badge-name-top: #5C3D14;
  --badge-name-mid: #8A6E2F;
  --badge-name-bot: #A8823C;
  --badge-name-shadow: #2C2118;
}

page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-outer);
  color: var(--text-primary);
  transition: background-color 0.35s ease, color 0.35s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
}

/* ===== 史诗沉浸层：典籍排版 ===== */
/* 正文衬线栈：中文优先宋体系，西文 Georgia；与无衬线 UI 字形成「卷轴/器物」对比 */
.font-serif-body {
  font-family: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', Georgia, 'Times New Roman', serif;
}

/* 碑文式大标题：西文 display 用，配宽字距 */
.font-display {
  font-family: 'Cinzel', Georgia, 'Palatino Linotype', 'Songti SC', serif;
}

/* 金辉光（深色主题）/ 深棕投影（浅色主题） */
.text-glow-gold {
  text-shadow: 0 2rpx 16rpx rgba(var(--accent-rgb), 0.4);
}

/* 卢恩分隔符：章与章之间的仪式间隔 */
.rune-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  margin: 28rpx 0;
  color: var(--accent);
  opacity: 0.75;
  font-size: 24rpx;
  letter-spacing: 6rpx;
  font-family: serif;
}

.rune-divider::before,
.rune-divider::after {
  content: '';
  height: 1rpx;
  width: 88rpx;
  background: linear-gradient(90deg, transparent, var(--accent-soft, rgba(var(--accent-rgb), 0.5)));
}

.rune-divider::after {
  background: linear-gradient(90deg, var(--accent-soft, rgba(var(--accent-rgb), 0.5)), transparent);
}

view {
  color: var(--text-primary);
}

text {
  color: var(--text-primary);
}

image {
  display: block;
}

/* 隐藏 uni-app 原生 tabBar，由自定义 TabBar 组件接管 */
uni-tabbar,
.uni-tabbar,
.uni-tabbar--bottom,
.uni-tabbar--top,
.uni-tabbar-border {
  display: none !important;
}

/* ===== 页面转场（全局复用） ===== */
/* 列表/Tab 页：纯淡入（页面内有 position: fixed 的 TabBar，transform 会破坏其定位） */
.page-enter {
  animation: pageFadeIn 0.28s ease-out backwards;
}

/* 详情/功能页：上浮 + 轻微放大，营造「展开」感 */
.page-enter-deep {
  animation: pageRiseIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

/* ===== 列表交错入场（配合行内 animation-delay 控制顺序） ===== */
.stagger-item {
  animation: staggerFadeUp 0.4s ease-out backwards;
}

@keyframes pageFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pageRiseIn {
  from { opacity: 0; transform: translateY(32rpx) scale(0.985); }
  to { opacity: 1; transform: none; }
}

@keyframes staggerFadeUp {
  from { opacity: 0; transform: translateY(24rpx); }
  to { opacity: 1; transform: none; }
}

/* ===== 自绘下拉刷新指示器（配合 pullRefresh mixin） ===== */
.pull-refresh-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  pointer-events: none;
  transition: transform 0.25s ease;
}

.pull-refresh-indicator.dragging {
  transition: none;
}

.pull-rune {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2rpx solid rgba(var(--accent-rgb), 0.4);
  background: var(--bg-card);
  color: var(--accent);
  font-size: 34rpx;
  font-family: serif;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.35);
}

.pull-refresh-indicator.loading .pull-rune {
  animation: pullRuneSpin 0.9s linear infinite;
}

@keyframes pullRuneSpin {
  to { transform: rotate(360deg); }
}

/* ===== 主 CTA 扫光（btn-shine）：周期性一道柔光扫过按钮 ===== */
.btn-shine {
  position: relative;
  overflow: hidden;
}

.btn-shine::after {
  content: '';
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: -60%;
  width: 45%;
  background: linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
  transform: skewX(-18deg) translateX(0);
  animation: btnShineSweep 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes btnShineSweep {
  0%, 60% { transform: skewX(-18deg) translateX(0); }
  100% { transform: skewX(-18deg) translateX(420%); }
}

/* 系统开启「减弱动态效果」时关闭入场动画 */
@media (prefers-reduced-motion: reduce) {
  .page-enter,
  .page-enter-deep,
  .story-detail-page.page-enter-deep,
  .stagger-item,
  .pull-refresh-indicator.loading .pull-rune,
  .btn-shine::after,
  .avatar-large {
    animation: none;
  }
}
</style>
