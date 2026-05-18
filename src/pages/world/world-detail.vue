<template>
	<view class="container">
		<view class="back-btn-wrap">
			<text class="back-btn" @click="goBack">‹</text>
		</view>
		<view class="header">
			<text class="title">{{ world.name || '九界详情' }}</text>
			<text class="subtitle">{{ world.originalName }}</text>
		</view>

		<view class="world-map-stage" :class="getMapToneClass()">
				<view class="map-fullscreen-btn" @click.stop="openMapFullscreen">全屏</view>
				<text class="map-kicker">{{ world.originalName || world.name }}</text>
				<text class="map-title">{{ getCurrentTimeline() ? getCurrentTimeline().title : world.name }}</text>
				<text class="map-subtitle">{{ getCurrentTimeline() ? getCurrentTimeline().stage : '神域' }}</text>
				<view class="map-mark mark-one"></view>
				<view class="map-mark mark-two"></view>
				<view class="map-mark mark-three"></view>
			</view>

			<view class="world-info">
				<view class="info-header">
					<text class="world-name">{{ world.name }}</text>
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
				<view
					class="tab-item"
					:class="{ active: currentTab === 'timeline' }"
					@click="switchTab('timeline')"
				>
					<text class="tab-text">时间线</text>
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

				<view v-if="currentTab === 'timeline'" class="timeline-section">
					<view v-if="getTimelineList().length" class="timeline-panel">
						<view class="timeline-slider-tab">
							<view class="timeline-track">
								<view class="timeline-fill" :style="{ width: getTimelineProgressWidth() }"></view>
							</view>
							<view class="timeline-nodes">
								<view
									v-for="(item, index) in getTimelineList()"
									:key="item.id"
									class="timeline-node"
									:class="{ active: activeTimelineIndex === index }"
									@click="selectTimeline(index)"
								>
									<view class="node-dot"></view>
									<text class="node-label">{{ item.stage }}</text>
								</view>
							</view>
						</view>

						<view class="timeline-detail-card">
							<text class="timeline-kicker">当前阶段</text>
							<text class="timeline-title">{{ getCurrentTimeline().title }}</text>
							<text class="timeline-subtitle">{{ getCurrentTimeline().subtitle }}</text>
							<text class="timeline-summary">{{ getCurrentTimeline().summary }}</text>

							<view class="event-list">
								<text class="event-title">阶段事件</text>
								<view
									v-for="event in getCurrentTimeline().events"
									:key="event"
									class="event-item"
								>
									<text class="event-dot"></text>
									<text class="event-text">{{ event }}</text>
								</view>
							</view>

							<view v-if="getCurrentTimeline().related && getCurrentTimeline().related.length" class="related-mini">
								<text class="event-title">相关档案</text>
								<view class="related-tags">
									<text
										v-for="item in getCurrentTimeline().related"
										:key="item.type + '-' + item.id"
										class="related-tag"
										@click="goToArchiveItem(item)"
									>
										{{ item.name }}
									</text>
								</view>
							</view>
						</view>
					</view>

					<view v-else class="empty-timeline">
						<text class="empty-title">时间线整理中</text>
						<text class="empty-desc">该国度的历史阶段尚未收录，后续将补充地图与传说节点。</text>
					</view>
				</view>

				<view v-if="currentTab === 'timeline' && getTimelineList().length" class="test-panel">
					<view class="test-header">
						<text class="test-title">测试工具</text>
						<text class="test-btn" @click="clearTestLog">清空日志</text>
					</view>
					<view class="test-buttons">
						<text class="test-button primary" @click="testTimelineSwitch">测试时间线切换</text>
						<text class="test-button" @click="testBackLogic">测试返回逻辑</text>
					</view>
					<view v-if="testLog.length" class="test-log">
						<text class="log-title">测试日志</text>
						<scroll-view scroll-y class="log-content">
							<view v-for="(log, index) in testLog" :key="index" class="log-item">
								<text class="log-time">{{ log.time }}</text>
								<text class="log-message">{{ log.message }}</text>
							</view>
						</scroll-view>
					</view>
				</view>
			</view>

			<view class="bottom-space"></view>

		<view v-if="isMapFullscreen" class="fullscreen-map-layer">
			<view class="fullscreen-map-header">
				<view class="fullscreen-close" @click="closeMapFullscreen">
					<text>退出</text>
				</view>
				<view class="fullscreen-title-wrap">
					<text class="fullscreen-title">{{ world.name }}</text>
					<text class="fullscreen-subtitle">
						{{ getCurrentTimeline() ? getCurrentTimeline().title : world.originalName }}
					</text>
				</view>
			</view>

			<view class="fullscreen-map" :class="getMapToneClass()">
				<text class="fullscreen-map-kicker">{{ world.originalName || world.name }}</text>
				<text class="fullscreen-map-title">
					{{ getCurrentTimeline() ? getCurrentTimeline().title : world.name }}
				</text>
				<text class="fullscreen-map-stage">
					{{ getCurrentTimeline() ? getCurrentTimeline().stage : '神域' }}
				</text>
				<view class="fullscreen-map-mark mark-a"></view>
				<view class="fullscreen-map-mark mark-b"></view>
				<view class="fullscreen-map-mark mark-c"></view>
				<view class="fullscreen-map-mark mark-d"></view>
			</view>

			<view v-if="getTimelineList().length" class="fullscreen-timeline">
				<view class="fullscreen-track">
					<view class="fullscreen-fill" :style="{ width: getTimelineProgressWidth() }"></view>
				</view>
				<view class="fullscreen-nodes">
					<view
						v-for="(item, index) in getTimelineList()"
						:key="item.id"
						class="fullscreen-node"
						:class="{ active: activeTimelineIndex === index }"
						@click="selectTimeline(index)"
					>
						<view class="fullscreen-node-dot"></view>
						<text class="fullscreen-node-label">{{ item.stage }}</text>
					</view>
				</view>
			</view>

			<view class="fullscreen-stage-card" v-if="getCurrentTimeline()">
				<text class="fullscreen-stage-title">{{ getCurrentTimeline().title }}</text>
				<text class="fullscreen-stage-desc">{{ getCurrentTimeline().summary }}</text>
			</view>
		</view>
	</view>
