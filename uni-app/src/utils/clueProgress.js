const STORAGE_KEY = 'ravens_clue_progress'

export function getRavensClueProgress() {
  const saved = uni.getStorageSync(STORAGE_KEY)
  return saved && typeof saved === 'object'
    ? saved
    : { clueIds: [], revealed: false }
}

export function saveRavensClueProgress(progress) {
  uni.setStorageSync(STORAGE_KEY, progress)
}

export function unlockRavensClue(clueId) {
  if (!clueId) return false

  const progress = getRavensClueProgress()
  const clueIds = progress.clueIds || []

  if (clueIds.includes(clueId)) {
    return false
  }

  clueIds.push(clueId)
  progress.clueIds = clueIds

  if (clueIds.length >= 3) {
    progress.revealed = true
  }

  saveRavensClueProgress(progress)
  return true
}

export function isRavensRevealed() {
  return getRavensClueProgress().revealed === true
}

export function getRavensClueCount() {
  const progress = getRavensClueProgress()
  return progress && progress.clueIds
    ? progress.clueIds.length
    : 0
}

export function isRavensClueUnlocked(clueId) {
  const progress = getRavensClueProgress()
  return progress.clueIds && progress.clueIds.includes(clueId)
}

export function resetRavensClues() {
  uni.removeStorageSync(STORAGE_KEY)
}
