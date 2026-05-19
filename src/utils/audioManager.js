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

export function initAudio() {
  if (audio) return audio

  audio = uni.createInnerAudioContext()
  audio.src = '/static/audio/bgm-main.mp3'
  audio.loop = true
  audio.volume = getVolume()

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

export function getVolume() {
  const saved = uni.getStorageSync(VOLUME_KEY)
  return saved !== '' && saved !== null ? parseFloat(saved) : 0.45
}

export function setVolume(value) {
  const volume = Math.max(0, Math.min(1, value))
  uni.setStorageSync(VOLUME_KEY, volume)
  if (audio) {
    audio.volume = volume
  }
  return volume
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

function fadeTo(targetVolume, callback) {
  clearFadeTimer()
  const instance = initAudio()
  const currentVolume = instance.volume
  const delta = (targetVolume - currentVolume) * (FADE_INTERVAL / FADE_DURATION)

  fadeTimer = setInterval(() => {
    let newVolume = instance.volume + delta

    if (delta > 0 && newVolume >= targetVolume) {
      newVolume = targetVolume
      clearFadeTimer()
      callback && callback()
    } else if (delta < 0 && newVolume <= targetVolume) {
      newVolume = targetVolume
      clearFadeTimer()
      callback && callback()
    }

    instance.volume = newVolume
  }, FADE_INTERVAL)
}

export function playBgm() {
  const instance = initAudio()
  const targetVolume = getVolume()
  
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
