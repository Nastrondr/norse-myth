<script>
export default {
  onLaunch() {
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
page {
  width: 100%;
  min-height: 100vh;
  background: #0B1118;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
}

view {
  color: #F2F4F6;
}

text {
  color: #F2F4F6;
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
  border: 2rpx solid rgba(198, 161, 91, 0.4);
  background: #172230;
  color: #C6A15B;
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
  .stagger-item,
  .pull-refresh-indicator.loading .pull-rune,
  .btn-shine::after {
    animation: none;
  }
}
</style>
