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

		<TabBar current="gods" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import { gods as norseGods, godFactions } from '@/data/norse.js'

export default {
  components: { TabBar },
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

</style>