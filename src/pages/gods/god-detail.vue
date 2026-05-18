<template>
	<view class="container">
		<view class="back-btn-wrap">
			<text class="back-btn" @click="goBack">‹</text>
		</view>
		<view class="header" :style="{ background: headerGradient }">
			<view class="avatar-large" :class="getFactionClass(god.faction)">
				<text class="avatar-text">{{ god.name[0] }}</text>
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
		
		<view class="section" v-if="hasRelationships">
			<text class="section-title">关系网络</text>
			
			<view class="relation-group" v-if="god.relationships.parents && god.relationships.parents.length">
				<text class="relation-type">血缘关系</text>
				<view class="relation-cards">
					<view class="relation-card" v-for="parent in god.relationships.parents" :key="parent" @click="goToRelated(parent)">
						<text class="relation-name">{{ parent }}</text>
						<text class="relation-label">父母</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.children && god.relationships.children.length">
				<text class="relation-type">子女</text>
				<view class="relation-cards">
					<view class="relation-card" v-for="child in god.relationships.children" :key="child" @click="goToRelated(child)">
						<text class="relation-name">{{ child }}</text>
						<text class="relation-label">子女</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.spouse && god.relationships.spouse.length">
				<text class="relation-type">亲密关系</text>
				<view class="relation-cards">
					<view class="relation-card" v-for="spouse in god.relationships.spouse" :key="spouse" @click="goToRelated(spouse)">
						<text class="relation-name">{{ spouse }}</text>
						<text class="relation-label">配偶</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.allies && god.relationships.allies.length">
				<text class="relation-type">盟友</text>
				<view class="relation-cards">
					<view class="relation-card" v-for="ally in god.relationships.allies" :key="ally" @click="goToRelated(ally)">
						<text class="relation-name">{{ ally }}</text>
						<text class="relation-label">盟友</text>
					</view>
				</view>
			</view>
			
			<view class="relation-group" v-if="god.relationships.enemies && god.relationships.enemies.length">
				<text class="relation-type">冲突关系</text>
				<view class="relation-cards">
					<view class="relation-card enemy" v-for="enemy in god.relationships.enemies" :key="enemy" @click="goToRelated(enemy)">
						<text class="relation-name">{{ enemy }}</text>
						<text class="relation-label">敌对者</text>
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
	</view>
</template>

<script>
import { gods } from '@/data/norse.js'
import { stories } from '@/data/norse.js'
import { unlockRavensClue, getRavensClueCount } from '@/utils/clueProgress.js'

export default {
	data() {
		return {
			god: {}
		}
	},
	computed: {
		headerGradient() {
			const factionColors = {
				'阿萨神族': '#C6A15B',
				'华纳神族': '#7C8C74',
				'巨人': '#8B4A4A'
			}
			const color = factionColors[this.god.faction] || '#8FB6D9'
			return `linear-gradient(135deg, ${color}22 0%, #0B1118 100%)`
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
			return r && (r.parents?.length || r.children?.length || r.spouse?.length || r.allies?.length || r.enemies?.length)
		},
		relatedStories() {
			if (!this.god.stories) return []
			return this.god.stories.map(id => stories.find(s => s.id === id)).filter(Boolean)
		}
	},
	onLoad(options) {
		const godId = options.id || 'odin'
		this.god = gods.find(g => g.id === godId) || gods[0]
		if (this.god.id === 'odin') {
			if (getRavensClueCount() < 3) {
				unlockRavensClue('relation')
			}
		}
	},
	methods: {
		getFactionClass(faction) {
			const classes = {
				'阿萨神族': 'asa',
				'华纳神族': 'vana',
				'巨人': 'giant'
			}
			return classes[faction] || ''
		},
		goToRelated(name) {
			const relatedId = name.toLowerCase()
			const god = gods.find(g => g.id === relatedId || g.name === name)
			if (god) {
				uni.navigateTo({ url: `/pages/gods/god-detail?id=${god.id}` })
			} else {
				uni.showToast({ title: '信息待补充', icon: 'none' })
			}
		},
		goToStory(id) {
			uni.navigateTo({ url: `/pages/stories/story-detail?id=${id}` })
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #0B1118;
}

.back-btn-wrap {
	position: fixed;
	top: 40rpx;
	left: 24rpx;
	z-index: 100;
}

.back-btn {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(11, 17, 24, 0.85);
	border: 1px solid #27384A;
	border-radius: 50%;
	color: #C6A15B;
	font-size: 48rpx;
	font-weight: 300;
}

.header {
	padding: 60rpx 32rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-large {
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #C6A15B, #8B7030);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}

.avatar-large.asa { background: linear-gradient(135deg, #C6A15B, #8B7030); }
.avatar-large.vana { background: linear-gradient(135deg, #5A7A5C, #3A4A3C); }
.avatar-large.giant { background: linear-gradient(135deg, #8B4A4A, #5A2A2A); }

.avatar-text {
	color: #F2F4F6;
	font-size: 48rpx;
	font-weight: bold;
}

.god-name {
	color: #F2F4F6;
	font-size: 44rpx;
	font-weight: bold;
	margin-bottom: 8rpx;
}

.god-original {
	color: #C6A15B;
	font-size: 28rpx;
	margin-bottom: 8rpx;
}

.god-title {
	color: #66727F;
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

.section {
	padding: 32rpx;
}

.section-title {
	color: #C6A15B;
	font-size: 28rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.description {
	color: #F2F4F6;
	font-size: 28rpx;
	line-height: 1.8;
}

.info-grid {
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	padding: 24rpx;
}

.info-item {
	margin-bottom: 16rpx;
}

.info-item:last-child { margin-bottom: 0; }

.info-label {
	color: #66727F;
	font-size: 22rpx;
	display: block;
	margin-bottom: 4rpx;
}

.info-value {
	color: #F2F4F6;
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
	border: 1rpx solid #27384A;
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
	background: linear-gradient(135deg, #C6A15B88, #D8C27A44);
	border: 2rpx solid #C6A15B;
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
	color: #66727F;
}

.radar-value {
	font-size: 24rpx;
	font-weight: 600;
	color: #C6A15B;
}

.attributes {
	background: #172230;
	border: 1rpx solid #27384A;
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
	color: #66727F;
	font-size: 22rpx;
}

.attr-bar {
	flex: 1;
	height: 8rpx;
	background: #27384A;
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
	color: #A8B3BD;
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
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.relation-card.enemy {
	border-color: rgba(185, 74, 72, 0.3);
}

.relation-name {
	color: #F2F4F6;
	font-size: 22rpx;
	font-weight: bold;
}

.relation-label {
	color: #66727F;
	font-size: 18rpx;
	margin-top: 4rpx;
}

.story-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.story-card {
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	padding: 24rpx;
}

.story-title {
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.story-category {
	color: #66727F;
	font-size: 22rpx;
}
</style>