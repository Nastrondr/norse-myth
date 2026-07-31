let audio = null
let fadeTimer = null
const STORAGE_KEY = 'norse_bgm_enabled'
const VOLUME_KEY = 'norse_bgm_volume'
const FADE_DURATION = 800
const FADE_INTERVAL = 50

function clearFadeTimer() {
  if (fadeTimer) {
    clearInterval(fadeTimer)
    fadeTimer = null
  }
}

export function getBgmVolume() {
  const saved = uni.getStorageSync(VOLUME_KEY)
  const n = Number(saved)
  if (!Number.isFinite(n)) return 0.45
  return Math.max(0, Math.min(1, n))
}

export function setBgmVolume(value) {
  let volume = Number(value)
  if (!Number.isFinite(volume)) {
    volume = getBgmVolume()
  }
  if (!Number.isFinite(volume)) {
    volume = 0.45
  }
  volume = Math.max(0, Math.min(1, volume))
  uni.setStorageSync(VOLUME_KEY, volume)
  const instance = initAudio()
  if (instance && Number.isFinite(volume)) {
    instance.volume = volume
  }
  return volume
}

export function initAudio() {
  if (audio) return audio
  audio = uni.createInnerAudioContext()
  audio.src = '/static/audio/bgm-main.mp3'
  audio.loop = true
  audio.volume = getBgmVolume()
  audio.onError((err) => {
    console.warn('BGM error:', err)
  })
  return audio
}

export function getBgmEnabled() {
  return uni.getStorageSync(STORAGE_KEY) === true
}

export function setBgmEnabled(value) {
  uni.setStorageSync(STORAGE_KEY, !!value)
}

function fadeTo(targetVolume, callback) {
  clearFadeTimer()
  const instance = initAudio()
  const currentVolume = Number(instance.volume) || 0
  const safeTarget = Math.max(0, Math.min(1, Number(targetVolume) || 0))
  const steps = FADE_DURATION / FADE_INTERVAL
  const delta = (safeTarget - currentVolume) / steps

  fadeTimer = setInterval(() => {
    let newVolume = Number(instance.volume) + delta
    let done = false

    if (delta > 0 && newVolume >= safeTarget) {
      newVolume = safeTarget
      done = true
    } else if (delta < 0 && newVolume <= safeTarget) {
      newVolume = safeTarget
      done = true
    } else if (delta === 0) {
      done = true
    }

    instance.volume = Math.max(0, Math.min(1, newVolume))

    if (done) {
      clearFadeTimer()
      callback && callback()
    }
  }, FADE_INTERVAL)
}

export function playBgm() {
  const instance = initAudio()
  const targetVolume = getBgmVolume()
  clearFadeTimer()
  instance.volume = 0
  instance.play()
  fadeTo(targetVolume)
  setBgmEnabled(true)
}

export function pauseBgm() {
  if (!audio) return
  fadeTo(0, () => {
    if (audio) {
      audio.pause()
    }
  })
  setBgmEnabled(false)
}

export function toggleBgm() {
  const enabled = getBgmEnabled()
  if (enabled) {
    pauseBgm()
    return false
  }
  playBgm()
  return true
}

export function getAudioInstance() {
  return audio
}
