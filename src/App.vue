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
</style>
