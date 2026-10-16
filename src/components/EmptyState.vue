<template>
	<view class="es" :class="['es-' + size, 'es-' + type, card ? 'es-card' : '']">
		<view class="es-rune-ring">
			<text class="es-rune">{{ preset.rune }}</text>
		</view>
		<text v-if="currentTitle" class="es-title">{{ currentTitle }}</text>
		<text v-if="currentDesc" class="es-desc">{{ currentDesc }}</text>
		<view v-if="actions && actions.length" class="es-actions">
			<view
				v-for="(action, index) in actions"
				:key="index"
				class="es-btn"
				:class="'es-btn-' + (action.variant || 'primary')"
				@click="$emit('action', action.event || action.label)"
			>
				<text class="es-btn-text" :class="'es-btn-text-' + (action.variant || 'primary')">{{ action.label }}</text>
			</view>
		</view>
	</view>
</template>

<script>
/**
 * EmptyState 统一缺省态组件
 *
 * type   场景：search 搜索/筛选无结果 | empty 数据未收录 | pending 内容整理中
 *        locked 未解锁（业务封锁） | notfound 内容不存在 | error 加载失败
 * size   尺寸：page 整页 | block 区块（默认） | inline 卡片内嵌
 * card   是否带卡片容器（与列表卡片同框时使用）
 * title / desc 覆盖预设文案（不传则用场景预设）
 * actions 按钮组 [{ label, variant: 'primary'|'ghost', event }]
 *        点击后向父组件 emit('action', event || label)
 */
const PRESETS = {
	search: { rune: 'ᚲ', title: '未找到匹配内容', desc: '调整关键词或筛选条件，再试一次。' },
	empty: { rune: 'ᛟ', title: '暂无记录', desc: '这里的档案尚未写下任何内容。' },
	pending: { rune: 'ᛜ', title: '整理中', desc: '内容正在收录，稍后再度造访。' },
	locked: { rune: 'ᚾ', title: '尚未解锁', desc: '继续探索九界，封印自会解除。' },
	notfound: { rune: 'ᛈ', title: '内容不存在', desc: '这份记录已失落于世界树，或链接有误。' },
	error: { rune: 'ᚦ', title: '出了点问题', desc: '稍后再试；若持续出现，可尝试重置数据。' }
}

export default {
	name: 'EmptyState',
	props: {
		type: { type: String, default: 'empty' },
		size: { type: String, default: 'block' },
		title: { type: String, default: '' },
		desc: { type: String, default: '' },
		card: { type: Boolean, default: false },
		actions: { type: Array, default: () => [] }
	},
	computed: {
		preset() {
			return PRESETS[this.type] || PRESETS.empty
		},
		currentTitle() {
			return this.title || this.preset.title
		},
		currentDesc() {
			return this.desc || this.preset.desc
		}
	}
}
</script>

<style scoped>
.es {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	box-sizing: border-box;
	padding: 72rpx 32rpx;
	animation: esFadeUp 0.4s ease-out backwards;
}

/* ===== 尺寸变体 ===== */
.es-inline {
	padding: 40rpx 24rpx;
}

.es-inline .es-rune-ring {
	width: 80rpx;
	height: 80rpx;
}

.es-inline .es-rune {
	font-size: 40rpx;
}

.es-inline .es-title {
	font-size: 26rpx;
}

.es-inline .es-desc {
	font-size: 22rpx;
}

.es-inline .es-btn {
	height: 64rpx;
	padding: 0 36rpx;
}

.es-inline .es-btn-text {
	font-size: 24rpx;
}

.es-page {
	padding: 120rpx 48rpx 160rpx;
	min-height: 60vh;
}

.es-page .es-rune-ring {
	width: 128rpx;
	height: 128rpx;
}

.es-page .es-rune {
	font-size: 64rpx;
}

.es-page .es-title {
	font-size: 30rpx;
}

.es-page .es-desc {
	font-size: 24rpx;
}

.es-page .es-btn {
	height: 76rpx;
	padding: 0 48rpx;
}

/* ===== 结构 ===== */
.es-rune-ring {
	width: 104rpx;
	height: 104rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
	flex-shrink: 0;
	box-sizing: border-box;
}

.es-rune {
	font-family: serif;
	font-size: 52rpx;
	line-height: 1;
}

.es-title {
	display: block;
	color: var(--text-primary);
	font-size: 28rpx;
	font-weight: 600;
	letter-spacing: 1rpx;
	margin-bottom: 8rpx;
}

.es-desc {
	display: block;
	color: var(--text-secondary);
	font-size: 23rpx;
	line-height: 1.6;
	max-width: 480rpx;
}

.es-actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 20rpx;
	margin-top: 36rpx;
}

.es-btn {
	height: 72rpx;
	padding: 0 44rpx;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	transition: transform 0.15s ease, opacity 0.15s ease;
}

.es-btn:active {
	transform: scale(0.96);
	opacity: 0.9;
}

.es-btn-text {
	font-size: 26rpx;
}

.es-btn-primary {
	background: linear-gradient(135deg, var(--accent-strong), var(--accent));
}

.es-btn-text-primary {
	color: var(--bg-outer);
	font-weight: 700;
}

.es-btn-ghost {
	background: rgba(var(--accent-rgb), 0.08);
	border: 1rpx solid rgba(var(--accent-rgb), 0.45);
}

.es-btn-text-ghost {
	color: var(--accent);
}

/* 卡片容器：嵌在 tab 内容区时与列表卡片同框 */
.es-card {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 24rpx;
}

/* ===== 场景配色：卢恩符文 = 场景识别色 ===== */
.es-search .es-rune-ring {
	background: rgba(143, 182, 217, 0.08);
	border: 1rpx solid rgba(143, 182, 217, 0.35);
}

.es-search .es-rune {
	color: #8FB6D9;
}

.es-empty .es-rune-ring {
	background: rgba(var(--accent-rgb), 0.08);
	border: 1rpx solid rgba(var(--accent-rgb), 0.35);
}

.es-empty .es-rune {
	color: var(--accent);
}

.es-pending .es-rune-ring {
	background: rgba(var(--accent-strong-rgb), 0.08);
	border: 1rpx solid rgba(var(--accent-strong-rgb), 0.35);
}

.es-pending .es-rune {
	color: var(--accent-strong);
}

.es-locked .es-rune-ring {
	background: rgba(124, 140, 116, 0.10);
	border: 1rpx solid rgba(124, 140, 116, 0.35);
}

.es-locked .es-rune {
	color: #7C8C74;
}

.es-notfound .es-rune-ring {
	background: rgba(183, 156, 217, 0.08);
	border: 1rpx solid rgba(183, 156, 217, 0.35);
}

.es-notfound .es-rune {
	color: #B79CD9;
}

.es-error .es-rune-ring {
	background: rgba(185, 74, 72, 0.10);
	border: 1rpx solid rgba(185, 74, 72, 0.35);
}

.es-error .es-rune {
	color: #B94A48;
}

@keyframes esFadeUp {
	from {
		opacity: 0;
		transform: translateY(24rpx);
	}
	to {
		opacity: 1;
		transform: none;
	}
}

/* 系统开启「减弱动态效果」时关闭入场动画 */
@media (prefers-reduced-motion: reduce) {
	.es {
		animation: none;
	}
}
</style>