</template>

<script>
import { norseWorlds } from '@/data/norseWorlds.js'
import { gods } from '@/data/norse.js'
import { stories } from '@/data/norse.js'
import { worldTimelines } from '@/data/worldTimelines.js'
import { unlockRavensClue, getRavensClueCount } from '@/utils/clueProgress.js'

export default {
	data() {
		return {
			world: {},
			currentTab: 'inhabitants',
			isPinned: false,
			selectedPin: -1,
			mapLocations: [],
			activeTimelineIndex: 2,
			testMode: false,
			testLog: [],
			isMapFullscreen: false
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
		if (this.world.id === 'asgard') {
			if (getRavensClueCount() < 3) {
				unlockRavensClue('trace')
			}
		}
	},
	methods: {
		goBack() {
			const pages = getCurrentPages()
			if (pages.length <= 1) {
				uni.switchTab({
					url: '/pages/index/index'
				})
			} else {
				uni.navigateBack()
			}
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
		},
		selectTimeline(index) {
			this.activeTimelineIndex = index
		},
		getMapIcon() {
			const tone = this.currentTimeline?.mapTone
			const icons = {
				mist: '◈',
				forest: '♧',
				gold: '✦',
				dusk: '☽',
				fire: '✧'
			}
			return icons[tone] || '◈'
		},
		getRelatedTypeLabel(type) {
			const labels = {
				god: '神祇',
				realm: '国度',
				creature: '生物',
				story: '故事'
			}
			return labels[type] || type
		},
		goToRelated(item) {
			if (!item) return
			switch (item.type) {
				case 'god':
					this.goToGod(item.id)
					break
				case 'story':
					this.goToStory(item.id)
					break
				case 'creature':
					uni.navigateTo({ url: `/pages/bestiary/creature-detail?id=${item.id}` })
					break
				case 'realm':
					uni.navigateTo({ url: `/pages/world/world-detail?id=${item.id}` })
					break
				default:
					uni.showToast({ title: '暂无法跳转', icon: 'none' })
			}
		},
		getCurrentTimeline() {
			const realmId = this.world && this.world.id ? this.world.id : this.id
			const list = this.getTimelineList()
			return list[this.activeTimelineIndex] || null
		},
		getTimelineList() {
			const realmId = this.world && this.world.id ? this.world.id : this.id
			return worldTimelines[realmId] || []
		},
		selectTimeline(index) {
			this.activeTimelineIndex = index
		},
		getTimelineProgressWidth() {
			const list = this.getTimelineList()
			if (!list.length) return '0%'
			if (list.length === 1) return '100%'
			return (this.activeTimelineIndex / (list.length - 1)) * 100 + '%'
		},
		goToArchiveItem(item) {
			this.goToRelated(item)
		},
		getMapToneClass() {
			const item = this.getCurrentTimeline()
			return item && item.mapTone ? 'tone-' + item.mapTone : 'tone-default'
		},
		addTestLog(message) {
			const time = new Date().toLocaleTimeString()
			this.testLog.push({ time, message })
			if (this.testLog.length > 20) {
				this.testLog.shift()
			}
		},
		openMapFullscreen() {
			this.isMapFullscreen = true
		},
		closeMapFullscreen() {
			this.isMapFullscreen = false
		},
		testTimelineSwitch() {
			this.testMode = true
			this.addTestLog('开始测试时间线切换')
			
			const testSequence = [0, 2, 4, 1, 3, 0]
			let index = 0
			
			const runTest = () => {
				if (index >= testSequence.length) {
					this.addTestLog('时间线切换测试完成')
					uni.showToast({ title: '时间线测试完成', icon: 'success' })
					return
				}
				
				const targetIndex = testSequence[index]
				this.selectTimeline(targetIndex)
				const timeline = this.getCurrentTimeline()
				this.addTestLog(`切换到阶段 ${targetIndex}: ${timeline?.stage} - ${timeline?.title}`)
				index++
				setTimeout(runTest, 800)
			}
			
			runTest()
		},
		testBackLogic() {
			const pages = getCurrentPages()
			this.addTestLog(`当前页面栈深度: ${pages.length}`)
			this.addTestLog(`是否需要返回首页: ${pages.length <= 1}`)
			
			if (pages.length <= 1) {
				this.addTestLog('测试: 将跳转到首页')
				uni.showModal({
					title: '返回测试',
					content: `页面栈深度: ${pages.length}\n将跳转到首页`,
					showCancel: false
				})
			} else {
				this.addTestLog('测试: 将返回上一页')
				uni.showModal({
					title: '返回测试',
					content: `页面栈深度: ${pages.length}\n将返回上一页`,
					showCancel: false
				})
			}
		},
		clearTestLog() {
			this.testLog = []
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

.back-btn-wrap {
	position: fixed;
	top: 40rpx;
	left: 24rpx;
	z-index: 100;
}

.back-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(11, 17, 24, 0.85);
	border: 1px solid #27384A;
	border-radius: 50%;
	color: #C6A15B;
	font-size: 48rpx;
	font-weight: 300;
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



.world-info {
	padding: 32rpx 24rpx 24rpx;
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

.world-map-stage {
	position: relative;
	height: 320rpx;
	border-radius: 24rpx;
	border: 1px solid #27384A;
	background: #172230;
	overflow: hidden;
	padding: 24rpx;
	box-sizing: border-box;
}

.world-map-stage::before {
	content: '';
	position: absolute;
	inset: 0;
	background:
		linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
	background-size: 60rpx 60rpx;
	opacity: 0.5;
}

.world-map-stage::after {
	content: '';
	position: absolute;
	inset: 0;
	background: radial-gradient(circle at 62% 34%, rgba(198,161,91,0.15), transparent 34%);
}

.world-map-stage .map-kicker {
	position: relative;
	z-index: 1;
	display: block;
	color: #66727F;
	font-size: 22rpx;
	letter-spacing: 4rpx;
}

.world-map-stage .map-title {
	position: relative;
	z-index: 1;
	display: block;
	margin-top: 120rpx;
	color: #F2F4F6;
	font-size: 36rpx;
	font-weight: 900;
}

.world-map-stage .map-subtitle {
	position: relative;
	z-index: 1;
	display: block;
	margin-top: 8rpx;
	color: #C6A15B;
	font-size: 24rpx;
}

.world-map-stage .map-mark {
	position: absolute;
	z-index: 2;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #D8C27A;
	box-shadow: 0 0 20rpx rgba(216,194,122,0.4);
}

.world-map-stage .mark-one {
	top: 100rpx;
	left: 80rpx;
}

.world-map-stage .mark-two {
	top: 160rpx;
	right: 100rpx;
}

.world-map-stage .mark-three {
	bottom: 80rpx;
	left: 180rpx;
}

.tone-mist {
	background: linear-gradient(135deg, #1B2527, #101820);
}

.tone-forest {
	background: linear-gradient(135deg, #14251E, #0E1721);
}

.tone-gold {
	background: linear-gradient(135deg, #1D2430, #131A22);
}

.tone-dusk {
	background: linear-gradient(135deg, #171A2A, #0E1721);
}

.tone-fire {
	background: linear-gradient(135deg, #2A1515, #0E1721);
}

.map-kicker {
	position: relative;
	z-index: 1;
	display: block;
	color: #66727F;
	font-size: 22rpx;
	letter-spacing: 4rpx;
}

.map-title {
	position: relative;
	z-index: 1;
	display: block;
	margin-top: 180rpx;
	color: #F2F4F6;
	font-size: 42rpx;
	font-weight: 900;
}

.map-stage {
	position: relative;
	z-index: 1;
	display: block;
	margin-top: 10rpx;
	color: #C6A15B;
	font-size: 24rpx;
}

.map-mark {
	position: absolute;
	z-index: 2;
	width: 18rpx;
	height: 18rpx;
	border-radius: 50%;
	background: #D8C27A;
	box-shadow: 0 0 24rpx rgba(216,194,122,0.45);
}

.mark-one {
	top: 120rpx;
	left: 120rpx;
}

.mark-two {
	top: 200rpx;
	right: 150rpx;
}

.mark-three {
	bottom: 100rpx;
	left: 240rpx;
}

.map-fullscreen-btn {
	position: absolute;
	z-index: 5;
	right: 22rpx;
	top: 22rpx;
	height: 52rpx;
	padding: 0 20rpx;
	border-radius: 999rpx;
	background: rgba(11,17,24,0.68);
	border: 1px solid rgba(198,161,91,0.45);
	color: #C6A15B;
	font-size: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.timeline-slider {
	margin-top: 28rpx;
	padding: 24rpx;
	border-radius: 22rpx;
	background: #172230;
	border: 1px solid #27384A;
}

.timeline-slider-tab {
	padding: 24rpx;
	border-radius: 22rpx;
	background: #172230;
	border: 1px solid #27384A;
}

.timeline-track {
	position: relative;
	height: 8rpx;
	background: #0B1118;
	border-radius: 999rpx;
	overflow: hidden;
}

.timeline-fill {
	height: 100%;
	background: linear-gradient(90deg, #C6A15B, #D8C27A);
	border-radius: 999rpx;
}

.timeline-nodes {
	display: flex;
	justify-content: space-between;
	margin-top: 20rpx;
}

.timeline-node {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 20%;
}

.node-dot {
	width: 18rpx;
	height: 18rpx;
	border-radius: 50%;
	border: 2rpx solid #66727F;
	background: #0B1118;
}

.timeline-node.active .node-dot {
	border-color: #C6A15B;
	background: #C6A15B;
	box-shadow: 0 0 20rpx rgba(198,161,91,0.35);
}

.node-label {
	margin-top: 10rpx;
	color: #66727F;
	font-size: 20rpx;
}

.timeline-node.active .node-label {
	color: #C6A15B;
}

.timeline-detail-card {
	margin-top: 28rpx;
	padding: 30rpx;
	border-radius: 24rpx;
	background: #172230;
	border: 1px solid #27384A;
}

.timeline-kicker {
	display: block;
	color: #C6A15B;
	font-size: 22rpx;
	letter-spacing: 4rpx;
}

.timeline-title {
	display: block;
	margin-top: 14rpx;
	color: #F2F4F6;
	font-size: 36rpx;
	font-weight: 900;
}

.timeline-subtitle {
	display: block;
	margin-top: 8rpx;
	color: #A8B3BD;
	font-size: 25rpx;
}

.timeline-summary {
	display: block;
	margin-top: 20rpx;
	color: #A8B3BD;
	font-size: 26rpx;
	line-height: 1.75;
	white-space: normal;
	word-break: break-word;
}

.event-list {
	margin-top: 28rpx;
}

.event-title {
	display: block;
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 800;
	margin-bottom: 16rpx;
}

.event-item {
	display: flex;
	gap: 14rpx;
	margin-bottom: 14rpx;
}

.event-dot {
	width: 10rpx;
	height: 10rpx;
	margin-top: 14rpx;
	border-radius: 50%;
	background: #C6A15B;
	flex-shrink: 0;
}

.event-text {
	flex: 1;
	color: #A8B3BD;
	font-size: 25rpx;
	line-height: 1.6;
}

.related-mini {
	margin-top: 28rpx;
	padding-top: 20rpx;
	border-top: 1px solid #27384A;
}

.related-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.related-tag {
	padding: 8rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(198,161,91,0.14);
	color: #C6A15B;
	font-size: 22rpx;
}

.empty-timeline {
	padding: 40rpx 32rpx;
	border-radius: 24rpx;
	background: #172230;
	border: 1px solid #27384A;
}

.empty-title {
	display: block;
	color: #F2F4F6;
	font-size: 30rpx;
	font-weight: 800;
}

.empty-desc {
	display: block;
	margin-top: 12rpx;
	color: #A8B3BD;
	font-size: 25rpx;
	line-height: 1.6;
}

@keyframes fadeUp {
	from {
		opacity: 0;
		transform: translateY(16rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.test-panel {
	margin-top: 32rpx;
	padding: 24rpx;
	border-radius: 20rpx;
	background: rgba(198,161,91,0.08);
	border: 1px solid rgba(198,161,91,0.2);
}

.test-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.test-title {
	color: #C6A15B;
	font-size: 26rpx;
	font-weight: 700;
}

.test-btn {
	color: #66727F;
	font-size: 22rpx;
}

.test-buttons {
	display: flex;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.test-button {
	flex: 1;
	height: 72rpx;
	border-radius: 36rpx;
	background: #172230;
	border: 1px solid #27384A;
	color: #A8B3BD;
	font-size: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.test-button.primary {
	background: linear-gradient(135deg, #C6A15B, #D8C27A);
	border-color: #C6A15B;
	color: #0B1118;
	font-weight: 700;
}

.test-log {
	padding-top: 20rpx;
	border-top: 1px solid rgba(39, 56, 74, 0.5);
}

.log-title {
	display: block;
	color: #66727F;
	font-size: 22rpx;
	margin-bottom: 12rpx;
}

.log-content {
	max-height: 240rpx;
	background: #0B1118;
	border-radius: 12rpx;
	padding: 16rpx;
}

.log-item {
	display: flex;
	gap: 12rpx;
	margin-bottom: 8rpx;
}

.log-time {
	color: #4A5568;
	font-size: 20rpx;
	flex-shrink: 0;
}

.log-message {
	color: #A8B3BD;
	font-size: 22rpx;
}

.fullscreen-map-layer {
	position: fixed;
	z-index: 9999;
	inset: 0;
	background: #0B1118;
	color: #F2F4F6;
	padding: 32rpx;
	box-sizing: border-box;
}

.fullscreen-map-header {
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.fullscreen-close {
	width: 112rpx;
	height: 56rpx;
	border-radius: 999rpx;
	border: 1px solid rgba(198,161,91,0.45);
	color: #C6A15B;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
}

.fullscreen-title-wrap {
	flex: 1;
	text-align: center;
	padding-right: 112rpx;
}

.fullscreen-title {
	display: block;
	color: #F2F4F6;
	font-size: 30rpx;
	font-weight: 800;
}

.fullscreen-subtitle {
	display: block;
	margin-top: 4rpx;
	color: #A8B3BD;
	font-size: 22rpx;
}

.fullscreen-map {
	position: relative;
	height: 58vh;
	margin-top: 20rpx;
	border-radius: 30rpx;
	border: 1px solid #27384A;
	overflow: hidden;
	padding: 34rpx;
	box-sizing: border-box;
}

.fullscreen-map::before {
	content: '';
	position: absolute;
	inset: 0;
	background:
		linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
	background-size: 88rpx 88rpx;
	opacity: 0.5;
}

.fullscreen-map::after {
	content: '';
	position: absolute;
	inset: 0;
	background: radial-gradient(circle at 56% 34%, rgba(198,161,91,0.18), transparent 36%);
}

.fullscreen-map-kicker,
.fullscreen-map-title,
.fullscreen-map-stage {
	position: absolute;
	left: 34rpx;
	z-index: 2;
}

.fullscreen-map-kicker {
	top: 34rpx;
	color: #66727F;
	font-size: 24rpx;
	letter-spacing: 4rpx;
}

.fullscreen-map-title {
	bottom: 80rpx;
	color: #F2F4F6;
	font-size: 48rpx;
	font-weight: 900;
}

.fullscreen-map-stage {
	bottom: 34rpx;
	left: 34rpx;
	color: #C6A15B;
	font-size: 26rpx;
}

.fullscreen-map-mark {
	position: absolute;
	z-index: 3;
	width: 22rpx;
	height: 22rpx;
	border-radius: 50%;
	background: #D8C27A;
	box-shadow: 0 0 26rpx rgba(216,194,122,0.5);
}

.mark-a {
	top: 22%;
	left: 28%;
}

.mark-b {
	top: 38%;
	right: 24%;
}

.mark-c {
	bottom: 28%;
	left: 44%;
}

.mark-d {
	bottom: 20%;
	right: 34%;
}

.fullscreen-timeline {
	margin-top: 28rpx;
	padding: 24rpx;
	border-radius: 24rpx;
	background: #172230;
	border: 1px solid #27384A;
}

.fullscreen-track {
	height: 8rpx;
	background: #0B1118;
	border-radius: 999rpx;
	overflow: hidden;
}

.fullscreen-fill {
	height: 100%;
	background: linear-gradient(90deg, #C6A15B, #D8C27A);
	border-radius: 999rpx;
}

.fullscreen-nodes {
	display: flex;
	justify-content: space-between;
	margin-top: 20rpx;
}

.fullscreen-node {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 20%;
}

.fullscreen-node-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	border: 2rpx solid #66727F;
	background: #0B1118;
}

.fullscreen-node.active .fullscreen-node-dot {
	background: #C6A15B;
	border-color: #C6A15B;
}

.fullscreen-node-label {
	margin-top: 10rpx;
	color: #66727F;
	font-size: 21rpx;
}

.fullscreen-node.active .fullscreen-node-label {
	color: #C6A15B;
}

.fullscreen-stage-card {
	margin-top: 24rpx;
	padding: 24rpx;
	border-radius: 22rpx;
	background: #172230;
	border: 1px solid #27384A;
}

.fullscreen-stage-title {
	display: block;
	color: #F2F4F6;
	font-size: 30rpx;
	font-weight: 800;
}

.fullscreen-stage-desc {
	display: block;
	margin-top: 12rpx;
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.6;
	white-space: normal;
	word-break: break-word;
}
</style>
