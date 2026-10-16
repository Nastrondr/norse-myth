// 集合注册：src/data/*.js 是文献种子数据的唯一来源。
//
// 替换或更新文本的两种方式：
// 1. 编辑种子文件：直接修改 src/data/*.js，重新构建即生效；
//    用户本地的旧修改会因种子哈希变化自动失效，恢复为最新种子。
// 2. 运行时更新：通过 db.update / db.replaceCollection / db.importJSON 修改，
//    持久化在本地 storage，优先于种子（直到种子再次更新）。
import { realms, gods, stories } from '@/data/norse.js'
import { runeData } from '@/data/runes.js'
import { norseArtifacts } from '@/data/norseArtifacts.js'
import { norseCreatures } from '@/data/norseCreatures.js'
import { norseTimeline } from '@/data/norseTimeline.js'
import { norseWorlds } from '@/data/norseWorlds.js'
import { worldTimelines } from '@/data/worldTimelines.js'

export function registerCollections(db) {
  return db
    // 九界（norse.js realms）
    .defineCollection('realms', realms)
    // 神祇（norse.js gods）
    .defineCollection('gods', gods)
    // 故事文库（norse.js stories，已合并 norseStories.js 详细版，统一 id）
    .defineCollection('stories', stories)
    // 生物图鉴（norseCreatures.js，v3.0 已合并原 creatures 与 codexCreatures）
    .defineCollection('creatures', norseCreatures)
    // 卢恩符文·完整版 24 符（runes.js runeData；原 norse.js 简版仅保留种子未注册）
    .defineCollection('runeDetails', runeData)
    // 神器图鉴（norseArtifacts.js norseArtifacts）
    .defineCollection('artifacts', norseArtifacts)
    // 神话编年史（norseTimeline.js norseTimeline）
    .defineCollection('timeline', norseTimeline)
    // 九界详情（norseWorlds.js norseWorlds）
    .defineCollection('worlds', norseWorlds)
    // 各界时间线（worldTimelines.js，对象型文档）
    .defineDoc('worldTimelines', worldTimelines)
}
