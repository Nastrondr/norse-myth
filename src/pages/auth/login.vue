<template>
	<view class="login-page page-enter">
		<view class="bg-decoration"></view>
		<view class="bg-decoration-2"></view>

		<view class="brand">
			<view class="brand-rune"><text class="rune-mark">ᛟ</text></view>
			<text class="brand-name">北欧神话</text>
			<text class="brand-sub">九界探索 · 档案登记</text>
		</view>

		<view class="card">
			<view class="mode-tabs">
				<view class="mode-tab" :class="{ active: mode === 'login' }" @click="mode = 'login'">
					<text>进入档案</text>
				</view>
				<view class="mode-tab" :class="{ active: mode === 'register' }" @click="mode = 'register'">
					<text>新建档案</text>
				</view>
			</view>

			<view class="field">
				<text class="field-label">档案名</text>
				<input
					class="field-input"
					v-model="form.name"
					:maxlength="16"
					placeholder="2-16 个字符"
					placeholder-class="field-placeholder"
				/>
			</view>

			<view class="field" v-if="mode === 'register'">
				<text class="field-label">确认密码</text>
				<input
					class="field-input"
					v-model="form.confirm"
					password
					:maxlength="32"
					placeholder="再次输入密码"
					placeholder-class="field-placeholder"
				/>
			</view>

			<view class="field">
				<text class="field-label">密码</text>
				<input
					class="field-input"
					v-model="form.password"
					password
					:maxlength="32"
					:placeholder="mode === 'register' ? '至少 4 个字符' : '档案密码'"
					placeholder-class="field-placeholder"
					@confirm="onSubmit"
				/>
			</view>

			<text v-if="message" class="message" :class="{ error: !messageOk }">{{ message }}</text>

			<view class="submit-btn" :class="{ loading }" @click="onSubmit">
				<text>{{ mode === 'login' ? '开启旅程' : '立下誓言' }}</text>
			</view>

			<view class="guest-entry" @click="onGuest">
				<text class="guest-text">以访客身份继续 →</text>
			</view>
		</view>

		<view class="footnote">
			<text>档案保存于本地 · 进度随档案切换</text>
		</view>
	</view>
</template>

<script>
import { login, register, enterGuest, getCurrentUserId } from '@/auth/user.js'

export default {
	data() {
		return {
			mode: 'login',
			form: { name: '', password: '', confirm: '' },
			message: '',
			messageOk: true,
			loading: false,
			// 已有档案时进入本页默认登录态，否则默认注册
			hasProfiles: false
		}
	},
	onLoad() {
		// 已处于会话中（如登出后带回）不作特殊处理，用户可重新登录
	},
	methods: {
		showMessage(text, ok) {
			this.message = text
			this.messageOk = !!ok
		},
		async onSubmit() {
			if (this.loading) return
			const { name, password, confirm } = this.form
			if (!name.trim() || !password) {
				this.showMessage('请填写档案名与密码', false)
				return
			}
			if (this.mode === 'register' && password !== confirm) {
				this.showMessage('两次输入的密码不一致', false)
				return
			}
			this.loading = true
			try {
				const action = this.mode === 'login' ? login : register
				const result = await action(name.trim(), password)
				if (!result.ok) {
					this.showMessage(result.error || '操作失败', false)
					return
				}
				if (this.mode === 'register') {
					// 注册后直接登录进入
					const entered = await login(name.trim(), password)
					if (!entered.ok) {
						this.showMessage('档案已创建，请手动进入', false)
						return
					}
				}
				this.goHome()
			} finally {
				this.loading = false
			}
		},
		onGuest() {
			enterGuest()
			this.goHome()
		},
		goHome() {
			uni.reLaunch({ url: '/pages/index/index' })
		}
	}
}
</script>

<style scoped>
.login-page {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 48rpx;
	position: relative;
	overflow: hidden;
	background: var(--bg-outer);
}

.bg-decoration {
	position: absolute;
	top: -180rpx;
	right: -160rpx;
	width: 520rpx;
	height: 520rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%);
}

.bg-decoration-2 {
	position: absolute;
	bottom: -200rpx;
	left: -180rpx;
	width: 560rpx;
	height: 560rpx;
	border-radius: 50%;
	background: radial-gradient(circle, rgba(var(--bg-outer-rgb, 11, 17, 24), 0.6) 0%, transparent 70%);
}

.brand {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 56rpx;
	position: relative;
}

.brand-rune {
	width: 132rpx;
	height: 132rpx;
	border-radius: 36rpx;
	border: 1rpx solid rgba(var(--accent-rgb), 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-card);
}

.rune-mark {
	font-size: 68rpx;
	color: var(--ink-rune);
}

.brand-name {
	color: var(--text-primary);
	font-size: 44rpx;
	font-weight: bold;
	letter-spacing: 12rpx;
	margin-top: 8rpx;
}

.brand-sub {
	color: var(--text-muted);
	font-size: 24rpx;
	letter-spacing: 4rpx;
}

.card {
	width: 100%;
	max-width: 640rpx;
	background: var(--bg-card);
	border: 1rpx solid var(--border-soft);
	border-radius: 32rpx;
	padding: 44rpx 40rpx;
	position: relative;
	box-shadow: var(--shadow-card);
}

.mode-tabs {
	display: flex;
	background: var(--bg-inset);
	border-radius: 18rpx;
	padding: 8rpx;
	margin-bottom: 40rpx;
}

.mode-tab {
	flex: 1;
	text-align: center;
	padding: 18rpx 0;
	border-radius: 12rpx;
	transition: background 0.25s ease;
}

.mode-tab text {
	color: var(--text-muted);
	font-size: 26rpx;
	letter-spacing: 2rpx;
}

.mode-tab.active {
	background: var(--bg-elevated);
	border: 1rpx solid rgba(var(--accent-rgb), 0.35);
}

.mode-tab.active text {
	color: var(--accent-strong);
}

.field {
	margin-bottom: 28rpx;
}

.field-label {
	display: block;
	color: var(--text-secondary);
	font-size: 24rpx;
	margin-bottom: 12rpx;
	letter-spacing: 2rpx;
}

.field-input {
	width: 100%;
	background: var(--bg-inset);
	border: 1rpx solid var(--border-faint);
	border-radius: 16rpx;
	padding: 22rpx 24rpx;
	color: var(--text-primary);
	font-size: 28rpx;
	box-sizing: border-box;
}

.field-placeholder {
	color: var(--text-muted);
}

.message {
	display: block;
	font-size: 24rpx;
	color: var(--accent-strong);
	margin-bottom: 20rpx;
	line-height: 1.6;
}

.message.error {
	color: #C97A6B;
}

.submit-btn {
	margin-top: 12rpx;
	background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
	border-radius: 18rpx;
	padding: 26rpx 0;
	text-align: center;
	transition: transform 0.2s ease, opacity 0.2s ease;
}

.submit-btn:active {
	transform: scale(0.98);
}

.submit-btn.loading {
	opacity: 0.6;
}

.submit-btn text {
	color: #14181E;
	font-size: 30rpx;
	font-weight: bold;
	letter-spacing: 6rpx;
}

.guest-entry {
	margin-top: 28rpx;
	text-align: center;
}

.guest-text {
	color: var(--text-muted);
	font-size: 24rpx;
	letter-spacing: 2rpx;
}

.footnote {
	position: relative;
	margin-top: 40rpx;
}

.footnote text {
	color: var(--text-muted);
	font-size: 20rpx;
	letter-spacing: 2rpx;
	opacity: 0.7;
}
</style>
