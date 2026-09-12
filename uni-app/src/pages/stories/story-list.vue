<template>
	<view class="container page-enter">
		<PageHeader kicker="SAGA OF THE NORTH" title="神话故事" subtitle="沿着命运的时间线，阅读从创世到诸神黄昏与世界重生的故事。" />

		<view class="view-toggle">
			<view
				class="toggle-btn"
				:class="{ active: viewMode === 'timeline' }"
				@click="viewMode = 'timeline'"
			>
				<text>时间轴</text>
			</view>
			<view
				class="toggle-btn"
				:class="{ active: viewMode === 'list' }"
				@click="viewMode = 'list'"
			>
				<text>故事列表</text>
			</view>
		</view>

		<view v-if="viewMode === 'timeline'" class="timeline-list">
			<view
				v-for="(phase, index) in timeline"
				:key="phase.id + '-' + refreshTick"
				class="timeline-phase stagger-item"
				:style="{ animationDelay: Math.min(index, 12) * 0.05 + 's' }"
			>
				<view class="phase-header" @click="togglePhase(phase.id)">
					<view class="phase-marker" :style="{ background: phase.color }"></view>
					<view class="phase-title-group">
						<text class="phase-title">{{ phase.title }}</text>
						<text class="phase-subtitle">{{ phase.subtitle }}</text>
					</view>
					<text class="phase-toggle">{{ isPhaseExpanded(phase.id) ? '−' : '+' }}</text>
				</view>

				<view v-if="isPhaseExpanded(phase.id)" class="phase-events">
					<view
						v-for="event in phase.events"
						:key="event.id"
						class="timeline-event"
						@click="goToStory(event.relatedStory)"
					>
						<view class="event-dot" :style="{ background: phase.color }"></view>
						<view class="event-content">
							<text class="event-title">{{ event.title }}</text>
							<text class="event-summary">{{ event.summary }}</text>
							<view class="event-tags">
								<text
									v-for="tag in event.tags"
									:key="tag"
									class="event-tag"
								>
									{{ tag }}
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view v-if="viewMode === 'list'" class="list-mode">
			<view class="category-tabs">
				<text
					v-for="cat in categories"
					:key="cat.id"
					class="tab"
					:class="{ active: currentCategory === cat.id }"
					@click="setCategory(cat.id)"
				>{{ cat.label }}</text>
				<view
					v-if="tabIndicator.ready"
					class="tab-indicator"
					:style="{ transform: 'translateX(' + tabIndicator.left + 'px)', width: tabIndicator.width + 'px' }"
				></view>
			</view>

			<scroll-view class="story-list" scroll-y>
				<view class="story-card stagger-item"
					v-for="(story, index) in filteredStories"
					:key="story.id"
					:style="{ animationDelay: Math.min(index, 12) * 0.05 + 's' }"
					@click="goToDetail(story.id)"
				>
					<view class="story-icon">{{ story.title.charAt(0) }}</view>
					<view class="story-info">
						<text class="story-title">{{ story.title }}</text>
						<text class="story-summary">{{ story.summary }}</text>
						<view class="story-meta">
							<text class="story-time">{{ story.readingTime }}</text>
							<text class="story-chars" v-if="story.characters && story.characters.length">{{ story.characters.slice(0, 2).join(' · ') }}</text>
						</view>
					</view>
					<text class="arrow">›</text>
				</view>
			</scroll-view>
		</view>

		<TabBar current="stories" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { db } from '@/db'
import { storyCategories } from '@/data/norseStories.js'

