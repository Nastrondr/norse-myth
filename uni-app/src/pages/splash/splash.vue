<template>
	<view class="splash-container">
		<view class="bg-decoration"></view>
		<view class="bg-decoration-2"></view>
		
		<view class="logo-container">
			<text class="rune">ᛟ</text>
		</view>
		
		<text class="app-name">北欧神话</text>
		<text class="app-subtitle">探索九界的神秘世界</text>
		
		<view v-if="showSkip" class="skip-btn" @click="goToHome">
			<text class="skip-text">{{ countdown }} 跳过</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			showSkip: false,
			countdown: 3,
			timer: null
		}
	},
	onLoad() {
		this.startCountdown()
	},
	onReady() {
		setTimeout(() => {
			this.showSkip = true
		}, 500)
	},
	methods: {
		startCountdown() {
			this.timer = setInterval(() => {
				this.countdown--
				if (this.countdown <= 0) {
					this.goToHome()
				}
			}, 1000)
		},
		goToHome() {
			clearInterval(this.timer)
			uni.switchTab({
				url: '/pages/index/index'
			})
		}
	},
	onUnload() {
		clearInterval(this.timer)
	}
}
</script>

<style scoped>
.splash-container {
	flex: 1;
	width: 100%;
	height: 100vh;
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}

.bg-decoration {
	position: absolute;
	width: 600rpx;
	height: 600rpx;
	border-radius: 50%;
	background: rgba(102, 126, 234, 0.1);
	top: -200rpx;
	right: -200rpx;
	animation: float 8s ease-in-out infinite;
}

.bg-decoration-2 {
	position: absolute;
	width: 400rpx;
	height: 400rpx;
	border-radius: 50%;
	background: rgba(233, 69, 96, 0.1);
	bottom: -150rpx;
	left: -150rpx;
	animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
	0%, 100% { transform: translate(0, 0); }
	50% { transform: translate(30rpx, 30rpx); }
}

.logo-container {
	width: 200rpx;
	height: 200rpx;
	background: linear-gradient(135deg, #667eea 0%, #e94560 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 40rpx;
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { transform: scale(1); opacity: 1; }
	50% { transform: scale(1.05); opacity: 0.9; }
}

.rune {
	font-size: 100rpx;
	color: #ffffff;
	font-weight: bold;
}

.app-name {
	font-size: 56rpx;
	font-weight: bold;
	color: #ffffff;
	margin-bottom: 16rpx;
	letter-spacing: 4rpx;
}

.app-subtitle {
	font-size: 28rpx;
	color: #8a8a8a;
	margin-bottom: 40rpx;
}

.skip-btn {
	position: absolute;
	top: 80rpx;
	right: 30rpx;
	padding: 16rpx 32rpx;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 30rpx;
	backdrop-filter: blur(10rpx);
}

.skip-text {
	font-size: 26rpx;
	color: #ffffff;
}
</style>