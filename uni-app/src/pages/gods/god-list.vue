<template>
	<view class="container">
		<view class="header">
			<text class="title">神祇百科</text>
			<text class="subtitle">认识阿萨神族、华纳神族与巨人之间复杂而古老的关系</text>
		</view>
		
		<view class="search-box">
			<text class="search-icon">*</text>
			<input class="search-input" placeholder="搜索神祇..." v-model="searchText" />
		</view>
		
		<view class="faction-tabs">
			<text 
				class="tab" 
				:class="{ active: currentFaction === '' }"
				@click="currentFaction = ''"
			>全部</text>
			<text 
				class="tab" 
				:class="{ active: currentFaction === '阿萨神族' }"
				@click="currentFaction = '阿萨神族'"
			>阿萨神族</text>
			<text 
				class="tab" 
				:class="{ active: currentFaction === '华纳神族' }"
				@click="currentFaction = '华纳神族'"
			>华纳神族</text>
			<text 
				class="tab" 
				:class="{ active: currentFaction === '巨人血统' }"
				@click="currentFaction = '巨人血统'"
			>巨人血统</text>
			<text 
				class="tab" 
				:class="{ active: currentFaction === '冥界' }"
				@click="currentFaction = '冥界'"
			>冥界</text>
			<text 
				class="tab" 
				:class="{ active: currentFaction === '其他' }"
				@click="currentFaction = '其他'"
			>其他</text>
		</view>
		
		<scroll-view class="god-list" scroll-y>
			<view 
				class="god-card" 
				v-for="god in filteredGods" 
				:key="god.id"
				@click="goToDetail(god.id)"
			>
				<view class="god-avatar" :class="getFactionClass(god.faction)">
					<text class="avatar-text">{{ god.name[0] }}</text>
				</view>
				<view class="god-info">
					<text class="god-name">{{ god.name }}</text>
					<text class="god-title">{{ god.originalName }}</text>
					<text class="god-domain">{{ god.domain.slice(0, 3).join(' · ') }}</text>
				</view>
				<view class="faction-tag" :class="getFactionClass(god.faction)">
					{{ god.faction }}
				</view>
				<text class="arrow">›</text>
			</view>
		</scroll-view>

		<view class="bottom-tab">
			<view class="tab-item" @click="goToTab('home')">
				<view class="tab-icon-box"><view class="css-icon icon-home"></view></view>
				<text class="tab-label">首页</text>
			</view>
			<view class="tab-item active">
				<view class="tab-icon-box"><view class="css-icon icon-gods"></view></view>
				<text class="tab-label">神祇</text>
			</view>
			<view class="tab-item" @click="goToTab('stories')">
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
import { norseGods } from '@/data/norseGods.js'

export default {
	data() {
		return {
			gods: norseGods,
			searchText: '',
			currentFaction: ''
		}
	},
	computed: {
		filteredGods() {
			let result = this.gods
			if (this.searchText) {
				result = result.filter(god => 
					god.name.includes(this.searchText) || 
					god.originalName.toLowerCase().includes(this.searchText.toLowerCase())
				)
			}
			if (this.currentFaction) {
				result = result.filter(god => god.faction === this.currentFaction)
			}
			return result
		}
	},
	methods: {
		goToDetail(id) {
			uni.navigateTo({
				url: `/pages/gods/god-detail?id=${id}`
			})
		},
		getFactionClass(faction) {
			const classes = {
				'阿萨神族': 'asa',
				'华纳神族': 'vana',
				'巨人血统 / 阿萨同伴': 'giant',
				'洛基之女 / 冥界统治者': 'hel'
			}
			return classes[faction] || ''
		},
		goToTab(tab) {
			const routes = {
				home: '/pages/index/index',
				stories: '/pages/stories/story-list',
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
	padding-bottom: 120rpx;
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

.search-box {
	display: flex;
	align-items: center;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	padding: 20rpx 24rpx;
	margin-bottom: 30rpx;
}

.search-icon {
	font-size: 28rpx;
	margin-right: 16rpx;
}

.search-input {
	flex: 1;
	color: #F2F4F6;
	font-size: 28rpx;
}

.faction-tabs {
	display: flex;
	margin-bottom: 24rpx;
	overflow-x: auto;
	overflow-y: hidden;
}

.faction-tabs::-webkit-scrollbar {
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

.god-list {
	height: calc(100vh - 400rpx);
}

.god-card {
	display: flex;
	align-items: center;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 30rpx;
	transition: all 0.2s ease;
}

.god-card:active {
	transform: scale(0.98);
	border-color: #8FB6D9;
}

.god-avatar {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #C6A15B, #8B7030);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
}

.god-avatar.asa {
	background: linear-gradient(135deg, #C6A15B, #8B7030);
}

.god-avatar.vana {
	background: linear-gradient(135deg, #7C8C74, #4A5C4A);
}

.god-avatar.giant {
	background: linear-gradient(135deg, #B94A48, #7A2A2A);
}

.god-avatar.hel {
	background: linear-gradient(135deg, #66727F, #4A5A5A);
}

.avatar-text {
	color: #F2F4F6;
	font-size: 32rpx;
	font-weight: bold;
}

.god-info {
	flex: 1;
}

.god-name {
	display: block;
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: bold;
	margin-bottom: 4rpx;
}

.god-title {
	display: block;
	color: #C6A15B;
	font-size: 22rpx;
	margin-bottom: 4rpx;
}

.god-domain {
	display: block;
	color: #66727F;
	font-size: 20rpx;
}

.faction-tag {
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	font-size: 18rpx;
	margin-right: 12rpx;
}

.faction-tag.asa {
	background: rgba(198, 161, 91, 0.2);
	color: #C6A15B;
}

.faction-tag.vana {
	background: rgba(124, 140, 116, 0.2);
	color: #7C8C74;
}

.faction-tag.giant {
	background: rgba(185, 74, 72, 0.2);
	color: #B94A48;
}

.faction-tag.hel {
	background: rgba(102, 114, 127, 0.2);
	color: #66727F;
}

.arrow {
	color: #66727F;
	font-size: 32rpx;
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