<template>
	<view class="container page-enter-deep">
		<NavBar title="神祇详情" />
		<EmptyState
			v-if="notFound"
			type="notfound"
			size="page"
			:actions="[{ label: '返回图鉴', variant: 'primary', event: 'back' }]"
			@action="onEmptyAction"
		/>
		<template v-else>
		<view class="header" :style="{ background: headerGradient, transform: heroStyle.transform, opacity: heroStyle.opacity }">
			<view class="avatar-large" :class="getFactionClass(god.faction)">
			<PortraitImage :src="god.portrait" :name="god.name" :text-size="48" />
		</view>
			<text class="god-name">{{ god.name }}</text>
			<text class="god-original">{{ god.originalName }}</text>
			<text class="god-title">{{ god.title }}</text>
			<view class="faction-tag" :class="getFactionClass(god.faction)">
				{{ god.faction }}
			</view>
		</view>
		
		<view class="section">
			<text class="section-title">简介</text>
			<text class="description">{{ god.description }}</text>
		</view>
		
		<view class="section">
			<text class="section-title">基础信息</text>
			<view class="info-grid">
				<view class="info-item">
					<text class="info-label">神职领域</text>
					<text class="info-value">{{ god.domain.join('、') }}</text>
				</view>
				<view class="info-item" v-if="god.symbols && god.symbols.length">
					<text class="info-label">象征物</text>
					<text class="info-value">{{ god.symbols.join('、') }}</text>
				</view>
				<view class="info-item" v-if="god.artifact && god.artifact.length">
					<text class="info-label">神器</text>
					<text class="info-value">{{ god.artifact.join('、') }}</text>
				</view>
				<view class="info-item" v-if="god.realm && god.realm.length">
					<text class="info-label">关联九界</text>
					<text class="info-value">{{ god.realm.join('、') }}</text>
				</view>
			</view>
		</view>
		
		<view class="section">
			<text class="section-title">能力表现</text>
			<view class="radar-container">
				<view class="radar-chart">
					<view class="radar-grid">
						<view class="radar-level"></view>
						<view class="radar-level"></view>
						<view class="radar-level"></view>
						<view class="radar-level"></view>
					</view>
					<view class="radar-polygon" :style="radarPolygonStyle"></view>
					<view class="radar-points">
						<view class="radar-point" v-for="(attr, index) in radarPoints" :key="index" :style="attr.pointStyle">
							<text class="radar-label">{{ attr.label }}</text>
							<text class="radar-value">{{ attr.value }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="section favor-section">
			<text class="section-title">眷顾</text>
			<view class="favor-card">
				<view class="favor-header">
				<text class="favor-level">眷顾 Lv.{{ favorStageInfo.level }}</text>
				<text class="favor-title">{{ favorStageInfo.name }}</text>
				</view>
				<view class="favor-progress">
					<view class="favor-track">
						<view class="favor-fill" :style="{ width: favorProgress + '%' }"></view>
					</view>
					<text class="favor-exp"><AnimNumber :value="favorState.favorExp" /> / {{ favorMax }}</text>
				</view>
				<text class="favor-desc">{{ favorStageDescription }}</text>
			</view>
			<view class="offering-actions">
				<view
					class="offering-button"
					v-for="offering in offeringOptions"
					:key="offering.key"
					:class="{ pulse: offeringPulsing === offering.key }"
					@click="makeOffering(offering)"
				>
					<text class="offering-icon">{{ offering.icon }}</text>
					<text class="offering-label">{{ offering.label }}</text>
				</view>
			</view>
			<text v-if="offeringMessage" class="offering-message">{{ offeringMessage }}</text>
		</view>

		<view class="section" v-if="hasRelationships">
			<text class="section-title">关系网络</text>
			
			<view class="relation-group" v-if="god.relationships.parents && god.relationships.parents.length">
				<text class="relation-type">血缘关系</text>
				<view class="relation-cards">
					<view
						class="relation-card"
						:class="{ pending: !hasGodArchive(parent) }"
						v-for="parent in god.relationships.parents"
						:key="parent"
						@click="goToRelated(parent)"
					>
						<text class="relation-name">{{ parent }}</text>
						<text class="relation-label">{{ relationLabel(parent, '父母') }}</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.children && god.relationships.children.length">
				<text class="relation-type">子女</text>
				<view class="relation-cards">
					<view
						class="relation-card"
						:class="{ pending: !hasGodArchive(child) }"
						v-for="child in god.relationships.children"
						:key="child"
						@click="goToRelated(child)"
					>
						<text class="relation-name">{{ child }}</text>
						<text class="relation-label">{{ relationLabel(child, '子女') }}</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.spouse && god.relationships.spouse.length">
				<text class="relation-type">亲密关系</text>
				<view class="relation-cards">
					<view
						class="relation-card"
						:class="{ pending: !hasGodArchive(spouse) }"
						v-for="spouse in god.relationships.spouse"
						:key="spouse"
						@click="goToRelated(spouse)"
					>
						<text class="relation-name">{{ spouse }}</text>
						<text class="relation-label">{{ relationLabel(spouse, '配偶') }}</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.allies && god.relationships.allies.length">
				<text class="relation-type">盟友</text>
				<view class="relation-cards">
					<view
						class="relation-card"
						:class="{ pending: !hasGodArchive(ally) }"
						v-for="ally in god.relationships.allies"
						:key="ally"
						@click="goToRelated(ally)"
					>
						<text class="relation-name">{{ ally }}</text>
						<text class="relation-label">{{ relationLabel(ally, '盟友') }}</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.rivals && god.relationships.rivals.length">
				<text class="relation-type">竞争关系</text>
				<view class="relation-cards">
					<view
						class="relation-card rival"
						:class="{ pending: !hasGodArchive(rival) }"
						v-for="rival in god.relationships.rivals"
						:key="rival"
						@click="goToRelated(rival)"
					>
						<text class="relation-name">{{ rival }}</text>
						<text class="relation-label">{{ relationLabel(rival, '竞争者') }}</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.enemies && god.relationships.enemies.length">
				<text class="relation-type">冲突关系</text>
				<view class="relation-cards">
					<view
						class="relation-card enemy"
						:class="{ pending: !hasGodArchive(enemy) }"
						v-for="enemy in god.relationships.enemies"
						:key="enemy"
						@click="goToRelated(enemy)"
					>
						<text class="relation-name">{{ enemy }}</text>
						<text class="relation-label">{{ relationLabel(enemy, '敌对者') }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="section" v-if="god.stories && god.stories.length">
			<text class="section-title">相关故事</text>
			<view class="story-list">
				<view class="story-card" v-for="story in relatedStories" :key="story.id" @click="goToStory(story.id)">
					<text class="story-title">{{ story.title }}</text>
					<text class="story-category">{{ story.category }}</text>
				</view>
			</view>
		</view>
		<!-- 神谕事件揭晓层 -->
		<view v-if="favorEventOverlay" class="favor-event-layer" @click="favorEventOverlay = null">
			<view class="favor-event-body" @click.stop>
				<text class="favor-event-kicker">ORACLE UNLOCKED · 神谕显现</text>
				<text class="favor-event-title">{{ favorEventOverlay.name }}</text>
				<text class="favor-event-desc">{{ favorEventOverlay.description }}</text>
				<view class="favor-event-close" @click="favorEventOverlay = null">
					<text>铭记于心</text>
				</view>
			</view>
		</view>
		</template>
	</view>
</template>

<script>
import { db } from '@/db'
import { unlockRavensClue, getRavensClueCount } from '@/utils/clueProgress.js'
import {
	FAVOR_STAGES,
	getFavorStage,
	getFavorProgress,
	getFavorMax,
	getGodPreferences,
	getStageDescription as getFavorStageDescription,
	getStageEvents as getFavorStageEvents,
	computeGain as computeFavorGain,
	newlyUnlockedEvents as newlyUnlockedFavorEvents,
	getFavorState,
	saveFavorState
} from '@/interactions/favor.js'
import NavBar from '@/components/NavBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import PortraitImage from '@/components/PortraitImage.vue'
import AnimNumber from '@/components/AnimNumber.vue'
import heroParallax from '@/mixins/heroParallax.js'

export default {
	components: { NavBar, EmptyState, PortraitImage, AnimNumber },
	mixins: [heroParallax],
	data() {
		return {
			god: {},
			notFound: false,
			favorState: { favorExp: 0, offeringStats: {}, unlockedEvents: [] },
			offeringMessage: '',
			offeringPulsing: '',
			favorEventOverlay: null
		}
	},
	computed: {
		headerGradient() {
			const faction = this.god.faction || ''
			let color = '#8FB6D9'
			if (faction.includes('华纳')) {
				color = '#7C8C74'
			} else if (faction.includes('巨人')) {
				color = '#8B4A4A'
			} else if (faction.includes('冥界')) {
				color = '#66727F'
			} else if (faction.includes('阿萨')) {
				color = '#C6A15B'
			}
			return `linear-gradient(135deg, ${color}22 0%, var(--bg-outer) 100%)`
		},
		radarPoints() {
			if (!this.god.attributes) return []
			const attrs = this.god.attributes
			const labels = ['智慧', '战斗', '魔法', '权威', '命运']
			const keys = ['wisdom', 'combat', 'magic', 'authority', 'fate']
			const centerX = 50
			const centerY = 50
			const radius = 40
			return keys.map((key, i) => {
				const value = attrs[key] || 0
				const angle = (i * 72 - 90) * Math.PI / 180
				const x = centerX + radius * Math.cos(angle) * value / 100
				const y = centerY + radius * Math.sin(angle) * value / 100
				return {
					label: labels[i],
					value: value,
					pointStyle: `left: ${x}%; top: ${y}%; transform: translate(-50%, -50%);`
				}
			})
		},
		radarPolygonStyle() {
			if (!this.god.attributes) return ''
			const attrs = this.god.attributes
			const keys = ['wisdom', 'combat', 'magic', 'authority', 'fate']
			const values = keys.map(k => attrs[k] || 0)
			const centerX = 50
			const centerY = 50
			const radius = 40
			const points = keys.map((_, i) => {
				const value = values[i]
				const angle = (i * 72 - 90) * Math.PI / 180
				const x = centerX + radius * Math.cos(angle) * value / 100
				const y = centerY + radius * Math.sin(angle) * value / 100
				return `${x}% ${y}%`
			}).join(', ')
			return `clip-path: polygon(${points}); -webkit-clip-path: polygon(${points});`
		},
		hasRelationships() {
			const r = this.god.relationships
			return r && (r.parents?.length || r.children?.length || r.spouse?.length || r.allies?.length || r.rivals?.length || r.enemies?.length)
		},
		relatedStories() {
			if (!this.god.stories) return []
			return this.god.stories.map(id => db.findById('stories', id)).filter(Boolean)
		},
		// ===== 眷顾系统 =====
		favorStageInfo() {
			return getFavorStage(this.favorState.favorExp)
		},
		favorProgress() {
			return getFavorProgress(this.favorState.favorExp, this.god)
		},
		favorMax() {
			return getFavorMax(this.god)
		},
		favorStageDescription() {
			return getFavorStageDescription(this.god, this.favorStageInfo.name)
		},
		offeringOptions() {
			// 供品按钮：取该神喜好前四项 + 一个通用清水（兜底互动）
			const { likes } = getGodPreferences(this.god)
			const icons = ['🥃', '🍯', '🕯️', '💍', '🍞', '⚔️', '📖', '🪶', '🧂', '🪨', '🍷', '🌸']
			const picks = likes.slice(0, 4)
			if (!picks.includes('清水')) picks.push('清水')
			return picks.map((label, i) => ({
				key: 'offering-' + i,
				label,
				icon: icons[i % icons.length],
				favor: 5,
				tags: [label]
			}))
		}
	},
	onLoad(options) {
		const godId = options.id || 'odin'
		const found = db.findById('gods', godId)
		// 无 id → 默认奥丁；带无效 id → 缺省态「内容不存在」
		if (!found) {
			this.notFound = true
			return
		}
		this.god = found
		this.favorState = getFavorState(this.god.id)
		if (this.god.id === 'odin') {
			if (getRavensClueCount() < 3) {
				unlockRavensClue('relation')
			}
		}
	},
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
	// 头部视差：hero 随滚动缓慢下移并淡出
	onPageScroll(e) {
		this.updateHeroParallax(e.scrollTop)
	},
	methods: {
		getFactionClass(faction) {
			if (!faction) return ''
			if (faction.includes('华纳')) return 'vana'
			if (faction.includes('巨人')) return 'giant'
			if (faction.includes('冥界')) return 'hel'
			if (faction.includes('阿萨')) return 'asa'
			return ''
		},
		goToRelated(name) {
			const relatedId = name.toLowerCase()
			const god = db.findById('gods', relatedId) || db.findOne('gods', { name })
			if (god) {
				uni.navigateTo({ url: `/pages/gods/god-detail?id=${god.id}` })
			}
			// 无档案的关联实体：卡片呈 pending 态（置灰 + 「档案整理中」），点击不再弹 toast
		},
		// 该关联实体是否已有神祇档案
		hasGodArchive(name) {
			const relatedId = name.toLowerCase()
			return !!(db.findById('gods', relatedId) || db.findOne('gods', { name }))
		},
		// 未收录档案的关联实体，在关系标签后追加提示
		relationLabel(name, label) {
			return this.hasGodArchive(name) ? label : label + ' · 档案整理中'
		},
		goToStory(id) {
			uni.navigateTo({ url: `/pages/stories/story-detail?id=${id}` })
		},
		// ===== 眷顾系统 =====
		makeOffering(offering) {
			if (this.offeringPulsing) return
			const prev = Number(this.favorState.favorExp || 0)
			const max = this.favorMax
			const { amount, note } = computeFavorGain(offering, this.god)
			const next = Math.min(prev + amount, max)

			// 供品计数
			const stats = Object.assign({}, this.favorState.offeringStats || {})
			stats[offering.key] = (stats[offering.key] || 0) + 1

			this.favorState = Object.assign({}, this.favorState, { favorExp: next, offeringStats: stats })
			this.offeringPulsing = offering.key
			setTimeout(() => { this.offeringPulsing = '' }, 600)
			this.offeringMessage = note || this.getFavorFeedback(next, prev)

			// 神谕事件：跨阈值即解锁并全屏揭晓
			const events = getFavorStageEvents(this.god)
			const unlockedNow = newlyUnlockedFavorEvents(events, prev, next)
			const unlockedIds = [...(this.favorState.unlockedEvents || []), ...unlockedNow.map(e => e.id)]
			this.favorState = saveFavorState(this.god.id, {
				favorExp: next,
				offeringStats: stats,
				unlockedEvents: unlockedIds
		})
			if (unlockedNow.length) {
				const first = unlockedNow[0]
				this.favorEventOverlay = { name: first.name, description: first.description }
			}
		},
		getFavorFeedback(next, prev) {
			if (next >= this.favorMax && prev < this.favorMax) {
				return '神恩满溢——你已成为眷顾之人。'
			}
			const stage = getFavorStage(next)
			if (stage.min > prev) {
				return `眷顾加深，进入「${stage.name}」。`
			}
			return '供品已呈上，神意微动。'
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: var(--bg-outer);
}

.header {
	padding: 24rpx 32rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* 头像显影入场：墨水在羊皮纸上浮现 */
@keyframes avatarDevelop {
  from { filter: blur(10px) brightness(0.55); transform: scale(0.96); opacity: 0; }
  60% { filter: blur(3px) brightness(0.85); opacity: 1; }
  to { filter: blur(0) brightness(1); transform: scale(1); opacity: 1; }
}

.avatar-large {
  animation: avatarDevelop 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #C6A15B, #8B7030);
	border-radius: 50%;
	margin-bottom: 20rpx;
}

.avatar-large.asa { background: linear-gradient(135deg, #C6A15B, #8B7030); }
.avatar-large.vana { background: linear-gradient(135deg, #5A7A5C, #3A4A3C); }
.avatar-large.giant { background: linear-gradient(135deg, #8B4A4A, #5A2A2A); }
.avatar-large.hel { background: linear-gradient(135deg, #66727F, #3A4450); }

.god-name {
	color: var(--text-primary);
	font-size: 44rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.god-original {
	color: var(--accent);
	font-size: 28rpx;
	margin-bottom: 8rpx;
}

.god-title {
	color: var(--text-muted);
	font-size: 24rpx;
	margin-bottom: 16rpx;
}

.faction-tag {
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
}

.faction-tag.asa { background: rgba(198, 161, 91, 0.2); color: #C6A15B; }
.faction-tag.vana { background: rgba(90, 122, 92, 0.2); color: #7C8C74; }
.faction-tag.giant { background: rgba(139, 74, 74, 0.2); color: #8B4A4A; }
.faction-tag.hel { background: rgba(102, 114, 127, 0.2); color: #8FA3B8; }

.section {
	padding: 32rpx;
}

.section-title {
	color: var(--accent);
	font-size: 28rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.description {
	color: var(--text-primary);
	font-size: 28rpx;
	line-height: 1.8;
}

.info-grid {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 16rpx;
	padding: 24rpx;
}

.info-item {
	margin-bottom: 16rpx;
}

.info-item:last-child { margin-bottom: 0; }

.info-label {
	color: var(--text-muted);
	font-size: 22rpx;
	display: block;
	margin-bottom: 4rpx;
}

.info-value {
	color: var(--text-primary);
	font-size: 26rpx;
}

.radar-container {
	display: flex;
	justify-content: center;
	padding: 24rpx 0;
}

.radar-chart {
	position: relative;
	width: 400rpx;
	height: 400rpx;
	margin: 0 auto;
}

.radar-grid {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.radar-level {
	position: absolute;
	width: 80%;
	height: 80%;
	top: 10%;
	left: 10%;
	border: 1rpx solid var(--border-soft);
	border-radius: 50%;
	opacity: 0.5;
}

.radar-level:nth-child(1) { width: 20%; height: 20%; top: 40%; left: 40%; opacity: 0.2; }
.radar-level:nth-child(2) { width: 40%; height: 40%; top: 30%; left: 30%; opacity: 0.3; }
.radar-level:nth-child(3) { width: 60%; height: 60%; top: 20%; left: 20%; opacity: 0.4; }
.radar-level:nth-child(4) { width: 80%; height: 80%; top: 10%; left: 10%; opacity: 0.5; }

.radar-polygon {
	position: absolute;
	width: 80%;
	height: 80%;
	top: 10%;
	left: 10%;
	background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.53), rgba(var(--accent-strong-rgb), 0.27));
	border: 2rpx solid var(--accent);
	border-radius: 50%;
}

.radar-points {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
}

.radar-point {
	position: absolute;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.radar-label {
	font-size: 20rpx;
	color: var(--text-muted);
}

.radar-value {
	font-size: 24rpx;
	font-weight: 600;
	color: var(--accent);
}

.attributes {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 16rpx;
	padding: 24rpx;
}

.attr-item {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.attr-item:last-child { margin-bottom: 0; }

.attr-label {
	width: 100rpx;
	color: var(--text-muted);
	font-size: 22rpx;
}

.attr-bar {
	flex: 1;
	height: 8rpx;
	background: var(--border-soft);
	border-radius: 4rpx;
	margin: 0 16rpx;
	overflow: hidden;
}

.attr-fill {
	height: 100%;
	background: linear-gradient(90deg, #8FB6D9, #C6A15B);
	border-radius: 4rpx;
}

.attr-value {
	width: 50rpx;
	text-align: right;
	color: var(--text-secondary);
	font-size: 22rpx;
}

.relation-group {
	margin-bottom: 24rpx;
}

.relation-type {
	color: #8FB6D9;
	font-size: 24rpx;
	display: block;
	margin-bottom: 12rpx;
}

.relation-cards {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.relation-card {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	transition: transform 0.15s ease, border-color 0.15s ease;
}

.relation-card:active {
	transform: scale(0.95);
	border-color: rgba(var(--accent-rgb), 0.55);
}

/* 档案未收录的关联实体：置灰、去点击反馈，标签提示「档案整理中」 */
.relation-card.pending {
	opacity: 0.55;
}

.relation-card.pending:active {
	transform: none;
	border-color: var(--border-soft);
}

.relation-card.rival {
	border-color: rgba(var(--accent-rgb), 0.3);
}

.relation-card.enemy {
	border-color: rgba(185, 74, 72, 0.3);
}

.relation-name {
	color: var(--text-primary);
	font-size: 22rpx;
	font-weight: bold;
}

.relation-label {
	color: var(--text-muted);
	font-size: 18rpx;
	margin-top: 4rpx;
}

.story-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.story-card {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 16rpx;
	padding: 24rpx;
	transition: transform 0.15s ease, border-color 0.15s ease;
}

.story-card:active {
	transform: scale(0.98);
	border-color: rgba(var(--accent-rgb), 0.55);
}

.story-title {
	color: var(--text-primary);
	font-size: 28rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.story-category {
	color: var(--text-muted);
	font-size: 22rpx;
}

/* ===== 眷顾系统 ===== */
.favor-section {
	margin-top: 24rpx;
}

.favor-card {
	background: var(--bg-card, rgba(255, 255, 255, 0.04));
	border: 1rpx solid rgba(198, 161, 91, 0.25);
	border-radius: 24rpx;
	padding: 28rpx;
}

.favor-header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 20rpx;
}

.favor-level {
	color: #C6A15B;
	font-size: 26rpx;
	font-weight: bold;
}

.favor-title {
	color: var(--text-primary);
	font-size: 30rpx;
	letter-spacing: 4rpx;
}

.favor-progress {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

.favor-track {
	flex: 1;
	height: 12rpx;
	background: rgba(255, 255, 255, 0.08);
	border-radius: 6rpx;
	overflow: hidden;
}

.favor-fill {
	height: 100%;
	background: linear-gradient(90deg, #8FB6D9, #C6A15B);
	border-radius: 6rpx;
	transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.favor-exp {
	color: var(--text-muted);
	font-size: 22rpx;
	white-space: nowrap;
}

.favor-desc {
	color: var(--text-secondary, var(--text-muted));
	font-size: 24rpx;
	line-height: 1.7;
	font-style: italic;
}

.offering-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 20rpx;
	flex-wrap: wrap;
}

.offering-button {
	flex: 1;
	min-width: 140rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 20rpx 12rpx;
	background: rgba(255, 255, 255, 0.04);
	border: 1rpx solid rgba(255, 255, 255, 0.1);
	border-radius: 18rpx;
	transition: transform 0.2s ease, border-color 0.2s ease;
}

.offering-button:active {
	transform: scale(0.96);
}

.offering-button.pulse {
	animation: favorPulse 0.6s ease;
	border-color: rgba(198, 161, 91, 0.7);
}

@keyframes favorPulse {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.06); }
}

.offering-icon {
	font-size: 40rpx;
}

.offering-label {
	color: var(--text-secondary, var(--text-muted));
	font-size: 22rpx;
}

.offering-message {
	display: block;
	margin-top: 16rpx;
	color: #C6A15B;
	font-size: 24rpx;
	line-height: 1.6;
}

/* 神谕事件揭晓层 */
.favor-event-layer {
	position: fixed;
	inset: 0;
	z-index: 999;
	background: rgba(8, 10, 14, 0.88);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx;
}

.favor-event-body {
	max-width: 560rpx;
	background: linear-gradient(160deg, rgba(28, 32, 40, 0.98), rgba(16, 18, 24, 0.98));
	border: 1rpx solid rgba(198, 161, 91, 0.45);
	border-radius: 28rpx;
	padding: 56rpx 44rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	gap: 24rpx;
}

.favor-event-kicker {
	color: #C6A15B;
	font-size: 20rpx;
	letter-spacing: 6rpx;
}

.favor-event-title {
	color: var(--text-primary, #E8E4DA);
	font-size: 44rpx;
	font-weight: bold;
	letter-spacing: 6rpx;
}

.favor-event-desc {
	color: var(--text-secondary, #B8B2A6);
	font-size: 26rpx;
	line-height: 1.8;
}

.favor-event-close {
	margin-top: 16rpx;
	padding: 16rpx 48rpx;
	border: 1rpx solid rgba(198, 161, 91, 0.5);
	border-radius: 999rpx;
}

.favor-event-close text {
	color: #C6A15B;
	font-size: 26rpx;
	letter-spacing: 4rpx;
}
</style>
