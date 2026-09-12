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
		<PageHeader back kicker="ARTIFACTS" title="法器图鉴" subtitle="来自矮人锻造与诸神持有的传说神器" />

		<view class="artifact-grid">
			<view
				class="artifact-card stagger-item"
				v-for="(artifact, index) in artifacts"
				:key="artifact.id + '-' + refreshTick"
				:style="{ animationDelay: Math.min(index, 12) * 0.04 + 's' }"
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
					<text class="artifact-name">{{ artifact.name }}</text>
					<text class="artifact-type">{{ artifact.type }}</text>
				</view>
			</view>
		</view>

		<view class="bottom-space"></view>
		<TabBar current="codex" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { db } from '@/db'

export default {
	components: { TabBar, PageHeader },
	data() {
		return {
			artifacts: db.findAll('artifacts')
		}
	},
	methods: {
		goToArtifactDetail(id) {
			uni.navigateTo({
				url: `/pages/bestiary/artifact-detail?id=${id}`
			})
		},
		getArtifactIcon(type) {
			const icons = {
				'神锤': 'T',
				'神枪': 'I',
				'神戒': 'O',
				'神船': 'B',
				'项链': 'N',
				'束缚之链': 'C'
			}
			return icons[type] || 'A'
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #0B1118;
	padding: 0 32rpx;
	box-sizing: border-box;
}

.artifact-grid {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	box-sizing: border-box;
}

.artifact-card {
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

.artifact-card:active {
	transform: scale(0.96);
	border-color: #C6A15B;
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

.artifact-name {
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

.artifact-type {
	color: #66727F;
	font-size: 20rpx;
	text-align: center;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.bottom-space {
	height: 180rpx;
}
</style>
