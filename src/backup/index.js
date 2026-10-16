// 整库存档：内容层（文献全量数据）+ 状态层（进度/互动/存档/设置）
// 打包为一份 JSON 文本，用于换设备迁移或异地备份。
//
// 用法：
//   import { exportArchive, importArchive } from '@/backup'
//   const text = exportArchive()        // 复制保存这份文本
//   importArchive(text)                 // 粘贴回来自动恢复（覆盖当前数据）
//
// 设计说明：
// - 内容层导出的是全量集合数据（而非种子 diff）：恢复不依赖两端种子版本一致，
//   旧设备导出的存档在任何构建上都能还原
// - 状态层导出全部命名空间，含 settings
// - 导入是整体替换语义，UI 层需向用户确认后调用，完成后建议刷新页面
import { db } from '@/db'
import { state } from '@/state'

const ARCHIVE_VERSION = 1

export function exportArchive() {
  const content = JSON.parse(db.exportJSON())
  const stateDump = JSON.parse(state.exportState())
  return JSON.stringify({
    kind: 'norse-archive',
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    content,
    state: stateDump
  })
}

export function importArchive(input) {
  const payload = typeof input === 'string' ? JSON.parse(input) : input
  if (
    !payload ||
    payload.kind !== 'norse-archive' ||
    !payload.content ||
    typeof payload.content !== 'object' ||
    !payload.state ||
    typeof payload.state !== 'object'
  ) {
    throw new Error('[archive] 存档格式不正确，需为 exportArchive 导出的文本')
  }
  const content = db.importJSON(payload.content)
  const restored = state.importState(payload.state)
  return {
    collections: content.applied,
    namespaces: restored.applied,
    ignored: [...(content.ignored || []), ...(restored.ignored || [])]
  }
}

// 开发环境挂到 window，便于控制台调试存档（与 window.norseDB 同模式）
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  window.norseArchive = { export: exportArchive, import: importArchive }
}

export default { exportArchive, importArchive }
