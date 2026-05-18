<template>
  <view class="divination-page">
    <view class="page-header">
      <text class="page-title">三符文占卜</text>
    </view>

    <view v-if="!divinationStarted" class="intro-section">
      <text class="intro-text">在雾与树影之间，抽取属于你的过去、现在与未来。</text>
      <view class="ritual-button" @click="startDivination">
        <text>开始占卜</text>
      </view>
    </view>

    <view v-if="divinationStarted && currentDrawStep < 3" class="draw-section">
      <text class="draw-prompt">请抽取：{{ drawPositions[currentDrawStep] }}之符</text>

      <view class="vegvisir-disc" :class="{ active: isDrawing }">
        <view class="rune-orbit outer-orbit">
          <text
            v-for="(mark, index) in outerRuneMarks"
            :key="'outer-' + index"
            class="orbit-rune"
            :style="getOrbitRuneStyle(index, outerRuneMarks.length, 'outer')"
          >
            {{ mark }}
          </text>
        </view>

        <view class="rune-orbit inner-orbit">
          <text
            v-for="(mark, index) in innerRuneMarks"
            :key="'inner-' + index"
            class="orbit-rune inner"
            :style="getOrbitRuneStyle(index, innerRuneMarks.length, 'inner')"
          >
            {{ mark }}
          </text>
        </view>

        <view class="inner-compass">
          <view class="compass-line line-vertical"></view>
          <view class="compass-line line-horizontal"></view>
          <view class="compass-line line-diagonal-a"></view>
          <view class="compass-line line-diagonal-b"></view>
          <view class="stave stave-north"></view>
          <view class="stave stave-east"></view>
          <view class="stave stave-south"></view>
          <view class="stave stave-west"></view>
        </view>

        <view class="center-sigil">
          <text class="center-sigil-text">ᛉ</text>
        </view>
      </view>

      <view class="draw-slots">
        <view class="draw-slot" v-for="(pos, index) in drawPositions" :key="pos" :class="{ 'slot-active': index === currentDrawStep, 'slot-filled': drawnRunes[index] }">
          <text v-if="drawnRunes[index]" class="slot-symbol">{{ drawnRunes[index].symbol }}</text>
          <text v-else class="slot-placeholder">{{ index === currentDrawStep ? '?' : '未显现' }}</text>
        </view>
      </view>

      <view class="ritual-button" @click="drawNextRune" :class="{ 'button-disabled': isDrawing }">
        <text>{{ getDrawButtonText() }}</text>
      </view>
    </view>

    <view v-if="drawnRunes.length >= 3 && !showInterpretation" class="result-section">
      <view class="result-card" v-for="(rune, index) in drawnRunes" :key="rune.id">
        <text class="result-label">{{ rune.position }}</text>
        <text class="result-symbol">{{ rune.symbol }}</text>
        <text class="result-name">{{ rune.name }}</text>
        <text class="result-meaning">{{ rune.meaning }}</text>
      </view>

      <view class="ritual-button" @click="showInterpretation = true">
        <text>查看解读</text>
      </view>

      <view class="ritual-button secondary" @click="resetDivination">
        <text>重新占卜</text>
      </view>
    </view>

    <view v-if="showInterpretation" class="interpretation-section">
      <view class="result-card" v-for="(rune, index) in drawnRunes" :key="rune.id">
        <text class="result-label">{{ rune.position }}</text>
        <text class="result-symbol">{{ rune.symbol }}</text>
        <text class="result-name">{{ rune.name }}</text>
        <text class="result-meaning">{{ rune.meaning }}</text>
        <text class="result-upright">{{ rune.uprightMeaning }}</text>
      </view>

      <view class="interpretation">
        <text class="interp-title">综合解读</text>
        <text class="interp-text">{{ getDivinationSummary() }}</text>
      </view>

      <view class="ritual-button secondary" @click="resetDivination">
        <text>重新占卜</text>
      </view>
    </view>

    <view class="bottom-space"></view>
  </view>
</template>

<script>
import { runes as runeData } from '@/data/runes.js'

