<template>
	<scroll-view scroll-y class="container page-enter-deep" @scroll="onHeroScroll">
		<NavBar title="法器详情" />
		<EmptyState
			v-if="notFound"
			type="notfound"
			size="page"
			:actions="[{ label: '返回图鉴', variant: 'primary', event: 'back' }]"
			@action="onEmptyAction"
		/>
		<template v-else>
		<view class="artifact-hero" :style="heroStyle">
			<view class="artifact-icon-box">
				<text class="artifact-icon">{{ getArtifactIcon(artifact.type) }}</text>
			</view>
			<text class="artifact-name">{{ artifact.name }}</text>
			<text class="artifact-original">{{ artifact.originalName }}</text>
			<view class="artifact-meta">
				<text class="meta-type">{{ artifact.type }}</text>
				<text class="meta-divider">|</text>
				<text class="meta-owner">{{ artifact.owner }}</text>
				<text class="meta-divider">|</text>
				<text class="meta-realm">{{ artifact.realm }}</text>
			</view>
			<view class="rarity-tag" :class="artifact.rarity">
				{{ getRarityLabel(artifact.rarity) }}
			</view>
		</view>

		<view class="section-card">
			<text class="section-title">简介</text>
			<text class="artifact-desc">{{ artifact.desc }}</text>
		</view>

		<view class="section-card" v-if="artifact.abilities && artifact.abilities.length">
			<text class="section-title">能力</text>
			<view class="ability-list">
				<view
					class="ability-tag"
					v-for="(ability, index) in artifact.abilities"
					:key="index"
				>
					<text>{{ ability }}</text>
				</view>
			</view>
		</view>

		<view class="section-card">
			<text class="section-title">归属</text>
			<view class="owner-info">
				<view class="owner-row">
					<text class="owner-label">持有者</text>
					<text class="owner-value">{{ artifact.owner }}</text>
				</view>
				<view class="owner-row">
					<text class="owner-label">所属界域</text>
					<text class="owner-value">{{ artifact.realm }}</text>
				</view>
				<view class="owner-row" v-if="artifact.dangerLevel">
					<text class="owner-label">危险等级</text>
					<text class="owner-value danger">{{ artifact.dangerLevel }}</text>
				</view>
			</view>
		</view>

		<view class="section-card" v-if="hasRelatedGods">
			<text class="section-title">相关神祇</text>
			<view class="related-list">
				<view
					class="related-card god-card"
					v-for="god in artifact.relatedGods"
					:key="god.id"
					@click="goToGod(god.id)"
				>
					<text class="related-name">{{ god.name }}</text>
					<text class="related-desc">{{ god.desc }}</text>
				</view>
			</view>
		</view>

		<view class="section-card" v-if="hasRelatedStories">
			<text class="section-title">相关故事</text>
			<view class="related-list">
				<view
					class="related-card story-card"
					v-for="story in artifact.relatedStories"
					:key="story.id"
					@click="goToStory(story.id)"
				>
					<text class="related-name">{{ story.name }}</text>
					<text class="related-desc">{{ story.desc }}</text>
				</view>
			</view>
		</view>

		<view class="section-card" v-if="hasRelatedCreatures">
			<text class="section-title">相关生物</text>
			<view class="related-list">
				<view
					class="related-card creature-card"
					v-for="creature in artifact.relatedCreatures"
					:key="creature.id"
					@click="goToCreature(creature.id)"
				>
					<text class="related-name">{{ creature.name }}</text>
					<text class="related-desc">{{ creature.desc }}</text>
				</view>
			</view>
		</view>
		</template>
	</scroll-view>
</template>

<script>
import { getRarityLabel } from '@/data/norseArtifacts.js'
import { db } from '@/db'
import NavBar from '@/components/NavBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import heroParallax from '@/mixins/heroParallax.js'

