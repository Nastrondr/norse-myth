// 本地用户体系：多探索者档案 + 访客模式（本地优先，无后端）
//
// 数据模型（全部走 StateDB，无新存储通道）：
//   users.list                 → [ { id, name, passHash, salt, createdAt, lastLoginAt } ]
//   users.snapshot.<userId>    → { progress:{}, bond:{}, favor:{}, game:{} }  // 各档案进度快照
//   session.currentUserId      → 'guest' | 档案 id | ''（未登录）
//
// 切换/登录/登出时自动做「进度快照换入换出」：
//   离开当前档案 → 把 progress/bond/favor/game 四个命名空间导出存进该档案的快照；
//   进入新档案 → 清空四命名空间后，从新档案快照恢复（访客 = 空白开局）。
//   settings 命名空间全局共享（主题/音量不分档案）。
//
// 密码安全：SHA-256(salt + password)，优先 WebCrypto（https/localhost），
// 非 crypto 环境（单元测试 node）降级 djb2+salt。明文密码绝不落盘。
//
// 约束：档案名唯一、2-16 字符；密码 ≥4 字符（本地档案，降低门槛）。

import { state } from '@/state'

const USERS_KEY = 'users.list'
const SNAPSHOT_NS = 'users'
const SESSION_KEY = 'session.currentUserId'

// 跟随档案切换的进度命名空间
const PROFILE_NAMESPACES = ['progress', 'bond', 'favor', 'game']

// ===== 密码哈希 =====

function fallbackHash(str) {
  // 非 crypto 环境降级（单测）：djb2 变体，带 salt 仍可防直接彩虹表
  let h1 = 5381
  let h2 = 52711
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = ((h1 << 5) + h1 + c) >>> 0
    h2 = ((h2 << 5) + h2 + c) >>> 0
  }
  return 'fb-' + h1.toString(36) + '-' + h2.toString(36)
}

export async function hashPassword(password, salt) {
  const text = String(salt) + ':' + String(password)
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      const arr = Array.from(new Uint8Array(buf))
      return 'sha256-' + arr.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (e) {
      // fallthrough
    }
  }
  return fallbackHash(text)
}

function makeSalt() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

// ===== 档案 CRUD =====

export function getUserList() {
  return state.get(USERS_KEY, [])
}

export function getCurrentUserId() {
  return state.get(SESSION_KEY, '')
}

export function getCurrentUser() {
  const id = getCurrentUserId()
  if (!id) return null
  if (id === 'guest') return { id: 'guest', name: '访客', guest: true }
  return getUserList().find(u => u.id === id) || null
}

function findByName(name) {
  const target = String(name || '').trim()
  return getUserList().find(u => u.name === target) || null
}

function saveUserList(list) {
  state.set(USERS_KEY, list)
}

/**
 * 注册新档案
 * @returns { ok, user? , error? }
 */
export async function register(name, password) {
  const username = String(name || '').trim()
  if (username.length < 2 || username.length > 16) {
    return { ok: false, error: '档案名需 2-16 个字符' }
  }
  if (findByName(username)) {
    return { ok: false, error: '该档案名已被使用' }
  }
  const pwd = String(password || '')
  if (pwd.length < 4) {
    return { ok: false, error: '密码至少 4 个字符' }
  }
  const salt = makeSalt()
  const passHash = await hashPassword(pwd, salt)
  const user = {
    id: 'u-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
    name: username,
    salt,
    passHash,
    createdAt: Date.now(),
    lastLoginAt: null
  }
  saveUserList([...getUserList(), user])
  return { ok: true, user }
}

/**
 * 登录：校验密码并切换到该档案（换入其进度快照）
 */
export async function login(name, password) {
  const user = findByName(name)
  if (!user) return { ok: false, error: '档案不存在' }
  const hash = await hashPassword(String(password || ''), user.salt)
  if (hash !== user.passHash) {
    return { ok: false, error: '密码不正确' }
  }
  switchTo(user.id)
  const list = getUserList().map(u => (u.id === user.id ? Object.assign({}, u, { lastLoginAt: Date.now() }) : u))
  saveUserList(list)
  return { ok: true, user }
}

// ===== 进度快照换入换出 =====

function exportProfileSnapshot(userId) {
  const data = {}
  PROFILE_NAMESPACES.forEach(ns => {
    data[ns] = state.get(ns, {}) || {}
  })
  state.set(SNAPSHOT_NS + '.snapshot.' + userId, data)
}

function importProfileSnapshot(userId) {
  // 先清空当前四命名空间（避免档案间进度串味）
  PROFILE_NAMESPACES.forEach(ns => state.remove(ns))
  const snapshot = state.get(SNAPSHOT_NS + '.snapshot.' + userId)
  if (!snapshot) return
  PROFILE_NAMESPACES.forEach(ns => {
    if (snapshot[ns] && Object.keys(snapshot[ns]).length) {
      state.set(ns, snapshot[ns])
    }
  })
}

function switchTo(userId) {
  const current = getCurrentUserId()
  if (current && current !== userId) {
    if (current === 'guest') exportProfileSnapshot('guest')
    else exportProfileSnapshot(current)
  }
  importProfileSnapshot(userId)
  state.set(SESSION_KEY, userId)
}

/** 进入访客模式（保留已创建档案的进度） */
export function enterGuest() {
  switchTo('guest')
  return { ok: true }
}

/** 登出 → 回到未登录态（进度先存回当前档案） */
export function logout() {
  const current = getCurrentUserId()
  if (current) {
    exportProfileSnapshot(current === 'guest' ? 'guest' : current)
  }
  state.set(SESSION_KEY, '')
  return { ok: true }
}

/**
 * 删除档案（连同其快照；正在使用中则同时登出）
 */
export function deleteUser(userId) {
  const list = getUserList().filter(u => u.id !== userId)
  saveUserList(list)
  state.remove(SNAPSHOT_NS + '.snapshot.' + userId)
  if (getCurrentUserId() === userId) {
    state.set(SESSION_KEY, '')
  }
  return { ok: true }
}

/** 是否已有任何登录态（访客也算） */
export function hasSession() {
  return !!getCurrentUserId()
}

export default {
  register,
  login,
  logout,
  enterGuest,
  deleteUser,
  getUserList,
  getCurrentUser,
  getCurrentUserId,
  hasSession,
  hashPassword
}
