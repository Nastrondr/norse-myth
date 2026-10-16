<template>
	<view class="story-detail-page page-enter-deep">
		<NavBar title="故事详情" />

		<EmptyState
			v-if="notFound"
			type="notfound"
			size="page"
			:actions="[{ label: '返回故事', variant: 'primary', event: 'back' }]"
			@action="onEmptyAction"
		/>
		<scroll-view v-else class="content-scroll" scroll-y @scroll="onHeroScroll">
			<view class="story-content">
				<view class="story-hero" :style="heroStyle">
					<text class="story-title">{{ story.title }}</text>
					<text class="story-original">{{ storyOriginalTitle }}</text>
					<view class="story-meta-row">
						<text class="story-chip">{{ storyCategory }}</text>
						<text class="story-time">{{ story.readingTime || '5 分钟' }}</text>
					</view>
					<text class="story-lead">{{ storySummary }}</text>
				</view>

				<view class="section-card scroll-prose" v-if="storyParagraphs.length">
					<text class="section-title">卷轴正文</text>
					<template v-for="(para, pi) in storyParagraphs" :key="pi">
						<view class="rune-divider" v-if="pi > 0">ᛝ</view>
						<text class="prose-para" :class="{ 'prose-first': pi === 0 }">{{ para }}</text>
					</template>
				</view>

				<view class="section-card" v-if="storyPhases.length">
					<text class="section-title">情节脉络</text>
					<view class="timeline-section">
						<view
							v-for="(phase, index) in storyPhases"
							:key="phase.title"
							class="phase-card"
						>
							<view class="phase-header">
								<text class="phase-index">{{ formatIndex(index + 1) }}</text>
								<text class="phase-title">{{ phase.title }}</text>
							</view>
							<view class="rune-divider" v-if="index > 0">ᛝ ✦ ᛝ</view>
							<view class="phase-list">
								<view
									v-for="item in phase.items"
									:key="item"
									class="phase-item"
								>
									<text class="phase-dot"></text>
									<text class="phase-text">{{ item }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view class="section-card">
					<text class="section-title">象征意义</text>
					<text class="section-text">{{ symbolicMeaning }}</text>
				</view>

				<view class="section-card">
					<text class="section-title">相关内容</text>
					<view class="related-section">
						<text class="related-label">相关神祇</text>
						<view class="related-tags">
							<text
								v-for="god in relatedGods"
								:key="god"
								class="related-tag god-tag"
							>
								{{ god }}
							</text>
						</view>
					</view>
					<view class="related-section">
						<text class="related-label">相关生物</text>
						<view class="related-tags">
							<text
								v-for="creature in relatedCreatures"
								:key="creature"
								class="related-tag creature-tag"
							>
								{{ creature }}
							</text>
						</view>
					</view>
					<view class="related-section">
						<text class="related-label">相关九界</text>
						<view class="related-tags">
							<text
								v-for="world in relatedWorlds"
								:key="world"
								class="related-tag world-tag"
							>
								{{ world }}
							</text>
						</view>
					</view>
				</view>

				<view class="bottom-space"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { db } from '@/db'
import { unlockRavensClue, getRavensClueCount } from '@/utils/clueProgress.js'
import NavBar from '@/components/NavBar.vue'
import EmptyState from '@/components/EmptyState.vue'
import heroParallax from '@/mixins/heroParallax.js'

export default {
	components: { NavBar, EmptyState },
	mixins: [heroParallax],
	data() {
		return {
			story: {},
			notFound: false,
			storyPhases: []
		}
	},
	computed: {
		storyOriginalTitle() {
			if (this.story.originalTitle && this.story.originalTitle !== this.story.title) {
				return this.story.originalTitle
			}
			const originals = {
				'ragnarok': 'Ragnarok',
				'creation': 'Creation of the World'
			}
			return originals[this.story.id] || this.story.title
		},
		storyCategory() {
			if (this.story.category && this.story.category !== this.story.title) {
				return this.story.category
			}
			const categories = {
				'ragnarok': '末日预言',
				'creation': '创世神话'
			}
			return categories[this.story.id] || '神话故事'
		},
		symbolicMeaning() {
			const meanings = {
				'ragnarok': '诸神黄昏象征命运不可逃避，也象征旧秩序的死亡与新秩序的诞生。',
				'creation': '世界创造象征着秩序从混沌中诞生，以及牺牲与创造之间的深刻联系。',
				'default': '这个故事承载着北欧神话中对命运、勇气与牺牲的深刻思考。'
			}
			if (this.story.symbolicMeaning) return this.story.symbolicMeaning
			return meanings[this.story.id] || meanings.default
		},
		storyParagraphs() {
			if (Array.isArray(this.story.paragraphs) && this.story.paragraphs.length) {
				return this.story.paragraphs
			}
			// 回退：把单段 content 按句号粗切成 2~3 句一段
			const c = this.story.content || ''
			if (!c) return []
			const sentences = c.split(/(?<=[。！？])/).filter(x => x.trim())
			const paras = []
			for (let i = 0; i < sentences.length; i += 2) {
				paras.push(sentences.slice(i, i + 2).join('').trim())
			}
			return paras
		},
		storySummary() {
			const summaries = {
				'ragnarok': '诸神黄昏不是单纯毁灭，而是一场命运已经写定、但诸神仍然选择迎战的终末。',
				'creation': '从虚无中诞生秩序，奥丁与兄弟以牺牲换取世界，九界由此成形。',
				'default': this.story.summary || ''
			}
			return summaries[this.story.id] || summaries.default
		},
		relatedGods() {
			return (this.story.relatedGods || [])
				.map(id => {
					const g = db.findById('gods', id)
					return g ? g.name : null
				})
				.filter(Boolean)
		},
		relatedCreatures() {
			return (this.story.relatedCreatures || [])
				.map(id => {
					const c = db.findById('creatures', id)
					return c ? c.name : null
				})
				.filter(Boolean)
		},
		relatedWorlds() {
			return (this.story.realms || [])
				.map(id => {
					const w = db.findById('worlds', id)
					return w ? w.name : null
				})
				.filter(Boolean)
		}
	},
	onLoad(options) {
		const storyId = options.id
		const found = storyId ? db.findById('stories', storyId) : null
		// 无 id → 默认首篇故事；带无效 id → 缺省态「内容不存在」
		if (storyId && !found) {
			this.notFound = true
			return
		}
		this.story = found || db.findAll('stories')[0]
		this.initPhases()
		if (this.isOdinRelatedStory(this.story)) {
			if (getRavensClueCount() < 3) {
				unlockRavensClue('ability')
			}
		}
	},
	methods: {
		// 缺省态操作：返回上一页，无栈时回故事列表
		onEmptyAction(event) {
			if (event !== 'back') return
			const pages = getCurrentPages()
			if (pages.length > 1) {
				uni.navigateBack()
			} else {
				uni.switchTab({ url: '/pages/stories/story-list' })
			}
		},
		isOdinRelatedStory(story) {
			if (!story) return false
			if (story.characters && story.characters.includes('odin')) return true
			if (story.relatedGods && story.relatedGods.includes('odin')) return true
			if (story.id && story.id.toLowerCase().includes('odin')) return true
			if (story.title && story.title.includes('奥丁')) return true
			return false
		},
		formatIndex(num) {
			return String(num).padStart(2, '0')
		},
		initPhases() {
			const phasesMap = {
				'ragnarok': [
					{
						title: '征兆',
						items: [
							'芬里尔挣脱锁链',
							'洛基率领巨人入侵',
							'世界树颤抖'
						]
					},
					{
						title: '终末之战',
						items: [
							'奥丁被芬里尔吞噬',
							'索尔杀死耶梦加得后中毒倒下',
							'海姆达尔与洛基同归于尽'
						]
					},
					{
						title: '焚烧与沉没',
						items: [
							'世界沉入海底',
							'苏尔特的火焰吞噬天空'
						]
					},
					{
						title: '世界重生',
						items: [
							'新的土地升起',
							'幸存者重新繁衍',
							'巴德尔归来'
						]
					}
				],
				'creation': [
					{
						title: '原初混沌',
						items: [
							'冰与火的世界隔着虚空对峙',
							'金伦加鸿沟中寒气与热气交汇'
						]
					},
					{
						title: '巨人之诞生',
						items: [
							'原初巨人尤弥尔从混沌中出现',
							'母牛欧德姆布拉舔出了众神'
						]
					},
					{
						title: '世界创造',
						items: [
							'奥丁与兄弟杀死尤弥尔',
							'用其身体塑造大地、海洋、山脉',
							'用颅骨创造天空'
						]
					},
					{
						title: '九界形成',
						items: [
							'世界树尤克特拉希尔支撑九界',
							'矮人从巨人尸体中诞生'
						]
					}
				]
			}
			// 仅渲染有专属脉络的故事；其余显示「卷轴正文」即可
			this.storyPhases = phasesMap[this.story.id] || []
		}
	}
}
</script>

<style scoped>
/* 卷轴展开转场：纵向舒展 + 由虚入实 */
@keyframes scrollUnroll {
  from { opacity: 0; transform: scaleY(0.96); filter: blur(6px); }
  to { opacity: 1; transform: scaleY(1); filter: blur(0); }
}

.story-detail-page.page-enter-deep {
  animation: scrollUnroll 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  transform-origin: 50% 0;
}

.story-detail-page {
	min-height: 100vh;
	background: var(--bg-outer);
	color: var(--text-primary);
	padding-bottom: 160rpx;
	box-sizing: border-box;
}

.content-scroll {
	height: calc(100vh - 88rpx - env(safe-area-inset-top));
}

.story-content {
	padding: 32rpx;
	box-sizing: border-box;
}

.story-hero {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.story-title {
	display: block;
	color: var(--text-primary);
	font-size: 44rpx;
	font-weight: 800;
	line-height: 1.2;
	text-shadow: 0 2rpx 16rpx rgba(var(--accent-rgb), 0.4);
}

.story-original {
	display: block;
	margin-top: 8rpx;
	color: var(--accent);
	font-size: 26rpx;
}

.story-meta-row {
	display: flex;
	gap: 12rpx;
	margin-top: 20rpx;
	flex-wrap: wrap;
}

.story-chip {
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(var(--accent-rgb), 0.14);
	color: var(--accent);
	font-size: 22rpx;
}

.story-time {
	padding: 6rpx 14rpx;
	border-radius: 999rpx;
	background: rgba(143, 182, 217, 0.10);
	color: var(--text-secondary);
	font-size: 22rpx;
}

.story-lead {
	display: block;
	margin-top: 22rpx;
	color: var(--text-secondary);
	font-size: 28rpx;
	line-height: 1.9;
	letter-spacing: 1.5rpx;
	font-family: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
	white-space: normal;
	word-break: break-word;
}

.section-card {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 22rpx;
	padding: 28rpx;
	margin-bottom: 24rpx;
}

.section-title {
	display: block;
	color: var(--accent);
	font-size: 30rpx;
	font-weight: 800;
	margin-bottom: 16rpx;
}

/* 卷轴正文：衬线长文排版，段间符文分隔 */
.prose-para {
	display: block;
	color: var(--text-secondary);
	font-size: 28rpx;
	line-height: 2;
	letter-spacing: 1.5rpx;
	font-family: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
	white-space: normal;
	word-break: break-word;
}

.prose-first::first-letter {
	float: left;
	font-size: 84rpx;
	line-height: 1.05;
	padding: 6rpx 14rpx 0 0;
	color: var(--accent);
	font-weight: 700;
	text-shadow: 0 2rpx 14rpx rgba(var(--accent-rgb), 0.35);
}

.section-text {
	display: block;
	color: var(--text-secondary);
	font-size: 28rpx;
	line-height: 2;
	letter-spacing: 1.5rpx;
	font-family: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
	white-space: normal;
	word-break: break-word;
}

/* 首字下沉：手抄本式开篇，金色衬线大字 */
.phase-card:first-child .phase-item:first-child .phase-text::first-letter {
	float: left;
	font-family: 'Songti SC', 'STSong', 'Noto Serif SC', Georgia, serif;
	font-size: 84rpx;
	line-height: 1.05;
	padding: 6rpx 14rpx 0 0;
	color: var(--accent);
	font-weight: 700;
	text-shadow: 0 2rpx 14rpx rgba(var(--accent-rgb), 0.35);
}

.character-scroll {
	width: 100%;
	white-space: nowrap;
}

.character-tags {
	display: flex;
	gap: 12rpx;
}

.character-tag {
	display: inline-flex;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(var(--accent-rgb), 0.14);
	color: var(--accent);
	font-size: 22rpx;
}

.timeline-section {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.phase-card {
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 22rpx;
	padding: 26rpx;
	margin-bottom: 20rpx;
}

.phase-header {
	display: flex;
	align-items: center;
	gap: 14rpx;
	margin-bottom: 18rpx;
}

.phase-index {
	color: var(--accent);
	font-size: 24rpx;
	font-weight: 800;
}

.phase-title {
	color: var(--text-primary);
	font-size: 30rpx;
	font-weight: 800;
}

.phase-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.phase-item {
	display: flex;
	gap: 12rpx;
}

.phase-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
	background: var(--accent);
	margin-top: 16rpx;
	flex-shrink: 0;
}

.phase-text {
	flex: 1;
	color: var(--text-secondary);
	font-size: 28rpx;
	line-height: 2;
	letter-spacing: 1.5rpx;
	font-family: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC', Georgia, serif;
	white-space: normal;
	word-break: break-word;
}

.related-section {
	margin-bottom: 20rpx;
}

.related-section:last-child {
	margin-bottom: 0;
}

.related-label {
	display: block;
	color: var(--text-muted);
	font-size: 22rpx;
	margin-bottom: 12rpx;
}

.related-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.related-tag {
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
}

.god-tag {
	background: rgba(var(--accent-rgb), 0.14);
	color: var(--accent);
}

.creature-tag {
	background: rgba(185, 74, 72, 0.14);
	color: #B94A48;
}

.world-tag {
	background: rgba(143, 182, 217, 0.14);
	color: #8FB6D9;
}

.bottom-space {
	height: 80rpx;
}
</style>
