<template>
	<view class="container">
		<view class="back-btn-wrap">
			<text class="back-btn" @click="goBack">‹</text>
		</view>
		<view v-if="isCreatureUnknown(creature) && creature.id !== 'raven'" class="unknown-detail">
			<view class="unknown-hero">
				<view class="creature-icon unknown">
					<text>?</text>
				</view>
				<text class="name">未知存在</text>
				<text class="original-name">Unknown</text>
				<view class="type-tags">
					<text class="type-tag">线索未明</text>
					<text class="danger-tag">未发现</text>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">线索档案</text>
				<text class="clue-desc">{{ getClueProfile(creature).clueDesc }}</text>

				<view class="clue-list">
					<view class="clue-row">
						<text class="clue-label">类型线索</text>
						<text class="clue-value">{{ getClueProfile(creature).clueType }}</text>
					</view>
					<view class="clue-row">
						<text class="clue-label">出没迹象</text>
						<text class="clue-value">{{ getClueProfile(creature).clueRealm }}</text>
					</view>
					<view class="clue-row">
						<text class="clue-label">能力传闻</text>
						<text class="clue-value">{{ getClueProfile(creature).clueAbility }}</text>
					</view>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">解锁线索</text>
				<view
					v-for="(hint, index) in getClueProfile(creature).unlockHints"
					:key="index"
					class="hint-item"
				>
					<text class="hint-dot"></text>
					<text class="hint-text">{{ hint }}</text>
				</view>
			</view>

			<view class="unknown-actions">
				<view class="secondary-button" @click="goExploreClue(creature)">
					<text class="secondary-btn-text">继续探索</text>
				</view>
				<view class="ghost-button" @click="markClue(creature)">
					<text class="ghost-btn-text">标记线索</text>
				</view>
			</view>
		</view>

		<view v-else-if="creature.id === 'raven' && !isRavensRevealed()" class="ravens-clue-detail">
			<view class="unknown-hero" :class="{ 'reveal-flash': showRevealAnimation }">
				<view class="creature-icon unknown">
					<text v-if="!showRevealAnimation">?</text>
					<text v-else class="revealed-name">{{ creature.name[0] }}</text>
				</view>
				<text class="name">{{ getRavensClueTitle() }}</text>
				<text class="original-name">{{ getRavensClueSubtitle() }}</text>
				<view class="type-tags">
					<text class="type-tag">{{ getRavensClueCount() }} / 3 条线索</text>
					<text class="danger-tag" v-if="getRavensClueCount() < 3">身份未明</text>
					<text class="danger-tag collected" v-else>已解锁</text>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">线索档案</text>
				<text class="clue-desc">{{ getClueProfile(creature).clueDesc }}</text>
			</view>

			<view class="section-card" v-if="getClueProfile(creature).clues">
				<text class="section-title">探索线索</text>
				<view
					v-for="clue in getClueProfile(creature).clues"
					:key="clue.id"
					class="clue-card"
					:class="{ locked: !isRavensClueUnlocked(clue.id) }"
				>
					<text class="clue-title">{{ clue.title }}</text>
					<text class="clue-text" v-if="isRavensClueUnlocked(clue.id)">{{ clue.text }}</text>
					<text class="clue-text locked" v-else>继续探索后显现。</text>
				</view>
			</view>

			<view class="section-card">
				<text class="section-title">解锁提示</text>
				<view
					v-for="(hint, index) in getClueProfile(creature).unlockHints"
					:key="index"
					class="hint-item"
				>
					<text class="hint-dot"></text>
					<text class="hint-text">{{ hint }}</text>
				</view>
			</view>

			<view class="reset-clue" @click="resetRavensClues()">
				<text class="reset-clue-text">重置线索</text>
			</view>
		</view>

		<view v-else class="known-detail">
			<view class="header" :class="{ 'unlock-glow': playUnlockAnimation }">
				<view class="creature-icon" :class="getDangerClass(creature.dangerLevel)">
					<text>{{ creature.name[0] }}</text>
				</view>
				<text class="name">{{ creature.name }}</text>
				<text class="original-name">{{ creature.originalName }}</text>
				<view class="type-tags">
					<text class="type-tag">{{ creature.type }}</text>
					<text class="danger-tag" :class="creature.dangerLevel">{{ creature.dangerLevel }}</text>
				</view>
			</view>

			<view class="section" v-if="creature.interactionType === 'spirit' && !isCollected">
				<text class="section-title">未解锁状态</text>
				<view class="unlock-card mist-layer">
					<view class="mist-overlay"></view>
					<text class="unlock-text">你尚未真正见过它们。只有在亚尔夫海姆的薄雾与冷光之间，才可能发现光明精灵的踪迹。</text>
					<view class="unlock-tasks">
						<text class="task-label">探索任务：</text>
						<text class="task-item">1. 前往亚尔夫海姆</text>
						<text class="task-item">2. 阅读《弗雷与亚尔夫海姆》</text>
						<text class="task-item">3. 静候一次</text>
					</view>
					<view class="unlock-btn" @click="unlockCreature">
						<text class="unlock-btn-text">静候一次</text>
					</view>
				</view>
			</view>

			<view class="section" v-if="creature.interactionType === 'abyss' && !isCollected">
				<text class="section-title">海雾之下</text>
				<view class="unlock-card abyss-layer">
					<view class="abyss-overlay"></view>
					<text class="unlock-text">你尚未真正见过世界之蛇。只有在海潮异常回落、远方海面形成闭合的环时，才可能发现它的踪迹。</text>
					<view class="unlock-tasks">
						<text class="task-label">探索任务：</text>
						<text class="task-item">1. 阅读《索尔钓起世界之蛇》</text>
						<text class="task-item">2. 进入米德加德详情页</text>
						<text class="task-item">3. 远观海面一次</text>
					</view>
					<view class="unlock-btn abyss" @click="unlockJormungandr">
						<text class="unlock-btn-text">远观海面一次</text>
					</view>
				</view>
			</view>

		<view class="section bond-section" v-if="isCollected && creature.interactionType === 'spirit'">
			<text class="section-title">羁绊</text>
			<view class="bond-card">
				<view class="bond-header">
					<text class="bond-level">羁绊 Lv.{{ creature.bondLevel }}</text>
					<text class="bond-title">{{ creature.bondStage }}</text>
				</view>
				<view class="bond-progress">
					<view class="bond-track">
						<view class="bond-fill spirit" :style="{ width: bondProgress + '%' }"></view>
					</view>
					<text class="bond-exp">{{ creature.bondExp || 0 }} / {{ creature.bondMax || 100 }}</text>
				</view>
				<view class="bond-mood-row">
					<text class="bond-mood-label">当前情绪：</text>
					<text class="bond-mood-value">{{ creature.mood || '疏离' }}</text>
				</view>
				<text class="bond-desc">{{ getBondStageDescription() }}</text>
			</view>
		</view>

		<view class="section abyss-section" v-if="isCollected && creature.interactionType === 'abyss'">
			<text class="section-title">状态</text>
			<view class="abyss-card" :class="{ frozen: creature.missing || creature.abyssFrozen }">
				<view class="abyss-mist" v-if="!creature.missing && !creature.abyssFrozen"></view>
				<view class="abyss-header">
					<text class="abyss-stage">{{ creature.missing ? '沉入外海' : creature.abyssStage }}</text>
					<text v-if="creature.missing" class="abyss-status" :class="{ missing: creature.missing }">
						{{ creature.mood }}
					</text>
				</view>
				<view class="abyss-progress-group">
					<view class="abyss-progress-item">
						<text class="abyss-progress-label">观测进度</text>
						<view class="abyss-track">
							<view class="abyss-fill awareness" :style="{ width: abyssAwarenessProgress + '%' }" :class="{ frozen: creature.missing || creature.abyssFrozen }"></view>
						</view>
						<text class="abyss-progress-value" :class="{ frozen: creature.missing || creature.abyssFrozen }">
							{{ creature.missing || creature.abyssFrozen ? '冻结' : (creature.abyssAwareness || 0) + ' / ' + (creature.abyssMax || 100) }}
						</text>
					</view>
					<view class="abyss-progress-item">
						<text class="abyss-progress-label">灾厄阈值</text>
						<view class="abyss-track">
							<view class="abyss-fill risk" :style="{ width: riskLevelProgress + '%' }" :class="{ frozen: creature.missing || creature.abyssFrozen }"></view>
						</view>
						<text class="abyss-progress-value" :class="{ frozen: creature.missing || creature.abyssFrozen }">
							{{ creature.missing || creature.abyssFrozen ? '冻结' : (creature.riskLevel || 0) + ' / ' + (creature.riskMax || 100) }}
						</text>
					</view>
				</view>
				<text class="abyss-desc">{{ getAbyssDescription() }}</text>
			</view>
		</view>

		<view class="section" v-if="isCollected && creature.interactionType === 'abyss' && !creature.missing && !creature.abyssFrozen">
			<text class="section-title">互动</text>
			<view class="interaction-actions abyss">
				<view
					v-for="action in getAbyssActions()"
					:key="action.key"
					class="interaction-button abyss"
					:class="{
						worship: action.key === 'worship',
						retreat: action.key === 'retreat',
						touch: action.key === 'touch',
						danger: action.highRisk && creature.riskLevel >= 70
					}"
					@click="handleAbyssInteraction(action)"
				>
					<view class="light-particle" v-if="playAbyssAnimation"></view>
					<text class="interaction-label">{{ action.label }}</text>
					<text class="risk-hint" v-if="action.highRisk && creature.riskLevel >= 70">继续靠近可能导致它沉入外海</text>
				</view>
			</view>
			<text v-if="interactionMessage" class="interaction-message">{{ interactionMessage }}</text>
		</view>

		<view class="section" v-if="isCollected && creature.interactionType === 'abyss' && (creature.missing || creature.abyssFrozen)">
			<text class="section-title">深海冻结</text>
			<view class="frozen-card">
				<view class="frozen-message">
					<text class="frozen-text">{{ creature.missing ? '世界之蛇已沉入外海。海面再无回应。' : '观测记录已冻结。' }}</text>
				</view>
				<text class="frozen-hint" v-if="creature.missing">{{ interactionMessage || '你的记录停留在它消失的那一刻。' }}</text>
				<view class="frozen-actions">
					<view class="frozen-btn" @click="viewAbyssRecord">
						<text class="frozen-btn-text">查看记录</text>
					</view>
					<view class="frozen-btn tide" @click="waitForTide">
						<text class="frozen-btn-text">等待潮汐</text>
					</view>
				</view>
			</view>
		</view>

		<view class="section" v-if="isCollected && creature.interactionType !== 'abyss'">
			<text class="section-title">互动</text>
			<view class="interaction-actions">
				<view
					v-for="action in interactionActions"
					:key="action.key"
					class="interaction-button"
					:class="getInteractionType(creature)"
					@click="handleInteraction(action)"
				>
					<view class="light-particle" v-if="playInteractionAnimation"></view>
					<text class="interaction-label">{{ action.label }}</text>
				</view>
			</view>
			<text v-if="interactionMessage" class="interaction-message">{{ interactionMessage }}</text>
		</view>

		<view class="section" v-if="isCollected">
			<text class="section-title">喜好与禁忌</text>
			<view class="preference-grid">
				<view class="preference-column">
					<text class="pref-label">喜欢</text>
					<view class="pref-tags">
						<text class="pref-tag like" v-for="item in creature.likes || ['自由', '肉食', '黑暗']" :key="item">{{ item }}</text>
					</view>
				</view>
				<view class="preference-column">
					<text class="pref-label">厌恶</text>
					<view class="pref-tags">
						<text class="pref-tag dislike" v-for="item in creature.dislikes || ['锁链', '光明']" :key="item">{{ item }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="section">
			<text class="section-title">神话档案</text>
			<view class="archive-card">
				<view class="archive-item">
					<text class="archive-label">描述</text>
					<text class="archive-value">{{ creature.description }}</text>
				</view>
				<view class="archive-item">
					<text class="archive-label">栖息地</text>
					<text class="archive-value">{{ getRealmName(creature.realm) }}</text>
				</view>
				<view class="archive-item">
					<text class="archive-label">能力</text>
					<text class="archive-value">{{ creature.power }}</text>
				</view>
			</view>
		</view>

		<view class="section" v-if="isCollected && creature.relationshipBonds && creature.relationshipBonds.length">
			<text class="section-title">关系羁绊</text>
			<view class="relation-list">
				<view class="relation-card" v-for="bond in creature.relationshipBonds" :key="bond.target">
					<text class="relation-name">{{ bond.name }}</text>
					<text class="relation-type" :class="bond.type">{{ bond.relation }}</text>
				</view>
			</view>
		</view>

		<view class="section" v-if="isCollected && creature.interactionType === 'spirit' && !isHighRiskCreature(creature)">
			<text class="section-title">羁绊徽章</text>
			<view class="badge-list">
				<view
					class="badge-card"
					:class="{ unlocked: badge.unlocked, hidden: badge.hidden, 'badge-unlock': playBadgeAnimation && unlockedBadge && unlockedBadge.id === badge.id }"
					v-for="badge in getVisibleBadges()"
					:key="badge.id"
				>
					<text class="badge-icon" v-if="badge.hidden">?</text>
					<text class="badge-name">{{ badge.name }}</text>
					<text class="badge-desc" v-if="badge.desc">{{ badge.desc }}</text>
					<text class="badge-status" v-if="!badge.hidden">{{ badge.unlocked ? '已解锁' : '未解锁' }}</text>
				</view>
			</view>
		</view>

		<!-- 高危对象不显示徽章模块 -->

		</view>

		<view class="collect-btn" :class="{ collected: isCollected }" @click="isCollected ? removeCollect() : collect()">
			<text v-if="!isCollected">收藏到图鉴</text>
			<text v-else>已收藏 · 移除记录</text>
		</view>

		<view class="bottom-space"></view>
	</view>
</template>

<script>
import { norseCreatures } from '@/data/norseCreatures.js'
import { realms, creatures } from '@/data/norse.js'
import { getRavensClueProgress, saveRavensClueProgress, isRavensRevealed as checkRavensRevealed, getRavensClueCount as getClueCount, isRavensClueUnlocked as checkRavensClueUnlocked, resetRavensClues } from '@/utils/clueProgress.js'

export default {
	data() {
		return {
			creature: {},
			isCollected: false,
			interactionMessage: '',
			playUnlockAnimation: false,
			playInteractionAnimation: false,
			playAbyssAnimation: false,
			playMissingAnimation: false,
			playBadgeAnimation: false,
			unlockedBadge: null,
			defaultBadges: [
				{ id: 'observer', name: '观察者', unlocked: false },
				{ id: 'companion', name: '同伴', unlocked: false },
				{ id: 'warden', name: '见证者', unlocked: false }
			],
			showRevealAnimation: false
		}
	},
	computed: {
		bondProgress() {
			const exp = Number(this.creature.bondExp || 0)
			const max = Number(this.creature.bondMax || 100)
			return (exp / max) * 100
		},
		interactionActions() {
			return this.getInteractionActions()
		},
		abyssAwarenessProgress() {
			const value = Number(this.creature.abyssAwareness || 0)
			const max = Number(this.creature.abyssMax || 100)
			return (value / max) * 100
		},
		riskLevelProgress() {
			const value = Number(this.creature.riskLevel || 0)
			const max = Number(this.creature.riskMax || 100)
			return (value / max) * 100
		}
	},
	onLoad(options) {
		const creatureId = options.id
		let found = norseCreatures.find(c => c.id === creatureId)
		if (!found) {
			found = creatures.find(c => c.id === creatureId)
		}
		if (!found) {
			found = norseCreatures[0]
		}
		this.creature = {
			...found,
			bondLevel: found.bondLevel || 1,
			bondExp: found.bondExp || 0,
			bondMax: found.bondMax || 100,
			mood: found.mood || '疏离',
			likes: found.likes || ['自由', '肉食'],
			dislikes: found.dislikes || ['锁链', '欺骗'],
			temperament: found.temperament || '',
			relationshipBonds: found.relationshipBonds || [],
			tasks: found.tasks || [],
			badges: found.badges || this.defaultBadges,
			interactionStats: found.interactionStats || { listen: 0, gift: 0, wait: 0, resonate: 0, guard: 0 },
			bondStage: found.bondStage || '未发现踪迹'
		}
		this.checkCollected()
		if (this.creature.id === 'raven') {
			this.loadRavensClues()
		}
	},
	methods: {
		checkCollected() {
			const collected = uni.getStorageSync('collectedCreatures') || []
			this.isCollected = collected.includes(this.creature.id)
		},
		getDangerClass(level) {
			const classes = { '极危': 'extreme', '高': 'high', '中': 'medium', '低': 'low' }
			return classes[level] || ''
		},
		getBondLevel() {
			if (this.creature.interactionType === 'spirit') {
				return this.getSpiritBondStage()
			}
			const exp = this.creature.bondExp || 0
			if (exp >= 90) return 'Lv.3'
			if (exp >= 60) return 'Lv.2'
			return 'Lv.1'
		},
		getBondTitle() {
			if (this.creature.interactionType === 'spirit') {
				return this.creature.mood || '疏离'
			}
			const exp = this.creature.bondExp || 0
			if (exp >= 90) return '命运羁绊'
			if (exp >= 60) return '认可同伴'
			if (exp >= 30) return '谨慎接近'
			return '陌生观察'
		},
		getRealmName(realmId) {
			const realm = realms.find(r => r.id === realmId)
			return realm?.name || realmId
		},
		increaseBond(amount, message) {
			if (!this.creature) return
			const current = Number(this.creature.bondExp || 0)
			const max = Number(this.creature.bondMax || 100)
			const next = Math.min(current + amount, max)
			this.creature.bondExp = next
			this.interactionMessage = message
		},
		getInteractionType(creature) {
			if (!creature) return 'beast'
			if (creature.interactionType) return creature.interactionType
			const type = String(creature.type || '')
			const category = String(creature.category || '')
			const dangerLevel = String(creature.dangerLevel || '')

			if (
				type.includes('狼') ||
				type.includes('蛇') ||
				type.includes('马') ||
				type.includes('犬') ||
				type.includes('龙') ||
				type.includes('鸟类') ||
				category.includes('神兽') ||
				category.includes('野兽')
			) {
				return dangerLevel === '极危' ? 'danger' : 'beast'
			}

			if (
				type.includes('女武神') ||
				type.includes('冥界统治者') ||
				type.includes('神')
			) {
				return 'divine'
			}

			if (
				type.includes('矮人') ||
				category.includes('工匠') ||
				category.includes('种族')
			) {
				return 'craftsman'
			}

			if (
				type.includes('精灵') ||
				category.includes('精灵') ||
				category.includes('灵性')
			) {
				return 'spirit'
			}

			if (
				type.includes('亡者') ||
				type.includes('冥界') ||
				type.includes('亡灵') ||
				category.includes('冥界')
			) {
				return 'underworld'
			}

			return 'person'
		},
		getInteractionActions() {
			const type = this.getInteractionType(this.creature)

			switch (type) {
				case 'beast':
					return [
						{ key: 'feed', label: '投喂', bond: 10, message: '它接受了食物，警惕稍稍降低。' },
						{ key: 'comfort', label: '安抚', bond: 8, message: '它短暂放松下来，但仍保持距离。' },
						{ key: 'observe', label: '观察', bond: 5, message: '你记录下它的行动轨迹。' }
					]
				case 'danger':
					return [
						{ key: 'keepDistance', label: '保持距离', bond: 3, message: '你没有贸然靠近，这反而让它减少了敌意。' },
						{ key: 'offerTribute', label: '献上贡品', bond: 7, message: '贡品被收下，但它仍没有完全信任你。' },
						{ key: 'findWeakness', label: '观察弱点', bond: 5, message: '你发现它的力量与某段命运紧密相连。' }
					]
				case 'divine':
					return [
						{ key: 'greet', label: '致意', bond: 5, message: '你的礼节被看见了。' },
						{ key: 'consult', label: '询问神谕', bond: 8, message: '对方给出了一句含义模糊的提示。' },
						{ key: 'ally', label: '结盟', bond: 10, message: '这不是承诺，但对方认可了你的立场。' }
					]
				case 'craftsman':
					return [
						{ key: 'commission', label: '委托', bond: 8, message: '工匠记下了你的需求，但报酬必须公平。' },
						{ key: 'trade', label: '交易', bond: 6, message: '一次清晰的交换比空话更有效。' },
						{ key: 'collaborate', label: '协作', bond: 10, message: '共同完成的小任务提升了信任。' }
					]
				case 'spirit':
					return this.getSpiritActions()
				case 'underworld':
					return [
						{ key: 'greet', label: '致意', bond: 5, message: '你以合适的礼节靠近死亡边界。' },
						{ key: 'keepPromise', label: '守约', bond: 10, message: '遵守规则比勇敢更重要。' },
						{ key: 'listenDead', label: '聆听亡语', bond: 7, message: '你听见了来自寒雾深处的低语。' }
					]
				case 'person':
				default:
					return [
						{ key: 'talk', label: '交谈', bond: 5, message: '你们交换了少量信息，关系略有推进。' },
						{ key: 'collaborate', label: '协作', bond: 8, message: '一次谨慎的合作建立了初步信任。' },
						{ key: 'gift', label: '赠礼', bond: 6, message: '礼物被接受，但对方仍在观察你的意图。' }
					]
			}
		},
		handleInteraction(action) {
			if (!action) return
			console.log('[互动] action:', action.key, 'creature.interactionType:', this.creature.interactionType, 'creature.id:', this.creature.id)
			if (this.creature.interactionType === 'spirit') {
				console.log('[互动] 进入精灵互动分支')
				this.handleSpiritInteraction(action)
				return
			}
			console.log('[互动] 进入普通互动分支')
			const amount = action.bond || 5
			const message = action.message || '关系略有变化。'
			this.increaseBond(amount, message)
		},
		getBondIntroText() {
			const type = this.getInteractionType(this.creature)

			switch (type) {
				case 'beast':
					return `${this.creature.name}仍保持警觉，但它开始熟悉你的气息。`
				case 'danger':
					return `${this.creature.name}不是可以驯服的存在。你能建立的不是亲密，而是谨慎的理解。`
				case 'spirit':
					const stage = this.getSpiritBondStage()
					if (stage === '未发现踪迹') {
						return `${this.creature.name}不会回应喧哗。只有在亚尔夫海姆的薄雾与冷光之间，才可能发现它们的踪迹。`
					}
					if (stage === '亚尔夫之友') {
						return `你与${this.creature.name}建立了深久的联系。冷光成为你与林地之间的纽带。`
					}
					return `${this.creature.name}开始回应你的存在。${stage === '初见微光' ? '它们在树影间短暂显现。' : stage === '雾中回应' ? '雾中传来某种尚不成形的回应。' : stage === '林间同行' ? '微光开始在你身旁停留。' : '你感到某种温和的共鸣。'}`
				case 'divine':
					return `${this.creature.name}注视着你的选择。神性的认可来自礼节、立场与代价。`
				case 'craftsman':
					return `与${this.creature.name}建立关系，需要清晰的交换、可靠的承诺和公平的报酬。`
				case 'underworld':
					return `${this.creature.name}与死亡边界相连。靠近它需要遵守规则，而不是冒犯沉默。`
				case 'person':
				default:
					return `与${this.creature.name}的关系仍在试探中。一次交谈或协作，可能比鲁莽靠近更有效。`
			}
		},
		collect() {
			if (this.isCollected) return
			let collected = uni.getStorageSync('collectedCreatures') || []
			collected.push(this.creature.id)
			uni.setStorageSync('collectedCreatures', collected)
			this.isCollected = true
			uni.showToast({ title: '收藏成功！', icon: 'success' })
		},
		removeCollect() {
			if (!this.isCollected) return
			let collected = uni.getStorageSync('collectedCreatures') || []
			collected = collected.filter(id => id !== this.creature.id)
			uni.setStorageSync('collectedCreatures', collected)
			this.isCollected = false
			uni.showToast({ title: '已移除记录', icon: 'none' })
		},
		getSpiritActions() {
			const exp = Number(this.creature.bondExp || 0)
			const actions = [
				{ key: 'wait', label: '静候', bond: 5, message: '你没有打扰它们。微光在树影间停留得更久了一些。' },
				{ key: 'listen', label: '聆听', bond: 6, message: '你听见风穿过枝叶，像某种尚未成形的语言。' },
				{ key: 'gift', label: '赠礼', bond: 8, message: '你放下一枚洁净的小物，它被光轻轻覆盖。' }
			]
			if (exp >= 25) {
				actions.push({ key: 'resonate', label: '共鸣', bond: 10, message: '你顺着光的节奏放慢呼吸，短暂感到某种温和的回应。' })
			}
			if (exp >= 50) {
				actions.push({ key: 'guard', label: '守护', bond: 12, message: '你清理了被黑雾侵蚀的树根。微光在你身边停留了很久。' })
			}
			return actions
		},
		getSpiritBondStage() {
			const exp = Number(this.creature && this.creature.bondExp || 0)
			if (!this.creature || !this.creature.collected) return '未发现踪迹'
			if (exp >= 100) return '亚尔夫之友'
			if (exp >= 75) return '光之共鸣'
			if (exp >= 50) return '林间同行'
			if (exp >= 25) return '雾中回应'
			return '初见微光'
		},
		isBondMaxed() {
			return Number(this.creature && this.creature.bondExp || 0) >= Number(this.creature && this.creature.bondMax || 100)
		},
		isHighRiskCreature(creature) {
			if (!creature) return false
			return (
				creature.interactionType === 'abyss' ||
				creature.interactionType === 'danger' ||
				creature.category === '灾厄生物' ||
				creature.dangerLevel === '极高' ||
				Number(creature.dangerScore || 0) >= 90
			)
		},
		isCreatureUnknown(creature) {
			if (!creature) return true
			return creature.collected === false || creature.unlocked === false
		},
		getClueProfile(creature) {
			const fallback = {
				clueName: '未明踪迹',
				clueType: '未知类型',
				clueRealm: '尚未确认出没地点',
				clueAbility: '能力仍在传闻中',
				clueDesc: '你只获得了零散的线索，还不足以确认它的真实身份。',
				unlockHints: ['继续探索相关国度', '阅读相关故事', '完成一次观察']
			}
			if (!creature) return fallback
			return {
				...fallback,
				...(creature.clueProfile || {})
			}
		},
		loadRavensClues() {
			// using utility, no local state needed
		},
		getRavensClueCount() {
			return getClueCount()
		},
		isRavensRevealed() {
			return checkRavensRevealed()
		},
		isRavensClueUnlocked(clueId) {
			return checkRavensClueUnlocked(clueId)
		},
		getRavensClueTitle() {
			const count = this.getRavensClueCount()
			if (count === 0) return '???'
			if (count === 1) return '天空的影子'
			if (count === 2) return '天空的影子'
			return this.creature.name
		},
		getRavensClueSubtitle() {
			const count = this.getRavensClueCount()
			if (count === 0) return '踪迹未明'
			if (count === 1) return '身份仍未确认'
			if (count === 2) return '飞行生物'
			return '奥丁的眼与耳'
		},
		resetRavensClues() {
			resetRavensClues()
			if (this.creature) {
				this.creature.collected = false
				this.creature.unlocked = false
			}
			uni.showToast({
				title: '已重置线索',
				icon: 'none'
			})
		},
		goExploreClue(creature) {
			uni.showToast({
				title: '继续探索相关线索',
				icon: 'none'
			})
		},
		markClue(creature) {
			uni.showToast({
				title: '已标记线索',
				icon: 'none'
			})
		},
		getVisibleBadges() {
			if (!this.creature) return []
			if (this.isHighRiskCreature(this.creature)) return []
			const badges = this.creature.badges || []
			if (!this.isBondMaxed()) {
				return [
					{
						id: 'unknown',
						name: '未知徽章',
						desc: '继续建立羁绊，徽章将在合适的时刻显现。',
						unlocked: false,
						hidden: true
					}
				]
			}
			return badges.filter(item => item.unlocked)
		},
		updateSpiritMoodAndStage() {
			if (!this.creature) return
			const exp = Number(this.creature.bondExp || 0)
			if (!this.creature.collected) {
				this.creature.bondStage = '未发现踪迹'
				this.creature.mood = '疏离'
				return
			}
			if (exp >= 100) {
				this.creature.bondLevel = 5
				this.creature.bondStage = '亚尔夫之友'
				this.creature.mood = '信任'
				return
			}
			if (exp >= 75) {
				this.creature.bondLevel = 4
				this.creature.bondStage = '光之共鸣'
				this.creature.mood = '亲近'
				return
			}
			if (exp >= 50) {
				this.creature.bondLevel = 3
				this.creature.bondStage = '林间同行'
				this.creature.mood = '接纳'
				return
			}
			if (exp >= 25) {
				this.creature.bondLevel = 2
				this.creature.bondStage = '雾中回应'
				this.creature.mood = '回应'
				return
			}
			this.creature.bondLevel = 1
			this.creature.bondStage = '初见微光'
			this.creature.mood = '警觉'
		},
		getBondStageDescription() {
			if (!this.creature || !this.creature.collected) {
				return '你尚未真正见过它们。只有在亚尔夫海姆的薄雾与冷光之间，才可能发现光明精灵的踪迹。'
			}
			const exp = Number(this.creature.bondExp || 0)
			if (exp >= 100) {
				return '光明精灵不会宣誓效忠，也不会许下永恒陪伴。但当你再次走入亚尔夫海姆，微光会为你让出道路。'
			}
			if (exp >= 75) {
				return '你开始理解它们的沉默。光明精灵并不拒绝关系，只拒绝粗暴的占有。'
			}
			if (exp >= 50) {
				return '它们允许你沿着同一条林间小径前行。那不是亲近，而是一种谨慎的许可。'
			}
			if (exp >= 25) {
				return '光明精灵开始回应你的存在，但它们仍不愿被贸然靠近。你需要用安静证明自己的善意。'
			}
			return '你在树影间看见一束短暂的冷光。它没有靠近，也没有逃离。'
		},
		unlockCreature() {
			this.creature.collected = true
			this.creature.bondLevel = 1
			this.creature.bondExp = 5
			this.creature.bondMax = 100
			this.creature.bondStage = '初见微光'
			this.creature.mood = '警觉'
			this.interactionMessage = '你在树影间看见一束短暂的冷光。它没有靠近，也没有逃离。'
			this.playUnlockAnimation = true
			this.isCollected = true
			const collected = uni.getStorageSync('collectedCreatures') || []
			if (!collected.includes(this.creature.id)) {
				collected.push(this.creature.id)
				uni.setStorageSync('collectedCreatures', collected)
			}
		},
		handleSpiritInteraction(action) {
			if (!action || !this.creature) return
			const current = Number(this.creature.bondExp || 0)
			const max = Number(this.creature.bondMax || 100)
			const next = Math.min(current + action.bond, max)
			this.creature.bondExp = next
			if (!this.creature.interactionStats) {
				this.creature.interactionStats = { listen: 0, gift: 0, wait: 0, resonate: 0, guard: 0 }
			}
			if (this.creature.interactionStats[action.key] !== undefined) {
				this.creature.interactionStats[action.key] += 1
			}
			this.updateSpiritMoodAndStage()
			this.interactionMessage = action.message
			this.playInteractionAnimation = true
			if (next >= max) {
				this.unlockSpiritBadge()
			}
		},
		unlockSpiritBadge() {
			if (this.unlockedBadge) return
			const stats = this.creature.interactionStats || {}
			const keys = Object.keys(stats)
			if (!keys.length) return
			let topKey = keys[0]
			keys.forEach(key => {
				if (Number(stats[key] || 0) > Number(stats[topKey] || 0)) {
					topKey = key
				}
			})
			const total = keys.reduce((sum, key) => sum + Number(stats[key] || 0), 0)
			const topCount = Number(stats[topKey] || 0)
			let badgeType = topKey
			if (total > 0 && topCount / total < 0.35) {
				badgeType = 'balanced'
			}
			const badges = this.creature.badges || []
			const target = badges.find(item => item.type === badgeType)
			if (target) {
				target.unlocked = true
				this.unlockedBadge = target
				this.interactionMessage = `获得徽章：${target.name}`
				this.playBadgeAnimation = true
			}
		},
		unlockJormungandr() {
			this.creature.collected = true
			this.creature.status = 'observed'
			this.creature.abyssAwareness = 8
			this.creature.riskLevel = 5
			this.creature.abyssStage = '海面蛇影'
			this.creature.mood = '未回应'
			this.interactionMessage = '你看见远海上有一道不合常理的弧线。它不像浪，也不像岛。它在缓慢移动。'
			this.playUnlockAnimation = true
			this.isCollected = true
			const collected = uni.getStorageSync('collectedCreatures') || []
			if (!collected.includes(this.creature.id)) {
				collected.push(this.creature.id)
				uni.setStorageSync('collectedCreatures', collected)
			}
		},
		getAbyssStage() {
			if (!this.creature || !this.creature.collected) return '海雾之下'
			if (this.creature.missing) return '沉入外海'
			const value = Number(this.creature.abyssAwareness || 0)
			if (value >= 100) return '海渊见证者'
			if (value >= 80) return '终末凝视'
			if (value >= 50) return '世界边界震动'
			if (value >= 25) return '深海回望'
			return '海面蛇影'
		},
		getAbyssDescription() {
			if (!this.creature || !this.creature.collected) {
				return '你尚未真正见过世界之蛇。只有在海潮异常回落、远方海面形成闭合的环时，才可能发现它的踪迹。'
			}
			if (this.creature.missing) {
				return '世界之蛇沉入了更深的海域。此后，海面再无回应。你的记录停留在它消失的那一刻。'
			}
			const value = Number(this.creature.abyssAwareness || 0)
			if (value >= 100) {
				return '你没有获得世界之蛇的信任，也不可能获得。你只是短暂见证了盘绕米德加德边界的灾厄。'
			}
			if (value >= 80) {
				return '你几乎看见了它的全貌。但世界之蛇不该被完整看见。继续靠近，可能让它沉入更深处。'
			}
			if (value >= 50) {
				return '它的存在正在逼近世界的边界。你得到的不是亲近，而是越来越清晰的危险。'
			}
			if (value >= 25) {
				return '你开始意识到，自己并不是唯一的观察者。海面无风，却有一圈涟漪向你靠近。'
			}
			return '你看见远海上有一道不合常理的弧线。它不像浪，也不像岛。它在缓慢移动。'
		},
		getAbyssActions() {
			const awareness = Number(this.creature.abyssAwareness || 0)
			const risk = Number(this.creature.riskLevel || 0)
			const actions = [
				{ key: 'distantView', label: '远观', awareness: 5, risk: 1, message: '你站在远处观察海面的弧线。它没有靠近，也没有离去。' },
				{ key: 'tideListen', label: '听潮', awareness: 4, risk: 0, message: '潮声低沉而漫长，像从世界边缘传来的回音。' },
				{ key: 'record', label: '记录', awareness: 8, risk: 5, message: '你更仔细地记录蛇影的位置。下一道浪很快抹去了痕迹。' }
			]
			if (awareness >= 25) {
				actions.push({ key: 'worship', label: '祭拜', awareness: 3, risk: -8, message: '你以敬畏之心献上祭礼。海面短暂恢复平静。' })
			}
			if (awareness >= 50) {
				actions.push({ key: 'retreat', label: '退后', awareness: 0, risk: -12, message: '你选择后退。远海的弧线缓慢沉入雾中。' })
				actions.push({ key: 'touch', label: '触碰', awareness: 16, risk: 28, highRisk: true, message: '你越过了安全距离。海面忽然安静得可怕。' })
			}
			return actions
		},
		handleAbyssInteraction(action) {
			if (!action || !this.creature) return
			if (this.creature.missing || this.creature.abyssFrozen) {
				this.interactionMessage = '海面没有回应。记录已经冻结。'
				return
			}
			const awareness = Number(this.creature.abyssAwareness || 0)
			const risk = Number(this.creature.riskLevel || 0)
			const max = Number(this.creature.abyssMax || 100)
			this.creature.abyssAwareness = Math.min(awareness + Number(action.awareness || 0), max)
			this.creature.riskLevel = Math.max(0, Math.min(risk + Number(action.risk || 0), 100))
			this.creature.interactionCount = Number(this.creature.interactionCount || 0) + 1
			if (action.highRisk) {
				this.creature.highRiskCount = Number(this.creature.highRiskCount || 0) + 1
			}
			if (!this.creature.interactionStats) {
				this.creature.interactionStats = { distantView: 0, tideListen: 0, worship: 0, record: 0, retreat: 0, touch: 0 }
			}
			if (this.creature.interactionStats[action.key] !== undefined) {
				this.creature.interactionStats[action.key] += 1
			}
			this.creature.abyssStage = this.getAbyssStage()
			this.interactionMessage = action.message
			this.playAbyssAnimation = true
			this.checkAbyssMissing(action)
			this.checkAbyssBadge()
		},
		checkAbyssMissing(action) {
			if (!this.creature || this.creature.missing) return
			const risk = Number(this.creature.riskLevel || 0)
			const highRiskCount = Number(this.creature.highRiskCount || 0)
			const shouldDisappear =
				(action && action.key === 'touch' && risk >= 70) ||
				(risk >= 90 && highRiskCount >= 2)
			if (shouldDisappear) {
				this.creature.missing = true
				this.creature.abyssFrozen = true
				this.creature.status = 'missing'
				this.creature.abyssStage = '沉入外海'
				this.creature.mood = '无回应'
				this.interactionMessage = '世界之蛇沉入了更深的海域。此后，海面再无回应。'
				this.unlockMissingBadge()
				this.playMissingAnimation = true
			}
		},
		checkAbyssBadge() {
			if (!this.creature) return
			if (this.creature.missing) return
			const awareness = Number(this.creature.abyssAwareness || 0)
			const max = Number(this.creature.abyssMax || 100)
			if (awareness < max) return
			const stats = this.creature.interactionStats || {}
			const touchCount = Number(stats.touch || 0)
			const distantViewCount = Number(stats.distantView || 0)
			const tideListenCount = Number(stats.tideListen || 0)
			const recordCount = Number(stats.record || 0)
			const worshipCount = Number(stats.worship || 0)
			const retreatCount = Number(stats.retreat || 0)
			let badgeType = 'complete'
			if (touchCount >= Math.max(distantViewCount, tideListenCount, observeCount, worshipCount, retreatCount)) {
				badgeType = 'risk'
			} else if (distantViewCount + tideListenCount + observeCount >= worshipCount + retreatCount) {
				badgeType = 'cautious'
			} else if (worshipCount + retreatCount > distantViewCount + tideListenCount + observeCount) {
				badgeType = 'reverent'
			}
			this.unlockAbyssBadgeByType(badgeType)
		},
		unlockMissingBadge() {
			this.unlockAbyssBadgeByType('missing')
		},
		unlockAbyssBadgeByType(type) {
			const badges = this.creature.badges || []
			const target = badges.find(item => item.type === type)
			if (!target || target.unlocked) return
			target.unlocked = true
			this.unlockedBadge = target
			this.interactionMessage = `获得徽章：${target.name}`
			this.playBadgeAnimation = true
		},
		isAbyssMissing() {
			return this.creature && (this.creature.missing || this.creature.abyssFrozen)
		},
		viewAbyssRecord() {
			const stats = this.creature.interactionStats || {}
			const recordSummary = `观测记录：远观${stats.distantView || 0}次，听潮${stats.tideListen || 0}次，记录${stats.record || 0}次，祭拜${stats.worship || 0}次，退后${stats.retreat || 0}次，触碰${stats.touch || 0}次。`
			this.interactionMessage = recordSummary
		},
		waitForTide() {
			this.interactionMessage = '潮汐回来了，但它没有。'
		},
		getAbyssVisibleBadges() {
			if (!this.creature) return []
			const badges = this.creature.badges || []
			if (this.creature.missing) {
				return badges.filter(item => item.unlocked)
			}
			if (this.creature.abyssAwareness < 100) {
				return [
					{
						id: 'unknown-abyss',
						name: '未知徽章',
						desc: '继续观测，徽章将在合适的时刻显现。',
						unlocked: false,
						hidden: true
					}
				]
			}
			return badges.filter(item => item.unlocked)
		},
		goBack() {
			const pages = getCurrentPages()
			if (pages.length <= 1) {
				uni.switchTab({
					url: '/pages/index/index'
				})
			} else {
				uni.navigateBack()
			}
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #0B1118;
	padding: 24rpx;
	padding-top: 100rpx;
	padding-bottom: 160rpx;
	box-sizing: border-box;
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

.container-inner {
	padding: 24rpx;
	padding-bottom: 160rpx;
	width: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
}

.unknown-detail {
	padding-bottom: 32rpx;
}

.unknown-hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 0;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 20rpx;
	margin-bottom: 32rpx;
}

.reveal-flash {
	animation: revealFlash 0.8s ease-out both;
}

@keyframes revealFlash {
	0% {
		opacity: 0;
		transform: scale(0.96);
		filter: blur(8rpx);
	}
	60% {
		opacity: 1;
		transform: scale(1.03);
		filter: blur(0);
	}
	100% {
		transform: scale(1);
	}
}

.revealed-name {
	color: #C6A15B;
}

.ravens-clue-detail {
	padding-bottom: 32rpx;
}

.clue-card {
	background: rgba(11,17,24,0.58);
	border: 1rpx solid rgba(39,56,74,0.72);
	border-radius: 16rpx;
	padding: 18rpx;
	margin-top: 14rpx;
	box-sizing: border-box;
}

.clue-card.locked {
	opacity: 0.6;
}

.clue-title {
	display: block;
	color: #F2F4F6;
	font-size: 26rpx;
	font-weight: 700;
}

.clue-text {
	display: block;
	margin-top: 8rpx;
	color: #A8B3BD;
	font-size: 22rpx;
	line-height: 1.5;
}

.clue-text.locked {
	color: #66727F;
	font-style: italic;
}

.full-width {
	width: 100%;
}

.reset-clue {
	margin-top: 32rpx;
	padding: 12rpx;
	text-align: center;
}

.reset-clue-text {
	color: #66727F;
	font-size: 22rpx;
}

.reset-clue:active .reset-clue-text {
	opacity: 0.6;
}

.creature-icon.unknown {
	background: rgba(102, 114, 127, 0.2);
	border: 1rpx dashed #27384A;
}

.unknown-actions {
	display: flex;
	gap: 24rpx;
	justify-content: center;
	margin-top: 32rpx;
}

.secondary-button {
	flex: 1;
	padding: 24rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
	text-align: center;
}

.secondary-button:active {
	background: rgba(39, 56, 74, 0.5);
}

.secondary-btn-text {
	color: #A8B3BD;
	font-size: 28rpx;
}

.ghost-button {
	flex: 1;
	padding: 24rpx;
	background: transparent;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
	text-align: center;
}

.ghost-btn-text {
	color: #66727F;
	font-size: 28rpx;
}

.clue-desc {
	display: block;
	color: #A8B3BD;
	font-size: 26rpx;
	line-height: 1.7;
	margin-bottom: 24rpx;
}

.clue-list {
	margin-top: 16rpx;
}

.clue-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 16rpx 0;
	border-bottom: 1rpx solid rgba(39, 56, 74, 0.5);
}

.clue-row:last-child {
	border-bottom: none;
}

.clue-label {
	color: #66727F;
	font-size: 24rpx;
	flex-shrink: 0;
}

.clue-value {
	color: #BFD7EA;
	font-size: 24rpx;
	text-align: right;
	max-width: 60%;
}

.hint-item {
	display: flex;
	align-items: center;
	padding: 14rpx 0;
}

.hint-dot {
	width: 8rpx;
	height: 8rpx;
	background: #6F8FA6;
	border-radius: 50%;
	margin-right: 16rpx;
	flex-shrink: 0;
}

.hint-text {
	color: #A8B3BD;
	font-size: 26rpx;
}

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 0;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 20rpx;
	margin-bottom: 32rpx;
}

.creature-icon {
	width: 160rpx;
	height: 160rpx;
	background: linear-gradient(135deg, #7C8C74 0%, #4A5C4A 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}

.creature-icon.extreme {
	background: linear-gradient(135deg, #B94A48 0%, #7A2A2A 100%);
}

.creature-icon.high {
	background: linear-gradient(135deg, #C6A15B 0%, #7A6030 100%);
}

.creature-icon text {
	color: #F2F4F6;
	font-size: 64rpx;
	font-weight: 700;
}

.name {
	color: #F2F4F6;
	font-size: 48rpx;
	font-weight: 700;
	margin-bottom: 8rpx;
}

.original-name {
	color: #C6A15B;
	font-size: 32rpx;
	margin-bottom: 16rpx;
}

.type-tags {
	display: flex;
	gap: 12rpx;
}

.type-tag {
	color: #66727F;
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	background: #111A24;
	border-radius: 8rpx;
}

.danger-tag {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
}

.danger-tag.extreme {
	background: rgba(185, 74, 72, 0.2);
	color: #B94A48;
}

.danger-tag.high {
	background: rgba(198, 161, 91, 0.2);
	color: #C6A15B;
}

.danger-tag.medium {
	background: rgba(143, 182, 217, 0.2);
	color: #8FB6D9;
}

.danger-tag.low {
	background: rgba(124, 140, 116, 0.2);
	color: #7C8C74;
}

.section {
	margin-bottom: 32rpx;
}

.section-title {
	display: block;
	color: #F2F4F6;
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 16rpx;
}

.bond-card {
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 18rpx;
	padding: 24rpx;
}

.bond-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.bond-level {
	color: #C6A15B;
	font-size: 28rpx;
	font-weight: 700;
}

.bond-title {
	color: #A8B3BD;
	font-size: 26rpx;
}

.bond-progress {
	margin-bottom: 12rpx;
}

.bond-track {
	height: 8rpx;
	background: #27384A;
	border-radius: 4rpx;
	overflow: hidden;
	margin-bottom: 8rpx;
}

.bond-fill {
	height: 100%;
	background: linear-gradient(90deg, #C6A15B, #D8C27A);
	border-radius: 4rpx;
}

.bond-exp {
	color: #66727F;
	font-size: 22rpx;
}

.bond-mood-row {
	display: flex;
	align-items: center;
	margin-top: 12rpx;
}

.bond-mood-label {
	color: #66727F;
	font-size: 24rpx;
}

.bond-mood-value {
	color: #BFD7EA;
	font-size: 26rpx;
	font-weight: 600;
	margin-left: 8rpx;
}

.bond-desc {
	display: block;
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.6;
	margin-top: 12rpx;
}

.bond-fill.spirit {
	background: linear-gradient(90deg, #BFD7EA, #8FB6D9);
}

.interaction-actions {
	display: flex;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.interaction-button {
	flex: 1;
	padding: 20rpx 0;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
	text-align: center;
	transition: all 0.2s ease;
}

.interaction-button:active {
	transform: scale(0.98);
}

.interaction-button.beast {
	border-color: #27384A;
}

.interaction-button.beast:active {
	border-color: #C6A15B;
	background: rgba(198, 161, 91, 0.1);
}

.interaction-button.person {
	border-color: #27384A;
}

.interaction-button.person:active {
	border-color: #8FB6D9;
	background: rgba(143, 182, 217, 0.1);
}

.interaction-button.divine {
	border-color: rgba(198, 161, 91, 0.3);
}

.interaction-button.divine:active {
	border-color: #C6A15B;
	background: rgba(198, 161, 91, 0.15);
}

.interaction-button.craftsman {
	border-color: rgba(124, 140, 116, 0.3);
}

.interaction-button.craftsman:active {
	border-color: #7C8C74;
	background: rgba(124, 140, 116, 0.1);
}

.interaction-button.spirit {
	border-color: rgba(143, 182, 217, 0.3);
}

.interaction-button.spirit:active {
	border-color: #8FB6D9;
	background: rgba(143, 182, 217, 0.1);
}

.abyss-layer {
	position: relative;
	overflow: hidden;
}

.abyss-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(111, 143, 166, 0.08) 0%, rgba(45, 65, 82, 0.05) 100%);
	animation: mistDrift 4s ease-in-out infinite;
	pointer-events: none;
}

.unlock-btn.abyss {
	background: linear-gradient(135deg, #6F8FA6 0%, #4A6878 100%);
}

.interaction-button.abyss {
	border-color: rgba(111, 143, 166, 0.3);
}

.interaction-button.abyss:active {
	border-color: #6F8FA6;
	background: rgba(111, 143, 166, 0.1);
}

.interaction-button.abyss.highRisk {
	border-color: rgba(185, 74, 72, 0.4);
}

.interaction-button.abyss.highRisk:active {
	border-color: rgba(185, 74, 72, 0.7);
	background: rgba(185, 74, 72, 0.12);
}

.interaction-button.abyss.danger {
	border-color: rgba(185, 74, 72, 0.55);
	background: rgba(185, 74, 72, 0.10);
}

.interaction-button.abyss.worship {
	border-color: rgba(198, 161, 91, 0.5);
}

.interaction-button.abyss.worship:active {
	border-color: rgba(198, 161, 91, 0.8);
	background: rgba(198, 161, 91, 0.1);
}

.interaction-button.abyss.retreat {
	border-color: rgba(102, 114, 127, 0.5);
}

.interaction-button.abyss.retreat:active {
	border-color: rgba(102, 114, 127, 0.8);
	background: rgba(102, 114, 127, 0.1);
}

.interaction-button.abyss.touch {
	border-color: rgba(185, 74, 72, 0.55);
}

.interaction-button.abyss.touch:active {
	border-color: rgba(185, 74, 72, 0.8);
	background: rgba(185, 74, 72, 0.15);
}

.risk-hint {
	display: block;
	color: #B94A48;
	font-size: 18rpx;
	margin-top: 4rpx;
}

.frozen-card {
	background: #0E1721;
	border: 1rpx dashed #27384A;
	border-radius: 18rpx;
	padding: 32rpx;
	text-align: center;
}

.frozen-message {
	margin-bottom: 16rpx;
}

.frozen-text {
	color: #66727F;
	font-size: 28rpx;
	line-height: 1.6;
}

.frozen-hint {
	display: block;
	color: #A8B3BD;
	font-size: 24rpx;
	margin-bottom: 20rpx;
	padding: 12rpx;
	background: rgba(39, 56, 74, 0.3);
	border-radius: 8rpx;
}

.frozen-actions {
	display: flex;
	justify-content: center;
	gap: 24rpx;
	margin-top: 20rpx;
}

.frozen-btn {
	padding: 16rpx 32rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 10rpx;
}

.frozen-btn:active {
	background: rgba(39, 56, 74, 0.5);
}

.frozen-btn.tide {
	border-color: rgba(111, 143, 166, 0.4);
}

.frozen-btn-text {
	color: #A8B3BD;
	font-size: 26rpx;
}

.frozen-btn.tide .frozen-btn-text {
	color: #6F8FA6;
}

.abyss-card {
	background: #0E1721;
	border: 1rpx solid #27384A;
	border-radius: 18rpx;
	padding: 28rpx;
	position: relative;
	overflow: hidden;
}

.abyss-card.frozen {
	background: rgba(14, 23, 33, 0.6);
	border-style: dashed;
}

.abyss-mist {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(111, 143, 166, 0.06) 0%, rgba(45, 65, 82, 0.03) 100%);
	animation: abyssMist 5s ease-in-out infinite;
	pointer-events: none;
}

.abyss-card.frozen .abyss-mist {
	display: none;
}

.abyss-status.missing {
	color: #B94A48;
}

.frozen .abyss-fill.frozen {
	opacity: 0.4;
}

.frozen .abyss-progress-value.frozen {
	color: #B94A48;
}

.abyss-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.abyss-stage {
	color: #F2F4F6;
	font-size: 32rpx;
	font-weight: 700;
}

.abyss-mood {
	color: #6F8FA6;
	font-size: 26rpx;
}

.abyss-mood.missing {
	color: #B94A48;
}

.abyss-progress-group {
	margin-bottom: 16rpx;
}

.abyss-progress-item {
	margin-bottom: 12rpx;
}

.abyss-progress-label {
	display: block;
	color: #66727F;
	font-size: 22rpx;
	margin-bottom: 6rpx;
}

.abyss-track {
	height: 8rpx;
	background: rgba(39, 56, 74, 0.8);
	border-radius: 4rpx;
	overflow: hidden;
	margin-bottom: 4rpx;
}

.abyss-fill {
	height: 100%;
	border-radius: 4rpx;
}

.abyss-fill.awareness {
	background: linear-gradient(90deg, #6F8FA6, #8FB6D9);
}

.abyss-fill.risk {
	background: linear-gradient(90deg, #C6A15B, #B94A48);
}

.abyss-progress-value {
	color: #66727F;
	font-size: 20rpx;
}

.abyss-desc {
	display: block;
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.6;
}

.interaction-button.underworld {
	border-color: rgba(185, 74, 72, 0.3);
}

.interaction-button.underworld:active {
	border-color: rgba(185, 74, 72, 0.6);
	background: rgba(185, 74, 72, 0.1);
}

.interaction-button.danger {
	border-color: rgba(185, 74, 72, 0.45);
}

.interaction-button.danger:active {
	border-color: rgba(185, 74, 72, 0.8);
	background: rgba(185, 74, 72, 0.15);
}

.interaction-label {
	color: #F2F4F6;
	font-size: 28rpx;
	font-weight: 600;
}

.light-particle {
	position: absolute;
	width: 8rpx;
	height: 8rpx;
	background: #BFD7EA;
	border-radius: 50%;
	top: 50%;
	left: 50%;
	margin-left: -4rpx;
	margin-top: -4rpx;
	animation: lightRise 0.6s ease-out forwards;
	pointer-events: none;
	box-shadow: 0 0 6rpx #BFD7EA, 0 0 12rpx rgba(191, 215, 234, 0.5);
}

.badge-unlock {
	animation: badgeUnlock 0.6s ease-out forwards;
}

.interaction-message {
	display: block;
	color: #A8B3BD;
	font-size: 26rpx;
	font-style: italic;
	text-align: center;
	padding: 16rpx;
}

.preference-grid {
	display: flex;
	gap: 24rpx;
}

.preference-column {
	flex: 1;
}

.pref-label {
	display: block;
	color: #66727F;
	font-size: 22rpx;
	margin-bottom: 12rpx;
}

.pref-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.pref-tag {
	padding: 6rpx 14rpx;
	border-radius: 6rpx;
	font-size: 22rpx;
}

.pref-tag.like {
	background: rgba(124, 140, 116, 0.2);
	color: #7C8C74;
}

.pref-tag.dislike {
	background: rgba(185, 74, 72, 0.2);
	color: #B94A48;
}

.archive-card {
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 18rpx;
	padding: 24rpx;
}

.archive-item {
	margin-bottom: 20rpx;
}

.archive-item:last-child {
	margin-bottom: 0;
}

.archive-label {
	display: block;
	color: #66727F;
	font-size: 22rpx;
	margin-bottom: 6rpx;
}

.archive-value {
	display: block;
	color: #A8B3BD;
	font-size: 26rpx;
	line-height: 1.6;
}

.relation-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.relation-card {
	padding: 16rpx 20rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
}

.relation-name {
	display: block;
	color: #F2F4F6;
	font-size: 26rpx;
	margin-bottom: 4rpx;
}

.relation-type {
	font-size: 22rpx;
}

.relation-type.blood { color: #C6A15B; }
.relation-type.conflict { color: #B94A48; }
.relation-type.fate { color: #7C8C74; }

.badge-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.badge-card {
	width: 48%;
	padding: 20rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 14rpx;
	opacity: 0.5;
}

.badge-card.hidden {
	opacity: 0.62;
	border-style: dashed;
	background: rgba(23, 34, 48, 0.55);
}

.badge-card.unlocked {
	opacity: 1;
	border-color: rgba(198, 161, 91, 0.65);
	background: rgba(198, 161, 91, 0.10);
}

.badge-icon {
	display: block;
	color: #66727F;
	font-size: 42rpx;
	text-align: center;
	margin-bottom: 8rpx;
}

.badge-name {
	display: block;
	color: #F2F4F6;
	font-size: 26rpx;
	font-weight: 700;
	margin-bottom: 4rpx;
}

.badge-desc {
	display: block;
	color: #A8B3BD;
	font-size: 22rpx;
	line-height: 1.6;
	margin-bottom: 6rpx;
}

.badge-status {
	font-size: 20rpx;
	color: #66727F;
}

.badge-card.unlocked .badge-status {
	color: #C6A15B;
}

@keyframes mistDrift {
	0% { transform: translateX(-8rpx); opacity: 0.35; }
	50% { transform: translateX(8rpx); opacity: 0.55; }
	100% { transform: translateX(-8rpx); opacity: 0.35; }
}

@keyframes unlockGlow {
	0% {
		opacity: 0;
		transform: scale(0.92);
		filter: blur(8rpx);
	}
	70% {
		opacity: 1;
		transform: scale(1.04);
		filter: blur(0);
	}
	100% {
		transform: scale(1);
	}
}

@keyframes lightRise {
	0% {
		opacity: 0;
		transform: translateY(12rpx) scale(0.8);
	}
	40% {
		opacity: 1;
	}
	100% {
		opacity: 0;
		transform: translateY(-28rpx) scale(1.1);
	}
}

@keyframes abyssMist {
	0% { transform: translateX(-10rpx); opacity: 0.28; }
	50% { transform: translateX(10rpx); opacity: 0.48; }
	100% { transform: translateX(-10rpx); opacity: 0.28; }
}

@keyframes abyssRipple {
	0% {
		transform: scale(0.92);
		opacity: 0.35;
	}
	100% {
		transform: scale(1.18);
		opacity: 0;
	}
}

@keyframes abyssDisappear {
	0% {
		opacity: 1;
		transform: translateY(0);
		filter: blur(0);
	}
	100% {
		opacity: 0.3;
		transform: translateY(28rpx);
		filter: blur(8rpx);
	}
}

@keyframes badgeUnlock {
	0% {
		opacity: 0;
		transform: translateY(20rpx) scale(0.86);
	}
	70% {
		opacity: 1;
		transform: translateY(-4rpx) scale(1.04);
	}
	100% {
		transform: translateY(0) scale(1);
	}
}

.mist-layer {
	position: relative;
	overflow: hidden;
}

.mist-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(191, 215, 234, 0.08) 0%, rgba(143, 182, 217, 0.05) 100%);
	animation: mistDrift 4s ease-in-out infinite;
	pointer-events: none;
}

.unlock-glow {
	animation: unlockGlow 0.8s ease-out forwards;
}

.unlock-card {
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 18rpx;
	padding: 32rpx;
}

.unlock-text {
	display: block;
	color: #A8B3BD;
	font-size: 28rpx;
	line-height: 1.6;
	margin-bottom: 24rpx;
}

.unlock-tasks {
	margin-bottom: 24rpx;
}

.task-label {
	display: block;
	color: #C6A15B;
	font-size: 26rpx;
	margin-bottom: 12rpx;
}

.task-item {
	display: block;
	color: #66727F;
	font-size: 24rpx;
	margin-bottom: 8rpx;
}

.unlock-btn {
	padding: 24rpx 48rpx;
	background: linear-gradient(135deg, #BFD7EA 0%, #8FB6D9 100%);
	border-radius: 12rpx;
	text-align: center;
	margin-top: 24rpx;
}

.unlock-btn:active {
	opacity: 0.8;
}

.unlock-btn-text {
	color: #0B1118;
	font-size: 30rpx;
	font-weight: 600;
}

.collect-btn {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #D8C27A 0%, #C6A15B 55%, #8A6F45 100%);
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 32rpx;
}

.collect-btn[hover-class] {
	opacity: 0.8;
}

.collect-btn text {
	color: #0B1118;
	font-size: 32rpx;
	font-weight: 700;
}

.collect-btn.collected {
	background: #172230;
	border: 1rpx solid #27384A;
}

.collect-btn.collected text {
	color: #66727F;
	font-size: 28rpx;
}

.bottom-space {
	height: 180rpx;
}
</style>