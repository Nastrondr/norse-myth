<template>
	<text class="anim-number">{{ displayText }}</text>
</template>

<script>
// 数字滚动：value 变化时从当前显示值缓动（easeOutCubic）到目标值
export default {
	name: 'AnimNumber',
	props: {
		value: {
			type: Number,
			default: 0
		},
		duration: {
			type: Number,
			default: 700
		}
	},
	data() {
		return {
			display: 0,
			rafId: null
		}
	},
	computed: {
		displayText() {
			return Math.round(this.display)
		}
	},
	watch: {
		value: {
			immediate: true,
			handler(val) {
				this.animateTo(Number(val) || 0)
			}
		}
	},
	beforeUnmount() {
		this.stop()
	},
	methods: {
		stop() {
			if (this.rafId && typeof cancelAnimationFrame === 'function') {
				cancelAnimationFrame(this.rafId)
			}
			this.rafId = null
		},
		animateTo(target) {
			this.stop()
			const from = this.display
			const delta = target - from
			if (!delta) return
			const startTs = Date.now()
			const tick = () => {
				const p = Math.min(1, (Date.now() - startTs) / this.duration)
				const eased = 1 - Math.pow(1 - p, 3)
				this.display = from + delta * eased
				if (p < 1) {
					this.rafId = requestAnimationFrame(tick)
				} else {
					this.display = target
					this.rafId = null
				}
			}
			if (typeof requestAnimationFrame === 'function') {
				this.rafId = requestAnimationFrame(tick)
			} else {
				// 无 rAF 环境直接落到目标值
				this.display = target
			}
		}
	}
}
</script>
