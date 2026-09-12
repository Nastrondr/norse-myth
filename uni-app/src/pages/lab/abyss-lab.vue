<template>
	<view class="lab-page page-enter-deep">
		<NavBar title="高危观测 · 原型" />

		<!-- ============ 概念 A：观测舞台（状态可视化到场景） ============ -->
		<view class="stage" :class="{ unstable: sanity >= 7 && phase !== 'missing', frozen: phase === 'missing' }">
			<!-- 终端角标 -->
			<view class="stage-badge">
				<view class="rec-dot"></view>
				<text class="rec-text">REC</text>
				<text class="stage-cam">观测画面 · 米德加德外海</text>
			</view>
			<text class="stage-time">{{ clockText }}</text>

			<!-- 海面层 -->
			<view class="wave w1"></view>
			<view class="wave w2"></view>
			<view class="wave w3"></view>

			<!-- 雾气：密度随心智负荷增加 -->
			<view class="mist m1" :style="{ opacity: mistOpacity }"></view>
			<view class="mist m2" :style="{ opacity: mistOpacity * 0.8 }"></view>

			<!-- 蛇影弧线：随观测深度浮现、逼近 -->
			<view class="serpent-arc" :style="arcStyle"></view>

			<!-- 巨影之眼：观测深度 ≥ 25 -->
			<view v-if="eyeVisible" class="serpent-eye" :style="eyeStyle"></view>

			<!-- 互动涟漪反馈 -->
			<view v-for="r in ripples" :key="r.id" class="ripple" :class="r.tone"></view>

			<!-- 失踪结局：信号丢失 -->
			<view v-if="phase === 'missing'" class="signal-lost">
				<text class="lost-title">信号丢失</text>
				<text class="lost-sub">— 记录停留在它消失的那一刻 —</text>
			</view>
		</view>

		<!-- ============ 概念 B：状态面板（三仪表 + 等级语言） ============ -->
		<view class="panel">
			<view class="lab-tag">概念 B · 状态仪表</view>
			<view class="panel-header">
				<text class="contact-status" :class="{ hostile: hostility >= 6, missing: phase === 'missing' }">{{ contactStatus }}</text>
				<text class="sanity-word" :class="sanityLevel.key">{{ sanityLevel.text }}</text>
			</view>

			<view class="gauge-row">
				<text class="gauge-label">观测深度</text>
				<view class="gauge-track">
					<view class="gauge-fill obs" :style="{ width: Math.min(100, observation * 2.5) + '%' }"></view>
				</view>
				<text class="gauge-value">{{ Math.min(100, Math.round(observation * 2.5)) }}%</text>
			</view>

			<view class="gauge-row">
				<text class="gauge-label">心智负荷</text>
				<view class="gauge-track">
					<view
						class="gauge-fill san"
						:class="sanityLevel.key"
						:style="{ width: Math.min(100, sanity * 10) + '%' }"
					></view>
				</view>
				<text class="gauge-value">{{ sanity }}</text>
			</view>

			<view class="gauge-row">
				<text class="gauge-label">居民态度</text>
				<view class="gauge-track">
					<view class="gauge-fill hos" :style="{ width: Math.min(100, hostility * 10) + '%' }"></view>
				</view>
				<text class="gauge-value">{{ hostilityText }}</text>
			</view>
		</view>

		<!-- ============ 概念 C：互动矩阵（风险语言 + 解锁门禁） ============ -->
		<view class="panel actions-panel" v-if="phase !== 'missing'">
			<view class="lab-tag">概念 C · 风险分级互动</view>
			<view class="action-grid">
				<view
					v-for="action in availableActions"
					:key="action.key"
					class="action-btn"
					:class="[action.risk, { locked: action.unlock > observation, shaking: shakeKey === action.key }]"
					@click="doAction(action)"
				>
					<text class="action-name">{{ action.label }}</text>
					<text class="action-risk" v-if="action.risk === 'extreme'">极高</text>
					<text class="action-risk" v-else-if="action.risk === 'high'">高</text>
					<text class="action-risk" v-else-if="action.risk === 'medium'">中</text>
					<text class="action-risk safe" v-else-if="action.risk === 'safe'">安全</text>
					<text class="action-lock" v-if="action.unlock > observation">观测 {{ action.unlock }} 解锁</text>
				</view>
			</view>
		</view>

		<!-- ============ 概念 D：终端日志（打字机 + 阈值跨越提示） ============ -->
		<view class="panel log-panel">
			<view class="lab-tag">概念 D · 观测日志</view>
			<view class="log-list">
				<view v-for="(log, index) in logs" :key="log.id" class="log-item" :class="{ danger: log.danger, threshold: log.threshold }">
					<text class="log-time">{{ log.time }}</text>
					<text class="log-text">{{ index === 0 ? typingText : log.text }}<text v-if="index === 0 && typing" class="cursor">▌</text></text>
				</view>
			</view>
		</view>

		<!-- ============ 概念 E：「你应该离开」全屏低语 ============ -->
		<view v-if="whisperVisible" class="whisper-layer" @click="whisperVisible = false">
			<text class="whisper-text">你应该离开。</text>
		</view>

		<!-- ============ 概念 F：事件揭晓层 ============ -->
		<view v-if="eventOverlay" class="event-layer" @click="eventOverlay = null">
			<view class="event-body" :class="eventOverlay.tone" @click.stop>
				<text class="event-kicker">{{ eventOverlay.tone === 'missing' ? 'ARCHIVE CLOSED' : 'EVENT UNLOCKED' }}</text>
				<text class="event-title">{{ eventOverlay.name }}</text>
				<text class="event-desc">{{ eventOverlay.description }}</text>
				<view class="event-close" @click="eventOverlay = null">
					<text>记录在案</text>
				</view>
			</view>
		</view>

		<!-- ============ 演示控制台（Mock 专用，接入真实数据流后移除） ============ -->
		<view class="mock-console" :class="{ collapsed: !consoleOpen }">
			<view class="console-header" @click="consoleOpen = !consoleOpen">
				<text class="console-title">演示控制台 · MOCK</text>
				<text class="console-arrow">{{ consoleOpen ? '收起' : '展开' }}</text>
			</view>
			<view v-if="consoleOpen" class="console-body">
				<view class="slider-row">
					<text class="slider-label">观测 {{ observation }}</text>
					<slider :value="observation" :max="40" activeColor="#8FB6D9" backgroundColor="#27384A" block-color="#8FB6D9" @change="e => observation = e.detail.value" />
				</view>
				<view class="slider-row">
					<text class="slider-label">心智 {{ sanity }}</text>
					<slider :value="sanity" :max="12" activeColor="#B94A48" backgroundColor="#27384A" block-color="#B94A48" @change="e => setSanity(e.detail.value)" />
				</view>
				<view class="slider-row">
					<text class="slider-label">敌视 {{ hostility }}</text>
					<slider :value="hostility" :max="12" activeColor="#C6A15B" backgroundColor="#27384A" block-color="#C6A15B" @change="e => hostility = e.detail.value" />
				</view>
				<view class="console-btns">
					<view class="mock-btn" @click="showWhisper"><text>触发低语警告</text></view>
					<view class="mock-btn" @click="showEvent('whisperer')"><text>低语者事件</text></view>
					<view class="mock-btn" @click="showEvent('tide-record')"><text>失踪结局</text></view>
					<view class="mock-btn reset" @click="resetAll"><text>重置</text></view>
				</view>
			</view>
		</view>

		<view class="bottom-space"></view>
	</view>
