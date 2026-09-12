import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { realms, gods, stories } from '../src/data/norse.js'
import { norseArtifacts } from '../src/data/norseArtifacts.js'
import { norseCreatures } from '../src/data/norseCreatures.js'
import { norseTimeline } from '../src/data/norseTimeline.js'
import { norseWorlds } from '../src/data/norseWorlds.js'

// 引用完整性测试：防止新增/修改文献数据时引入断链
// （神祇、生物、九界的相互引用必须全部有效；故事引用仅允许指向"已排期的未写故事"）

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const godIds = new Set(gods.map(g => g.id))
const storyIds = new Set(stories.map(s => s.id))
const realmIds = new Set(realms.map(r => r.id))
const creatureIds = new Set(norseCreatures.map(c => c.id))

// 已排期待撰写的故事（第二阶段写作任务）。写完对应故事后请从此列表移除，
// 测试会双向校验：出现新的未登记断链会失败，写完故事不更新列表也会失败。
const KNOWN_MISSING_STORIES = [
  'creation-of-humans',
  'loki-children',
  'thor-giants',
  'aesir-vanir-war',
  'freya-necklace',
  'freyr-alfheim',
  'loki-hair-trick',
  'hel-realm',
  'world-tree',
  'asgard-order',
  'valhalla',
  'divine-artifacts',
  'idunn-apples',
  'loki-punishment',
  'rebirth'
]

function expectAllValid(refs, validSet, message) {
  refs.forEach(ref => {
    expect(validSet.has(ref), message + ' 引用了不存在的 id: ' + ref).toBe(true)
  })
}

describe('集合主键唯一性', () => {
  const collections = { gods, stories, realms, creatures: norseCreatures, artifacts: norseArtifacts, worlds: norseWorlds }
  Object.entries(collections).forEach(([name, list]) => {
    it(`${name} 的 id 唯一且非空`, () => {
      const ids = list.map(x => x.id)
      expect(new Set(ids).size, name + ' 存在重复 id').toBe(ids.length)
      ids.forEach(id => expect(id, name + ' 存在空 id').toBeTruthy())
    })
  })
})

describe('神祇引用', () => {
  it('gods.stories 均存在于 stories', () => {
    gods.forEach(g => expectAllValid(g.stories || [], storyIds, `神祇 ${g.id}.stories`))
  })
  it('gods.realm 均存在于 realms', () => {
    gods.forEach(g => expectAllValid(g.realm || [], realmIds, `神祇 ${g.id}.realm`))
  })
})

describe('九界引用', () => {
  // 尚未撰写的故事允许出现在排期清单内
  const allowedStories = new Set([...storyIds, ...KNOWN_MISSING_STORIES])

  it('realms 的 relatedGods / relatedStories / relatedCreatures 均有效', () => {
    realms.forEach(r => {
      expectAllValid(r.relatedGods || [], godIds, `${r.id}.relatedGods`)
      expectAllValid(r.relatedStories || [], allowedStories, `${r.id}.relatedStories`)
      expectAllValid(r.relatedCreatures || [], creatureIds, `${r.id}.relatedCreatures`)
    })
  })
  it('worlds（详情）的 relatedGods / relatedStories / relatedCreatures 均有效', () => {
    norseWorlds.forEach(w => {
      expectAllValid(w.relatedGods || [], godIds, `${w.id}.relatedGods`)
      expectAllValid(w.relatedStories || [], allowedStories, `${w.id}.relatedStories`)
      expectAllValid(w.relatedCreatures || [], creatureIds, `${w.id}.relatedCreatures`)
    })
  })
})

