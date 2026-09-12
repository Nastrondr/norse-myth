<template>
	<view class="container page-enter-deep">
		<NavBar title="九界详情" />
		<view class="header">
			<text class="title">{{ world.name || '九界详情' }}</text>
			<text class="subtitle">{{ world.originalName }}</text>
		</view>

		<view
			class="world-map-stage"
			:class="[getMapToneClass(), world.mapImage ? 'has-image' : '']"
			:style="heroStyle"
		>
				<image
					v-if="world.mapImage"
					class="map-art"
					:src="world.mapImage"
					mode="aspectFill"
				></image>
				<view class="map-fullscreen-btn" @click.stop="openMapFullscreen">全屏</view>
				<text class="map-kicker">{{ world.originalName || world.name }}</text>
				<view
					v-for="(loc, index) in mapLocations"
					:key="loc.original"
					class="map-pin"
					:class="{ active: selectedPin === index }"
					:style="embeddedPinStyle(loc)"
					@click.stop="selectPin(index)"
				>
					<view class="map-pin-dot"></view>
					<text class="map-pin-label">{{ loc.name }}</text>
				</view>
			</view>

			<view class="world-info">
				<view class="info-header">
					<text class="world-name">{{ world.name }}</text>
				</view>
				<text class="world-subtitle">{{ world.subtitle }}</text>
				<text class="world-description">{{ world.description }}</text>
			</view>

			<view class="tab-bar">
				<view class="tab-underline" :style="{ transform: 'translateX(' + tabIndex * 100 + '%)' }"></view>
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
					:class="{ highlighted: selectedPin > -1 && displayLocations.length === 1 }"
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

			<view class="fullscreen-map" :class="[getMapToneClass(), world.mapImage ? 'has-image' : '']">
				<!-- 有手绘图：3:4 画框内嵌 1:1 方形画布，可拖动 / 双指缩放 -->
				<view
					v-if="world.mapImage"
					class="map-pan-layer"
					:style="panLayerStyle"
					@touchstart="onPanStart"
					@touchmove.stop.prevent="onPanMove"
					@touchend="onPanEnd"
					@touchcancel="onPanEnd"
				>
					<image class="map-art" :src="world.mapImage" mode="aspectFill"></image>
					<view
						v-for="(loc, index) in mapLocations"
						:key="loc.original"
						class="map-pin"
						:class="{ active: selectedPin === index }"
						:style="{ left: loc.x + '%', top: loc.y + '%' }"
						@click.stop="selectPinFromMap(index)"
					>
						<view class="map-pin-dot"></view>
						<text class="map-pin-label">{{ loc.name }}</text>
					</view>
				</view>
				<!-- 无图回退：点位直接放在画框上 -->
				<template v-else>
					<view
						v-for="(loc, index) in mapLocations"
						:key="loc.original"
						class="map-pin"
						:class="{ active: selectedPin === index }"
						:style="{ left: loc.x + '%', top: loc.y + '%' }"
						@click.stop="selectPinFromMap(index)"
					>
						<view class="map-pin-dot"></view>
						<text class="map-pin-label">{{ loc.name }}</text>
					</view>
				</template>
				<text class="fullscreen-map-kicker">{{ world.originalName || world.name }}</text>
				<text class="fullscreen-map-title">
					{{ getCurrentTimeline() ? getCurrentTimeline().title : world.name }}
				</text>
				<text class="fullscreen-map-stage">
					{{ getCurrentTimeline() ? getCurrentTimeline().stage : '神域' }}
				</text>
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
import { db } from '@/db'
import { unlockRavensClue, getRavensClueCount } from '@/utils/clueProgress.js'
import NavBar from '@/components/NavBar.vue'
import heroParallax from '@/mixins/heroParallax.js'

