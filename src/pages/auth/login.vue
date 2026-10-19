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
				<view class="mode-tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">
					<text>进入档案</text>
				</view>
				<view class="mode-tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">
					<text>新建档案</text>
				</view>
			</view>

			<view class="saved-list" v-if="mode === 'login' && savedUsers.length">
				<view
					class="saved-user"
					:class="{ active: form.name === user.name }"
					v-for="user in savedUsers"
					:key="user.id"
					@click="pickUser(user)"
				>
					<text class="saved-user-name">{{ user.name }}</text>
					<view class="saved-user-del" @click.stop="confirmDeleteUser(user)">
						<text>✕</text>
					</view>
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

		<!-- 删除档案确认层 -->
		<view v-if="deleteTarget" class="delete-layer" @click="deleteTarget = null">
			<view class="delete-body" @click.stop>
				<text class="delete-title">封存档案</text>
				<text class="delete-desc">「{{ deleteTarget.name }}」的全部进度将随之消散，无法找回。确定封存？</text>
				<view class="delete-actions">
					<view class="delete-btn cancel" @click="deleteTarget = null">
						<text>再想想</text>
					</view>
					<view class="delete-btn confirm" @click="onDeleteUser">
						<text>封存</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { login, register, enterGuest, deleteUser, getUserList, getCurrentUserId } from '@/auth/user.js'
import { state } from '@/state'

export default {
	data() {
		return {
			mode: 'login',
			form: { name: '', password: '', confirm: '' },
			message: '',
			messageOk: true,
			loading: false,
			savedUsers: [],
			deleteTarget: null
		}
	},
	onLoad() {
		this.refreshSavedUsers()
		// 记住上次档案名：预填
		const last = state.get('session.lastLoginName', '')
		if (last) {
			this.form.name = last
		} else if (this.savedUsers.length === 1) {
			this.form.name = this.savedUsers[0].name
		}
		// 无任何档案时默认注册模式
		if (!this.savedUsers.length) this.mode = 'register'
	},
	methods: {
		refreshSavedUsers() {
			this.savedUsers = getUserList()
		},
		switchMode(mode) {
			this.mode = mode
			this.message = ''
		},
		pickUser(user) {
			this.form.name = user.name
			this.message = ''
		},
		confirmDeleteUser(user) {
			this.deleteTarget = user
		},
		async onDeleteUser() {
			const target = this.deleteTarget
			this.deleteTarget = null
			if (!target) return
			deleteUser(target.id)
			this.refreshSavedUsers()
			if (this.form.name === target.name) this.form.name = ''
			if (!this.savedUsers.length) this.mode = 'register'
			this.showMessage('档案已封存', true)
		},
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
				// 记住本次档案名
				state.set('session.lastLoginName', name.trim())
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
/* ===== 已存档案列表 ===== */
.saved-list {
	display: flex;
	flex-wrap: wrap;
	gap: 14rpx;
	margin-bottom: 32rpx;
}

.saved-user {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 20rpx;
	background: var(--bg-inset);
	border: 1rpx solid var(--border-faint);
	border-radius: 999rpx;
	transition: border-color 0.2s ease;
}

.saved-user.active {
	border-color: rgba(var(--accent-rgb), 0.55);
}

.saved-user-name {
	color: var(--text-secondary);
	font-size: 24rpx;
}

.saved-user.active .saved-user-name {
	color: var(--accent-strong);
}

.saved-user-del {
	width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.06);
}

.saved-user-del text {
	color: var(--text-muted);
	font-size: 20rpx;
}

/* ===== 删除确认层 ===== */
.delete-layer {
	position: fixed;
	inset: 0;
	z-index: 999;
	background: rgba(8, 10, 14, 0.88);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 60rpx;
}

.delete-body {
	max-width: 520rpx;
	background: var(--bg-elevated);
	border: 1rpx solid rgba(201, 122, 107, 0.4);
	border-radius: 28rpx;
	padding: 48rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	gap: 24rpx;
}

.delete-title {
	color: var(--text-primary);
	font-size: 36rpx;
	font-weight: bold;
	letter-spacing: 6rpx;
}

.delete-desc {
	color: var(--text-secondary);
	font-size: 26rpx;
	line-height: 1.7;
}

.delete-actions {
	display: flex;
	gap: 20rpx;
	margin-top: 12rpx;
}

.delete-btn {
	padding: 18rpx 52rpx;
	border-radius: 999rpx;
	border: 1rpx solid var(--border-soft);
}

.delete-btn.cancel text {
	color: var(--text-secondary);
	font-size: 26rpx;
}

.delete-btn.confirm {
	border-color: rgba(201, 122, 107, 0.6);
	background: rgba(201, 122, 107, 0.12);
}

.delete-btn.confirm text {
	color: #C97A6B;
	font-size: 26rpx;
}
</style>