describe('故事与生物引用', () => {
  it('stories 的 relatedGods / relatedCreatures / realms 均有效', () => {
    stories.forEach(s => {
      expectAllValid(s.relatedGods || [], godIds, `故事 ${s.id}.relatedGods`)
      expectAllValid(s.relatedCreatures || [], creatureIds, `故事 ${s.id}.relatedCreatures`)
      expectAllValid(s.realms || [], realmIds, `故事 ${s.id}.realms`)
    })
  })
  it('creatures 的 relatedGods / relatedCreatures 均有效（relatedStories 允许指向排期列表）', () => {
    const allowed = new Set([...storyIds, ...KNOWN_MISSING_STORIES])
    norseCreatures.forEach(c => {
      expectAllValid(c.relatedGods || [], godIds, `生物 ${c.id}.relatedGods`)
      expectAllValid(c.relatedCreatures || [], creatureIds, `生物 ${c.id}.relatedCreatures`)
      expectAllValid(c.relatedStories || [], allowed, `生物 ${c.id}.relatedStories`)
    })
  })
})

describe('神器引用', () => {
  it('artifacts 的 relatedGods / relatedCreatures / relatedStories 均有效（故事允许指向排期列表）', () => {
    const allowed = new Set([...storyIds, ...KNOWN_MISSING_STORIES])
    norseArtifacts.forEach(a => {
      expectAllValid((a.relatedGods || []).map(x => x.id), godIds, `神器 ${a.id}.relatedGods`)
      expectAllValid((a.relatedCreatures || []).map(x => x.id), creatureIds, `神器 ${a.id}.relatedCreatures`)
      expectAllValid((a.relatedStories || []).map(x => x.id), allowed, `神器 ${a.id}.relatedStories`)
    })
  })
})

describe('故事断链与排期清单', () => {
  it('全库被引用但不存在的故事，必须与 KNOWN_MISSING_STORIES 完全一致（双向）', () => {
    const referenced = new Set()
    gods.forEach(g => (g.stories || []).forEach(x => referenced.add(x)))
    realms.forEach(r => (r.relatedStories || []).forEach(x => referenced.add(x)))
    norseWorlds.forEach(w => (w.relatedStories || []).forEach(x => referenced.add(x)))
    norseCreatures.forEach(c => (c.relatedStories || []).forEach(x => referenced.add(x)))
    norseArtifacts.forEach(a => (a.relatedStories || []).forEach(x => referenced.add(x.id)))
    norseTimeline.forEach(age => (age.events || []).forEach(e => e.relatedStory && referenced.add(e.relatedStory)))

    const missing = [...referenced].filter(id => !storyIds.has(id))
    const known = new Set(KNOWN_MISSING_STORIES)

    const notRegistered = missing.filter(id => !known.has(id))
    expect(notRegistered, '发现未登记的断链（请撰写故事或将其加入 KNOWN_MISSING_STORIES）').toEqual([])

    const stale = KNOWN_MISSING_STORIES.filter(id => !missing.includes(id))
    expect(stale, '以下故事已可解析，请从 KNOWN_MISSING_STORIES 移除').toEqual([])
  })
})

describe('手绘地图素材', () => {
  it('worlds.mapImage 指向的文件必须存在', () => {
    norseWorlds.filter(w => w.mapImage).forEach(w => {
      const file = path.join(__dirname, '..', 'src', w.mapImage)
      expect(fs.existsSync(file), `${w.id}.mapImage 文件不存在: ${w.mapImage}`).toBe(true)
    })
  })
  it('mapLocations 的 x/y 为 0~100 的数字', () => {
    norseWorlds.forEach(w => {
      (w.mapLocations || []).forEach(loc => {
        expect(typeof loc.x, `${w.id} 点位 ${loc.name} 的 x 应为数字`).toBe('number')
        expect(loc.x, `${w.id} 点位 ${loc.name} 的 x 超出 0~100`).toBeGreaterThanOrEqual(0)
        expect(loc.x, `${w.id} 点位 ${loc.name} 的 x 超出 0~100`).toBeLessThanOrEqual(100)
        expect(typeof loc.y, `${w.id} 点位 ${loc.name} 的 y 应为数字`).toBe('number')
        expect(loc.y, `${w.id} 点位 ${loc.name} 的 y 超出 0~100`).toBeGreaterThanOrEqual(0)
        expect(loc.y, `${w.id} 点位 ${loc.name} 的 y 超出 0~100`).toBeLessThanOrEqual(100)
      })
    })
  })
})