export default {
  components: { TabBar, PageHeader },
	data() {
		return {
			stories: db.findAll('stories'),
			timeline: db.findAll('timeline'),
			categories: storyCategories,
			viewMode: 'timeline',
			currentCategory: '',
			expandedPhaseIds: ['creation-age'],
			tabIndicator: { left: 0, width: 0, ready: false }
		}
	},
	watch: {
		// 切到列表视图时 tab 才首次渲染，需要重新测量指示器
		viewMode(val) {
			if (val === 'list') this.updateTabIndicator()
		}
	},
	computed: {
		filteredStories() {
			if (!this.currentCategory) return this.stories
			return this.stories.filter(s => s.category === this.currentCategory)
		}
	},
	methods: {
		// 下拉刷新回调：重新读取故事与时间线
		onRefresh() {
			this.stories = db.findAll('stories')
			this.timeline = db.findAll('timeline')
		},
		setCategory(id) {
			this.currentCategory = id
			this.updateTabIndicator()
		},
		// 测量当前激活 tab 的位置，驱动滑动指示器
		updateTabIndicator() {
			this.$nextTick(() => {
				uni.createSelectorQuery().in(this)
					.select('.category-tabs').boundingClientRect()
					.selectAll('.category-tabs .tab').boundingClientRect()
					.exec((res) => {
						const barRect = res && res[0]
						const tabRects = res && res[1]
						if (!barRect || !tabRects || !tabRects.length) return
						const index = Math.max(0, this.categories.findIndex(c => c.id === this.currentCategory))
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
		togglePhase(id) {
			if (!id) return
			const index = this.expandedPhaseIds.indexOf(id)
			if (index >= 0) {
				this.expandedPhaseIds.splice(index, 1)
			} else {
				this.expandedPhaseIds.push(id)
			}
		},
		isPhaseExpanded(id) {
			return this.expandedPhaseIds.includes(id)
		},
		goToDetail(id) {
			if (!id) return
			const story = this.stories.find(s => s.id === id)
			if (story) {
				uni.navigateTo({
					url: `/pages/stories/story-detail?id=${id}`
				})
			}
		},
		goToStory(storyId) {
			if (!storyId) return
			const story = this.stories.find(s => s.id === storyId)
			if (story) {
				uni.navigateTo({
					url: `/pages/stories/story-detail?id=${storyId}`
				})
			}
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
	overflow-x: hidden;
}

.view-toggle {
	display: flex;
	gap: 16rpx;
	margin: 28rpx 0;
}

.toggle-btn {
	flex: 1;
	height: 64rpx;
	border-radius: 999rpx;
	background: #172230;
	color: #A8B3BD;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	border: 1rpx solid #27384A;
	transition: color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
}

.toggle-btn:active {
	transform: scale(0.96);
}

.toggle-btn.active {
	background: #C6A15B;
	color: #0B1118;
	border-color: #C6A15B;
	font-weight: 700;
}

.timeline-list {
	position: relative;
	padding-left: 22rpx;
	margin-top: 12rpx;
}

.timeline-list::before {
	content: '';
	position: absolute;
	left: 12rpx;
	top: 20rpx;
	bottom: 20rpx;
	width: 2rpx;
	background: linear-gradient(to bottom, rgba(198,161,91,0.8), rgba(39,56,74,0.3));
}

.timeline-phase {
	position: relative;
	margin-bottom: 22rpx;
}

.phase-header {
	display: flex;
	align-items: center;
	gap: 18rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 22rpx;
	padding: 24rpx;
	box-sizing: border-box;
}

.phase-header:active {
	opacity: 0.82;
}

.phase-marker {
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	border: 3rpx solid rgba(242,244,246,0.18);
	flex-shrink: 0;
}

.phase-title-group {
	flex: 1;
	min-width: 0;
}

.phase-title {
	display: block;
	color: #F2F4F6;
	font-size: 30rpx;
	font-weight: 800;
}

.phase-subtitle {
	display: block;
	margin-top: 8rpx;
	color: #A8B3BD;
	font-size: 22rpx;
	line-height: 1.5;
	white-space: normal;
	word-break: break-word;
}

.phase-toggle {
	color: #C6A15B;
	font-size: 36rpx;
	font-weight: 300;
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	transition: transform 0.15s ease;
}

.phase-toggle:active {
	transform: scale(0.85);
}

.phase-events {
	margin-left: 12rpx;
	padding-left: 24rpx;
	border-left: 1rpx solid rgba(198,161,91,0.28);
	margin-top: 14rpx;
}

.timeline-event {
	position: relative;
	display: flex;
	gap: 16rpx;
	padding: 20rpx 0;
}

.timeline-event:active {
	opacity: 0.82;
}

.event-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #C6A15B;
	margin-top: 10rpx;
	flex-shrink: 0;
	box-shadow: 0 0 18rpx rgba(198,161,91,0.25);
}

.event-content {
	flex: 1;
	min-width: 0;
	background: rgba(23,34,48,0.72);
	border: 1rpx solid rgba(39,56,74,0.78);
	border-radius: 18rpx;
	padding: 20rpx;
	box-sizing: border-box;
}

.event-title {
	display: block;
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 700;
	line-height: 1.35;
}

.event-summary {
	display: block;
	margin-top: 8rpx;
	color: #A8B3BD;
	font-size: 23rpx;
	line-height: 1.55;
	white-space: normal;
	word-break: break-word;
}

.event-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-top: 14rpx;
}

.event-tag {
	padding: 4rpx 10rpx;
	border-radius: 999rpx;
	background: rgba(198,161,91,0.14);
	color: #C6A15B;
	font-size: 18rpx;
	line-height: 1.2;
}

.list-mode {
	display: flex;
	flex-direction: column;
}

.category-tabs {
	display: flex;
	position: relative;
	margin-bottom: 24rpx;
	overflow-x: auto;
	overflow-y: hidden;
}

.category-tabs::-webkit-scrollbar {
	display: none;
}

.tab {
	padding: 14rpx 26rpx;
	color: #66727F;
	font-size: 24rpx;
	white-space: nowrap;
	border-radius: 30rpx;
	background: #172230;
	margin-right: 12rpx;
	border: 1rpx solid transparent;
	transition: color 0.2s ease, transform 0.15s ease;
}

.tab:active {
	transform: scale(0.95);
}

.tab.active {
	color: #C6A15B;
}

/* 滑动胶囊指示器：随激活 tab 平移 */
.tab-indicator {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	border: 1rpx solid #C6A15B;
	border-radius: 30rpx;
	box-sizing: border-box;
	pointer-events: none;
	z-index: 1;
	transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), width 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.story-list {
	height: calc(100vh - 400rpx);
}

.story-card {
	display: flex;
	align-items: center;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 18rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-sizing: border-box;
	transition: transform 0.15s ease, border-color 0.15s ease;
}

.story-card:active {
	transform: scale(0.98);
	border-color: rgba(198,161,91,0.55);
}

.story-icon {
	font-size: 48rpx;
	color: #C6A15B;
	margin-right: 20rpx;
}

.story-info {
	flex: 1;
}

.story-title {
	display: block;
	color: #F2F4F6;
	font-size: 30rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.story-summary {
	display: block;
	width: 100%;
	max-width: 100%;
	color: #A8B3BD;
	font-size: 26rpx;
	margin-bottom: 12rpx;
	word-break: break-word;
	overflow-wrap: break-word;
	white-space: normal;
	line-height: 1.5;
}

.story-meta {
	display: flex;
	gap: 16rpx;
}

.story-time,
.story-chars {
	color: #66727F;
	font-size: 22rpx;
}

.arrow {
	color: #66727F;
	font-size: 36rpx;
}

</style>
