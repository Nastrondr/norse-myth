<template>
	<view class="container">
		<view class="header">
			<text class="title">神话生物图鉴</text>
			<text class="subtitle">收集来自九界的神话生物</text>
		</view>

		<view class="progress-bar">
			<text class="progress-text">{{ collectedCount }} / {{ totalCount }}</text>
			<view class="progress-track">
				<view class="progress-fill" :style="{ width: (collectedCount / totalCount * 100) + '%' }"></view>
			</view>
		</view>

		<view class="type-tabs">
			<text
				class="tab"
				:class="{ active: currentType === '' }"
				@click="currentType = ''"
			>全部</text>
			<text
				class="tab"
				:class="{ active: currentType === '巨狼' }"
				@click="currentType = '巨狼'"
			>巨狼</text>
			<text
				class="tab"
				:class="{ active: currentType === '巨蛇' }"
				@click="currentType = '巨蛇'"
			>巨蛇</text>
			<text
				class="tab"
				:class="{ active: currentType === '精灵' }"
				@click="currentType = '精灵'"
			>精灵</text>
			<text
				class="tab"
				:class="{ active: currentType === '矮人' }"
				@click="currentType = '矮人'"
			>矮人</text>
			<text
				class="tab"
				:class="{ active: currentType === '巨人' }"
				@click="currentType = '巨人'"
			>巨人</text>
			<text
				class="tab"
				:class="{ active: currentType === '亡灵' }"
				@click="currentType = '亡灵'"
			>亡灵</text>
			<text
				class="tab"
				:class="{ active: currentType === '鸟类' }"
				@click="currentType = '鸟类'"
			>鸟类</text>
			<text
				class="tab"
				:class="{ active: currentType === 'artifact' }"
				@click="switchToArtifacts"
			>法器</text>
		</view>

		<view v-if="currentType === 'artifact'" class="creature-grid">
			<view
				class="creature-card"
				v-for="artifact in artifacts"
				:key="artifact.id"
				@click="goToArtifactDetail(artifact.id)"
			>
				<view class="card-inner">
					<view class="top-row">
						<view class="rarity-dot" :class="artifact.rarity"></view>
						<view class="collect-status collected">A</view>
					</view>
					<view class="avatar" :class="artifact.rarity">
						<text>{{ getArtifactIcon(artifact.type) }}</text>
					</view>
					<text class="creature-name">{{ artifact.name }}</text>
					<text class="creature-type">{{ artifact.type }}</text>
				</view>
			</view>
		</view>

		<view v-else class="creature-grid">
			<view
				class="creature-card"
				v-for="creature in filteredCreatures"
				:key="creature.id"
				:class="{ locked: !isCreatureRevealed(creature.id) }"
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

		<view class="bottom-tab">
			<view class="tab-item" @click="goToTab('home')">
				<view class="tab-icon-box"><view class="css-icon icon-home"></view></view>
				<text class="tab-label">首页</text>
			</view>
			<view class="tab-item" @click="goToTab('gods')">
				<view class="tab-icon-box"><view class="css-icon icon-gods"></view></view>
				<text class="tab-label">神祇</text>
			</view>
			<view class="tab-item" @click="goToTab('stories')">
				<view class="tab-icon-box"><view class="css-icon icon-stories"></view></view>
				<text class="tab-label">故事</text>
			</view>
			<view class="tab-item active">
				<view class="tab-icon-box"><view class="css-icon icon-bestiary"></view></view>
				<text class="tab-label">图鉴</text>
			</view>
			<view class="tab-item" @click="goToTab('fun')">
				<view class="tab-icon-box"><view class="css-icon icon-fun"></view></view>
				<text class="tab-label">档案</text>
			</view>
		</view>
	</view>
</template>

<script>
import { creatures } from '@/data/norse.js'
import { norseArtifacts, getRarityLabel } from '@/data/norseArtifacts.js'
import { isRavensRevealed as checkRavensRevealed, getRavensClueCount as getClueCount } from '@/utils/clueProgress.js'