</template>

<script>
import NavBar from '@/components/NavBar.vue'

// Mock 行为表：数值沿用现有系统，消息改为随机池（概念 G）
const ACTIONS = [
	{
		key: 'distantView', label: '远观', risk: 'low', unlock: 0,
		obs: 1, san: 0, hos: 0,
		msgs: ['你站在安全距离外观察。', '海平线上什么都没有。或者，什么都有。', '浪从很远的地方来，比想象中慢。']
	},
	{
		key: 'tideListen', label: '听潮', risk: 'medium', unlock: 0,
		obs: 1, san: 1, hos: 0,
		msgs: ['潮声中似乎夹杂着某种节律。', '你数不清潮水的次数，数字总是对不上。', '潮声停了一瞬。你没有告诉任何人。']
	},
	{
		key: 'observe', label: '观察', risk: 'high', unlock: 5,
		obs: 2, san: 2, hos: 0,
		msgs: ['你的笔记越来越密。', '你开始给每一道浪编号。', '纸上的线条开始像鳞片。']
	},
	{
		key: 'retreat', label: '退后', risk: 'safe', unlock: 5,
		obs: 0, san: -2, hos: -1,
		msgs: ['你选择后退，危险有所降低。', '你离开海岸。海面在你身后合拢。']
	},
	{
		key: 'worship', label: '祭拜', risk: 'high', unlock: 10,
		obs: 1, san: 2, hos: 3,
		msgs: ['远处，有人在看你。', '你献上的东西被潮水带走了。', '村里的人记住了你的脸。']
	},
	{
		key: 'touch', label: '触碰', risk: 'extreme', unlock: 20,
		obs: 3, san: 4, hos: 2,
		msgs: ['你越过了安全距离。海面忽然安静得可怕。', '指尖触到的一瞬，潮声全部消失了。']
	}
]

