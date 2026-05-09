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

      <view class="rune-pool">
        <view class="rune-pool-symbol" v-for="(rune, index) in displayRunes" :key="rune.id" :style="{ animationDelay: (index * 0.15) + 's' }">
          <text>{{ rune.symbol }}</text>
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
      showInterpretation: false
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

        const seed = [
          this.getTodayKey(),
          'Guest',
          step
        ].join('|')

        const list = this.runes || []
        if (!list.length) {
          this.isDrawing = false
          return
        }

        let index = this.hashString(seed) % list.length
        let selected = list[index]

        const usedIds = this.drawnRunes.map(item => item.id)
        let guard = 0

        while (usedIds.includes(selected.id) && guard < list.length) {
          index = (index + 1) % list.length
          selected = list[index]
          guard++
        }

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

      return `这组三符文显示，你正在从「${past.meaning}」的经验中走来，当前最需要面对的是「${present.meaning}」，而下一阶段将逐渐走向「${future.meaning}」。请不要急于得到一个绝对答案，先看清过去留下的痕迹、现在正在发生的变化，以及未来要求你调整的方向。`
    },

    hashString(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return Math.abs(hash)
    },

    getTodayKey() {
      const now = new Date()
      return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
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

.rune-pool {
  margin: 32rpx auto;
  padding: 36rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(198, 161, 91, 0.32);
  background: radial-gradient(circle, rgba(198, 161, 91, 0.10), rgba(23, 34, 48, 0.92));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 22rpx;
  width: 560rpx;
  height: 560rpx;
  box-sizing: border-box;
}

.rune-pool-symbol {
  color: #D8C27A;
  font-size: 42rpx;
  animation: runeFloat 2.4s ease-in-out infinite;
}

@keyframes runeFloat {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.72;
  }
  50% {
    transform: translateY(-8rpx);
    opacity: 1;
  }
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
  white-space: normal;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.8;
  color: #A8B3BD;
  font-size: 28rpx;
}

.bottom-space {
  height: 160rpx;
}
</style>