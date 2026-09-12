<template>
	<view
		class="container page-enter"
		@touchstart="onPullTouchStart"
		@touchmove="onPullTouchMove"
		@touchend="onPullTouchEnd"
		@touchcancel="onPullTouchEnd"
	>
		<view class="pull-refresh-indicator" :class="{ loading: pullLoading, dragging: pullActive }" :style="pullIndicatorStyle">
			<text class="pull-rune" :style="pullRuneStyle">ᚱ</text>
		</view>
		<PageHeader back kicker="BESTIARY" title="神话生物图鉴" subtitle="收集来自九界的神话生物" />

		<view class="progress-bar">
			<text class="progress-text"><AnimNumber :value="collectedCount" /> / <AnimNumber :value="totalCount" /></text>
			<view class="progress-track">
				<view class="progress-fill" :style="{ width: (collectedCount / totalCount * 100) + '%' }"></view>
			</view>
		</view>

		<view class="type-tabs">
			<text
				v-for="type in typeTabs"
				:key="type.value"
				class="tab"
				:class="{ active: currentType === type.value }"
				@click="setType(type.value)"
			>{{ type.label }}</text>
			<view
				v-if="tabIndicator.ready"
				class="tab-indicator"
				:style="{ transform: 'translateX(' + tabIndicator.left + 'px)', width: tabIndicator.width + 'px' }"
			></view>
		</view>

		<view class="creature-grid">
			<view
				class="creature-card stagger-item"
				v-for="(creature, index) in filteredCreatures"
				:key="creature.id"
				:class="{ locked: !isCreatureRevealed(creature.id) }"
				:style="{ animationDelay: Math.min(index, 12) * 0.04 + 's' }"
				@click="goToDetail(creature.id)"
			>
				<view class="card-inner">
					<view class="top-row">
						<view v-if="shouldShowDanger(creature)" class="danger-tag" :class="getDangerClass(creature.dangerLevel)">
							!
						</view>
						<view v-else class="danger-tag placeholder"></view>
						<view class="collect-status" :class="{ collected: isCreatureRevealed(creature.id) }">
							{{ isCreatureRevealed(creature.id) ? '★' : (creature.id === 'raven' && getRavensClueCount() > 0 ? getRavensClueCount() : '☆') }}
						</view>
					</view>

					<view class="avatar" :class="getDangerClass(creature.dangerLevel)">
						<text v-if="isCreatureRevealed(creature.id)">{{ creature.name[0] }}</text>
						<text v-else>?</text>
					</view>

					<text class="creature-name" :class="{ locked: !isCreatureRevealed(creature.id) }">
						{{ isCreatureRevealed(creature.id) ? creature.name : (creature.id === 'raven' ? getRavensDisplayName(creature) : '???') }}
					</text>

					<text class="creature-type">
						{{ isCreatureRevealed(creature.id) ? creature.type : (creature.id === 'raven' ? getRavensDisplayType(creature) : '未知') }}
					</text>

					<text v-if="creature.id === 'raven' && !isCreatureRevealed('raven')" class="clue-count">
						{{ getRavensClueCount() }} / 3 条线索
					</text>
				</view>
			</view>
		</view>

		<TabBar current="codex" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnimNumber from '@/components/AnimNumber.vue'
import { db } from '@/db'
import { creatureFilters } from '@/data/norseCreatures.js'
import { isRavensRevealed as checkRavensRevealed, getRavensClueCount as getClueCount } from '@/utils/clueProgress.js'
import pullRefresh from '@/mixins/pullRefresh.js'

