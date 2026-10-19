import { describe, it, expect, beforeEach } from 'vitest'

let auth
let state

beforeEach(async () => {
  // 每轮重置 StateDB（内存模式）：直接清命名空间
  state = (await import('@/state')).state
  const mod = await import('@/auth/user.js')
  auth = mod
  // 清理上一轮残留
  ;['users', 'session', 'progress', 'bond', 'favor', 'game'].forEach(ns => state.remove(ns))
})

describe('注册', () => {
  it('合法档案名 + 密码注册成功', async () => {
    const r = await auth.register('九界旅人', 'rune123')
    expect(r.ok).toBe(true)
    expect(r.user.name).toBe('九界旅人')
    expect(auth.getUserList()).toHaveLength(1)
    // 密码不明文落盘
    expect(JSON.stringify(auth.getUserList())).not.toContain('rune123')
  })

  it('重名拒绝', async () => {
    await auth.register('奥丁', 'pass1234')
    const r = await auth.register('奥丁', 'abcd1234')
    expect(r.ok).toBe(false)
    expect(r.error).toContain('已被使用')
  })

  it('档案名/密码长度校验', async () => {
    expect((await auth.register('一', 'pass1234')).ok).toBe(false)
    expect((await auth.register('正常名字', 'abc')).ok).toBe(false)
  })
})

describe('登录与访客', () => {
  it('正确密码登录并建立会话', async () => {
    await auth.register('旅人', 'pass1234')
    const bad = await auth.login('旅人', 'wrong-password')
    expect(bad.ok).toBe(false)
    const ok = await auth.login('旅人', 'pass1234')
    expect(ok.ok).toBe(true)
    expect(auth.getCurrentUser().name).toBe('旅人')
    expect(auth.hasSession()).toBe(true)
  })

  it('不存在的档案名', async () => {
    const r = await auth.login('不存在', 'whatever')
    expect(r.ok).toBe(false)
  })

  it('访客模式与会话', () => {
    auth.enterGuest()
    expect(auth.getCurrentUserId()).toBe('guest')
    expect(auth.getCurrentUser().guest).toBe(true)
  })
})

describe('进度快照换入换出', () => {
  it('档案进度互不串味', async () => {
    await auth.register('旅人甲', 'pass1234')
    await auth.register('旅人乙', 'pass1234')

    // 旅人甲登录，写入进度
    await auth.login('旅人甲', 'pass1234')
    state.set('progress.collectedCreatures', ['fenrir', 'hel'])
    state.set('favor.odin', { favorExp: 40 })

    // 切到旅人乙，进度应为空
    await auth.login('旅人乙', 'pass1234')
    expect(state.get('progress.collectedCreatures', [])).toEqual([])
    expect(state.get('favor.odin', null)).toBeNull()

    // 切回旅人甲，进度恢复
    await auth.login('旅人甲', 'pass1234')
    expect(state.get('progress.collectedCreatures', [])).toEqual(['fenrir', 'hel'])
    expect(state.get('favor.odin', {}).favorExp).toBe(40)
  })

  it('访客进度独立保存', async () => {
    auth.enterGuest()
    state.set('game.runeRecord', { done: true })
    await auth.register('正式档案', 'pass1234')
    await auth.login('正式档案', 'pass1234')
    expect(state.get('game.runeRecord', null)).toBeNull()
    auth.enterGuest()
    expect(state.get('game.runeRecord', {}).done).toBe(true)
  })

  it('logout 清会话且保留快照', async () => {
    await auth.register('旅人', 'pass1234')
    await auth.login('旅人', 'pass1234')
    state.set('progress.worldTree', { totalProgress: 50 })
    auth.logout()
    expect(auth.getCurrentUserId()).toBe('')
    await auth.login('旅人', 'pass1234')
    expect(state.get('progress.worldTree', {}).totalProgress).toBe(50)
  })
})

describe('删除档案', () => {
  it('删除指定档案与快照', async () => {
    const r = await auth.register('待删', 'pass1234')
    await auth.login('待删', 'pass1234')
    state.set('progress.worldTree', { totalProgress: 10 })
    auth.enterGuest()
    auth.deleteUser(r.user.id)
    expect(auth.getUserList()).toHaveLength(0)
    expect(state.get('users.snapshot.' + r.user.id, null)).toBeNull()
  })
})

describe('密码哈希', () => {
  it('同 salt 同密码哈希稳定，不同 salt 不同', async () => {
    const a1 = await auth.hashPassword('secret', 'salt-a')
    const a2 = await auth.hashPassword('secret', 'salt-a')
    const b = await auth.hashPassword('secret', 'salt-b')
    expect(a1).toBe(a2)
    expect(a1).not.toBe(b)
  })
})