export default {
  data() {
    return {
      runes: runeData,
      displayRunes: runeData.slice(0, 8),
      divinationStarted: false,
      currentDrawStep: 0,
      drawPositions: ['过去', '现在', '未来'],
      drawnRunes: [],
      isDrawing: false,
      showInterpretation: false,
      outerRuneMarks: ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ'],
      innerRuneMarks: ['ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']
    }
  },
  methods: {
    startDivination() {
      this.divinationStarted = true
      this.currentDrawStep = 0
      this.drawnRunes = []
      this.isDrawing = false
      this.showInterpretation = false
    },

    resetDivination() {
      this.divinationStarted = false
      this.currentDrawStep = 0
      this.drawnRunes = []
      this.isDrawing = false
      this.showInterpretation = false
    },

    getDrawButtonText() {
      if (this.isDrawing) return '雾中显现…'
      if (this.currentDrawStep >= 3) return '查看解读'
      return `抽取${this.drawPositions[this.currentDrawStep]}之符`
    },

    drawNextRune() {
      if (this.isDrawing) return
      if (this.drawnRunes.length >= 3) return

      this.isDrawing = true

      setTimeout(() => {
        const step = this.currentDrawStep
        const availableRunes = this.runes.filter(r => !this.drawnRunes.some(d => d.id === r.id))
        
        if (!availableRunes.length) {
          this.isDrawing = false
          return
        }

        const randomIndex = Math.floor(Math.random() * availableRunes.length)
        const selected = availableRunes[randomIndex]

        this.drawnRunes.push({
          ...selected,
          position: this.drawPositions[step]
        })

        this.currentDrawStep += 1
        this.isDrawing = false
      }, 800)
    },

    getDivinationSummary() {
      if (this.drawnRunes.length < 3) return ''

      const past = this.drawnRunes[0]
      const present = this.drawnRunes[1]
      const future = this.drawnRunes[2]

      const pastElement = past.element || ''
      const presentElement = present.element || ''
      const futureElement = future.element || ''

      return `这组三符文揭示了你的生命旅程正在经历的转变。

【过去 · ${pastElement}】${past.name}（${past.symbol}）—— ${past.meaning}
${past.uprightMeaning}

【现在 · ${presentElement}】${present.name}（${present.symbol}）—— ${present.meaning}
${present.uprightMeaning}

【未来 · ${futureElement}】${future.name}（${future.symbol}）—— ${future.meaning}
${future.uprightMeaning}

这是来自古老符文的启示：从${past.name}所代表的${past.meaning}，经由${present.name}象征的${present.meaning}，最终走向${future.name}预示的${future.meaning}。每一个阶段都有其深意，关键在于你如何解读与行动。

${past.deeper}
${present.deeper}
${future.deeper}

请记住，符文不是宿命的宣判，而是可能性的指引。你的选择，将决定这段旅程的走向。`
    },

    getOrbitRuneStyle(index, total, ring) {
      const angle = (360 / total) * index - 90
      const radius = ring === 'outer' ? 43 : 31
      const x = 50 + radius * Math.cos(angle * Math.PI / 180)
      const y = 50 + radius * Math.sin(angle * Math.PI / 180)

      return {
        left: x + '%',
        top: y + '%',
        transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`
      }
    }
  }
}
</script>

<style scoped>
.divination-page {
  min-height: 100vh;
  background: #0B1118;
  color: #F2F4F6;
  padding: 32rpx;
  padding-bottom: 160rpx;
  box-sizing: border-box;
  overflow-x: hidden;
}

.page-header {
  text-align: center;
  padding: 24rpx 0 40rpx;
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #C6A15B;
  letter-spacing: 6rpx;
}

.intro-section {
  text-align: center;
  padding: 80rpx 0;
}

.intro-text {
  display: block;
  font-size: 30rpx;
  color: #A8B3BD;
  line-height: 1.8;
  margin-bottom: 60rpx;
}

.draw-section {
  text-align: center;
}

.draw-prompt {
  display: block;
  font-size: 32rpx;
  color: #D8C27A;
  margin-bottom: 32rpx;
  letter-spacing: 4rpx;
}

.vegvisir-disc {
  position: relative;
  width: 520rpx;
  height: 520rpx;
  margin: 44rpx auto 40rpx;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(216,194,122,0.08) 0%, rgba(23,34,48,0.92) 44%, rgba(11,17,24,0.98) 100%);
  border: 1px solid rgba(198,161,91,0.34);
  box-shadow: inset 0 0 48rpx rgba(198,161,91,0.08), 0 0 36rpx rgba(0,0,0,0.28);
  overflow: hidden;
}

.vegvisir-disc::before {
  content: '';
  position: absolute;
  inset: 34rpx;
  border-radius: 50%;
  border: 1px solid rgba(198,161,91,0.28);
}

.vegvisir-disc::after {
  content: '';
  position: absolute;
  inset: 104rpx;
  border-radius: 50%;
  border: 1px solid rgba(198,161,91,0.18);
}

.rune-orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  transform-origin: center center;
  z-index: 4;
  pointer-events: none;
}

.outer-orbit {
  animation: runeRotateClockwise 42s linear infinite;
}

.inner-orbit {
  animation: runeRotateCounter 34s linear infinite;
}

.orbit-rune {
  position: absolute;
  color: rgba(216,194,122,0.72);
  font-size: 24rpx;
  line-height: 1;
  font-family: serif;
  text-align: center;
  text-shadow: 0 0 10rpx rgba(216,194,122,0.10);
}

.orbit-rune.inner {
  color: rgba(242,244,246,0.52);
  font-size: 20rpx;
}

@keyframes runeRotateClockwise {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes runeRotateCounter {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.inner-compass {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 260rpx;
  height: 260rpx;
  transform: translate(-50%, -50%);
  z-index: 2;
  opacity: 0.56;
}

.compass-line {
  position: absolute;
  left: 50%;
  top: 50%;
  background: rgba(198,161,91,0.28);
  transform-origin: center;
}

.line-vertical {
  width: 2rpx;
  height: 220rpx;
  transform: translate(-50%, -50%);
}

.line-horizontal {
  width: 220rpx;
  height: 2rpx;
  transform: translate(-50%, -50%);
}

.line-diagonal-a {
  width: 204rpx;
  height: 2rpx;
  transform: translate(-50%, -50%) rotate(45deg);
}

.line-diagonal-b {
  width: 204rpx;
  height: 2rpx;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.stave {
  position: absolute;
  width: 46rpx;
  height: 46rpx;
  border-left: 2rpx solid rgba(216,194,122,0.54);
}

.stave::before,
.stave::after {
  content: '';
  position: absolute;
  width: 22rpx;
  height: 2rpx;
  top: 8rpx;
  background: rgba(216,194,122,0.54);
}

.stave::before {
  left: 12rpx;
  transform: rotate(35deg);
}

.stave::after {
  right: 12rpx;
  transform: rotate(-35deg);
}

.stave-north {
  left: 50%;
  top: 14rpx;
  transform: translateX(-50%);
}

.stave-east {
  right: 14rpx;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
}

.stave-south {
  left: 50%;
  bottom: 14rpx;
  transform: translateX(-50%) rotate(180deg);
}

.stave-west {
  left: 14rpx;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
}

.center-sigil {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 82rpx;
  height: 82rpx;
  transform: translate(-50%, -50%);
  z-index: 5;
  border-radius: 50%;
  border: 1px solid rgba(198,161,91,0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11,17,24,0.48);
}

.center-sigil-text {
  color: rgba(216,194,122,0.86);
  font-size: 38rpx;
  font-family: serif;
  line-height: 1;
  animation: sigilPulse 3s ease-in-out infinite;
}

@keyframes sigilPulse {
  0%, 100% { opacity: 0.58; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

.vegvisir-disc.active {
  border-color: rgba(216,194,122,0.72);
  box-shadow: inset 0 0 58rpx rgba(198,161,91,0.16), 0 0 46rpx rgba(198,161,91,0.16);
}

.vegvisir-disc.active .outer-orbit {
  animation-duration: 12s;
}

.vegvisir-disc.active .inner-orbit {
  animation-duration: 9s;
}

.vegvisir-disc.active .orbit-rune {
  color: rgba(216,194,122,0.95);
  text-shadow: 0 0 18rpx rgba(216,194,122,0.28);
}

.draw-slots {
  display: flex;
  gap: 16rpx;
  margin: 40rpx 0;
}

.draw-slot {
  flex: 1;
  min-height: 180rpx;
  border-radius: 20rpx;
  border: 1rpx solid #27384A;
  background: #172230;
  padding: 20rpx;
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.draw-slot.slot-active {
  animation: borderBreath 1.5s ease-in-out infinite;
}

.draw-slot.slot-filled {
  border-color: #C6A15B;
}

@keyframes borderBreath {
  0%, 100% {
    box-shadow: 0 0 0 rgba(198, 161, 91, 0);
    border-color: #27384A;
  }
  50% {
    box-shadow: 0 0 28rpx rgba(198, 161, 91, 0.22);
    border-color: #C6A15B;
  }
}

.slot-symbol {
  font-size: 64rpx;
  color: #D8C27A;
}

.slot-placeholder {
  font-size: 26rpx;
  color: #66727F;
}

.ritual-button {
  width: 70%;
  height: 96rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #D8C27A 0%, #C6A15B 55%, #8A6F45 100%);
  color: #0B1118;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 32rpx rgba(198, 161, 91, 0.22);
  margin: 32rpx auto 0;
}

.ritual-button:active {
  transform: scale(0.98);
}

.button-disabled {
  opacity: 0.6;
}

.ritual-button.secondary {
  background: transparent;
  border: 1rpx solid #27384A;
  color: #66727F;
  box-shadow: none;
}

.interpretation-section {
  margin-top: 24rpx;
}

.result-card {
  background: #172230;
  border: 1rpx solid #27384A;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.result-label {
  display: block;
  font-size: 26rpx;
  color: #C6A15B;
  margin-bottom: 16rpx;
  letter-spacing: 4rpx;
}

.result-symbol {
  display: block;
  font-size: 72rpx;
  color: #D8C27A;
  text-align: center;
  margin-bottom: 12rpx;
}

.result-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #F2F4F6;
  margin-bottom: 16rpx;
  text-align: center;
}

.result-meaning {
  display: block;
  font-size: 28rpx;
  color: #A8B3BD;
  margin-bottom: 8rpx;
}

.result-upright {
  display: block;
  width: 100%;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  font-size: 26rpx;
  color: #66727F;
  line-height: 1.6;
}

.interpretation {
  background: #172230;
  border: 1rpx solid #27384A;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-top: 24rpx;
}

.interp-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #F2F4F6;
  margin-bottom: 20rpx;
}

.interp-text {
  display: block;
  width: 100%;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.9;
  color: #C8D0D8;
  font-size: 28rpx;
  padding: 24rpx 0;
  border-top: 1px solid rgba(198,161,91,0.2);
  border-bottom: 1px solid rgba(198,161,91,0.2);
}

.bottom-space {
  height: 160rpx;
}
</style>