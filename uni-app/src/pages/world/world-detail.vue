<template>
	<view class="container">
		<view class="header">
			<text class="title">{{ world.name || '九界详情' }}</text>
			<text class="subtitle">{{ world.originalName }}</text>
		</view>

		<view class="map-section">
				<view class="map-card">
					<view class="map-lines">
						<view class="line line-1"></view>
						<view class="line line-2"></view>
						<view class="line line-3"></view>
						<view class="circle circle-1"></view>
						<view class="circle circle-2"></view>
						<view class="mountain mt-1">△</view>
						<view class="mountain mt-2">△</view>
						<view class="forest fr-1">♧</view>
						<view class="forest fr-2">♧</view>
					</view>

					<view class="map-pins">
						<view
							v-for="(pin, index) in mapLocations"
							:key="index"
							class="map-pin"
							:class="{ active: selectedPin === index }"
							:style="{ left: pin.x + '%', top: pin.y + '%' }"
							@click="selectPin(index)"
						>
							<text class="map-pin-icon">{{ pin.icon }}</text>
						</view>
					</view>

					<view class="map-title">
						<text class="map-world-name">{{ world.name }}</text>
						<text class="map-world-type">{{ world.type }}</text>
					</view>
				</view>
			</view>

			<view class="world-info">
				<view class="info-header">
					<text class="world-name">{{ world.name }}</text>
					<text class="world-original">{{ world.originalName }}</text>
				</view>
				<text class="world-subtitle">{{ world.subtitle }}</text>
				<text class="world-description">{{ world.description }}</text>
			</view>

			<view class="tab-bar">
				<view
					class="tab-item"
					:class="{ active: currentTab === 'inhabitants' }"
					@click="switchTab('inhabitants')"
				>
					<text class="tab-text">居民</text>
				</view>
				<view
					class="tab-item"
					:class="{ active: currentTab === 'locations' }"
					@click="switchTab('locations')"
				>
					<text class="tab-text">地点</text>
				</view>
				<view
					class="tab-item"
					:class="{ active: currentTab === 'legends' }"
					@click="switchTab('legends')"
				>
					<text class="tab-text">传说</text>
				</view>
			</view>

			<view class="tab-content">
				<view v-if="currentTab === 'inhabitants'" class="inhabitants-list">
					<view
						v-for="god in relatedGods"
						:key="god.id"
						class="inhabitant-card"
						@click="goToGod(god.id)"
					>
						<view class="inhabitant-avatar" :style="{ background: getGodColor(god.faction) }">
							<text>{{ god.name[0] }}</text>
						</view>
						<view class="inhabitant-info">
							<text class="inhabitant-name">{{ god.name }}</text>
							<text class="inhabitant-title">{{ god.title }}</text>
						</view>
						<text class="inhabitant-arrow">›</text>
					</view>
					<view v-if="relatedGods.length === 0" class="empty-state">
						<text class="empty-text">暂无居民记录</text>
					</view>
				</view>

				<view v-if="currentTab === 'locations'" class="locations-list">
					<view
						v-for="(loc, index) in displayLocations"
						:key="index"
						class="location-card"
						:class="{ highlighted: selectedPin === index }"
						@click="selectPin(index)"
					>
						<view class="location-icon">
							<text>{{ loc.icon }}</text>
						</view>
						<view class="location-info">
							<text class="location-name">{{ loc.name }}</text>
							<text class="location-original">{{ loc.original }}</text>
							<text class="location-desc">{{ loc.desc }}</text>
						</view>
					</view>
					<view v-if="displayLocations.length === 0" class="empty-state">
						<text class="empty-text">暂无地点记录</text>
					</view>
				</view>

				<view v-if="currentTab === 'legends'" class="legends-list">
					<view
						v-for="story in relatedStories"
						:key="story.id"
						class="legend-card"
						@click="goToStory(story.id)"
					>
						<view class="legend-info">
							<text class="legend-title">{{ story.title }}</text>
							<text class="legend-category">{{ story.category }}</text>
							<text class="legend-desc">{{ story.summary }}</text>
						</view>
						<text class="legend-arrow">›</text>
					</view>
					<view v-if="relatedStories.length === 0" class="empty-state">
						<text class="empty-text">暂无传说记录</text>
					</view>
			</view>

			<view class="bottom-space"></view>
	</view>
</template>

<script>
import { norseWorlds } from '@/data/norseWorlds.js'
import { gods } from '@/data/norse.js'
import { stories } from '@/data/norse.js'

