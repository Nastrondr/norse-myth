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
		<PageHeader back kicker="PANTHEON" title="神祇百科" subtitle="认识阿萨神族、华纳神族与巨人之间复杂而古老的关系" />

		<view class="search-box">
			<view class="search-icon">
				<view class="search-icon-lens"></view>
			</view>
			<input class="search-input" placeholder="搜索神祇..." v-model="searchText" />
		</view>
		
		<view class="faction-tabs">
			<text
				v-for="faction in factionTabs"
				:key="faction.value"
				class="tab"
				:class="{ active: currentFaction === faction.value }"
				@click="setFaction(faction.value)"
			>{{ faction.label }}</text>
			<view
				v-if="tabIndicator.ready"
				class="tab-indicator"
				:style="{ transform: 'translateX(' + tabIndicator.left + 'px)', width: tabIndicator.width + 'px' }"
			></view>
		</view>
		
		<view class="god-list">
			<view
				class="god-card stagger-item"
				v-for="(god, index) in filteredGods"
				:key="god.id + '-' + refreshTick"
				:style="{ animationDelay: Math.min(index, 12) * 0.05 + 's' }"
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
			<view v-if="filteredGods.length === 0" class="empty-state">
				<text class="empty-symbol">ᛟ</text>
				<text class="empty-title">未找到相关神祇</text>
				<text class="empty-desc">换个名字或切换阵营再试试。</text>
			</view>
		</view>

		<TabBar current="codex" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { godFactions } from '@/data/norse.js'
import { db } from '@/db'
import pullRefresh from '@/mixins/pullRefresh.js'

export default {
  components: { TabBar, PageHeader },
	mixins: [pullRefresh],
	data() {
		return {
			gods: db.findAll('gods'),
			searchText: '',
			currentFaction: '',
			factionTabs: [
				{ label: '全部', value: '' },
				{ label: '阿萨神族', value: '阿萨神族' },
				{ label: '华纳神族', value: '华纳神族' },
				{ label: '巨人血统', value: '巨人血统' },
				{ label: '冥界', value: '冥界' },
				{ label: '其他', value: '其他' }
			],
			tabIndicator: { left: 0, width: 0, ready: false }
		}
	},
	mounted() {
		this.updateTabIndicator()
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
		// 下拉刷新回调：重新读取神祇数据
		onRefresh() {
			this.gods = db.findAll('gods')
		},
		setFaction(value) {
			this.currentFaction = value
			this.updateTabIndicator()
		},
		// 测量当前激活 tab 的位置，驱动滑动指示器
		updateTabIndicator() {
			this.$nextTick(() => {
				uni.createSelectorQuery().in(this)
					.select('.faction-tabs').boundingClientRect()
					.selectAll('.faction-tabs .tab').boundingClientRect()
					.exec((res) => {
						const barRect = res && res[0]
						const tabRects = res && res[1]
						if (!barRect || !tabRects || !tabRects.length) return
						const index = Math.max(0, this.factionTabs.findIndex(t => t.value === this.currentFaction))
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
	padding: 0 32rpx 180rpx;
	box-sizing: border-box;
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
	width: 32rpx;
	height: 32rpx;
	margin-right: 16rpx;
	position: relative;
	flex-shrink: 0;
}

.search-icon-lens {
	width: 20rpx;
	height: 20rpx;
	border: 3rpx solid #66727F;
	border-radius: 50%;
	box-sizing: border-box;
	position: absolute;
	left: 0;
	top: 0;
}

.search-icon-lens::after {
	content: '';
	position: absolute;
	right: -7rpx;
	bottom: -7rpx;
	width: 10rpx;
	height: 3rpx;
	background: #66727F;
	border-radius: 2rpx;
	transform: rotate(45deg);
}

.search-input {
	flex: 1;
	color: #F2F4F6;
	font-size: 28rpx;
}

.faction-tabs {
	display: flex;
	position: relative;
	margin-bottom: 24rpx;
	overflow-x: auto;
	overflow-y: hidden;
}

.faction-tabs::-webkit-scrollbar {
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

.god-list {
	padding-bottom: 40rpx;
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
	font-size: 36rpx;
}

.empty-state {
	padding: 80rpx 0;
	text-align: center;
}

.empty-symbol {
	display: block;
	font-size: 64rpx;
	line-height: 1;
	color: #27384A;
	font-family: serif;
	margin-bottom: 20rpx;
}

.empty-title {
	display: block;
	color: #A8B3BD;
	font-size: 28rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.empty-desc {
	display: block;
	color: #66727F;
	font-size: 22rpx;
}

</style>