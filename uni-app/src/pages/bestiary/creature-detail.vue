<template>
	<view class="container page-enter-deep">
		<NavBar title="生物详情" />
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
			<text class="section-title">深入观测</text>
			<view class="unlock-card abyss-layer">
				<view class="abyss-overlay"></view>
				<text class="unlock-text">图鉴中早已记下它的名字，但从未有人真正观测过活着的它。只有在海潮异常回落、远方海面形成闭合的环时，才可能发现它的踪迹。</text>
				<view class="unlock-tasks">
					<text class="task-label">线索：</text>
					<text class="task-item">1. 《索尔钓起世界之蛇》记下了它的样子</text>
					<text class="task-item">2. 米德加德的海民见过它的踪影</text>
					<text class="task-item">3. 在海潮回落时，你终于等到了它</text>
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
					<text class="bond-exp"><AnimNumber :value="Number(creature.bondExp) || 0" /> / <AnimNumber :value="Number(creature.bondMax) || 100" /></text>
				</view>
				<view class="bond-mood-row">
					<text class="bond-mood-label">当前情绪：</text>
					<text class="bond-mood-value">{{ creature.mood || '疏离' }}</text>
				</view>
				<text class="bond-desc">{{ getBondStageDescription() }}</text>
		</view>
	</view>

	<!-- ============ 精灵：微光结契互动区（镜像耶梦加得高危观测区，基调差异化） ============ -->
	<view class="section elf-section" v-if="isCollected && creature.interactionType === 'spirit' && creature.spiritConfig">
		<text class="section-title">林间互动</text>
		<view class="elf-meter-row">
			<view class="elf-meter">
				<text class="elf-meter-label">信任之光</text>
				<view class="elf-meter-track">
					<view class="elf-meter-fill trust" :style="{ width: elfState.trust + '%' }"></view>
				</view>
				<text class="elf-meter-value"><AnimNumber :value="Number(elfState.trust) || 0" /> / 100</text>
			</view>
			<view class="elf-meter">
				<text class="elf-meter-label">林间静谧</text>
				<view class="elf-meter-track" :class="{ warn: elfState.disturbance >= 60 }">
					<view class="elf-meter-fill quiet" :style="{ width: elfQuietPercent + '%' }"></view>
				</view>
				<text class="elf-meter-value">{{ elfQuietText }}</text>
			</view>
		</view>

		<view class="elf-receding-card" v-if="elfState.receding">
			<text class="elf-receding-title">微光回避中</text>
			<text class="elf-receding-desc">它们退入了林间深处。再连续静候 {{ elfQuietNeedLeft }} 次，微光会重新出现。</text>
		</view>

		<view class="elf-final-card" v-if="elfState.trust >= 100 && !elfState.receding">
			<text class="elf-final-title">✦ 亚尔夫之友</text>
			<text class="elf-final-desc">冷光成为你与林地之间的纽带。这段关系没有终点，也不需要终点。</text>
		</view>

		<view class="interaction-actions">
			<view
				v-for="action in getSpiritActions()"
				:key="action.key"
				class="interaction-button spirit"
				:class="'elf-tone-' + (action.tone || 'low')"
				@click="handleSpiritInteraction(action)"
			>
				<view class="light-particle" v-if="playInteractionAnimation"></view>
				<text class="interaction-label">{{ action.label }}</text>
				<text class="elf-action-hint" v-if="action.key === 'wait' && elfState.receding">静候 {{ elfState.recedingQuietCount }} / {{ elfQuietNeedTotal }}</text>
			</view>
		</view>

		<view class="elf-message-list" v-if="elfMessages.length">
			<view class="elf-message" v-for="(msg, index) in elfMessages.slice(0, 3)" :key="msg.time + '-' + index">
				<text class="elf-message-text">{{ msg.text }}</text>
			</view>
		</view>

		<view class="event-list" v-if="getElfEventCards().length">
			<view class="event-card" v-for="event in getElfEventCards()" :key="event.id">
				<text class="event-name">{{ event.name }}</text>
				<text class="event-desc">{{ event.description }}</text>
			</view>
		</view>
	</view>

		<!-- ============ 耶梦加得：按 abyss-lab 原型整体布局 ============ -->
		<view class="jorm-stage-section" v-if="isCollected && creature.id === 'jormungandr'">
			<!-- 概念 A：观测舞台（状态可视化到场景） -->
			<view class="obs-stage" :class="{ unstable: stageUnstable, frozen: jormungandrState.frozen }">
				<view class="stage-badge">
					<view class="rec-dot"></view>
					<text class="rec-text">REC</text>
					<text class="stage-cam">观测画面 · 米德加德外海</text>
				</view>
				<view class="stage-wave sw1"></view>
				<view class="stage-wave sw2"></view>
				<view class="stage-wave sw3"></view>
				<view class="stage-mist sm1" :style="{ opacity: stageMistOpacity }"></view>
				<view class="stage-mist sm2" :style="{ opacity: stageMistOpacity * 0.8 }"></view>
				<view class="stage-arc" :style="stageArcStyle"></view>
				<view v-if="stageEyeVisible" class="stage-eye" :style="{ left: stageEyeLeft }"></view>
				<view v-for="r in stageRipples" :key="r.id" class="stage-ripple" :class="r.tone"></view>
				<view v-if="jormungandrState.frozen" class="signal-lost">
					<text class="lost-title">信号丢失</text>
					<text class="lost-sub">— 记录停留在它消失的那一刻 —</text>
				</view>
			</view>

			<!-- 概念 B：状态面板（三仪表 + 等级语言） -->
			<view class="jorm-panel">
				<view class="panel-header">
					<text class="contact-status" :class="{ hostile: jormungandrState.hostility >= 6, missing: jormungandrState.frozen }">
						{{ jormungandrState.frozen ? '失踪' : jormungandrState.contactStatus }}
					</text>
					<text class="sanity-word" :class="sanityLevelKey">{{ sanityLoadText }}</text>
				</view>

				<view class="gauge-row">
					<text class="gauge-label">观测深度</text>
					<view class="gauge-track">
						<view class="gauge-fill obs" :style="{ width: observationPercent + '%' }"></view>
					</view>
					<text class="gauge-value">{{ jormungandrState.frozen ? '冻结' : Math.round(observationPercent) + '%' }}</text>
				</view>

				<view class="gauge-row">
					<text class="gauge-label">心智负荷</text>
					<view class="gauge-track">
						<view class="gauge-fill san" :class="sanityLevelKey" :style="{ width: Math.min(100, jormungandrState.sanityLoad * 10) + '%' }"></view>
					</view>
					<text class="gauge-value">{{ jormungandrState.frozen ? '冻结' : jormungandrState.sanityLoad }}</text>
				</view>

				<view class="gauge-row">
					<text class="gauge-label">居民态度</text>
					<view class="gauge-track">
						<view class="gauge-fill hos" :style="{ width: Math.min(100, jormungandrState.hostility * 10) + '%' }"></view>
					</view>
					<text class="gauge-value">{{ jormungandrState.frozen ? '冻结' : hostilityText }}</text>
				</view>

				<text class="jorm-desc">{{ getJormungandrDescription() }}</text>
			</view>

			<!-- 事件记录：解锁即永久展示（不依赖冻结状态） -->
			<view class="event-list" v-if="jormungandrState.unlockedEvents.length > 0">
				<view
					v-for="eventId in jormungandrState.unlockedEvents"
					:key="eventId"
					class="event-card"
				>
					<text class="event-name">{{ getJormungandrEventInfo(eventId)?.name }}</text>
					<text class="event-desc">{{ getJormungandrEventInfo(eventId)?.description }}</text>
				</view>
			</view>
		</view>

		<!-- 其他深渊生物：保持原有档案结构 -->
		<view class="section abyss-section" v-if="isCollected && creature.interactionType === 'abyss' && creature.id !== 'jormungandr'">
			<text class="section-title">状态</text>
			<view class="abyss-card" :class="{ frozen: creature.missing || creature.abyssFrozen }">
				<view class="abyss-mist" v-if="!(creature.missing || creature.abyssFrozen)"></view>
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

		<!-- 耶梦加得：原型互动矩阵 + 终端日志 -->
		<view class="jorm-actions-section" v-if="isCollected && creature.id === 'jormungandr' && !jormungandrState.frozen">
			<!-- 概念 C：互动矩阵（风险语言 + 解锁门禁） -->
			<view class="action-grid">
				<view
					v-for="action in jormungandrActions"
					:key="action.key"
					class="action-btn"
					:class="[action.risk, { locked: action.unlock > Number(jormungandrState.observation || 0), shaking: shakeKey === action.key }]"
					@click="handleJormungandrAction(action)"
				>
					<text class="action-name">{{ action.label }}</text>
					<text class="action-risk" :class="{ safe: action.risk === 'safe' }" v-if="action.risk !== 'low'">
						{{ action.risk === 'safe' ? '安全' : (action.risk === 'extreme' ? '极高' : (action.risk === 'high' ? '高' : '中')) }}
					</text>
					<text class="action-lock" v-if="action.unlock > Number(jormungandrState.observation || 0)">观测 {{ action.unlock }} 解锁</text>
				</view>
			</view>
		</view>

		<!-- 概念 D：观测日志（独立区块，失踪冻结后仍可查阅） -->
		<view class="jorm-log-panel" v-if="isCollected && creature.id === 'jormungandr' && jormungandrMessages.length > 0">
			<view class="log-list">
				<view
					v-for="(msg, index) in jormungandrMessages"
					:key="msg.id"
					class="log-item"
					:class="{ danger: msg.danger, threshold: msg.threshold }"
				>
					<text class="log-time">{{ msg.time }}</text>
					<text class="log-text">{{ index === 0 ? typingText : msg.text }}<text v-if="index === 0 && typing" class="type-cursor">▌</text></text>
				</view>
			</view>
		</view>

		<!-- 其他深渊生物：保持原有互动结构 -->
		<view class="section" v-if="isCollected && creature.interactionType === 'abyss' && creature.id !== 'jormungandr' && !(creature.missing || creature.abyssFrozen)">
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
						danger: (action.highRisk && creature.riskLevel >= 70) || action.risk === 'extreme' || action.risk === 'high'
					}"
					@click="handleAbyssInteraction(action)"
				>
					<view class="light-particle" v-if="playAbyssAnimation && abyssAnimKey === action.key"></view>
					<text class="interaction-label">{{ action.label }}</text>
					<text class="risk-hint" v-if="action.highRisk && creature.riskLevel >= 70">继续靠近可能导致它沉入更深处</text>
				</view>
			</view>
			<text v-if="interactionMessage" class="interaction-message">{{ interactionMessage }}</text>
		</view>

		<view class="section" v-if="isCollected && creature.interactionType === 'abyss' && ((creature.missing || creature.abyssFrozen) || (creature.id === 'jormungandr' && jormungandrState.frozen))">
			<text class="section-title">{{ creature.id === 'jormungandr' ? '档案冻结' : '深海冻结' }}</text>
			<view class="frozen-card">
				<view class="frozen-message">
					<text class="frozen-text">{{ creature.id === 'jormungandr' ? '该档案已进入失踪状态。后续互动已冻结。' : (creature.missing ? '世界之蛇已沉入外海。海面再无回应。' : '观测记录已冻结。') }}</text>
				</view>
				<text class="frozen-hint" v-if="creature.id === 'jormungandr' && jormungandrMessages.length > 0">{{ jormungandrMessages[0]?.text || '你的记录停留在它消失的那一刻。' }}</text>
				<text class="frozen-hint" v-else-if="creature.missing">{{ interactionMessage || '你的记录停留在它消失的那一刻。' }}</text>
				<view class="frozen-actions" v-if="creature.id !== 'jormungandr'">
					<view class="frozen-btn" @click="viewAbyssRecord">
						<text class="frozen-btn-text">查看记录</text>
					</view>
					<view class="frozen-btn tide" @click="waitForTide">
						<text class="frozen-btn-text">等待潮汐</text>
					</view>
				</view>
			</view>
			<view class="event-list" v-if="creature.id === 'jormungandr' && jormungandrState.unlockedEvents.length > 0">
				<view
					v-for="eventId in jormungandrState.unlockedEvents"
					:key="eventId"
					class="event-card"
				>
					<text class="event-name">{{ getJormungandrEventInfo(eventId)?.name }}</text>
					<text class="event-desc">{{ getJormungandrEventInfo(eventId)?.description }}</text>
				</view>
			</view>
		</view>

		<view class="section" v-if="isCollected && creature.interactionType !== 'abyss' && creature.id !== 'jormungandr' && !(creature.interactionType === 'spirit' && creature.spiritConfig)">
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

		<!-- 深渊系生物：解锁前隐藏收藏入口（防止绕过观测仪式），解锁后提供移除观测记录 -->
		<view
			v-if="creature.interactionType !== 'abyss' || isCollected"
			class="collect-btn"
			:class="{ collected: isCollected }"
			@click="isCollected ? removeCollect() : collect()"
		>
			<text v-if="!isCollected">收藏到图鉴</text>
			<text v-else-if="creature.interactionType === 'abyss'">移除观测记录 · 重开观测</text>
			<text v-else>已收藏 · 移除记录</text>
		</view>

		<!-- 概念 E：全屏低语警告 -->
		<view v-if="whisperVisible" class="whisper-layer" @click="whisperVisible = false">
			<text class="whisper-text">你应该离开。</text>
		</view>

		<!-- 概念 F：事件揭晓层 -->
		<view v-if="jormEventOverlay" class="jorm-event-layer" @click="jormEventOverlay = null">
			<view class="jorm-event-body" :class="jormEventOverlay.tone" @click.stop>
				<text class="jorm-event-kicker">{{ jormEventOverlay.tone === 'missing' ? 'ARCHIVE CLOSED' : 'EVENT UNLOCKED' }}</text>
				<text class="jorm-event-title">{{ jormEventOverlay.name }}</text>
				<text class="jorm-event-desc">{{ jormEventOverlay.description }}</text>
				<view class="jorm-event-close" @click="jormEventOverlay = null">
					<text>记录在案</text>
				</view>
			</view>
		</view>

		<!-- 解锁 / 收藏全屏庆祝层 -->
		<view v-if="celebration.visible" class="celebration-mask" @click="closeCelebration">
			<view class="celebration-body">
				<view class="celebration-icon">
					<text>{{ celebration.symbol }}</text>
					<view
						v-for="i in 10"
						:key="i"
						class="celebration-spark"
						:style="{ transform: 'rotate(' + (i * 36) + 'deg)' }"
					>
						<view class="spark-dot"></view>
					</view>
				</view>
				<text class="celebration-title">{{ celebration.title }}</text>
				<text class="celebration-subtitle">{{ celebration.subtitle }}</text>
			</view>
		</view>

		<view class="bottom-space"></view>
	</view>
