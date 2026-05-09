<template>
	<view class="container">
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

		<view class="section bond-section" v-if="isCollected">
			<text class="section-title">羁绊</text>
			<view class="bond-card">
				<view class="bond-header">
					<text class="bond-level">{{ getBondLevel() }}</text>
					<text class="bond-title">{{ getBondTitle() }}</text>
				</view>
				<view class="bond-progress">
					<view class="bond-track">
						<view class="bond-fill" :style="{ width: bondProgress + '%' }"></view>
					</view>
					<text class="bond-exp">{{ creature.bondExp || 0 }} / {{ creature.bondMax || 100 }}</text>
				</view>
				<text class="bond-mood">{{ getBondIntroText() }}</text>
			</view>
		</view>

		<view class="section" v-if="isCollected">
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
						<text class="pref-tag like" v-for="item in creature.likes || ['自由', '肉食']" :key="item">{{ item }}</text>
					</view>
				</view>
				<view class="preference-column">
					<text class="pref-label">厌恶</text>
					<view class="pref-tags">
						<text class="pref-tag dislike" v-for="item in creature.dislikes || ['锁链', '欺骗']" :key="item">{{ item }}</text>
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

		<view class="section" v-if="isCollected">
			<text class="section-title">徽章</text>
			<view class="badge-list">
				<view
					class="badge-card"
					:class="{ unlocked: badge.unlocked, 'badge-unlock': playBadgeAnimation && unlockedBadge && unlockedBadge.id === badge.id }"
					v-for="badge in creature.badges || defaultBadges"
					:key="badge.id"
				>
					<text class="badge-name">{{ badge.name }}</text>
					<text class="badge-desc" v-if="badge.desc">{{ badge.desc }}</text>
					<text class="badge-status">{{ badge.unlocked ? '已解锁' : '未解锁' }}</text>
				</view>
			</view>
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
import { realms } from '@/data/norse.js'

export default {
	data() {
		return {
			creature: {},
			isCollected: false,
			interactionMessage: '',
			playUnlockAnimation: false,
			playInteractionAnimation: false,
			playBadgeAnimation: false,
			unlockedBadge: null,
			defaultBadges: [
				{ id: 'observer', name: '观察者', unlocked: false },
				{ id: 'companion', name: '同伴', unlocked: false },
				{ id: 'warden', name: '见证者', unlocked: false }
			]
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
		}
	},
	onLoad(options) {
		const creatureId = options.id
		const found = norseCreatures.find(c => c.id === creatureId) || norseCreatures[0]
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
			if (this.creature.interactionType === 'spirit') {
				this.handleSpiritInteraction(action)
				return
			}
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
				case 'spirit':
					return `${this.creature.name}不会轻易回应喧哗。安静、赠礼与等待更接近它们的语言。`
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
				actions.push({ key: 'guard', label: '守护林地', bond: 12, message: '你清理了被黑雾侵蚀的树根。微光在你身边停留了很久。' })
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
		unlockCreature() {
			this.creature.collected = true
			this.creature.bondLevel = 1
			this.creature.bondExp = 5
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
			const next = Math.min(current + action.bond, 100)
			this.creature.bondExp = next
			if (!this.creature.interactionStats) {
				this.creature.interactionStats = { listen: 0, gift: 0, wait: 0, resonate: 0, guard: 0 }
			}
			if (this.creature.interactionStats[action.key] !== undefined) {
				this.creature.interactionStats[action.key] += 1
			}
			this.creature.bondStage = this.getSpiritBondStage()
			this.interactionMessage = action.message
			this.playInteractionAnimation = true
			if (next >= 100) {
				this.unlockSpiritBadge()
			}
		},
		unlockSpiritBadge() {
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
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #0B1118;
	padding: 24rpx;
	padding-bottom: 160rpx;
	width: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
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

.bond-mood {
	color: #66727F;
	font-size: 24rpx;
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

.badge-card.unlocked {
	opacity: 1;
	border-color: #C6A15B;
}

.badge-name {
	display: block;
	color: #F2F4F6;
	font-size: 26rpx;
	margin-bottom: 4rpx;
}

.badge-desc {
	display: block;
	color: #A8B3BD;
	font-size: 22rpx;
	margin-bottom: 6rpx;
	opacity: 0.7;
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