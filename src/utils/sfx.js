// 交互音效引擎（WebAudio 合成，零素材）
// 音色：北欧风「金石之声」——短促、清冷、带回响，避免卡通感
// 所有音效受 settings.sfxEnabled 控制；H5 环境自动降级为静音
import { state } from '@/state'

let ctx = null
let master = null

export function getSfxEnabled() {
  return state.get('settings.sfxEnabled') !== false // 默认开启
}

export function setSfxEnabled(value) {
  state.set('settings.sfxEnabled', !!value)
}

function ensureCtx() {
  if (typeof window === 'undefined' || !window.AudioContext) return null
  if (!ctx) {
    ctx = new window.AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.2 // 全局音量 20%，轻声点缀不抢 BGM
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// 通用音符：三角波主音 + 五度泛音，指数衰减，可选延迟回响
function tone(freq, { dur = 0.18, delay = 0, type = 'triangle', vol = 1, echo = 0 } = {}) {
  const ac = ensureCtx()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  const g = ac.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
  if (echo > 0) {
    // 简易回声：低音量的延迟重复
    tone(freq, { dur: dur * 0.8, delay: delay + 0.16, type, vol: vol * echo, echo: 0 })
  }
}

// 短噪声脉冲（纸张/沙沙声）
function noise({ dur = 0.12, vol = 0.5, hp = 2000 } = {}) {
  const ac = ensureCtx()
  if (!ac) return
  const len = Math.floor(ac.sampleRate * dur)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
  }
  const src = ac.createBufferSource()
  src.buffer = buf
  const filter = ac.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = hp
  const g = ac.createGain()
  g.gain.value = vol
  src.connect(filter)
  filter.connect(g)
  g.connect(master)
  src.start()
}

function enabled() {
  return getSfxEnabled() && typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext)
}

// ===== 预设音效 =====

// Tab 切换：单音轻击（E5）
export function sfxTap() {
  if (!enabled()) return
  tone(659.25, { dur: 0.1, vol: 0.6 })
}

// 翻页/翻章：纸张沙沙 + 高频点缀
export function sfxPage() {
  if (!enabled()) return
  noise({ dur: 0.14, vol: 0.35, hp: 2400 })
  tone(1318.5, { dur: 0.09, delay: 0.05, vol: 0.25, type: 'sine' })
}

// 图鉴解锁/成就：上行三音金铃（C6-E6-G6），带回响
export function sfxUnlock() {
  if (!enabled()) return
  tone(1046.5, { dur: 0.22, vol: 0.7, echo: 0.35 })
  tone(1318.5, { dur: 0.22, delay: 0.12, vol: 0.7, echo: 0.35 })
  tone(1568.0, { dur: 0.4, delay: 0.24, vol: 0.8, echo: 0.3 })
}

// 返回/关闭：下行双音
export function sfxBack() {
  if (!enabled()) return
  tone(523.25, { dur: 0.09, vol: 0.4 })
  tone(392, { dur: 0.14, delay: 0.07, vol: 0.4 })
}
