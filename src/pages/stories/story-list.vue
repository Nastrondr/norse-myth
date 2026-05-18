<template>
	<view class="container">
		<view class="header">
			<text class="title">神话故事</text>
			<text class="subtitle">沿着命运的时间线，阅读从创世到诸神黄昏与世界重生的故事。</text>
		</view>

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
				v-for="phase in timeline"
				:key="phase.id"
				class="timeline-phase"
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
					class="tab"
					:class="{ active: currentCategory === '' }"
					@click="currentCategory = ''"
				>全部</text>
				<text
					class="tab"
					:class="{ active: currentCategory === '创世神话' }"
					@click="currentCategory = '创世神话'"
				>创世神话</text>
				<text
					class="tab"
					:class="{ active: currentCategory === '神器传说' }"
					@click="currentCategory = '神器传说'"
				>神器传说</text>
				<text
					class="tab"
					:class="{ active: currentCategory === '末日预言' }"
					@click="currentCategory = '末日预言'"
				>末日预言</text>
			</view>

			<scroll-view class="story-list" scroll-y>
				<view class="story-card"
					v-for="story in filteredStories"
					:key="story.id"
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

		<view class="bottom-tab">
			<view class="tab-item" @click="goToTab('home')">
				<view class="tab-icon-box"><view class="css-icon icon-home"></view></view>
				<text class="tab-label">首页</text>
			</view>
			<view class="tab-item" @click="goToTab('gods')">
				<view class="tab-icon-box"><view class="css-icon icon-gods"></view></view>
				<text class="tab-label">神祇</text>
			</view>
			<view class="tab-item active">
				<view class="tab-icon-box"><view class="css-icon icon-stories"></view></view>
				<text class="tab-label">故事</text>
			</view>
			<view class="tab-item" @click="goToTab('bestiary')">
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
import { stories } from '@/data/norse.js'
import { norseTimeline } from '@/data/norseTimeline.js'

export default {
	data() {
		return {
			stories: stories,
			timeline: norseTimeline,
			viewMode: 'timeline',
			currentCategory: '',
			expandedPhaseIds: ['creation-age']
		}
	},
	computed: {
		filteredStories() {
			if (!this.currentCategory) return this.stories
			return this.stories.filter(s => s.category === this.currentCategory)
		}
	},
	methods: {
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
		},
		goToTab(tab) {
			const routes = {
				home: '/pages/index/index',
				gods: '/pages/gods/god-list',
				bestiary: '/pages/bestiary/bestiary-list',
				fun: '/pages/profile/profile'
			}
			if (routes[tab]) {
				uni.switchTab({ url: routes[tab] })
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
	overflow-x: hidden;
}

.header {
	text-align: center;
	padding: 24rpx 0 28rpx;
}

.title {
	display: block;
	font-size: 40rpx;
	font-weight: 800;
	line-height: 1.25;
	color: #F2F4F6;
}

.subtitle {
	display: block;
	margin-top: 12rpx;
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.5;
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
	width: 40rpx;
	text-align: center;
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
	margin-bottom: 24rpx;
	overflow-x: auto;
	overflow-y: hidden;
}

.category-tabs::-webkit-scrollbar {
	display: none;
}

.tab {
	padding: 12rpx 24rpx;
	color: #66727F;
	font-size: 24rpx;
	white-space: nowrap;
	border-radius: 30rpx;
	background: #172230;
	margin-right: 12rpx;
}

.tab.active {
	background: transparent;
	border: 1rpx solid #C6A15B;
	color: #C6A15B;
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
</style>
