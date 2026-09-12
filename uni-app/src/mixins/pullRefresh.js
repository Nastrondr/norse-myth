// 自绘下拉刷新 Mixin：页面根节点绑定 onPullTouchStart/Move/End，
// 顶部放置 .pull-refresh-indicator（样式在 App.vue 全局定义），
// 松手超过阈值后调用页面的 onRefresh()，完成后 refreshTick +1 触发列表重挂载（重放交错入场）
export default {
	data() {
		return {
			pullStartX: 0,
			pullStartY: 0,
			pullAxis: '',
			pullActive: false,
			pullDistance: 0,
			pullLoading: false,
			refreshTick: 0
		}
	},
	computed: {
		// 指示器纵向位移：默认隐藏在屏幕上方，随下拉滑入，加载时固定可见
		pullIndicatorStyle() {
			const y = this.pullLoading ? 12 : Math.max(-76, this.pullDistance - 76)
			return { transform: 'translateY(' + y + 'px)' }
		},
		// 卢恩符号随下拉距离旋转
		pullRuneStyle() {
			if (this.pullLoading) return {}
			return { transform: 'rotate(' + this.pullDistance * 2.4 + 'deg)' }
		}
	},
	methods: {
		getPullScrollTop() {
			// #ifdef H5
			return window.pageYOffset || document.documentElement.scrollTop || 0
			// #endif
			// #ifndef H5
			return 0
			// #endif
		},
		onPullTouchStart(e) {
			if (this.pullLoading) return
			if (this.getPullScrollTop() > 2) return
			const t = e.touches && e.touches[0]
			if (!t) return
			this.pullStartX = t.clientX
			this.pullStartY = t.clientY
			this.pullAxis = ''
			this.pullActive = true
		},
		onPullTouchMove(e) {
			if (!this.pullActive || this.pullLoading) return
			const t = e.touches && e.touches[0]
			if (!t) return
			const dx = t.clientX - this.pullStartX
			const dy = t.clientY - this.pullStartY
			// 轴锁定：避免拦截横向滚动（如 tab 栏）
			if (!this.pullAxis) {
				if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return
				this.pullAxis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x'
			}
			if (this.pullAxis !== 'y') return
			// 下拉阻尼：越拉越沉
			this.pullDistance = Math.max(0, Math.min(110, dy * 0.45))
		},
		onPullTouchEnd() {
			if (!this.pullActive) return
			this.pullActive = false
			if (this.pullDistance >= 56) {
				this.startPullRefresh()
			} else {
				this.pullDistance = 0
			}
		},
		startPullRefresh() {
			this.pullLoading = true
			this.pullDistance = 56
			Promise.resolve(typeof this.onRefresh === 'function' ? this.onRefresh() : null)
				.then(() => new Promise(resolve => setTimeout(resolve, 650)))
				.then(() => {
					this.pullLoading = false
					this.pullDistance = 0
					this.refreshTick += 1
				})
		}
	}
}
