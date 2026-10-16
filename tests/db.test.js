import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalDB } from '../src/db/localDB.js'
import { db } from '../src/db/index.js'

// 模拟 uni storage（localDB 在无 uni 全局时自动降级为内存模式）
function createUniMock() {
  const store = new Map()
  return {
    setStorageSync(key, value) {
      store.set(key, JSON.parse(JSON.stringify(value)))
    },
    getStorageSync(key) {
      return store.has(key) ? JSON.parse(JSON.stringify(store.get(key))) : ''
    }
  }
}

const SEED_GODS = [
  { id: 'odin', name: '奥丁', faction: '阿萨神族', description: '原始文案' },
  { id: 'thor', name: '索尔', faction: '阿萨神族', description: '原始文案' },
  { id: 'freya', name: '弗雷娅', faction: '华纳神族', description: '原始文案' }
]

describe('localDB 注册与查询', () => {
  it('findAll 返回种子内容', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(local.findAll('gods')).toHaveLength(3)
    expect(local.findById('gods', 'odin').name).toBe('奥丁')
    expect(local.findById('gods', 'nobody')).toBeNull()
  })

  it('find 支持对象匹配与谓词函数', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(local.find('gods', { faction: '阿萨神族' })).toHaveLength(2)
    expect(local.find('gods', g => g.name.includes('雷'))).toHaveLength(1)
    expect(local.findOne('gods', { id: 'freya' }).name).toBe('弗雷娅')
    expect(local.count('gods')).toBe(3)
  })

  it('查询结果为深拷贝，外部修改不影响数据库', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    const all = local.findAll('gods')
    all[0].description = '被篡改'
    all.pop()
    expect(local.findById('gods', 'odin').description).toBe('原始文案')
    expect(local.count('gods')).toBe(3)
    // 种子本身也不受影响
    expect(SEED_GODS[0].description).toBe('原始文案')
  })

  it('未注册的集合抛出错误并列出可用集合', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(() => local.findAll('stories')).toThrow(/可用集合/)
  })
})

describe('localDB 写操作', () => {
  it('update 局部更新并返回新记录', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    const updated = local.update('gods', 'odin', { description: '新文案' })
    expect(updated.description).toBe('新文案')
    expect(updated.faction).toBe('阿萨神族')
    expect(local.findById('gods', 'odin').description).toBe('新文案')
    expect(local.update('gods', 'nobody', {})).toBeNull()
    expect(() => local.update('gods', 'odin', { id: 'x' })).toThrow()
  })

  it('updateWhere 批量更新并返回条数', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(local.updateWhere('gods', { faction: '阿萨神族' }, { description: '统一文案' })).toBe(2)
    expect(local.find('gods', { description: '统一文案' })).toHaveLength(2)
  })

  it('insert 自动生成 id，重复 id 报错', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    const added = local.insert('gods', { name: '提尔' })
    expect(added.id).toBeTruthy()
    expect(local.count('gods')).toBe(4)
    expect(() => local.insert('gods', { id: 'odin', name: '重复' })).toThrow()
  })

  it('remove 与 replaceCollection', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(local.remove('gods', 'thor')).toBe(true)
    expect(local.remove('gods', 'thor')).toBe(false)
    expect(local.replaceCollection('gods', [{ id: 'odin', name: '奥丁' }])).toBe(1)
    expect(local.count('gods')).toBe(1)
    expect(() => local.replaceCollection('gods', [{ id: 'a' }, { id: 'a' }])).toThrow()
    expect(() => local.replaceCollection('gods', [{ name: '缺少 id' }])).toThrow()
  })

  it('文档型集合 getDoc/saveDoc', () => {
    const local = createLocalDB()
      .defineCollection('gods', SEED_GODS)
      .defineDoc('dailyPicks', { god: 'odin', rune: 'ansuz' })
    expect(local.getDoc('dailyPicks').god).toBe('odin')
    local.saveDoc('dailyPicks', { god: 'thor', rune: 'fehu' })
    expect(local.getDoc('dailyPicks')).toEqual({ god: 'thor', rune: 'fehu' })
    expect(() => local.findAll('dailyPicks')).toThrow()
    expect(() => local.getDoc('gods')).toThrow()
  })
})

describe('localDB 持久化与种子版本', () => {
  let uniMock

  beforeEach(() => {
    uniMock = createUniMock()
    globalThis.uni = uniMock
  })

  it('写入持久化：同一种子的新实例可读到修改', () => {
    const first = createLocalDB().defineCollection('gods', SEED_GODS)
    first.update('gods', 'odin', { description: '本地修改' })

    const second = createLocalDB().defineCollection('gods', SEED_GODS)
    expect(second.findById('gods', 'odin').description).toBe('本地修改')
  })

  it('种子更新后：本地旧修改自动失效，恢复为新种子', () => {
    const first = createLocalDB().defineCollection('gods', SEED_GODS)
    first.update('gods', 'odin', { description: '本地修改' })

    const newSeed = SEED_GODS.map(g =>
      g.id === 'odin' ? { ...g, description: '种子已更新' } : g
    )
    const second = createLocalDB().defineCollection('gods', newSeed)
    expect(second.findById('gods', 'odin').description).toBe('种子已更新')
  })

  it('reset 恢复种子数据', () => {
    const local = createLocalDB().defineCollection('gods', SEED_GODS)
    local.update('gods', 'odin', { description: '本地修改' })
    local.insert('gods', { id: 'tyr', name: '提尔' })
    local.reset('gods')
    expect(local.count('gods')).toBe(3)
    expect(local.findById('gods', 'odin').description).toBe('原始文案')
  })

  it('exportJSON / importJSON 全库迁移', () => {
    const source = createLocalDB()
      .defineCollection('gods', SEED_GODS)
      .defineDoc('dailyPicks', { god: 'odin' })
    source.update('gods', 'odin', { description: '迁移后的文案' })
    const dump = source.exportJSON()

    const target = createLocalDB()
      .defineCollection('gods', [])
      .defineDoc('dailyPicks', {})
    const result = target.importJSON(dump)
    expect(result.applied).toContain('gods')
    expect(result.applied).toContain('dailyPicks')
    expect(target.findById('gods', 'odin').description).toBe('迁移后的文案')
    expect(target.getDoc('dailyPicks').god).toBe('odin')

    // 忽略未知集合与格式错误
    expect(target.importJSON('{ "collections": { "unknown": [] } }').ignored).toContain('unknown')
    expect(() => target.importJSON('{ "bad": 1 }')).toThrow()
  })
})

describe('项目数据库单例', () => {
  it('已注册全部文献集合', () => {
    const names = db.collectionNames()
    ;[
      'realms', 'gods', 'stories', 'creatures', 'runeDetails',
      'artifacts', 'timeline', 'worlds', 'worldTimelines'
    ].forEach(name => {
      expect(names, '缺少集合 ' + name).toContain(name)
    })
  })

  it('核心文献数据可正常读取', () => {
    expect(db.findById('gods', 'odin').name).toBe('奥丁')
    expect(db.count('realms')).toBe(9)
    expect(db.count('gods')).toBe(13)
    expect(db.count('creatures')).toBe(14)
    expect(db.count('runeDetails')).toBeGreaterThan(20)
    expect(db.count('stories')).toBeGreaterThan(0)
    expect(db.getDoc('worldTimelines')).toHaveProperty('asgard')
  })
})