export default {
	components: { NavBar },
	mixins: [heroParallax],
	data() {
		return {
			world: {},
			currentTab: 'inhabitants',
			selectedPin: -1,
			mapLocations: [],
			activeTimelineIndex: 2,
			isMapFullscreen: false,
			// 全屏地图画布的拖动 / 缩放状态
			fsScale: 1,
			fsOffsetX: 0,
			fsOffsetY: 0,
			fsFrameW: 0,
			fsFrameH: 0,
			// 画布实际尺寸（按图片真实比例盖满画框算出）与图片宽高比（w/h，0 表示未知）
			fsLayerW: 0,
			fsLayerH: 0,
			imgRatio: 0
		}
	},
	computed: {
		// 当前激活 tab 的序号，驱动下划线平移
		tabIndex() {
			const order = ['inhabitants', 'locations', 'legends', 'timeline']
			const index = order.indexOf(this.currentTab)
			return index < 0 ? 0 : index
		},
		relatedGods() {
			if (!this.world.relatedGods) return []
			return this.world.relatedGods.map(id => db.findById('gods', id)).filter(Boolean)
		},
		relatedStories() {
			if (!this.world.relatedStories) return []
			return this.world.relatedStories.map(id => db.findById('stories', id)).filter(Boolean)
		},
		displayLocations() {
			if (this.selectedPin >= 0 && this.selectedPin < this.mapLocations.length) {
				return [this.mapLocations[this.selectedPin]]
			}
			return this.mapLocations
		},
		// 全屏画布：尺寸按图片比例盖满画框，变换先居中再叠加拖动偏移与缩放
		panLayerStyle() {
			return {
				width: this.fsLayerW ? this.fsLayerW + 'px' : '100%',
				height: this.fsLayerH ? this.fsLayerH + 'px' : '100%',
				transform:
					'translate(-50%, -50%) translate(' + this.fsOffsetX + 'px, ' + this.fsOffsetY + 'px) scale(' + this.fsScale + ')'
			}
		}
	},
	onLoad(options) {
		const worldId = options.id || 'asgard'
		const worlds = db.findAll('worlds')
		this.world = worlds.find(w => w.id === worldId) || worlds[0]
		this.initMapLocations()
		this.loadImageRatio()
		if (this.world.id === 'asgard') {
			if (getRavensClueCount() < 3) {
				unlockRavensClue('trace')
			}
		}
	},
	// 地图视差：地图随滚动缓慢下移并淡出
	onPageScroll(e) {
		this.updateHeroParallax(e.scrollTop)
	},
	mounted() {
		// #ifdef H5
		// 桌面浏览器：全局监听鼠标移动 / 抬起，配合画布上的 mousedown 完成拖动
		window.addEventListener('mousemove', this.onPanMouseMove)
		window.addEventListener('mouseup', this.onPanMouseUp)
		// #endif
	},
	beforeUnmount() {
		// #ifdef H5
		window.removeEventListener('mousemove', this.onPanMouseMove)
		window.removeEventListener('mouseup', this.onPanMouseUp)
		// #endif
	},
	methods: {
		switchTab(tab) {
			this.currentTab = tab
			if (tab === 'locations') {
				this.selectedPin = -1
			}
		},
		selectPin(index) {
			this.selectedPin = this.selectedPin === index ? -1 : index
			this.currentTab = 'locations'
		},
		// 全屏地图上点击点位：选中并退回页面，直接看到对应的地点卡片
		selectPinFromMap(index) {
			this.selectPin(index)
			this.closeMapFullscreen()
		},
		initMapLocations() {
			const locations = this.getWorldLocations()
			this.mapLocations = locations.slice(0, 5)
		},
		getWorldLocations() {
			// 点位数据来自 norseWorlds.js 的 mapLocations；未配置的国度回退到占位点位
			const fallback = [
				{ name: 'A', original: 'Unknown', icon: '◇', desc: '等待探索', x: 45, y: 45 }
			]
			return Array.isArray(this.world.mapLocations) && this.world.mapLocations.length
				? this.world.mapLocations
				: fallback
		},
		// 内嵌舞台为 4:3 横版、图片 aspectFill 居中裁切：
		// 把图上的百分比坐标映射到可见画框上；落在裁切区外的点位夹到边缘，保持可见可点
		embeddedPinStyle(loc) {
			const frameRatio = 4 / 3
			const ratio = this.imgRatio > 0 ? this.imgRatio : 1
			let x = loc.x
			let y = loc.y
			if (ratio > frameRatio) {
				// 图比画框宽：左右裁切
				const vis = frameRatio / ratio
				x = (loc.x / 100 - (1 - vis) / 2) / vis * 100
			} else if (ratio < frameRatio) {
				// 图比画框高：上下裁切
				const vis = ratio / frameRatio
				y = (loc.y / 100 - (1 - vis) / 2) / vis * 100
			}
			// 边缘留 8% 余量，保证点位连同标签完整落在画框内
			const clamp = v => Math.max(8, Math.min(92, Math.round(v)))
			return { left: clamp(x) + '%', top: clamp(y) + '%' }
		},
		getGodColor(faction) {
			if (!faction) return 'linear-gradient(135deg, #66727F 0%, #3A4450 100%)'
			if (faction.includes('华纳')) return 'linear-gradient(135deg, #7C8C74 0%, #4A5C4A 100%)'
			if (faction.includes('巨人')) return 'linear-gradient(135deg, #B94A48 0%, #7A2A2A 100%)'
			if (faction.includes('冥界')) return 'linear-gradient(135deg, #66727F 0%, #3A4450 100%)'
			if (faction.includes('阿萨')) return 'linear-gradient(135deg, #C6A15B 0%, #8B7030 100%)'
			return 'linear-gradient(135deg, #66727F 0%, #3A4450 100%)'
		},
		goToGod(id) {
			const god = db.findById('gods', id)
			if (god) {
				uni.navigateTo({ url: `/pages/gods/god-detail?id=${id}` })
			}
		},
		goToStory(id) {
			const story = db.findById('stories', id)
			if (story) {
				uni.navigateTo({ url: `/pages/stories/story-detail?id=${id}` })
			}
		},
		selectTimeline(index) {
			this.activeTimelineIndex = index
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
			return (db.getDoc('worldTimelines')[realmId] || [])
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
		loadImageRatio() {
			if (!this.world.mapImage || this.imgRatio) return
			uni.getImageInfo({
				src: this.world.mapImage,
				success: res => {
					if (res.width && res.height) {
						this.imgRatio = res.width / res.height
						// 若全屏已打开，补算画布尺寸
						if (this.isMapFullscreen) this.computePanLayerSize()
					}
				}
			})
		},
		openMapFullscreen() {
			// 每次打开重置画布：1 倍缩放、居中
			this.fsScale = 1
			this.fsOffsetX = 0
			this.fsOffsetY = 0
			this.isMapFullscreen = true
			this.$nextTick(() => {
				// 量取画框尺寸，用于拖动 / 缩放的边界夹取
				uni.createSelectorQuery().in(this).select('.fullscreen-map').boundingClientRect(rect => {
					if (rect && rect.width) {
						this.fsFrameW = rect.width
						this.fsFrameH = rect.height
						this.computePanLayerSize()
					}
					this.bindPanLayer()
				}).exec()
			})
		},
		computePanLayerSize() {
			// 画布按图片真实比例盖满画框：图比画框"宽"则取框高、图比画框"高"则取框宽，
			// 富余的方向就是可拖动的方向（方图左右拖、竖图上下拖）
			if (!this.fsFrameW || !this.fsFrameH) return
			const frameRatio = this.fsFrameW / this.fsFrameH
			const ratio = this.imgRatio > 0 ? this.imgRatio : frameRatio
			if (ratio > frameRatio) {
				this.fsLayerH = this.fsFrameH
				this.fsLayerW = this.fsFrameH * ratio
			} else {
				this.fsLayerW = this.fsFrameW
				this.fsLayerH = this.fsFrameW / ratio
			}
		},
		bindPanLayer() {
			// #ifdef H5
			// uni-view 组件只透传 touch 系列事件，桌面端的 mouse/wheel 直接在画布元素上原生绑定
			const layer = document.querySelector('.fullscreen-map .map-pan-layer')
			if (!layer) return
			layer.addEventListener('mousedown', this.onPanMouseDown)
			layer.addEventListener('wheel', this.onPanWheel, { passive: false })
			// #endif
		},
		closeMapFullscreen() {
			this.isMapFullscreen = false
		},
		/* ---------- 全屏地图：拖动 / 双指缩放 ---------- */
		getTouchDist(touches) {
			const dx = touches[0].clientX - touches[1].clientX
			const dy = touches[0].clientY - touches[1].clientY
			return Math.sqrt(dx * dx + dy * dy)
		},
		getTouchMid(touches) {
			return {
				x: (touches[0].clientX + touches[1].clientX) / 2,
				y: (touches[0].clientY + touches[1].clientY) / 2
			}
		},
		recordPanBaseline(touches) {
			this._panBaseX = this.fsOffsetX
			this._panBaseY = this.fsOffsetY
			if (touches.length >= 2) {
				this._panMode = 'pinch'
				this._panStartDist = this.getTouchDist(touches)
				this._panStartScale = this.fsScale
				const mid = this.getTouchMid(touches)
				this._panStartMidX = mid.x
				this._panStartMidY = mid.y
			} else {
				this._panMode = 'pan'
				this._panStartX = touches[0].clientX
				this._panStartY = touches[0].clientY
			}
		},
		applyZoom(scale) {
			this.fsScale = Math.round(Math.min(4, Math.max(1, scale)) * 100) / 100
			this.setPanOffset(this.fsOffsetX, this.fsOffsetY)
		},
		setPanOffset(x, y) {
			// 夹取偏移，保证画布（fsLayerW/H）在任意缩放下始终盖住画框
			if (!this.fsLayerW || !this.fsLayerH) {
				this.fsOffsetX = x
				this.fsOffsetY = y
				return
			}
			const halfW = Math.max(0, (this.fsLayerW * this.fsScale - this.fsFrameW) / 2)
			const halfH = Math.max(0, (this.fsLayerH * this.fsScale - this.fsFrameH) / 2)
			this.fsOffsetX = Math.round(Math.max(-halfW, Math.min(halfW, x)))
			this.fsOffsetY = Math.round(Math.max(-halfH, Math.min(halfH, y)))
		},
		onPanStart(e) {
			if (!e.touches || !e.touches.length) return
			this.recordPanBaseline(e.touches)
		},
		onPanMove(e) {
			if (!this._panMode || !e.touches) return
			if (this._panMode === 'pinch' && e.touches.length >= 2) {
				if (this._panStartDist > 0) {
					this.applyZoom(this._panStartScale * (this.getTouchDist(e.touches) / this._panStartDist))
				}
				const mid = this.getTouchMid(e.touches)
				this.setPanOffset(
					this._panBaseX + (mid.x - this._panStartMidX),
					this._panBaseY + (mid.y - this._panStartMidY)
				)
			} else if (this._panMode === 'pan' && e.touches.length === 1) {
				const t = e.touches[0]
				this.setPanOffset(
					this._panBaseX + (t.clientX - this._panStartX),
					this._panBaseY + (t.clientY - this._panStartY)
				)
			}
		},
		onPanEnd(e) {
			// 双指抬起一根：以剩余手指重建拖动基线，避免跳变
			if (e && e.touches && e.touches.length === 1) {
				this.recordPanBaseline(e.touches)
				return
			}
			this._panMode = ''
		},
		onPanMouseDown(e) {
			// 桌面浏览器：鼠标拖动（触屏走 touch 事件）
			if (e.button !== 0 || !this.world.mapImage) return
			this._panMouseDragging = true
			this._panMode = 'pan'
			this._panStartX = e.clientX
			this._panStartY = e.clientY
			this._panBaseX = this.fsOffsetX
			this._panBaseY = this.fsOffsetY
		},
		onPanMouseMove(e) {
			if (!this._panMouseDragging || this._panMode !== 'pan') return
			this.setPanOffset(
				this._panBaseX + (e.clientX - this._panStartX),
				this._panBaseY + (e.clientY - this._panStartY)
			)
		},
		onPanMouseUp() {
			this._panMouseDragging = false
			this._panMode = ''
		},
		onPanWheel(e) {
			// 桌面浏览器：滚轮缩放（双指捏合的桌面等价）
			this.applyZoom(this.fsScale * Math.exp(-e.deltaY * 0.0015))
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
	position: relative;
	border-bottom: 1rpx solid #27384A;
	margin: 0 24rpx;
}

/* 滑动下划线：宽度为 1/4，随激活 tab 平移 */
.tab-underline {
	position: absolute;
	left: 0;
	bottom: 0;
	width: 25%;
	height: 3rpx;
	background: #C6A15B;
	z-index: 1;
	transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.tab-item {
	flex: 1;
	padding: 24rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 3rpx solid transparent;
	margin-bottom: -1rpx;
	transition: opacity 0.15s ease;
}

.tab-item:active {
	opacity: 0.7;
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
	transition: transform 0.15s ease, border-color 0.15s ease;
}

.inhabitant-card:active {
	transform: scale(0.98);
	border-color: rgba(198,161,91,0.55);
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
	transition: border-color 0.2s ease, transform 0.15s ease;
}

.location-card:active {
	transform: scale(0.98);
	border-color: rgba(198,161,91,0.55);
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
	transition: transform 0.15s ease, border-color 0.15s ease;
}

.legend-card:active {
	transform: scale(0.98);
	border-color: rgba(198,161,91,0.55);
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
	/* 4:3 横版画框，节省上下空间；竖图 aspectFill 居中裁切，完整图进全屏看 */
	aspect-ratio: 4 / 3;
	border-radius: 24rpx;
	border: 1px solid #27384A;
	background: #172230;
	overflow: hidden;
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
	margin: 24rpx 0 0 24rpx;
	color: #66727F;
	font-size: 22rpx;
	letter-spacing: 4rpx;
}

/* 手绘地图底层：has-image 时图片铺满舞台，文字与点位浮于其上 */
.map-art {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 0;
	width: 100%;
	height: 100%;
	display: block;
}

.world-map-stage.has-image::before,
.fullscreen-map.has-image::before {
	/* 有真图时网格线只保留极淡一层，浮在图片上方 */
	z-index: 1;
	opacity: 0.2;
}

.world-map-stage.has-image::after,
.fullscreen-map.has-image::after {
	/* 用上下压暗渐变替换金晕，保证浅色画面上文字依然可读 */
	background: linear-gradient(
		180deg,
		rgba(11,17,24,0.52) 0%,
		rgba(11,17,24,0.08) 36%,
		rgba(11,17,24,0.06) 64%,
		rgba(11,17,24,0.55) 100%
	);
}

.map-pin {
	position: absolute;
	z-index: 3;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 14rpx;
	transform: translate(-50%, -50%);
}

.map-pin-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #D8C27A;
	box-shadow: 0 0 18rpx rgba(216,194,122,0.55), 0 0 0 6rpx rgba(216,194,122,0.12);
	transition: box-shadow 0.2s ease, background 0.2s ease;
}

.map-pin.active .map-pin-dot {
	background: #F2E3B3;
	box-shadow: 0 0 26rpx rgba(216,194,122,0.9), 0 0 0 10rpx rgba(216,194,122,0.2);
}

.map-pin-label {
	margin-top: 6rpx;
	color: #F2F4F6;
	font-size: 18rpx;
	letter-spacing: 1rpx;
	text-shadow: 0 2rpx 8rpx rgba(11,17,24,0.92);
	white-space: nowrap;
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

.map-fullscreen-btn {
	position: absolute;
	z-index: 5;
	right: 22rpx;
	top: 22rpx;
	height: 56rpx;
	padding: 0 24rpx;
	border-radius: 999rpx;
	background: rgba(11,17,24,0.68);
	border: 1px solid rgba(198,161,91,0.45);
	color: #C6A15B;
	font-size: 22rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.15s ease, background 0.15s ease;
}

.map-fullscreen-btn:active {
	transform: scale(0.94);
	background: rgba(198,161,91,0.22);
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
	padding: 12rpx 20rpx;
	border-radius: 999rpx;
	background: rgba(198,161,91,0.14);
	color: #C6A15B;
	font-size: 22rpx;
	transition: transform 0.15s ease, background 0.15s ease;
}

.related-tag:active {
	transform: scale(0.94);
	background: rgba(198,161,91,0.28);
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

.fullscreen-map-layer {
	position: fixed;
	z-index: 9999;
	inset: 0;
	background: #0B1118;
	color: #F2F4F6;
	padding: 32rpx;
	box-sizing: border-box;
	/* 画框变高后时间线/阶段卡可能超出屏幕，允许纵向滚动（画布内拖动已 prevent，不会冲突） */
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
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
	transition: transform 0.15s ease, background 0.15s ease;
}

.fullscreen-close:active {
	transform: scale(0.94);
	background: rgba(198,161,91,0.16);
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
	/* 3:4 竖屏画框：内嵌 1:1 方形画布，左右可拖动、双指缩放看细节 */
	aspect-ratio: 3 / 4;
	margin-top: 20rpx;
	border-radius: 30rpx;
	border: 1px solid #27384A;
	overflow: hidden;
	box-sizing: border-box;
	user-select: none;
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

.fullscreen-map::before,
.fullscreen-map::after {
	/* 装饰层不参与命中测试，触摸 / 点击穿透到画布与点位 */
	pointer-events: none;
}

.fullscreen-map::after {
	content: '';
	position: absolute;
	inset: 0;
	/* 压暗渐变提到画布（z-index:1）之上、文字之下，保证移动的画面上文字可读 */
	z-index: 2;
	background: radial-gradient(circle at 56% 34%, rgba(198,161,91,0.18), transparent 36%);
}

.fullscreen-map-kicker,
.fullscreen-map-title,
.fullscreen-map-stage {
	position: absolute;
	left: 34rpx;
	z-index: 3;
}

/* 可拖动画布：尺寸由 JS 按图片真实比例算出（盖满画框），这里只负责居中定位；
   图比画框宽则左右拖，图比画框高则上下拖；点位挂在画布内随图移动 */
.map-pan-layer {
	position: absolute;
	top: 50%;
	left: 50%;
	z-index: 1;
	touch-action: none;
	will-change: transform;
	cursor: grab;
}

.map-pan-layer:active {
	cursor: grabbing;
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

/* 全屏视图点位放大一档，更好点按 */
.fullscreen-map .map-pin-dot {
	width: 22rpx;
	height: 22rpx;
}

.fullscreen-map .map-pin-label {
	font-size: 22rpx;
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
