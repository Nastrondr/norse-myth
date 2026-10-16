// 本地文献数据库（全局单例）
//
// 快速上手：
//   import { db } from '@/db'
//   db.findAll('gods')                          // 查询集合（返回深拷贝）
//   db.findById('gods', 'odin')                 // 按 id 查询
//   db.find('gods', { faction: '阿萨神族' })     // 条件查询（对象或函数）
//   db.update('gods', 'odin', { description: '新文案' })  // 局部更新（自动持久化）
//   db.replaceCollection('stories', newArray)   // 整体替换集合
//   db.exportJSON() / db.importJSON(json)       // 整库导出 / 导入
//   db.reset('gods') / db.reset()               // 恢复单个 / 全部种子数据
//
// 文本替换与更新：
// - 出厂版本：直接编辑 src/data/*.js 种子文件（推荐做大批量替换）
// - 本地热更新：运行时通过 db 写入，立即生效并持久化，优先于种子
import { createLocalDB } from './localDB.js'
import { registerCollections } from './collections.js'

export const db = createLocalDB()
registerCollections(db)

// 开发环境下挂载到 window，便于在浏览器控制台直接调整文献文本
if (typeof window !== 'undefined' && import.meta.env && import.meta.env.DEV) {
  window.norseDB = db
}

export default db