const THRESHOLD_HINTS = {
	4: '你开始分不清观察和幻觉的边界。',
	7: '纸上的字迹在夜里似乎自己移动了。',
	10: '你已经很久没有睡过一个完整的夜晚。'
}

export default {
	components: { NavBar },
	data() {
		return {
			observation: 0,
			sanity: 0,
			hostility: 0,
			phase: 'calm', // calm | missing
			logs: [],
			typing: false,
			typingText: '',
			typeTimer: null,
			ripples: [],
			shakeKey: '',
			whisperVisible: false,
			eventOverlay: null,
			consoleOpen: true,
			clockText: ''
		}
	},
	computed: {
		availableActions() {
			return ACTIONS
		},
		// 概念 A：蛇影弧线随观测深度浮现、抬升
		arcStyle() {
			const t = Math.min(1, this.observation / 12)
			return {
				opacity: (0.15 + t * 0.85).toFixed(2),
				transform: `translateY(${(60 - this.observation * 2)}rpx) scaleX(${(1 + this.observation * 0.006).toFixed(3)})`
			}
		},
		eyeVisible() {
			return this.observation >= 25 && this.phase !== 'missing'
		},
		eyeStyle() {
			return { left: `${34 + Math.min(20, this.observation * 0.3)}%` }
		},
		mistOpacity() {
			return (0.25 + Math.min(1, this.sanity * 0.09)).toFixed(2)
		},
		sanityLevel() {
			if (this.sanity >= 10) return { key: 'lv4', text: '精神濒临崩溃' }
			if (this.sanity >= 7) return { key: 'lv3', text: '执迷' }
			if (this.sanity >= 4) return { key: 'lv2', text: '不安' }
			return { key: 'lv1', text: '清醒' }
		},
		hostilityText() {
			if (this.hostility >= 9) return '被驱逐边缘'
			if (this.hostility >= 6) return '居民敌视'
			if (this.hostility >= 3) return '有人议论'
			return '无人注意'
		},
		contactStatus() {
			if (this.phase === 'missing') return '失踪'
			if (this.hostility >= 8) return '被居民敌视'
			return '高危观测中'
		}
	},
	mounted() {
		this.pushLog('观测频道已建立。信号微弱，但足够。', false)
		this.clockTimer = setInterval(() => {
			this.clockText = new Date().toLocaleTimeString('zh-CN', { hour12: false })
		}, 1000)
	},
	beforeUnmount() {
		if (this.clockTimer) clearInterval(this.clockTimer)
		if (this.typeTimer) clearInterval(this.typeTimer)
	},
	methods: {
		// ---- 概念 C/D：行为执行（数值 + 随机消息 + 差异化反馈） ----
		doAction(action) {
			if (action.unlock > this.observation) {
				this.pushLog(`观测深度不足，你还不认识眼前的海。`, false)
				return
			}
			if (action.key === 'touch') {
				// 概念：暗色确认弹窗（原型用自制层替代系统弹窗）
				this.pushLog('你靠近了海面。有些边界一旦越过，就不再由你决定返回。', true)
			}
			const prevSanity = this.sanity
			this.observation = Math.min(40, this.observation + action.obs)
			this.setSanity(this.sanity + action.san)
			this.hostility = Math.max(0, Math.min(12, this.hostility + action.hos))

			const msg = action.msgs[Math.floor(Math.random() * action.msgs.length)]
			this.pushLog(msg, action.risk === 'extreme' || action.risk === 'high')

			// 差异化反馈：高危 → 舞台震动；安全 → 涟漪泛蓝
			if (action.risk === 'high' || action.risk === 'extreme') {
				this.shakeKey = action.key
				setTimeout(() => { this.shakeKey = '' }, 500)
			}
			this.spawnRipple(action.risk)

			// 概念 D：心智阈值跨越提示
			;[4, 7, 10].forEach(th => {
				if (prevSanity < th && this.sanity >= th) {
					this.pushLog(THRESHOLD_HINTS[th], false, true)
				}
			})

			// 概念 E：心智负荷首次 ≥ 7 触发全屏低语
			if (prevSanity < 7 && this.sanity >= 7) {
				this.showWhisper()
			}
		},
		setSanity(v) {
			this.sanity = Math.max(0, Math.min(12, v))
		},
		spawnRipple(tone) {
			const id = Date.now() + Math.random()
			this.ripples.push({ id, tone: tone === 'safe' ? 'calm' : 'deep' })
			if (this.ripples.length > 3) this.ripples.shift()
			setTimeout(() => {
				this.ripples = this.ripples.filter(r => r.id !== id)
			}, 1400)
		},
		// ---- 概念 E：全屏低语 ----
		showWhisper() {
			this.whisperVisible = true
			if (this.whisperTimer) clearTimeout(this.whisperTimer)
			this.whisperTimer = setTimeout(() => { this.whisperVisible = false }, 3200)
		},
		// ---- 概念 F：事件揭晓 ----
		showEvent(id) {
			const events = {
				'whisperer': {
					tone: 'hostile',
					name: '海边的低语者',
					description: '你开始频繁地向海献上牲畜、盐与黑色绳结。村里的人看见了你在潮水边跪下。从那天起，居民不再愿意靠近你。'
				},
				'tide-record': {
					tone: 'missing',
					name: '最后一页潮汐记录',
					description: '某天清晨，你没有再回到家人与同伴身边。人们只在海岸边找到被盐水浸透的笔记。'
				}
			}
			this.eventOverlay = events[id]
			if (id === 'tide-record') {
				this.phase = 'missing'
				this.pushLog('记录终止。潮水带走了最后一位观测者。', true)
			} else if (id === 'whisperer') {
				this.hostility = Math.max(this.hostility, 9)
			}
		},
		// ---- 概念 D：打字机日志 ----
		pushLog(text, danger, threshold) {
			const entry = {
				id: Date.now() + Math.random(),
				time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
				text,
				danger: !!danger,
				threshold: !!threshold
			}
			this.logs.unshift(entry)
			if (this.logs.length > 6) this.logs.pop()
			// 最新一条打字机呈现
			if (this.typeTimer) clearInterval(this.typeTimer)
			this.typing = true
			this.typingText = ''
			let i = 0
			this.typeTimer = setInterval(() => {
				this.typingText = entry.text.slice(0, ++i)
				if (i >= entry.text.length) {
					clearInterval(this.typeTimer)
					this.typing = false
				}
			}, 24)
		},
		resetAll() {
			if (this.typeTimer) clearInterval(this.typeTimer)
			this.observation = 0
			this.sanity = 0
			this.hostility = 0
			this.phase = 'calm'
			this.logs = []
			this.typing = false
			this.typingText = ''
			this.eventOverlay = null
			this.whisperVisible = false
			this.pushLog('新的观测者接替了档案。愿他读得懂潮水。', false)
		}
	}
}
</script>