export default {
  components: { TabBar, PageHeader, AnimNumber },
	mixins: [pullRefresh],
	data() {
		return {
			creatures: db.findAll('creatures'),
			currentType: '',
			// 筛选维度为 category（与 norseCreatures.js creatureFilters 配置保持一致）
			typeTabs: creatureFilters.map(f => ({ label: f.label, value: f.id })),
			tabIndicator: { left: 0, width: 0, ready: false }
		}
	},
	computed: {
		filteredCreatures() {
			if (!this.currentType) return this.creatures
			return this.creatures.filter(c => c.category === this.currentType)
		},
		collectedCount() {
			return this.creatures.filter(c => c.collected).length
		},
		totalCount() {
			return this.creatures.length
		}
	},
	onShow() {
		this.checkCollected()
	},
	mounted() {
		this.updateTabIndicator()
	},
	methods: {
		setType(value) {
			this.currentType = value
			this.updateTabIndicator()
		},
		// 测量当前激活 tab 的位置，驱动滑动指示器
		updateTabIndicator() {
			this.$nextTick(() => {
				uni.createSelectorQuery().in(this)
					.select('.type-tabs').boundingClientRect()
					.selectAll('.type-tabs .tab').boundingClientRect()
					.exec((res) => {
						const barRect = res && res[0]
						const tabRects = res && res[1]
						if (!barRect || !tabRects || !tabRects.length) return
						const index = Math.max(0, this.typeTabs.findIndex(t => t.value === this.currentType))
						const rect = tabRects[index]
						if (!rect) return
						this.tabIndicator = {
							left: rect.left - barRect.left,
							width: rect.width,
							ready: true
						}
					})
			})
		},
		checkCollected() {
			const collected = uni.getStorageSync('collectedCreatures') || []
			this.collectedIds = collected
		},
		isCreatureCollected(creatureId) {
			if (creatureId === 'raven') {
				return checkRavensRevealed()
			}
			const collected = uni.getStorageSync('collectedCreatures') || []
			if (collected.includes(creatureId)) return true
			const creature = this.creatures.find(c => c.id === creatureId)
			return creature?.collected === true
		},
		getRavensClueCount() {
			return getClueCount()
		},
		isCreatureRevealed(creatureId) {
			if (creatureId === 'raven') {
				return checkRavensRevealed()
			}
			return this.isCreatureCollected(creatureId)
		},
		goToDetail(id) {
			uni.navigateTo({
				url: `/pages/bestiary/creature-detail?id=${id}`
			})
		},
		getRavensDisplayName(creature) {
			const count = this.getRavensClueCount()
			if (count === 0) return '???'
			if (count === 1) return '天空的影子'
			if (count === 2) return '天空的影子'
			return creature.name
		},
		getRavensDisplayType(creature) {
			const count = this.getRavensClueCount()
			if (count === 0) return '未发现'
			if (count === 1) return '身份仍未确认'
			if (count === 2) return '飞行生物'
			return creature.type
		},
		getDangerClass(level) {
			const classes = {
				'极高': 'extreme',
				'极危': 'extreme',
				'高': 'high',
				'中': 'medium',
				'低': 'low'
			}
			return classes[level] || ''
		},
		shouldShowDanger(creature) {
			return creature.dangerLevel === '极危' || creature.dangerLevel === '极高'
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #0B1118;
	padding: 0 32rpx 160rpx;
	box-sizing: border-box;
}

.progress-bar {
	margin: 16rpx 0 20rpx;
}

.progress-text {
	color: #66727F;
	font-size: 20rpx;
	display: block;
	margin-bottom: 8rpx;
}

.progress-track {
	height: 3rpx;
	background: #172230;
	border-radius: 2rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #8FB6D9, #C6A15B);
	border-radius: 2rpx;
	transition: width 0.3s ease;
}

.type-tabs {
	display: flex;
	position: relative;
	margin-bottom: 20rpx;
	overflow-x: auto;
	overflow-y: hidden;
	-webkit-overflow-scrolling: touch;
}

.type-tabs::-webkit-scrollbar {
	display: none;
}

.tab {
	padding: 14rpx 24rpx;
	color: #66727F;
	font-size: 22rpx;
	white-space: nowrap;
	border-radius: 20rpx;
	background: #172230;
	margin-right: 10rpx;
	border: 1rpx solid transparent;
	flex-shrink: 0;
	transition: color 0.2s ease, transform 0.15s ease;
}

.tab:active {
	transform: scale(0.95);
}

.tab.active {
	color: #7C8C74;
}

/* 滑动胶囊指示器：随激活 tab 平移 */
.tab-indicator {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	border: 1rpx solid #7C8C74;
	border-radius: 20rpx;
	box-sizing: border-box;
	pointer-events: none;
	z-index: 1;
	transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.creature-grid {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	box-sizing: border-box;
	padding-bottom: 150rpx;
}

.creature-card {
	width: calc(33.333% - 10rpx);
	min-width: 0;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
	box-sizing: border-box;
	overflow: hidden;
	transition: border-color 0.2s ease, transform 0.15s ease;
	margin-bottom: 14rpx;
}

.creature-card:active {
	transform: scale(0.96);
	border-color: #C6A15B;
}

.creature-card.locked {
	opacity: 0.6;
}

.card-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 10rpx 16rpx;
	position: relative;
}

.top-row {
	position: absolute;
	top: 10rpx;
	left: 10rpx;
	right: 10rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.danger-tag {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18rpx;
	font-weight: bold;
	flex-shrink: 0;
}

.danger-tag.extreme {
	background: rgba(185, 74, 72, 0.25);
	color: #B94A48;
}

.danger-tag.high {
	background: rgba(198, 161, 91, 0.2);
	color: #C6A15B;
}

.danger-tag.medium {
	background: rgba(143, 182, 217, 0.15);
	color: #8FB6D9;
}

.danger-tag.low {
	background: rgba(124, 140, 116, 0.15);
	color: #7C8C74;
}

.danger-tag.placeholder {
	background: transparent;
}

.collect-status {
	font-size: 24rpx;
	color: #66727F;
}

.collect-status.collected {
	color: #C6A15B;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 10rpx 0 12rpx;
	flex-shrink: 0;
}

.avatar text {
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 700;
}

.avatar.extreme {
	background: linear-gradient(135deg, #B94A48 0%, #7A2A2A 100%);
}

.avatar.high {
	background: linear-gradient(135deg, #C6A15B 0%, #7A6030 100%);
}

.avatar.medium {
	background: linear-gradient(135deg, #8FB6D9 0%, #5A7A9A 100%);
}

.avatar.low {
	background: linear-gradient(135deg, #7C8C74 0%, #4A5C4A 100%);
}

.creature-name {
	color: #F2F4F6;
	font-size: 24rpx;
	font-weight: 600;
	margin-bottom: 6rpx;
	text-align: center;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.creature-name.locked {
	color: #66727F;
}

.creature-type {
	color: #66727F;
	font-size: 20rpx;
	text-align: center;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.clue-count {
	display: block;
	color: #C6A15B;
	font-size: 18rpx;
	text-align: center;
	margin-top: 4rpx;
}
</style>
