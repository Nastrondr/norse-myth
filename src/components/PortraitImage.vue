<template>
	<view class="pi">
		<!-- 底层占位：无立绘 / 加载中 / 加载失败时露出首字 -->
		<view class="pi-fallback">
			<text class="pi-fallback-text" :style="{ fontSize: textSize + 'rpx' }">{{ initial }}</text>
		</view>
		<!-- 立绘层：叠在占位之上，加载完成自然覆盖；失败时移除并回退占位 -->
		<image
			v-if="src && !failed"
			class="pi-img"
			:src="src"
			:mode="mode"
			:lazy-load="lazy"
			@error="onError"
		/>
	</view>
</template>

<script>
/**
 * PortraitImage 统一立绘组件
 *
 * 规范（P1）：
 * - 数据字段：portrait: '/static/portraits/<id>.(webp|jpg|png)'（建议 webp、宽 720、单张 ≤300KB）
 * - 图片一律静态打包（src/static/portraits/），数据库只存路径，不进 storage
 * - 无图 / 加载失败：回退到首字占位，外层容器的渐变背景与圆角继续生效
 *   （组件根 border-radius: inherit + overflow: hidden，负责裁剪圆形头像）
 *
 * props：
 * - src    立绘路径，空则直接显示占位
 * - name   实体名，占位取首字
 * - mode   裁剪模式，默认 aspectFill（aspectFit 用于大图展示）
 * - lazy   懒加载，默认开启（列表滚动到可视区才加载）
 * - textSize 占位首字字号（rpx），按外层容器约 40% 取值
 */
export default {
	name: 'PortraitImage',
	props: {
		src: { type: String, default: '' },
		name: { type: String, default: '' },
		mode: { type: String, default: 'aspectFill' },
		lazy: { type: Boolean, default: true },
		textSize: { type: Number, default: 32 }
	},
	data() {
		return {
			failed: false
		}
	},
	computed: {
		initial() {
			return (this.name || '?').charAt(0)
		}
	},
	watch: {
		// 切换实体（如同页跳转不同角色）时重置失败态，重新尝试加载
		src() {
			this.failed = false
		}
	},
	methods: {
		onError() {
			this.failed = true
			console.warn('[PortraitImage] 立绘加载失败，回退首字占位:', this.src)
		}
	}
}
</script>

<style scoped>
.pi {
	position: relative;
	width: 100%;
	height: 100%;
	border-radius: inherit;
	overflow: hidden;
}

.pi-fallback {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pi-fallback-text {
	color: var(--text-primary);
	font-weight: bold;
	line-height: 1;
}

.pi-img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	display: block;
}
</style>