export default {
	components: { NavBar, EmptyState },
	mixins: [heroParallax],
	data() {
		return {
			artifact: null,
			notFound: false
		}
	},
	computed: {
		hasRelatedGods() {
			return this.artifact && this.artifact.relatedGods && this.artifact.relatedGods.length > 0
		},
		hasRelatedStories() {
			return this.artifact && this.artifact.relatedStories && this.artifact.relatedStories.length > 0
		},
		hasRelatedCreatures() {
			return this.artifact && this.artifact.relatedCreatures && this.artifact.relatedCreatures.length > 0
		}
	},
	onLoad(options) {
		const found = options.id ? db.findById('artifacts', options.id) : null
		// 无 id → 默认首件法器；带无效 id → 缺省态「内容不存在」（原实现会白屏）
		if (options.id && !found) {
			this.notFound = true
			return
		}
		this.artifact = found || db.findAll('artifacts')[0]
	},
	methods: {
		// 缺省态操作：返回上一页，无栈时回图鉴
		onEmptyAction(event) {
			if (event !== 'back') return
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack()
			} else {
				uni.switchTab({ url: '/pages/codex/codex-index' })
			}
		},
		getRarityLabel(rarity) {
			return getRarityLabel(rarity)
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
		},
		goToGod(id) {
			uni.navigateTo({
				url: `/pages/gods/god-detail?id=${id}`
			})
		},
		goToStory(id) {
			uni.navigateTo({
				url: `/pages/stories/story-detail?id=${id}`
			})
		},
		goToCreature(id) {
			uni.navigateTo({
				url: `/pages/bestiary/creature-detail?id=${id}`
			})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: var(--bg-outer);
	color: var(--text-primary);
	padding-bottom: 60rpx;
}

.artifact-hero {
	padding: 48rpx 40rpx 60rpx;
	background:
		radial-gradient(circle at 50% 20%, rgba(var(--accent-rgb), 0.12), transparent 50%),
		var(--bg-outer);
	text-align: center;
	position: relative;
}

.artifact-icon-box {
	width: 140rpx;
	height: 140rpx;
	margin: 0 auto 30rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.24), rgba(var(--accent-rgb), 0.08));
	border: 2px solid rgba(var(--accent-rgb), 0.36);
	display: flex;
	align-items: center;
	justify-content: center;
}

.artifact-icon {
	color: var(--accent);
	font-size: 64rpx;
	font-weight: 900;
	font-style: italic;
}

.artifact-name {
	display: block;
	color: var(--text-primary);
	font-size: 48rpx;
	font-weight: 900;
	margin-bottom: 8rpx;
}

.artifact-original {
	display: block;
	color: var(--text-muted);
	font-size: 26rpx;
	margin-bottom: 20rpx;
}

.artifact-meta {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	flex-wrap: wrap;
}

.meta-type,
.meta-owner,
.meta-realm {
	color: var(--text-secondary);
	font-size: 24rpx;
}

.meta-divider {
	color: var(--text-muted);
}

.rarity-tag {
	position: absolute;
	top: 100rpx;
	right: 40rpx;
	padding: 6rpx 16rpx;
	border-radius: 14rpx;
	font-size: 20rpx;
	font-weight: 700;
}

.rarity-tag.legendary {
	background: rgba(var(--accent-strong-rgb), 0.2);
	color: var(--accent-strong);
	border: 1px solid rgba(var(--accent-strong-rgb), 0.4);
}

.rarity-tag.epic {
	background: rgba(143, 182, 217, 0.2);
	color: #8FB6D9;
	border: 1px solid rgba(143, 182, 217, 0.4);
}

.rarity-tag.rare {
	background: rgba(124, 140, 116, 0.2);
	color: #7C8C74;
	border: 1px solid rgba(124, 140, 116, 0.4);
}

.section-card {
	margin: 28rpx 32rpx;
	padding: 28rpx;
	background: var(--bg-card);
	border: 1px solid var(--border-soft);
	border-radius: 20rpx;
}

.section-title {
	display: block;
	color: var(--text-secondary);
	font-size: 24rpx;
	margin-bottom: 16rpx;
	font-weight: 600;
}

.artifact-desc {
	color: var(--text-primary);
	font-size: 26rpx;
	line-height: 1.7;
}

.ability-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.ability-tag {
	padding: 10rpx 18rpx;
	background: rgba(var(--accent-rgb), 0.12);
	border: 1px solid rgba(var(--accent-rgb), 0.28);
	border-radius: 12rpx;
}

.ability-tag text {
	color: var(--accent);
	font-size: 24rpx;
	font-weight: 600;
}

.owner-info {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.owner-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.owner-label {
	color: var(--text-muted);
	font-size: 24rpx;
}

.owner-value {
	color: var(--text-primary);
	font-size: 24rpx;
	font-weight: 600;
}

.owner-value.danger {
	color: var(--accent);
}

.related-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.related-card {
	padding: 18rpx;
	background: rgba(var(--bg-inset-rgb), 0.5);
	border-radius: 14rpx;
	border: 1px solid var(--border-soft);
}

.related-card:active {
	border-color: var(--accent);
}

.related-name {
	display: block;
	color: var(--text-primary);
	font-size: 26rpx;
	font-weight: 700;
	margin-bottom: 6rpx;
}

.related-desc {
	display: block;
	color: var(--text-muted);
	font-size: 22rpx;
}
</style>
