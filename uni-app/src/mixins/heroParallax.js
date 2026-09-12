// 详情页头部滚动视差 Mixin：
// - H5：mixin 自动监听 window scroll（uni-h5 的 onPageScroll 会被 scroll-view 页面破坏，原生监听不受影响）
// - 小程序/App：页面级滚动页面在页面中定义 onPageScroll(e) { this.updateHeroParallax(e.scrollTop) }
// - scroll-view 内滚动：scroll-view 绑定 @scroll="onHeroScroll"
// hero 元素绑定 :heroStyle 实现随滚动缓慢下移 + 淡出，形成前后景层次
export default {
	data() {
		return {
			heroScrollTop: 0
		}
	},
	computed: {
		heroStyle() {
			return {
				transform: 'translateY(' + Math.min(this.heroScrollTop * 0.3, 150) + 'px)',
				opacity: Math.max(0, 1 - this.heroScrollTop / 400)
			}
		}
	},
	mounted() {
		// #ifdef H5
		this._heroRafPending = false
		this._onHeroWinScroll = () => {
			if (this._heroRafPending) return
			this._heroRafPending = true
			requestAnimationFrame(() => {
				this._heroRafPending = false
				this.updateHeroParallax(window.pageYOffset || document.documentElement.scrollTop || 0)
			})
		}
		window.addEventListener('scroll', this._onHeroWinScroll, { passive: true })
		// #endif
	},
	beforeUnmount() {
		// #ifdef H5
		if (this._onHeroWinScroll) {
			window.removeEventListener('scroll', this._onHeroWinScroll)
		}
		// #endif
	},
	methods: {
		updateHeroParallax(scrollTop) {
			this.heroScrollTop = Number(scrollTop) || 0
		},
		// 供 scroll-view 的 @scroll 使用
		onHeroScroll(e) {
			this.updateHeroParallax(e && e.detail && e.detail.scrollTop)
		}
	}
}