export default {
	data() {
		return {
			world: {},
			currentTab: 'inhabitants',
			isPinned: false,
			selectedPin: -1,
			mapLocations: []
		}
	},
	computed: {
		relatedGods() {
			if (!this.world.relatedGods) return []
			return this.world.relatedGods.map(id => gods.find(g => g.id === id)).filter(Boolean)
		},
		relatedStories() {
			if (!this.world.relatedStories) return []
			return this.world.relatedStories.map(id => stories.find(s => s.id === id)).filter(Boolean)
		},
		displayLocations() {
			if (this.selectedPin >= 0 && this.selectedPin < this.mapLocations.length) {
				return [this.mapLocations[this.selectedPin]]
			}
			return this.mapLocations
		}
	},
	onLoad(options) {
		const worldId = options.id || 'asgard'
		this.world = norseWorlds.find(w => w.id === worldId) || norseWorlds[0]
		this.initMapLocations()
		this.checkPinStatus()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		switchTab(tab) {
			this.currentTab = tab
			if (tab === 'locations') {
				this.selectedPin = -1
			}
		},
		togglePin() {
			this.isPinned = !this.isPinned
			const pinnedWorlds = uni.getStorageSync('pinnedWorlds') || []
			if (this.isPinned) {
				if (!pinnedWorlds.includes(this.world.id)) {
					pinnedWorlds.push(this.world.id)
				}
			} else {
				const index = pinnedWorlds.indexOf(this.world.id)
				if (index > -1) {
					pinnedWorlds.splice(index, 1)
				}
			}
			uni.setStorageSync('pinnedWorlds', pinnedWorlds)
			uni.showToast({
				title: this.isPinned ? '已标记国度' : '已取消标记',
				icon: 'none'
			})
		},
		checkPinStatus() {
			const pinnedWorlds = uni.getStorageSync('pinnedWorlds') || []
			this.isPinned = pinnedWorlds.includes(this.world.id)
		},
		selectPin(index) {
			this.selectedPin = this.selectedPin === index ? -1 : index
			this.currentTab = 'locations'
		},
		initMapLocations() {
			const locations = this.getWorldLocations()
			this.mapLocations = locations.slice(0, 5)
		},
		getWorldLocations() {
			const worldLocations = {
				asgard: [
					{ name: 'A', original: 'Gladsheim', icon: '⌂', desc: '诸神议事大厅', x: 45, y: 25 },
					{ name: 'B', original: 'Valhalla', icon: '▣', desc: '英灵殿', x: 72, y: 38 },
					{ name: 'C', original: 'Fensalir', icon: '♧', desc: '弗丽嘉的宫殿', x: 22, y: 55 },
					{ name: 'D', original: 'Breidablik', icon: '◇', desc: '光明神的居所', x: 55, y: 72 }
				],
				midgard: [
					{ name: 'A', original: 'Midgard', icon: '◇', desc: '人类居所', x: 45, y: 40 },
					{ name: 'B', original: 'Bifrost', icon: '⌁', desc: '连接九界的桥梁', x: 75, y: 20 }
				],
				jotunheim: [
					{ name: 'A', original: 'Utgard', icon: '△', desc: '巨人国度中心', x: 45, y: 35 },
					{ name: 'B', original: 'Thrymheim', icon: '△', desc: '霜巨人领地', x: 22, y: 65 }
				],
				default: [
					{ name: 'A', original: 'Unknown', icon: '◇', desc: '等待探索', x: 45, y: 45 }
				]
			}
			return worldLocations[this.world.id] || worldLocations.default
		},
		getGodColor(faction) {
			const colors = {
				'阿萨神族': 'linear-gradient(135deg, #C6A15B 0%, #8B7030 100%)',
				'华纳神族': 'linear-gradient(135deg, #7C8C74 0%, #4A5C4A 100%)',
				'巨人': 'linear-gradient(135deg, #B94A48 0%, #7A2A2A 100%)'
			}
			return colors[faction] || 'linear-gradient(135deg, #66727F 0%, #3A4450 100%)'
		},
		goToGod(id) {
			const god = gods.find(g => g.id === id)
			if (god) {
				uni.navigateTo({ url: `/pages/gods/god-detail?id=${id}` })
			}
		},
		goToStory(id) {
			const story = stories.find(s => s.id === id)
			if (story) {
				uni.navigateTo({ url: `/pages/stories/story-detail?id=${id}` })
			}
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

.content-scroll {
	height: calc(100vh - 200rpx);
}

.map-section {
	padding: 24rpx;
}

.map-card {
	position: relative;
	height: 360rpx;
	border-radius: 24rpx;
	overflow: hidden;
	background: #0E1721;
	border: 1rpx solid #27384A;
}

.map-lines {
	position: absolute;
	inset: 0;
	opacity: 0.5;
}

.line {
	position: absolute;
	background: #27384A;
}

.line-1 {
	width: 100%;
	height: 1rpx;
	top: 33%;
	left: 0;
}

.line-2 {
	width: 100%;
	height: 1rpx;
	top: 66%;
	left: 0;
}

.line-3 {
	width: 1rpx;
	height: 100%;
	left: 50%;
	top: 0;
}

.circle {
	position: absolute;
	border: 1rpx solid #27384A;
	border-radius: 50%;
}

.circle-1 {
	width: 100rpx;
	height: 100rpx;
	top: 20%;
	left: 20%;
}

.circle-2 {
	width: 60rpx;
	height: 60rpx;
	bottom: 25%;
	right: 25%;
}

.mountain,
.forest {
	position: absolute;
	color: #27384A;
	font-size: 24rpx;
}

.mt-1 { top: 12%; right: 20%; }
.mt-2 { bottom: 30%; left: 25%; }
.fr-1 { top: 40%; left: 15%; }
.fr-2 { bottom: 15%; right: 30%; }

.map-pins {
	position: absolute;
	inset: 0;
}

.map-pin {
	position: absolute;
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	background: rgba(198, 161, 91, 0.18);
	border: 1rpx solid rgba(198, 161, 91, 0.65);
	display: flex;
	align-items: center;
	justify-content: center;
	transform: translate(-50%, -50%);
	z-index: 3;
}

.map-pin.active {
	background: rgba(198, 161, 91, 0.4);
	border-color: #D8C27A;
}

.map-pin-icon {
	display: block;
	color: #D8C27A;
	font-size: 20rpx;
	line-height: 1;
	text-align: center;
}

.map-title {
	position: absolute;
	bottom: 20rpx;
	left: 20rpx;
}

.map-world-name {
	display: block;
	color: #F2F4F6;
	font-size: 32rpx;
	font-weight: 700;
}

.map-world-type {
	color: #66727F;
	font-size: 20rpx;
}

.world-info {
	padding: 0 24rpx 24rpx;
}

.info-header {
	margin-bottom: 12rpx;
}

.world-name {
	display: block;
	color: #F2F4F6;
	font-size: 40rpx;
	font-weight: 700;
}

.world-original {
	display: block;
	color: #C6A15B;
	font-size: 26rpx;
	margin-top: 4rpx;
}

.world-subtitle {
	display: block;
	color: #A8B3BD;
	font-size: 26rpx;
	margin-bottom: 12rpx;
	line-height: 1.5;
}

.world-description {
	display: block;
	color: #66727F;
	font-size: 24rpx;
	line-height: 1.7;
	margin-bottom: 16rpx;
}

.tab-bar {
	display: flex;
	border-bottom: 1rpx solid #27384A;
	margin: 0 24rpx;
}

.tab-item {
	flex: 1;
	padding: 24rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 3rpx solid transparent;
	margin-bottom: -1rpx;
}

.tab-item.active {
	border-bottom-color: #C6A15B;
}

.tab-text {
	color: #66727F;
	font-size: 28rpx;
}

.tab-item.active .tab-text {
	color: #C6A15B;
	font-weight: 600;
}

.tab-content {
	padding: 24rpx;
}

.inhabitants-list,
.locations-list,
.legends-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.inhabitant-card {
	display: flex;
	align-items: center;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	padding: 20rpx;
}

.inhabitant-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.inhabitant-avatar text {
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 700;
}

.inhabitant-info {
	flex: 1;
	margin-left: 20rpx;
	min-width: 0;
}

.inhabitant-name {
	display: block;
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 4rpx;
}

.inhabitant-title {
	display: block;
	color: #66727F;
	font-size: 22rpx;
}

.inhabitant-arrow {
	color: #66727F;
	font-size: 36rpx;
	margin-left: 16rpx;
}

.location-card {
	display: flex;
	gap: 18rpx;
	padding: 24rpx;
	margin-bottom: 18rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 18rpx;
	box-sizing: border-box;
	transition: border-color 0.2s ease;
}

.location-card.highlighted {
	border-color: #C6A15B;
}

.location-icon {
	width: 56rpx;
	height: 56rpx;
	min-width: 56rpx;
	border-radius: 14rpx;
	background: #0B1118;
	border: 1rpx solid #27384A;
	display: flex;
	align-items: center;
	justify-content: center;
}

.location-icon text {
	color: #D8C27A;
	font-size: 28rpx;
}

.location-info {
	flex: 1;
	min-width: 0;
}

.location-name {
	display: block;
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 700;
}

.location-original {
	display: block;
	color: #C6A15B;
	font-size: 22rpx;
	margin-top: 4rpx;
}

.location-desc {
	display: block;
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.5;
	margin-top: 8rpx;
	white-space: normal;
	word-break: break-word;
}

.legend-card {
	display: flex;
	align-items: center;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	padding: 24rpx;
}

.legend-info {
	flex: 1;
	min-width: 0;
}

.legend-title {
	display: block;
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 4rpx;
}

.legend-category {
	display: block;
	color: #C6A15B;
	font-size: 20rpx;
	margin-bottom: 8rpx;
}

.legend-desc {
	display: block;
	color: #66727F;
	font-size: 22rpx;
	line-height: 1.5;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.legend-arrow {
	color: #66727F;
	font-size: 36rpx;
	margin-left: 16rpx;
}

.empty-state {
	padding: 60rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.empty-text {
	color: #66727F;
	font-size: 26rpx;
}

.bottom-space {
	height: 160rpx;
}
</style>