<style scoped>
.lab-page {
	min-height: 100vh;
	background: #0B1118;
	box-sizing: border-box;
	padding-bottom: 40rpx;
}

/* ============ 概念标签（讨论用，接入时移除） ============ */
.lab-tag {
	display: inline-block;
	font-size: 18rpx;
	color: #66727F;
	border: 1rpx dashed #27384A;
	border-radius: 6rpx;
	padding: 2rpx 12rpx;
	margin-bottom: 16rpx;
}

/* ============ 概念 A：观测舞台 ============ */
.stage {
	position: relative;
	height: 560rpx;
	margin: 20rpx 24rpx;
	border: 1rpx solid #27384A;
	border-radius: 20rpx;
	overflow: hidden;
	background: linear-gradient(180deg, #0D1622 0%, #10202E 55%, #0C1A26 100%);
}

.stage.unstable {
	animation: stageUnstable 5s ease-in-out infinite;
}

.stage.frozen {
	filter: grayscale(0.7) brightness(0.6);
}

@keyframes stageUnstable {
	0%, 100% { transform: translateX(0) skewX(0deg); }
	23% { transform: translateX(-3rpx) skewX(0.15deg); }
	47% { transform: translateX(2rpx) skewX(-0.1deg); }
	71% { transform: translateX(-2rpx) skewX(0.08deg); }
}

/* 终端角标 */
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

.stage-time {
	position: absolute;
	top: 20rpx;
	right: 24rpx;
	z-index: 5;
	font-size: 20rpx;
	color: #66727F;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
}

/* 海面：三层波浪滚动 */
.wave {
	position: absolute;
	bottom: -70rpx;
	width: 220%;
	height: 160rpx;
	border-radius: 42% 58% 0 0 / 90% 100% 0 0;
}

.wave.w1 {
	left: -60%;
	background: linear-gradient(180deg, rgba(111, 143, 166, 0.32), rgba(111, 143, 166, 0.04));
	animation: waveSlide 13s linear infinite;
}

.wave.w2 {
	left: -30%;
	bottom: -50rpx;
	background: linear-gradient(180deg, rgba(90, 122, 154, 0.4), rgba(90, 122, 154, 0.05));
	animation: waveSlide 9s linear infinite reverse;
}

.wave.w3 {
	left: -50%;
	bottom: -36rpx;
	background: linear-gradient(180deg, rgba(64, 92, 120, 0.55), rgba(11, 17, 24, 0.6));
	animation: waveSlide 7s linear infinite;
}

@keyframes waveSlide {
	from { transform: translateX(0); }
	to { transform: translateX(-48%); }
}

/* 雾气：密度随心智负荷 */
.mist {
	position: absolute;
	width: 130%;
	height: 220rpx;
	border-radius: 50%;
	filter: blur(30rpx);
	background: radial-gradient(ellipse, rgba(143, 182, 217, 0.22), transparent 70%);
	transition: opacity 0.8s ease;
}

.mist.m1 {
	bottom: 60rpx;
	left: -30%;
	animation: mistDrift 11s ease-in-out infinite;
}

.mist.m2 {
	bottom: 130rpx;
	left: 0;
	animation: mistDrift 15s ease-in-out infinite reverse;
}

@keyframes mistDrift {
	0%, 100% { transform: translateX(0); }
	50% { transform: translateX(90rpx); }
}

/* 蛇影弧线 */
.serpent-arc {
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

/* 巨影之眼 */
.serpent-eye {
	position: absolute;
	top: 38%;
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #C6A15B;
	box-shadow: 0 0 30rpx 10rpx rgba(198, 161, 91, 0.5);
	animation: eyePulse 2.6s ease-in-out infinite;
	transition: left 1.2s ease;
}

@keyframes eyePulse {
	0%, 100% { opacity: 0.65; transform: scale(1); }
	50% { opacity: 1; transform: scale(1.25); }
}

/* 互动涟漪 */
.ripple {
	position: absolute;
	left: 50%;
	bottom: 70rpx;
	width: 60rpx;
	height: 20rpx;
	border: 2rpx solid rgba(143, 182, 217, 0.7);
	border-radius: 50%;
	transform: translateX(-50%);
	animation: rippleSpread 1.4s ease-out forwards;
	pointer-events: none;
}

.ripple.calm {
	border-color: rgba(124, 140, 116, 0.8);
}

.ripple.deep {
	border-color: rgba(185, 74, 72, 0.75);
}

@keyframes rippleSpread {
	from { transform: translateX(-50%) scale(1); opacity: 0.9; }
	to { transform: translateX(-50%) scale(6); opacity: 0; }
}

/* 失踪：信号丢失 */
.signal-lost {
	position: absolute;
	inset: 0;
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

/* ============ 概念 B：状态面板 ============ */
.panel {
	margin: 20rpx 24rpx;
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

@keyframes sanityPulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.45; }
}

.gauge-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

.gauge-row:last-child {
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
	width: 110rpx;
	text-align: right;
	font-size: 22rpx;
	color: #A8B3BD;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
	flex-shrink: 0;
}

/* ============ 概念 C：互动矩阵 ============ */
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
	box-shadow: 0 0 24rpx rgba(185, 74, 72, 0.22);
	animation: extremeBreath 2s ease-in-out infinite;
}

@keyframes extremeBreath {
	0%, 100% { box-shadow: 0 0 24rpx rgba(185, 74, 72, 0.18); }
	50% { box-shadow: 0 0 40rpx rgba(185, 74, 72, 0.4); }
}

.action-btn.safe {
	border-color: rgba(124, 140, 116, 0.55);
}

.action-btn.locked {
	opacity: 0.38;
}

.action-btn.shaking {
	animation: btnShake 0.5s ease-out;
}

@keyframes btnShake {
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

/* ============ 概念 D：终端日志 ============ */
.log-panel {
	background: #0D1520;
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

.cursor {
	color: #8FB6D9;
	animation: recBlink 0.9s steps(1) infinite;
}

/* ============ 概念 E：全屏低语 ============ */
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
	animation: whisperIn 0.5s ease-out both;
}

@keyframes whisperIn {
	from { opacity: 0; }
	to { opacity: 1; }
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

/* ============ 概念 F：事件揭晓层 ============ */
.event-layer {
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
	animation: whisperIn 0.4s ease-out both;
}

.event-body {
	width: 78%;
	padding: 56rpx 48rpx;
	background: #101A26;
	border: 1rpx solid #27384A;
	border-radius: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	animation: eventRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes eventRise {
	from { opacity: 0; transform: translateY(40rpx) scale(0.96); }
	to { opacity: 1; transform: none; }
}

.event-kicker {
	font-size: 18rpx;
	color: #66727F;
	letter-spacing: 6rpx;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
	margin-bottom: 20rpx;
}

.event-title {
	font-size: 44rpx;
	font-weight: 800;
	color: #C6A15B;
	letter-spacing: 6rpx;
	margin-bottom: 28rpx;
}

.event-body.hostile .event-title {
	color: #D47573;
}

.event-body.missing .event-title {
	color: #66727F;
}

.event-desc {
	font-size: 26rpx;
	color: #A8B3BD;
	line-height: 1.8;
	text-align: justify;
	margin-bottom: 40rpx;
}

.event-close {
	padding: 18rpx 64rpx;
	border: 1rpx solid #C6A15B;
	border-radius: 999rpx;
	color: #C6A15B;
	font-size: 26rpx;
	letter-spacing: 4rpx;
}

.event-close:active {
	transform: scale(0.96);
	opacity: 0.8;
}

/* ============ 演示控制台 ============ */
.mock-console {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1200;
	background: rgba(13, 21, 32, 0.96);
	border-top: 1rpx dashed rgba(198, 161, 91, 0.45);
	backdrop-filter: blur(12rpx);
	padding-bottom: env(safe-area-inset-bottom);
}

.console-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 32rpx;
}

.console-title {
	font-size: 22rpx;
	color: #C6A15B;
	letter-spacing: 2rpx;
	font-family: 'SF Mono', Menlo, Consolas, monospace;
}

.console-arrow {
	font-size: 20rpx;
	color: #66727F;
}

.console-body {
	padding: 0 32rpx 24rpx;
}

.slider-row {
	display: flex;
	align-items: center;
	gap: 20rpx;
	margin-bottom: 8rpx;
}

.slider-label {
	width: 150rpx;
	font-size: 22rpx;
	color: #A8B3BD;
	flex-shrink: 0;
}

.slider-row slider {
	flex: 1;
	margin: 0;
}

.console-btns {
	display: flex;
	gap: 14rpx;
	margin-top: 16rpx;
}

.mock-btn {
	flex: 1;
	padding: 16rpx 0;
	text-align: center;
	background: #172230;
	border: 1rpx solid #27384A;
	border-radius: 12rpx;
	font-size: 22rpx;
	color: #A8B3BD;
}

.mock-btn:active {
	transform: scale(0.96);
}

.mock-btn.reset {
	border-color: rgba(185, 74, 72, 0.5);
	color: #D47573;
}

.bottom-space {
	height: 360rpx;
}
</style>