</template>

<script>
import { db } from '@/db'
import { getRavensClueProgress, saveRavensClueProgress, isRavensRevealed as checkRavensRevealed, getRavensClueCount as getClueCount, isRavensClueUnlocked as checkRavensClueUnlocked, resetRavensClues } from '@/utils/clueProgress.js'
import NavBar from '@/components/NavBar.vue'
import AnimNumber from '@/components/AnimNumber.vue'

// ===== 耶梦加得：消息随机池 / 风险映射 / 心智阈值提示（接入自 abyss-lab 原型） =====
const JORM_MSG_POOL = {
	distantView: ['你站在安全距离外观察。', '海平线上什么都没有。或者，什么都有。', '浪从很远的地方来，比想象中慢。'],
	tideListen: ['潮声中似乎夹杂着某种节律。', '你数不清潮水的次数，数字总是对不上。', '潮声停了一瞬。你没有告诉任何人。'],
	observe: ['你的笔记越来越密。', '你开始给每一道浪编号。', '纸上的线条开始像鳞片。'],
	worship: ['远处，有人在看你。', '你献上的东西被潮水带走了。', '村里的人记住了你的脸。'],
	retreat: ['你选择后退，危险有所降低。', '你离开海岸。海面在你身后合拢。'],
	touch: ['你越过了安全距离。海面忽然安静得可怕。', '指尖触到的一瞬，潮声全部消失了。']
}
const JORM_RISK = { distantView: 'low', tideListen: 'medium', observe: 'high', retreat: 'safe', worship: 'high', touch: 'extreme' }
const JORM_RISK_LABEL = { low: '', medium: '中', high: '高', safe: '安全', extreme: '极高' }
const JORM_THRESHOLD_HINTS = {
	4: '你开始分不清观察和幻觉的边界。',
	7: '纸上的字迹在夜里似乎自己移动了。',
	10: '你已经很久没有睡过一个完整的夜晚。'
}