export default {
	data() {
		return {
			creatures: creatures,
			currentType: ''
		}
	},
	computed: {
		filteredCreatures() {
			if (!this.currentType) return this.creatures
			return this.creatures.filter(c => c.type === this.currentType)
		},
		collectedCount() {
			if (this.currentType === 'artifact') {
				return this.artifacts.length
			}
			return this.creatures.filter(c => c.collected).length
		},
		totalCount() {
			if (this.currentType === 'artifact') {
				return this.artifacts.length
			}
			return this.creatures.length
		},
		artifacts() {
			return norseArtifacts
		}
	},
	onShow() {
		this.checkCollected()
	},
	methods: {
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
		},
		goToTab(tab) {
			const routes = {
				home: '/pages/index/index',
				gods: '/pages/gods/god-list',
				stories: '/pages/stories/story-list',
				fun: '/pages/profile/profile'
			}
			if (routes[tab]) {
				uni.switchTab({ url: routes[tab] })
			}
		},
		switchToArtifacts() {
			this.currentType = 'artifact'
		},
		goToArtifactDetail(id) {
			uni.navigateTo({
				url: `/pages/bestiary/artifact-detail?id=${id}`
			})
		},
		getArtifactIcon(type) {
			const icons = {
				'神锤': 'H',
				'神枪': 'S',
				'神戒': 'R',
				'神船': 'B',
				'项链': 'N',
				'束缚之链': 'C'
			}
			return icons[type] || 'A'
		},
		getRarityLabel(rarity) {
			return getRarityLabel(rarity)
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #0B1118;
	padding: 32rpx;
	padding-bottom: 160rpx;
	box-sizing: border-box;
}

.header {
	text-align: center;
	padding: 24rpx 0 40rpx;
}

.title {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #C6A15B;
	letter-spacing: 4rpx;
	margin-bottom: 12rpx;
}

.subtitle {
	display: block;
	font-size: 26rpx;
	color: #A8B3BD;
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
	margin-bottom: 20rpx;
	overflow-x: auto;
	overflow-y: hidden;
	-gwebkit-overflow-scrolling: touch;
}

.type-tabs::-webkit-scrollbar {
	display: none;
}

.tab {
	padding: 8rpx 18rpx;
	color: #66727F;
	font-size: 22rpx;
	white-space: nowrap;
	border-radius: 20rpx;
	background: #172230;
	margin-right: 10rpx;
	border: 1rpx solid transparent;
	flex-shrink: 0;
}

.tab.active {
	background: transparent;
	border-color: #7C8C74;
	color: #7C8C74;
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
	font-size: 22rpx;
	color: #27384A;
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

.bottom-tab {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	height: 112rpx;
	background: #111A24;
	border-top: 1px solid #27384A;
	display: flex;
	z-index: 9999;
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: content-box;
}

.tab-item {
	flex: 1;
	height: 112rpx;
	min-width: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	color: #66727F;
	text-align: center;
}

.tab-item.active {
	color: #C6A15B;
}

.tab-icon-box {
	width: 48rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.tab-label {
	display: block;
	height: 24rpx;
	line-height: 24rpx;
	font-size: 22rpx;
	color: currentColor;
	text-align: center;
}

.css-icon {
	position: relative;
	width: 32rpx;
	height: 32rpx;
	color: currentColor;
	box-sizing: border-box;
	transform-origin: center center;
}

.css-icon::before,
.css-icon::after {
	box-sizing: border-box;
}

.icon-home::before {
	content: '';
	position: absolute;
	left: 7rpx;
	top: 6rpx;
	width: 18rpx;
	height: 18rpx;
	border-left: 3rpx solid currentColor;
	border-top: 3rpx solid currentColor;
	transform: rotate(45deg);
	border-radius: 2rpx;
}

.icon-home::after {
	content: '';
	position: absolute;
	left: 8rpx;
	top: 17rpx;
	width: 16rpx;
	height: 11rpx;
	border: 3rpx solid currentColor;
	border-top: none;
	border-radius: 2rpx;
}

.icon-gods::before {
	content: '';
	position: absolute;
	left: 5rpx;
	top: 5rpx;
	width: 22rpx;
	height: 6rpx;
	border-left: 3rpx solid currentColor;
	border-right: 3rpx solid currentColor;
	border-top: 3rpx solid currentColor;
	transform: skewX(-8deg);
}

.icon-gods::after {
	content: '';
	position: absolute;
	left: 6rpx;
	top: 14rpx;
	width: 20rpx;
	height: 14rpx;
	border-left: 3rpx solid currentColor;
	border-right: 3rpx solid currentColor;
	box-shadow: 7rpx 0 0 -4rpx currentColor, -7rpx 0 0 -4rpx currentColor;
}

.icon-stories::before {
	content: '';
	position: absolute;
	left: 5rpx;
	top: 6rpx;
	width: 11rpx;
	height: 22rpx;
	border: 3rpx solid currentColor;
	border-radius: 4rpx 0 0 4rpx;
}

.icon-stories::after {
	content: '';
	position: absolute;
	right: 5rpx;
	top: 6rpx;
	width: 11rpx;
	height: 22rpx;
	border: 3rpx solid currentColor;
	border-radius: 0 4rpx 4rpx 0;
}

.icon-bestiary::before {
	content: '';
	position: absolute;
	left: 8rpx;
	top: 6rpx;
	width: 16rpx;
	height: 16rpx;
	border: 3rpx solid currentColor;
	transform: rotate(45deg);
	border-radius: 3rpx;
}

.icon-bestiary::after {
	content: '';
	position: absolute;
	left: 13rpx;
	top: 11rpx;
	width: 6rpx;
	height: 6rpx;
	border-radius: 50%;
	background: currentColor;
}

.icon-fun::before {
	content: '';
	position: absolute;
	left: 7rpx;
	top: 7rpx;
	width: 18rpx;
	height: 18rpx;
	border: 3rpx solid currentColor;
	border-radius: 50%;
}

.icon-fun::after {
	content: '';
	position: absolute;
	left: 14rpx;
	top: 14rpx;
	width: 4rpx;
	height: 4rpx;
	border-radius: 50%;
	background: currentColor;
}

.rarity-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
}

.rarity-dot.legendary {
	background: #D8C27A;
}

.rarity-dot.epic {
	background: #8FB6D9;
}

.rarity-dot.rare {
	background: #7C8C74;
}

.creature-icon.legendary {
	background: rgba(216, 194, 122, 0.15);
	border: 1rpx solid rgba(216, 194, 122, 0.35);
	color: #D8C27A;
}

.creature-icon.epic {
	background: rgba(143, 182, 217, 0.15);
	border: 1rpx solid rgba(143, 182, 217, 0.35);
	color: #8FB6D9;
}

.creature-icon.rare {
	background: rgba(124, 140, 116, 0.15);
	border: 1rpx solid rgba(124, 140, 116, 0.35);
	color: #7C8C74;
}

.avatar.legendary {
	background: rgba(216, 194, 122, 0.15);
	border: 1rpx solid rgba(216, 194, 122, 0.35);
	color: #D8C27A;
}

.avatar.epic {
	background: rgba(143, 182, 217, 0.15);
	border: 1rpx solid rgba(143, 182, 217, 0.35);
	color: #8FB6D9;
}

.avatar.rare {
	background: rgba(124, 140, 116, 0.15);
	border: 1rpx solid rgba(124, 140, 116, 0.35);
	color: #7C8C74;
}
</style>
