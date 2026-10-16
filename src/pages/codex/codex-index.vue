<template>
	<view class="codex-page page-enter">
		<PageHeader
			kicker="CODEX OF THE NORTH"
			title="万物图鉴"
			subtitle="诸神、神话生物与传说法器的档案皆收于此。"
		/>

		<view class="codex-grid">
			<view class="codex-card" hover-class="card-hover" @click="goTo('/pages/gods/god-list')">
				<view class="card-icon gods">
					<Crown :size="32" :stroke-width="1.6" />
				</view>
				<text class="card-title">神祇</text>
				<text class="card-sub">GODS</text>
				<text class="card-count">{{ godCount }} 位</text>
				<text class="card-arrow">›</text>
			</view>

			<view class="codex-card" hover-class="card-hover" @click="goTo('/pages/bestiary/bestiary-list')">
				<view class="card-icon creatures">
					<PawPrint :size="32" :stroke-width="1.6" />
				</view>
				<text class="card-title">神话生物</text>
				<text class="card-sub">CREATURES</text>
				<text class="card-count">{{ creatureCount }} 类</text>
				<text class="card-arrow">›</text>
			</view>

			<view class="codex-card" hover-class="card-hover" @click="goTo('/pages/bestiary/artifact-list')">
				<view class="card-icon artifacts">
					<Sword :size="32" :stroke-width="1.6" />
				</view>
				<text class="card-title">法器</text>
				<text class="card-sub">ARTIFACTS</text>
				<text class="card-count">{{ artifactCount }} 件</text>
				<text class="card-arrow">›</text>
			</view>
		</view>

		<view class="bottom-space"></view>
		<TabBar current="codex" />
	</view>
</template>

<script>
import TabBar from '@/components/TabBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { Crown, PawPrint, Sword } from 'lucide-vue-next'
import { db } from '@/db'

export default {
	components: { TabBar, PageHeader, Crown, PawPrint, Sword },
	data() {
		return {
			godCount: db.count('gods'),
			creatureCount: db.count('creatures'),
			artifactCount: db.count('artifacts')
		}
	},
	methods: {
		goTo(url) {
			uni.navigateTo({ url })
		}
	}
}
</script>

<style scoped>
.codex-page {
	min-height: 100vh;
	background: var(--bg-outer);
	box-sizing: border-box;
	padding: 0 32rpx;
}

.codex-grid {
	display: flex;
	gap: 20rpx;
	margin-top: 48rpx;
}

.codex-card {
	flex: 1;
	position: relative;
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 24rpx;
	padding: 40rpx 12rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	overflow: hidden;
	transition: border-color 0.2s ease, transform 0.15s ease;
}

.card-hover {
	transform: scale(0.97);
	border-color: var(--accent);
}

.card-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
}

.card-icon.gods {
	color: var(--accent-strong);
	background: rgba(var(--accent-strong-rgb), 0.10);
	border: 1rpx solid rgba(var(--accent-rgb), 0.36);
}

.card-icon.creatures {
	color: #8FB6D9;
	background: rgba(143, 182, 217, 0.10);
	border: 1rpx solid rgba(143, 182, 217, 0.32);
}

.card-icon.artifacts {
	color: #B79CD9;
	background: rgba(183, 156, 217, 0.10);
	border: 1rpx solid rgba(183, 156, 217, 0.32);
}

.card-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: var(--text-primary);
	letter-spacing: 2rpx;
	margin-bottom: 8rpx;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-sub {
	display: block;
	font-size: 18rpx;
	color: var(--text-muted);
	letter-spacing: 2rpx;
	margin-bottom: 20rpx;
}

.card-count {
	display: block;
	font-size: 24rpx;
	color: var(--accent);
	letter-spacing: 2rpx;
}

.card-arrow {
	position: absolute;
	right: 16rpx;
	top: 16rpx;
	font-size: 36rpx;
	color: var(--border-strong);
	line-height: 1;
}

.bottom-space {
	height: 180rpx;
}
</style>