export default {
	components: { NavBar, AnimNumber },
	data() {
			return {
				creature: {},
				isCollected: false,
				interactionMessage: '',
				playUnlockAnimation: false,
				playInteractionAnimation: false,
				playAbyssAnimation: false,
				abyssAnimKey: '',
				playMissingAnimation: false,
				playBadgeAnimation: false,
				unlockedBadge: null,
				defaultBadges: [
					{ id: 'observer', name: '观察者', unlocked: false },
					{ id: 'companion', name: '同伴', unlocked: false },
					{ id: 'warden', name: '见证者', unlocked: false }
				],
				showRevealAnimation: false,
				// 解锁 / 收藏全屏庆祝
				celebration: { visible: false, symbol: '', title: '', subtitle: '' },
				celebrationTimer: null,
				jormungandrState: {
					observation: 0,
					sanityLoad: 0,
					hostility: 0,
					contactStatus: '高危观测中',
					recentActions: [],
					frozen: false,
					unlockedEvents: []
				},
				jormungandrMessages: [],
				// ===== 精灵"微光结契"状态（镜像耶梦加得状态机的善良生物版本）=====
				elfState: {
					trust: 0,               // 信任之光 0-100（即 bondExp）
					disturbance: 0,         // 惊扰度 0-100（静谧条反向显示）
					quietStreak: 0,         // 连续静候计数（共鸣门槛）
					receding: false,        // 精灵回避中（可逆，仅静候可恢复）
					recedingQuietCount: 0,  // 回避期间的静候计数
					callCount: 0,           // 呼唤次数（触发回避）
					goodGifts: 0,           // 安宁状态下的赠礼次数（回赠事件门槛）
					returnedOnce: false,    // 曾经历"回避→回归"（守候者徽章）
					unlockedEvents: [],     // 已触发事件
					stats: { listen: 0, gift: 0, wait: 0, resonate: 0, guard: 0, call: 0 }
				},
				elfMessages: [],
				// 舞台反馈 / 全屏层（接入自原型）
				stageRipples: [],
				shakeKey: '',
				whisperVisible: false,
				whisperTimer: null,
				jormEventOverlay: null,
				typing: false,
				typingText: '',
				typeTimer: null
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
		},
		sanityLoadText() {
			const load = this.jormungandrState.sanityLoad
			if (load <= 3) return '清醒'
			if (load <= 6) return '不安'
			if (load <= 9) return '执迷'
			return '精神濒临崩溃'
		},
		// 心智分级（驱动仪表颜色与脉动）
		sanityLevelKey() {
			const load = Number(this.jormungandrState.sanityLoad || 0)
			if (load >= 10) return 'lv4'
			if (load >= 7) return 'lv3'
			if (load >= 4) return 'lv2'
			return 'lv1'
		},
		hostilityText() {
			const hostility = this.jormungandrState.hostility
			if (hostility <= 2) return '无人注意'
			if (hostility <= 5) return '有人议论'
			if (hostility <= 8) return '居民敌视'
			return '被驱逐边缘'
		},
		observationPercent() {
			return Math.min(100, this.jormungandrState.observation * 5)
		},
		isJormungandr() {
			return this.creature.id === 'jormungandr'
		},
		// ===== 精灵"微光结契"计算属性 =====
		elfQuietPercent() {
			return Math.max(0, 100 - Number(this.elfState.disturbance || 0))
		},
		elfQuietText() {
			const d = Number(this.elfState.disturbance || 0)
			if (d >= 80) return '噪声四起'
			if (d >= 60) return '草木不安'
			if (d >= 30) return '略有动静'
			return '安宁'
		},
		elfQuietNeedTotal() {
			const config = (this.creature && this.creature.spiritConfig) || null
			return config ? config.receding.quietNeed : 3
		},
		elfQuietNeedLeft() {
			return Math.max(0, this.elfQuietNeedTotal - Number(this.elfState.recedingQuietCount || 0))
		},
		jormungandrActions() {
			// 全量返回，锁定态由模板呈现（玩家可见成长路径）
			return [
				{ key: 'distantView', label: '远观', risk: 'low', unlock: 0 },
				{ key: 'tideListen', label: '听潮', risk: 'medium', unlock: 0 },
				{ key: 'observe', label: '观察', risk: 'high', unlock: 5 },
				{ key: 'retreat', label: '退后', risk: 'safe', unlock: 5 },
				{ key: 'worship', label: '祭拜', risk: 'high', unlock: 10 },
				{ key: 'touch', label: '触碰', risk: 'extreme', unlock: 20 }
			]
		},
		// ===== 观测舞台映射（接入自原型概念 A） =====
		stageArcStyle() {
			const obs = Number(this.jormungandrState.observation || 0)
			const t = Math.min(1, obs / 12)
			return {
				opacity: (0.15 + t * 0.85).toFixed(2),
				transform: `translateY(${(60 - obs * 2)}rpx) scaleX(${(1 + obs * 0.006).toFixed(3)})`
			}
		},
		stageEyeVisible() {
			return Number(this.jormungandrState.observation || 0) >= 25 && !this.jormungandrState.frozen
		},
		stageEyeLeft() {
			const obs = Number(this.jormungandrState.observation || 0)
			return `${34 + Math.min(20, obs * 0.3)}%`
		},
		stageMistOpacity() {
			return (0.25 + Math.min(1, Number(this.jormungandrState.sanityLoad || 0) * 0.09)).toFixed(2)
		},
		stageUnstable() {
			return Number(this.jormungandrState.sanityLoad || 0) >= 7 && !this.jormungandrState.frozen
		}
	},
	onLoad(options) {
		const creatureId = options.id
		let found = db.findById('creatures', creatureId)
		if (!found) {
			found = db.findAll('creatures')[0]
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
		if (this.creature.id === 'jormungandr') {
			this.loadJormungandrState()
		}
		if (this.creature.interactionType === 'spirit') {
			this.loadElfState()
		}
	},
	beforeUnmount() {
		if (this.typeTimer) clearInterval(this.typeTimer)
		if (this.whisperTimer) clearTimeout(this.whisperTimer)
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
			const realm = db.findById('realms', realmId)
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
		// ===== 解锁 / 收藏全屏庆祝 =====
		showCelebration({ symbol, title, subtitle }) {
			this.haptic()
			this.celebration = { visible: true, symbol, title, subtitle }
			if (this.celebrationTimer) clearTimeout(this.celebrationTimer)
			this.celebrationTimer = setTimeout(() => {
				this.celebration.visible = false
			}, 2400)
		},
		closeCelebration() {
			if (this.celebrationTimer) clearTimeout(this.celebrationTimer)
			this.celebration.visible = false
		},
		// 震动反馈：H5 用 Vibration API，其余端用 uni.vibrateShort
		haptic() {
			// #ifdef H5
			if (typeof navigator !== 'undefined' && navigator.vibrate) {
				navigator.vibrate(20)
			}
			// #endif
			// #ifndef H5
			try { uni.vibrateShort({}) } catch (e) { /* 部分平台不支持，忽略 */ }
			// #endif
		},
		collect() {
			if (this.isCollected) return
			let collected = uni.getStorageSync('collectedCreatures') || []
			collected.push(this.creature.id)
			uni.setStorageSync('collectedCreatures', collected)
			this.isCollected = true
			this.showCelebration({
				symbol: this.creature.name ? this.creature.name[0] : '★',
				title: '已收入图鉴',
				subtitle: this.creature.name + ' 的记录被保留'
			})
		},
		removeCollect() {
		if (!this.isCollected) return
		// 有羁绊/惊扰进度时二次确认，防止误触清空
		if (this.creature.interactionType === 'spirit' && this.getSpiritConfig()) {
			const s = this.elfState
			const hasProgress = s.trust > 0 || s.unlockedEvents.length > 0 || (this.elfMessages && this.elfMessages.length > 0)
			if (hasProgress) {
				uni.showModal({
					title: '告别这片林地',
					content: '将清空信任之光、惊扰记录、事件叙事与全部徽章，从初见微光重新开始。确定吗？',
					confirmText: '告别',
					cancelText: '留下',
					success: (res) => {
						if (res.confirm) this.doRemoveCollect()
					}
				})
				return
			}
		}
		if (this.creature.id === 'jormungandr') {
				const s = this.jormungandrState
				const hasProgress = Number(s.observation || 0) > 0 || s.unlockedEvents.length > 0 || s.frozen || (this.jormungandrMessages && this.jormungandrMessages.length > 0)
				if (hasProgress) {
					uni.showModal({
						title: '移除观测记录',
						content: '将清空全部观测进度、事件记录与档案叙事，从头开始观测。确定吗？',
						confirmText: '移除',
						cancelText: '保留',
						success: (res) => {
							if (res.confirm) this.doRemoveCollect()
						}
					})
					return
				}
			}
			this.doRemoveCollect()
		},
		doRemoveCollect() {
			let collected = uni.getStorageSync('collectedCreatures') || []
			collected = collected.filter(id => id !== this.creature.id)
			uni.setStorageSync('collectedCreatures', collected)
			this.isCollected = false
		if (this.creature.id === 'jormungandr') {
			this.resetJormungandrState()
		}
		if (this.creature.interactionType === 'spirit' && this.getSpiritConfig()) {
			this.resetElfState()
		}
			uni.showToast({ title: '已移除记录', icon: 'none' })
		},
		resetJormungandrState() {
		this.jormungandrState = {
			observation: 0,
			sanityLoad: 0,
			hostility: 0,
			contactStatus: '高危观测中',
			recentActions: [],
			frozen: false,
			unlockedEvents: []
		}
		this.jormungandrMessages = []
		this.stageRipples = []
		this.jormEventOverlay = null
		this.whisperVisible = false
		if (this.typeTimer) clearInterval(this.typeTimer)
		this.typing = false
		this.typingText = ''
		uni.removeStorageSync('jormungandr_high_risk_state')
	},
	// ===== 精灵"微光结契"：配置驱动的动作列表 =====
	getSpiritConfig() {
			return (this.creature && this.creature.spiritConfig) || null
		},
		getSpiritActions() {
			const config = this.getSpiritConfig()
			if (!config) {
				// 无配置的 spirit 生物保持旧行为
				const exp = Number(this.creature.bondExp || 0)
				const actions = [
					{ key: 'wait', label: '静候', bond: 5, message: '你没有打扰它们。微光在树影间停留得更久了一些。' },
					{ key: 'listen', label: '聆听', bond: 6, message: '你听见风穿过枝叶，像某种尚未成形的语言。' },
					{ key: 'gift', label: '赠礼', bond: 8, message: '你放下一枚洁净的小物，它被光轻轻覆盖。' }
				]
				if (exp >= 25) actions.push({ key: 'resonate', label: '共鸣', bond: 10, message: '你顺着光的节奏放慢呼吸，短暂感到某种温和的回应。' })
				if (exp >= 50) actions.push({ key: 'guard', label: '守护', bond: 12, message: '你清理了被黑雾侵蚀的树根。微光在你身边停留了很久。' })
				return actions
			}
			const trust = Number(this.elfState.trust || 0)
			return config.actions.filter(action => {
				// 回避期间只保留静候
				if (this.elfState.receding) return action.key === 'wait'
				if (trust < action.unlock) return false
				if (action.requireQuietStreak && this.elfState.quietStreak < action.requireQuietStreak) return false
				return true
			})
		},
		getSpiritBondStage() {
			const exp = Number(this.creature && this.creature.bondExp || 0)
			if (!this.creature || !this.creature.collected) return '未发现踪迹'
			const config = this.getSpiritConfig()
			if (config) {
				const matched = config.stages.filter(s => exp >= s.min)
				return matched.length ? matched[matched.length - 1].stage : config.stageInitial.stage
			}
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
				icon: 'success'
			})
		},
		getVisibleBadges() {
		if (!this.creature) return []
		if (this.isHighRiskCreature(this.creature)) return []
		const badges = this.creature.badges || []
		// 微光结契：徽章随互动事件逐个显现（灾厄生物不产出徽章）
		if (this.creature.interactionType === 'spirit' && this.creature.spiritConfig) {
			const unlocked = badges.filter(item => item.unlocked)
			if (unlocked.length) return unlocked
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
			const config = this.getSpiritConfig()
			if (config) {
				const matched = config.stages.filter(s => exp >= s.min)
				const target = matched.length ? matched[matched.length - 1] : config.stageInitial
				this.creature.bondLevel = Math.min(5, matched.length + 1)
				this.creature.bondStage = target.stage
				this.creature.mood = this.elfState.receding ? '回避' : target.mood
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
			const config = this.getSpiritConfig()
			if (config) {
				if (this.elfState.receding) return '微光此刻不在你能看见的地方。继续静候——它们记得每一个安静的访客。'
				const matched = config.stages.filter(s => exp >= s.min)
				return (matched.length ? matched[matched.length - 1].desc : config.stageInitial.desc)
			}
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
		if (this.getSpiritConfig()) {
			// 微光结契：初始信任与状态持久化
			this.elfState.trust = 5
			this.saveElfState()
		}
			this.interactionMessage = '你在树影间看见一束短暂的冷光。它没有靠近，也没有逃离。'
			this.playUnlockAnimation = true
			this.isCollected = true
			this.showCelebration({
				symbol: this.creature.name[0],
				title: '图鉴收录',
				subtitle: this.creature.name + ' · ' + this.creature.type
			})
			const collected = uni.getStorageSync('collectedCreatures') || []
			if (!collected.includes(this.creature.id)) {
				collected.push(this.creature.id)
				uni.setStorageSync('collectedCreatures', collected)
			}
		},
		// ===== 精灵"微光结契"：交互引擎 =====
	handleSpiritInteraction(action) {
			if (!action || !this.creature) return
			const config = this.getSpiritConfig()
			if (!config) {
				// 无配置的 spirit 生物保持旧行为（纯加羁绊）
				const current = Number(this.creature.bondExp || 0)
				const max = Number(this.creature.bondMax || 100)
				this.creature.bondExp = Math.min(current + (action.bond || action.trust || 5), max)
				this.updateSpiritMoodAndStage()
				this.interactionMessage = action.message
				this.playInteractionAnimation = true
				return
			}
			// 高打扰动作需要确认（镜像耶梦加得"触碰"确认弹窗）
			if (action.confirm) {
				uni.showModal({
					title: action.confirm.title,
					content: action.confirm.content,
					confirmText: action.confirm.confirmText,
					cancelText: action.confirm.cancelText,
					success: (res) => {
						if (res.confirm) this.executeElfAction(action)
						else this.addElfMessage('你选择了沉默。')
					}
				})
				return
			}
			this.executeElfAction(action)
		},
		executeElfAction(action) {
			const config = this.getSpiritConfig()
			const state = this.elfState

			// 计数与连续静候（节奏机制：连做会失去"静候节奏"）
			if (state.stats[action.key] !== undefined) state.stats[action.key] += 1
			state.quietStreak = action.key === 'wait' ? state.quietStreak + 1 : 0

			// 赠礼的"好礼"判定：林间安宁时的赠礼才被真正记住
			const goodGift = action.key === 'gift' && state.disturbance < 50
			if (goodGift) state.goodGifts += 1

			// 数值应用（trust 即 bondExp，clamp 0-100）
			let trustDelta = Number(action.trust || 0)
			if (action.key === 'gift' && !goodGift) trustDelta = Math.ceil(trustDelta / 2)
			state.trust = Math.max(0, Math.min(100, state.trust + trustDelta))
			state.disturbance = Math.max(0, Math.min(100, state.disturbance + Number(action.disturb || 0)))
			if (action.key === 'call') state.callCount += 1

			// 回避期间的静候恢复（可逆修复，镜像冻结的反面）
			if (state.receding && action.key === 'wait') {
				state.recedingQuietCount += 1
				if (state.recedingQuietCount >= config.receding.quietNeed) {
					state.receding = false
					state.recedingQuietCount = 0
					state.returnedOnce = true
					this.addElfMessage(config.receding.returnMessage)
					this.tryUnlockElfBadge('elf-watcher')
				}
			}

			// 同步羁绊显示
			this.creature.bondExp = state.trust
			this.creature.interactionStats = state.stats
			this.updateSpiritMoodAndStage()

			// 反馈消息
			const message = (action.key === 'gift' && !goodGift && action.messageDisturbed)
				? action.messageDisturbed
				: action.message
			this.addElfMessage(message)
			this.interactionMessage = message
			this.playInteractionAnimation = true

			this.checkElfEvents()
			this.tryUnlockElfBadges()
			this.saveElfState()
		},
		checkElfEvents() {
			const config = this.getSpiritConfig()
			const state = this.elfState
			if (state.receding) return

			// 事件：铁器的噪声（回避，可逆——善良生物没有冻结结局）
			// 呼唤计数在进入回避时重置：回归后需重新积累两次呼唤才会再次触发
			if (state.disturbance >= 80 || state.callCount >= 2) {
				state.receding = true
				state.recedingQuietCount = 0
				state.quietStreak = 0
				state.callCount = 0
				state.trust = Math.max(0, state.trust - config.receding.trustPenalty)
				this.creature.bondExp = state.trust
				if (!state.unlockedEvents.includes('ironNoise')) {
					state.unlockedEvents.push('ironNoise')
				}
				this.addElfMessage(config.receding.enterMessage)
				this.updateSpiritMoodAndStage()
				return
			}

			// 事件：林间的回赠（正向——耶梦加得体系没有的"双向时刻"）
			if (
				!state.unlockedEvents.includes('returnGift') &&
				state.trust >= 50 &&
				state.goodGifts >= config.badgeRules.goodGift
			) {
				state.unlockedEvents.push('returnGift')
				this.addElfMessage('一片带着微光的叶子落在你手边。')
				this.showCelebration({ symbol: '✦', title: '林间的回赠', subtitle: '它第一次主动走向你' })
				this.tryUnlockElfBadge('elf-giver')
			}

			// 一次性温和提示（镜像"你应该离开。"）
			if (state.disturbance >= 60 && !state.unlockedEvents.includes('gaze')) {
				state.unlockedEvents.push('gaze')
				this.addElfMessage(config.events.gaze.message)
			}
		},
		getElfEventCards() {
			const config = this.getSpiritConfig()
			if (!config) return []
			return this.elfState.unlockedEvents
				.filter(id => id !== 'gaze')
				.map(id => ({ id, ...(config.events[id] || {}) }))
		},
		// ===== 徽章：羁绊的证明（仅善良生物产出；灾厄生物零徽章）=====
		tryUnlockElfBadges() {
			const rules = this.getSpiritConfig().badgeRules
			const stats = this.elfState.stats
			if (stats.listen >= rules.listen) this.tryUnlockElfBadge('elf-listener')
			if (stats.resonate >= rules.resonate) this.tryUnlockElfBadge('elf-resonance')
			if (stats.guard >= rules.guard) this.tryUnlockElfBadge('elf-warden')
			if (this.elfState.trust >= rules.friendTrust) this.tryUnlockElfBadge('elf-friend')
		},
		tryUnlockElfBadge(badgeId) {
			const badges = (this.creature && this.creature.badges) || []
			const target = badges.find(item => item.id === badgeId)
			if (!target || target.unlocked) return
			target.unlocked = true
			this.unlockedBadge = target
			this.addElfMessage('获得徽章：' + target.name)
			this.playBadgeAnimation = true
			this.saveElfState()
		},
		addElfMessage(text) {
			this.elfMessages.unshift({ text, time: Date.now() })
			if (this.elfMessages.length > 6) this.elfMessages.pop()
		},
		saveElfState() {
			const config = this.getSpiritConfig()
			if (!config) return
			const badges = {}
			;((this.creature && this.creature.badges) || []).forEach(b => { badges[b.id] = !!b.unlocked })
			uni.setStorageSync(config.storageKey, { ...this.elfState, badges })
		},
		loadElfState() {
			const config = this.getSpiritConfig()
			if (!config) return
			const defaults = {
				trust: 0, disturbance: 0, quietStreak: 0, receding: false, recedingQuietCount: 0,
				callCount: 0, goodGifts: 0, returnedOnce: false, unlockedEvents: [],
				stats: { listen: 0, gift: 0, wait: 0, resonate: 0, guard: 0, call: 0 }
			}
			const saved = uni.getStorageSync(config.storageKey)
			this.elfState = {
				...defaults,
				...saved,
				stats: { ...defaults.stats, ...((saved && saved.stats) || {}) }
			}
			if (saved && saved.badges && this.creature && this.creature.badges) {
				this.creature.badges.forEach(b => { if (saved.badges[b.id]) b.unlocked = true })
			}
			// trust 同步羁绊显示（修复旧版刷新即丢进度的问题）
			if (this.isCollected) {
				this.creature.bondExp = Math.max(Number(this.creature.bondExp || 0), this.elfState.trust)
				this.creature.interactionStats = this.elfState.stats
				this.updateSpiritMoodAndStage()
			}
		},
		resetElfState() {
			const config = this.getSpiritConfig()
			if (config) uni.removeStorageSync(config.storageKey)
			this.elfState = {
				trust: 0, disturbance: 0, quietStreak: 0, receding: false, recedingQuietCount: 0,
				callCount: 0, goodGifts: 0, returnedOnce: false, unlockedEvents: [],
				stats: { listen: 0, gift: 0, wait: 0, resonate: 0, guard: 0, call: 0 }
			}
			this.elfMessages = []
			if (this.creature && this.creature.badges) {
				this.creature.badges.forEach(b => { b.unlocked = false })
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
			this.showCelebration({
				symbol: this.creature.name[0],
				title: '图鉴收录',
				subtitle: this.creature.name + ' · 高危观测开始'
			})
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
		getJormungandrDescription() {
			if (!this.creature || !this.creature.collected) {
				return '你尚未真正见过世界之蛇。只有在海潮异常回落、远方海面形成闭合的环时，才可能发现它的踪迹。'
			}
			if (this.jormungandrState.frozen) {
				return '你的记录越来越密。潮汐、梦魇、鱼群的死亡、夜里传来的低鸣……每一项都被你写进档案。某天清晨，你没有再回到家人与同伴身边。人们只在海岸边找到被盐水浸透的笔记。'
			}
			const obs = Number(this.jormungandrState.observation || 0)
			if (obs >= 40) {
				return '你没有获得耶梦加得的信任，也不可能获得。你只是短暂见证了盘绕米德加德边界的灾厄。'
			}
			if (obs >= 30) {
				return '你几乎看见了它的全貌。但世界之蛇不该被完整看见。继续靠近，可能让你迷失。'
			}
			if (obs >= 20) {
				return '它的存在正在逼近你的心智边界。你得到的不是亲近，而是越来越清晰的危险。'
			}
			if (obs >= 10) {
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
			if (touchCount >= Math.max(distantViewCount, tideListenCount, recordCount, worshipCount, retreatCount)) {
				badgeType = 'risk'
			} else if (distantViewCount + tideListenCount + recordCount >= worshipCount + retreatCount) {
				badgeType = 'cautious'
			} else if (worshipCount + retreatCount > distantViewCount + tideListenCount + recordCount) {
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
			this.showCelebration({
				symbol: '✦',
				title: '徽章解锁',
				subtitle: target.name
			})
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
		loadJormungandrState() {
		const saved = uni.getStorageSync('jormungandr_high_risk_state')
		if (saved) {
			this.jormungandrState = {
				observation: 0,
				sanityLoad: 0,
				hostility: 0,
				contactStatus: '高危观测中',
				recentActions: [],
				frozen: false,
				unlockedEvents: [],
				...saved
			}
			// 恢复事件日志（保留最近 3 条）
			if (Array.isArray(saved.messages)) {
				this.jormungandrMessages = saved.messages.slice(-3)
			}
		}
	},
	saveJormungandrState() {
		// 消息日志一并持久化，重进页面不丢叙事
		uni.setStorageSync('jormungandr_high_risk_state', {
			...this.jormungandrState,
			messages: this.jormungandrMessages
		})
	},
		handleJormungandrAction(action) {
		if (this.jormungandrState.frozen) {
			this.addJormungandrMessage('该档案已进入失踪状态。后续互动已冻结。')
			return
		}

		// 门禁：观测深度不足时给叙事提示（而非隐藏按钮）
		if (action.unlock && Number(this.jormungandrState.observation || 0) < action.unlock) {
			this.addJormungandrMessage('观测深度不足，你还不认识眼前的海。')
			return
		}

		if (action.key === 'touch') {
				uni.showModal({
					title: '确认',
					content: '你确定要靠近海面吗？有些边界一旦越过，就不再由你决定返回。',
					confirmText: '靠近',
					cancelText: '后退',
					success: (res) => {
						if (res.confirm) {
							this.executeJormungandrAction('touch')
						} else {
							this.addJormungandrMessage('你选择了后退。')
							this.saveJormungandrState()
						}
					}
				})
				return
			}

			this.executeJormungandrAction(action.key)
		},
		executeJormungandrAction(actionKey) {
		const state = this.jormungandrState
		const prevSanity = Number(state.sanityLoad || 0)

		state.recentActions.push(actionKey)
		if (state.recentActions.length > 6) {
			state.recentActions.shift()
		}

		const pool = JORM_MSG_POOL[actionKey] || []
		const message = pool[Math.floor(Math.random() * pool.length)] || '……'

		switch (actionKey) {
			case 'distantView':
				state.observation += 1
				break
			case 'tideListen':
				state.observation += 1
				state.sanityLoad += 1
				break
			case 'observe':
				state.observation += 2
				state.sanityLoad += 2
				break
			case 'worship':
				state.observation += 1
				state.sanityLoad += 2
				state.hostility += 3
				break
			case 'retreat':
				state.sanityLoad = Math.max(0, state.sanityLoad - 2)
				state.hostility = Math.max(0, state.hostility - 1)
				break
			case 'touch':
				state.observation += 3
				state.sanityLoad += 4
				state.hostility += 2
				break
		}
		this.addJormungandrMessage(message, JORM_RISK[actionKey] === 'extreme' || JORM_RISK[actionKey] === 'high')

		// 概念 C：差异化反馈——高危按钮震动 + 舞台涟漪（高危红 / 安全蓝绿）
		const risk = JORM_RISK[actionKey]
		if (risk === 'high' || risk === 'extreme') {
			this.shakeKey = actionKey
			setTimeout(() => { this.shakeKey = '' }, 500)
		}
		this.spawnStageRipple(risk === 'safe' ? 'calm' : 'deep')

		this.playAbyssAnimation = true
		this.abyssAnimKey = actionKey
		setTimeout(() => {
			this.playAbyssAnimation = false
			this.abyssAnimKey = ''
		}, 500)

		// 概念 D：心智阈值跨越提示
		const nextSanity = Number(state.sanityLoad || 0)
		;[4, 7, 10].forEach(th => {
			if (prevSanity < th && nextSanity >= th) {
				this.addJormungandrMessage(JORM_THRESHOLD_HINTS[th], false, true)
			}
		})

		this.checkJormungandrEvents()
		this.saveJormungandrState()
	},
		checkJormungandrEvents() {
			const state = this.jormungandrState
			if (state.frozen) return

			const recent5Actions = state.recentActions.slice(-5)
			const recent6Actions = state.recentActions.slice(-6)
			const worshipCount = recent5Actions.filter(a => a === 'worship').length
			const observeCount = recent6Actions.filter(a => a === 'observe').length

			if (!state.unlockedEvents.includes('tide-record') && observeCount >= 4 && state.sanityLoad >= 9) {
			state.unlockedEvents.push('tide-record')
			state.contactStatus = '失踪'
			state.frozen = true
			this.addJormungandrMessage('你的记录越来越密。潮汐、梦境、鱼群死亡的方向、夜里传来的低鸣……每一项都被你写进档案。起初，你还能分辨哪些是观察，哪些是幻觉。后来，纸上的线条开始像鳞片，海图上的弧线开始像一段身体。某天清晨，你没有再回到家人与同伴身边。人们只在海岸边找到被盐水浸透的笔记。')
			// 概念 F：失踪结局全屏揭晓
			this.showJormEventOverlay('tide-record')
			return
		}

		if (!state.unlockedEvents.includes('whisperer') && (worshipCount >= 3 || state.hostility >= 8)) {
			state.unlockedEvents.push('whisperer')
			state.hostility += 2
			state.contactStatus = '被居民敌视'
			this.addJormungandrMessage('你开始频繁地向海献上牲畜、盐与黑色绳结。起初只是几只羊，后来连村里的人也注意到了异常。他们看见你在潮水边跪下，口中喃喃念着听不懂的词。有人说你在祈求保护，也有人说你在喂养某个不该被喂养的东西。从那天起，居民不再愿意靠近你。')
			// 概念 F：低语者事件全屏揭晓
			this.showJormEventOverlay('whisperer')
		}

		if (state.sanityLoad >= 7 && state.sanityLoad < 10 && !state.unlockedEvents.includes('warning')) {
			state.unlockedEvents.push('warning')
			this.addJormungandrMessage('你应该离开。')
			// 概念 E：全屏低语警告
			this.showJormWhisper()
		}
	},
	// ===== 概念 E：全屏低语 =====
	showJormWhisper() {
		this.whisperVisible = true
		if (this.whisperTimer) clearTimeout(this.whisperTimer)
		this.whisperTimer = setTimeout(() => { this.whisperVisible = false }, 3200)
	},
	// ===== 概念 F：事件揭晓层 =====
	showJormEventOverlay(eventId) {
		const info = this.getJormungandrEventInfo(eventId)
		if (!info) return
		this.jormEventOverlay = {
			name: info.name,
			description: info.description,
			tone: eventId === 'tide-record' ? 'missing' : 'hostile'
		}
	},
	spawnStageRipple(tone) {
		const id = Date.now() + Math.random()
		this.stageRipples.push({ id, tone })
		if (this.stageRipples.length > 3) this.stageRipples.shift()
		setTimeout(() => {
			this.stageRipples = this.stageRipples.filter(r => r.id !== id)
		}, 1400)
	},
		addJormungandrMessage(message, danger, threshold) {
		// 最新在前（配合打字机：只对第一条逐字呈现）
		this.jormungandrMessages.unshift({
			id: Date.now() + Math.random(),
			text: message,
			time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
			danger: !!danger || message === '你应该离开。',
			threshold: !!threshold
		})
		if (this.jormungandrMessages.length > 6) {
			this.jormungandrMessages.pop()
		}
		// 概念 D：打字机
		if (this.typeTimer) clearInterval(this.typeTimer)
		this.typing = true
		this.typingText = ''
		let i = 0
		this.typeTimer = setInterval(() => {
			this.typingText = message.slice(0, ++i)
			if (i >= message.length) {
				clearInterval(this.typeTimer)
				this.typing = false
			}
		}, 24)
	},
		getJormungandrEventInfo(eventId) {
			const events = {
				'whisperer': {
					name: '海边的低语者',
					description: '你开始频繁地向海献上牲畜、盐与黑色绳结。起初只是几只羊，后来连村里的人也注意到了异常。他们看见你在潮水边跪下，口中喃喃念着听不懂的词。有人说你在祈求保护，也有人说你在喂养某个不该被喂养的东西。从那天起，居民不再愿意靠近你。'
				},
				'tide-record': {
					name: '最后一页潮汐记录',
					description: '你的记录越来越密。潮汐、梦境、鱼群死亡的方向、夜里传来的低鸣……每一项都被你写进档案。起初，你还能分辨哪些是观察，哪些是幻觉。后来，纸上的线条开始像鳞片，海图上的弧线开始像一段身体。某天清晨，你没有再回到家人与同伴身边。人们只在海岸边找到被盐水浸透的笔记。'
				},
				'warning': {
					name: '危险警告',
					description: '你的心智负荷已达到危险水平。你应该离开。'
				}
			}
			return events[eventId] || null
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
	box-sizing: border-box;
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
	padding: 16rpx 24rpx;
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

/* ===== 精灵"微光结契"互动区（金/绿基调，与高危红系区分） ===== */
.elf-section .interaction-button.spirit {
	position: relative;
}

.interaction-button.spirit.elf-tone-safe {
	border-color: rgba(124, 140, 116, 0.5);
}

.interaction-button.spirit.elf-tone-safe:active {
	border-color: #7C8C74;
	background: rgba(124, 140, 116, 0.12);
}

.interaction-button.spirit.elf-tone-gold {
	border-color: rgba(216, 194, 122, 0.5);
}

.interaction-button.spirit.elf-tone-gold:active {
	border-color: #D8C27A;
	background: rgba(216, 194, 122, 0.12);
}

.interaction-button.spirit.elf-tone-extreme {
	border-color: rgba(185, 74, 72, 0.55);
}

.interaction-button.spirit.elf-tone-extreme:active {
	border-color: #B94A48;
	background: rgba(185, 74, 72, 0.12);
}

.elf-action-hint {
	display: block;
	margin-top: 6rpx;
	font-size: 18rpx;
	color: #7C8C74;
	line-height: 1.4;
}

.elf-meter-row {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
	margin-bottom: 24rpx;
}

.elf-meter {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.elf-meter-label {
	width: 132rpx;
	flex-shrink: 0;
	font-size: 24rpx;
	color: #A8B3BD;
	letter-spacing: 2rpx;
}

.elf-meter-track {
	flex: 1;
	height: 10rpx;
	border-radius: 6rpx;
	background: #0B1118;
	border: 1rpx solid #27384A;
	overflow: hidden;
}

.elf-meter-track.warn {
	border-color: rgba(185, 74, 72, 0.4);
}

.elf-meter-fill {
	height: 100%;
	border-radius: 6rpx;
	transition: width 0.35s ease;
}

.elf-meter-fill.trust {
	background: linear-gradient(90deg, #8A6F45, #D8C27A);
}

.elf-meter-fill.quiet {
	background: linear-gradient(90deg, #4A5C4A, #7C8C74);
}

.elf-meter-value {
	width: 110rpx;
	flex-shrink: 0;
	font-size: 22rpx;
	color: #66727F;
	text-align: right;
}

.elf-receding-card {
	background: rgba(23, 34, 48, 0.9);
	border: 1rpx solid rgba(143, 182, 217, 0.35);
	border-radius: 16rpx;
	padding: 24rpx 28rpx;
	margin-bottom: 20rpx;
}

.elf-receding-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #8FB6D9;
	letter-spacing: 4rpx;
	margin-bottom: 10rpx;
}

.elf-receding-desc {
	display: block;
	font-size: 24rpx;
	color: #A8B3BD;
	line-height: 1.7;
}

.elf-final-card {
	background: rgba(216, 194, 122, 0.08);
	border: 1rpx solid rgba(216, 194, 122, 0.4);
	border-radius: 16rpx;
	padding: 28rpx;
	margin-bottom: 20rpx;
	text-align: center;
}

.elf-final-title {
	display: block;
	font-size: 32rpx;
	font-weight: 700;
	color: #D8C27A;
	letter-spacing: 6rpx;
	margin-bottom: 12rpx;
}

.elf-final-desc {
	display: block;
	font-size: 24rpx;
	color: #C8D0D8;
	line-height: 1.7;
}

.elf-message-list {
	margin-top: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.elf-message {
	background: rgba(23, 34, 48, 0.75);
	border: 1rpx solid rgba(124, 140, 116, 0.28);
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
}

.elf-message-text {
	font-size: 24rpx;
	color: #C8D0D8;
	line-height: 1.6;
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

/* 居民敌视：暗金，与心智负荷的红色区分 */
.abyss-fill.hostility {
	background: linear-gradient(90deg, #8B7030, #C6A15B);
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
	transition: transform 0.15s ease, opacity 0.15s ease;
}

.collect-btn:active {
	opacity: 0.85;
	transform: scale(0.98);
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

.event-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.event-card {
	background: #172230;
	border: 1rpx solid rgba(185, 74, 72, 0.3);
	border-radius: 14rpx;
	padding: 20rpx;
}

.event-name {
	display: block;
	color: #C6A15B;
	font-size: 28rpx;
	font-weight: 700;
	margin-bottom: 8rpx;
}

.event-desc {
	display: block;
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.6;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.message-item {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
	padding: 12rpx 16rpx;
	background: rgba(39, 56, 74, 0.3);
	border-radius: 8rpx;
}

.message-item.danger {
	background: rgba(185, 74, 72, 0.15);
	border: 1rpx solid rgba(185, 74, 72, 0.3);
}

.message-time {
	color: #66727F;
	font-size: 20rpx;
}

.message-item.danger .message-time {
	color: #B94A48;
}

.message-text {
	color: #A8B3BD;
	font-size: 24rpx;
	line-height: 1.5;
}

.message-item.danger .message-text {
        color: #D47573;
}

/* ===== 解锁 / 收藏全屏庆祝层 ===== */
.celebration-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(11, 17, 24, 0.82);
	z-index: 1200;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: celebrationMaskIn 0.3s ease-out both;
}

.celebration-body {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 80rpx;
}

.celebration-icon {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(198,161,91,0.3), rgba(198,161,91,0.05));
	border: 2rpx solid rgba(198,161,91,0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 36rpx;
	box-shadow: 0 0 70rpx rgba(198,161,91,0.35);
	animation: celebrationPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.celebration-icon text {
	font-size: 64rpx;
	color: #C6A15B;
	font-weight: 700;
}

.celebration-title {
	font-size: 40rpx;
	font-weight: 800;
	color: #F2F4F6;
	letter-spacing: 6rpx;
	margin-bottom: 14rpx;
	animation: celebrationRise 0.45s 0.12s ease-out both;
}

.celebration-subtitle {
	font-size: 24rpx;
	color: #A8B3BD;
	animation: celebrationRise 0.45s 0.2s ease-out both;
}

/* 粒子迸发：wrapper 旋转指向方向，dot 沿半径飞出 */
.celebration-spark {
	position: absolute;
	left: 50%;
	top: 50%;
	width: 0;
	height: 0;
}

.spark-dot {
	width: 10rpx;
	height: 10rpx;
	margin-left: -5rpx;
	border-radius: 50%;
	background: #C6A15B;
	box-shadow: 0 0 12rpx rgba(198,161,91,0.8);
	animation: sparkFly 0.75s ease-out both;
}

@keyframes celebrationMaskIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes celebrationPop {
	0% { transform: scale(0.2); opacity: 0; }
	60% { transform: scale(1.12); opacity: 1; }
	100% { transform: scale(1); opacity: 1; }
}

@keyframes celebrationRise {
	from { opacity: 0; transform: translateY(20rpx); }
	to { opacity: 1; transform: none; }
}

@keyframes sparkFly {
	from { transform: translateY(-50rpx) scale(1); opacity: 1; }
	to { transform: translateY(-180rpx) scale(0.3); opacity: 0; }
}

/* ===================== 概念 A：观测舞台（接入自 abyss-lab 原型） ===================== */
.obs-stage {
	position: relative;
	height: 480rpx;
	margin-bottom: 20rpx;
	border: 1rpx solid #27384A;
	border-radius: 20rpx;
	overflow: hidden;
	background: linear-gradient(180deg, #0D1622 0%, #10202E 55%, #0C1A26 100%);
}

.obs-stage.unstable {
	animation: stageUnstable 5s ease-in-out infinite;
}

.obs-stage.frozen {
	filter: grayscale(0.7) brightness(0.6);
}

@keyframes stageUnstable {
	0%, 100% { transform: translateX(0) skewX(0deg); }
	23% { transform: translateX(-3rpx) skewX(0.15deg); }
	47% { transform: translateX(2rpx) skewX(-0.1deg); }
	71% { transform: translateX(-2rpx) skewX(0.08deg); }
}

.stage-badge {
	position: absolute;
	top: 20rpx;
	left: 24rpx;
	z-index: 5;
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.rec-dot {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background: #B94A48;
	animation: recBlink 1.6s ease-in-out infinite;
}

@keyframes recBlink {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.2; }
}

.rec-text {
	font-size: 20rpx;
	color: #D47573;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
	letter-spacing: 2rpx;
}

.stage-cam {
	font-size: 18rpx;
	color: #66727F;
}

.stage-wave {
	position: absolute;
	bottom: -70rpx;
	width: 220%;
	height: 160rpx;
	border-radius: 42% 58% 0 0 / 90% 100% 0 0;
}

.stage-wave.sw1 {
	left: -60%;
	background: linear-gradient(180deg, rgba(111, 143, 166, 0.32), rgba(111, 143, 166, 0.04));
	animation: stageWaveSlide 13s linear infinite;
}

.stage-wave.sw2 {
	left: -30%;
	bottom: -50rpx;
	background: linear-gradient(180deg, rgba(90, 122, 154, 0.4), rgba(90, 122, 154, 0.05));
	animation: stageWaveSlide 9s linear infinite reverse;
}

.stage-wave.sw3 {
	left: -50%;
	bottom: -36rpx;
	background: linear-gradient(180deg, rgba(64, 92, 120, 0.55), rgba(11, 17, 24, 0.6));
	animation: stageWaveSlide 7s linear infinite;
}

@keyframes stageWaveSlide {
	from { transform: translateX(0); }
	to { transform: translateX(-48%); }
}

.stage-mist {
	position: absolute;
	width: 130%;
	height: 220rpx;
	border-radius: 50%;
	filter: blur(30rpx);
	background: radial-gradient(ellipse, rgba(143, 182, 217, 0.22), transparent 70%);
	transition: opacity 0.8s ease;
	pointer-events: none;
}

.stage-mist.sm1 {
	bottom: 60rpx;
	left: -30%;
	animation: stageMistDrift 11s ease-in-out infinite;
}

.stage-mist.sm2 {
	bottom: 130rpx;
	left: 0;
	animation: stageMistDrift 15s ease-in-out infinite reverse;
}

@keyframes stageMistDrift {
	0%, 100% { transform: translateX(0); }
	50% { transform: translateX(90rpx); }
}

.stage-arc {
	position: absolute;
	left: -40%;
	bottom: 40rpx;
	width: 180%;
	height: 320rpx;
	border: 3rpx solid rgba(143, 182, 217, 0.75);
	border-bottom: none;
	border-radius: 50% 50% 0 0 / 100% 100% 0 0;
	box-shadow: 0 -6rpx 40rpx rgba(143, 182, 217, 0.18);
	transition: opacity 0.9s ease, transform 0.9s ease;
	pointer-events: none;
}

.stage-eye {
	position: absolute;
	top: 38%;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #C6A15B;
	box-shadow: 0 0 30rpx 10rpx rgba(198, 161, 91, 0.5);
	animation: stageEyePulse 2.6s ease-in-out infinite;
	transition: left 1.2s ease;
}

@keyframes stageEyePulse {
	0%, 100% { opacity: 0.65; transform: scale(1); }
	50% { opacity: 1; transform: scale(1.25); }
}

.stage-ripple {
	position: absolute;
	left: 50%;
	bottom: 70rpx;
	width: 60rpx;
	height: 20rpx;
	border: 2rpx solid rgba(143, 182, 217, 0.7);
	border-radius: 50%;
	transform: translateX(-50%);
	animation: stageRippleSpread 1.4s ease-out forwards;
	pointer-events: none;
}

.stage-ripple.calm {
	border-color: rgba(124, 140, 116, 0.8);
}

.stage-ripple.deep {
	border-color: rgba(185, 74, 72, 0.75);
}

@keyframes stageRippleSpread {
	from { transform: translateX(-50%) scale(1); opacity: 0.9; }
	to { transform: translateX(-50%) scale(6); opacity: 0; }
}

.signal-lost {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 6;
	background: rgba(11, 17, 24, 0.45);
}

.lost-title {
	font-size: 44rpx;
	color: #66727F;
	letter-spacing: 10rpx;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.lost-sub {
	margin-top: 16rpx;
	font-size: 22rpx;
	color: #4A5A6A;
}

/* ===================== 概念 B：耶梦加得状态面板（原型 panel） ===================== */
.jorm-stage-section {
	margin-bottom: 8rpx;
}

.jorm-panel {
	margin-top: 20rpx;
	padding: 28rpx;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 20rpx;
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.contact-status {
	font-size: 26rpx;
	color: #C6A15B;
	font-weight: 600;
	letter-spacing: 2rpx;
}

.contact-status.hostile {
	color: #B94A48;
}

.contact-status.missing {
	color: #66727F;
}

.sanity-word {
	font-size: 22rpx;
	color: #66727F;
}

.sanity-word.lv2 {
	color: #C6A15B;
}

.sanity-word.lv3 {
	color: #D47573;
}

.sanity-word.lv4 {
	color: #B94A48;
	animation: sanityPulse 1.4s ease-in-out infinite;
}

.gauge-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

.gauge-row:last-of-type {
	margin-bottom: 0;
}

.gauge-label {
	width: 130rpx;
	font-size: 22rpx;
	color: #66727F;
	flex-shrink: 0;
}

.gauge-track {
	flex: 1;
	height: 10rpx;
	background: rgba(39, 56, 74, 0.8);
	border-radius: 5rpx;
	overflow: hidden;
}

.gauge-fill {
	height: 100%;
	border-radius: 5rpx;
	transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.gauge-fill.obs {
	background: linear-gradient(90deg, #6F8FA6, #8FB6D9);
}

.gauge-fill.san {
	background: linear-gradient(90deg, #66727F, #C6A15B);
}

.gauge-fill.san.lv2 {
	background: linear-gradient(90deg, #C6A15B, #D4884A);
}

.gauge-fill.san.lv3 {
	background: linear-gradient(90deg, #D4884A, #B94A48);
}

.gauge-fill.san.lv4 {
	background: linear-gradient(90deg, #B94A48, #7A2A2A);
	animation: sanityPulse 1.4s ease-in-out infinite;
}

.gauge-fill.hos {
	background: linear-gradient(90deg, #8B7030, #C6A15B);
}

.gauge-value {
	width: 130rpx;
	text-align: right;
	font-size: 22rpx;
	color: #A8B3BD;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
	flex-shrink: 0;
}

.jorm-desc {
	display: block;
	margin-top: 24rpx;
	font-size: 24rpx;
	color: #A8B3BD;
	line-height: 1.7;
}

@keyframes sanityPulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.45; }
}

/* ===================== 概念 C：耶梦加得互动矩阵（原型 action-grid） ===================== */
.jorm-actions-section {
	margin: 20rpx 0;
}

.action-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 18rpx;
}

.action-btn {
	position: relative;
	width: calc(33.333% - 12rpx);
	box-sizing: border-box;
	padding: 22rpx 0 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	background: #0F1822;
	border: 1rpx solid #27384A;
	border-radius: 16rpx;
	transition: transform 0.15s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.action-btn:active {
	transform: scale(0.95);
}

.action-btn.medium {
	border-color: rgba(198, 161, 91, 0.4);
}

.action-btn.high {
	border-color: rgba(185, 74, 72, 0.5);
}

.action-btn.extreme {
	border-color: rgba(185, 74, 72, 0.85);
	animation: extremeBreath 2s ease-in-out infinite;
}

.action-btn.safe {
	border-color: rgba(124, 140, 116, 0.55);
}

.action-btn.locked {
	opacity: 0.38;
}

.action-btn.shaking {
	animation: jormBtnShake 0.5s ease-out;
}

@keyframes extremeBreath {
	0%, 100% { box-shadow: 0 0 24rpx rgba(185, 74, 72, 0.18); }
	50% { box-shadow: 0 0 40rpx rgba(185, 74, 72, 0.4); }
}

@keyframes jormBtnShake {
	0%, 100% { transform: translateX(0); }
	20% { transform: translateX(-8rpx); }
	40% { transform: translateX(7rpx); }
	60% { transform: translateX(-5rpx); }
	80% { transform: translateX(3rpx); }
}

.action-name {
	font-size: 28rpx;
	color: #F2F4F6;
}

.action-risk {
	font-size: 18rpx;
	color: #B94A48;
	letter-spacing: 2rpx;
}

.action-risk.safe {
	color: #7C8C74;
}

.action-lock {
	font-size: 18rpx;
	color: #66727F;
}

/* ===================== 概念 D：耶梦加得观测日志（原型 log-panel） ===================== */
.jorm-log-panel {
	margin-top: 20rpx;
	padding: 28rpx;
	background: #0D1520;
	border: 1rpx solid #27384A;
	border-radius: 20rpx;
}

.log-list {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.log-item {
	display: flex;
	gap: 16rpx;
	padding-left: 18rpx;
	border-left: 2rpx solid #27384A;
	animation: logIn 0.35s ease-out both;
}

@keyframes logIn {
	from { opacity: 0; transform: translateY(12rpx); }
	to { opacity: 1; transform: none; }
}

.log-time {
	font-size: 20rpx;
	color: #4A5A6A;
	flex-shrink: 0;
	padding-top: 4rpx;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.log-text {
	flex: 1;
	font-size: 24rpx;
	color: #A8B3BD;
	line-height: 1.6;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.log-item.danger .log-text {
	color: #D47573;
}

.log-item.danger {
	border-left-color: rgba(185, 74, 72, 0.6);
}

.log-item.threshold .log-text {
	color: #C6A15B;
	font-style: italic;
}

.type-cursor {
	color: #8FB6D9;
	animation: recBlink 0.9s steps(1) infinite;
}

/* ===================== 概念 E / F：全屏低语与事件揭晓 ===================== */
.whisper-layer {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1300;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(7, 10, 15, 0.88);
}

.whisper-text {
	font-size: 52rpx;
	color: #B94A48;
	letter-spacing: 16rpx;
	font-weight: 300;
	animation: whisperDrift 3.2s ease-in-out both;
}

@keyframes whisperDrift {
	0% { opacity: 0; letter-spacing: 40rpx; }
	25% { opacity: 1; letter-spacing: 16rpx; }
	80% { opacity: 1; }
	100% { opacity: 0; }
}

.jorm-event-layer {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1400;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(7, 10, 15, 0.9);
}

.jorm-event-body {
	width: 78%;
	padding: 56rpx 48rpx;
	background: #101A26;
	border: 1rpx solid #27384A;
	border-radius: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	animation: jormEventRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes jormEventRise {
	from { opacity: 0; transform: translateY(40rpx) scale(0.96); }
	to { opacity: 1; transform: none; }
}

.jorm-event-kicker {
	font-size: 18rpx;
	color: #66727F;
	letter-spacing: 6rpx;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
	margin-bottom: 20rpx;
}

.jorm-event-title {
	font-size: 44rpx;
	font-weight: 800;
	color: #C6A15B;
	letter-spacing: 6rpx;
	margin-bottom: 28rpx;
}

.jorm-event-body.hostile .jorm-event-title {
	color: #D47573;
}

.jorm-event-body.missing .jorm-event-title {
	color: #66727F;
}

.jorm-event-desc {
	font-size: 26rpx;
	color: #A8B3BD;
	line-height: 1.8;
	text-align: justify;
	margin-bottom: 40rpx;
}

.jorm-event-close {
	padding: 18rpx 64rpx;
	border: 1rpx solid #C6A15B;
	border-radius: 999rpx;
	color: #C6A15B;
	font-size: 26rpx;
	letter-spacing: 4rpx;
}

.jorm-event-close:active {
	transform: scale(0.96);
	opacity: 0.8;
}
</style>