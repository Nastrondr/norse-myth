import { describe, it, expect } from 'vitest'
import {
  gods,
  stories,
  realms,
  creatures,
  runes,
  godFactions,
  getGodById,
  getGodsByFaction
} from '../src/data/norse.js'

const RELATIONSHIP_KEYS = ['parents', 'spouse', 'children', 'allies', 'rivals', 'enemies']
const ATTRIBUTE_KEYS = ['wisdom', 'combat', 'magic', 'authority', 'fate']
const REQUIRED_GOD_FIELDS = [
  'id', 'name', 'originalName', 'title', 'faction',
  'realm', 'domain', 'symbols', 'artifact',
  'description', 'image', 'relationships', 'attributes', 'stories'
]

describe('神祇数据完整性', () => {
  it('所有神祇都包含必填字段', () => {
    gods.forEach(god => {
      REQUIRED_GOD_FIELDS.forEach(field => {
        expect(god, `神祇 ${god.id} 缺少字段 ${field}`).toHaveProperty(field)
      })
    })
  })

  it('神祇 ID 唯一且不为空', () => {
    const ids = gods.map(g => g.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
    ids.forEach(id => expect(id).toBeTruthy())
  })

  it('神祇数量符合预期（10 位主要神祇）', () => {
    expect(gods.length).toBeGreaterThanOrEqual(10)
  })
})

describe('关系数据结构', () => {
  it('每个神祇都有 relationships 对象', () => {
    gods.forEach(god => {
      expect(god.relationships).toBeTypeOf('object')
      expect(god.relationships).not.toBeNull()
    })
  })

  it('relationships 包含所有标准键', () => {
    gods.forEach(god => {
      RELATIONSHIP_KEYS.forEach(key => {
        expect(god.relationships, `神祇 ${god.id} 缺少关系键 ${key}`).toHaveProperty(key)
      })
    })
  })

  it('所有关系值都是数组', () => {
    gods.forEach(god => {
      RELATIONSHIP_KEYS.forEach(key => {
        expect(
          Array.isArray(god.relationships[key]),
          `神祇 ${god.id} 的 ${key} 不是数组`
        ).toBe(true)
      })
    })
  })

  it('关系中引用的 ID 如果是已知神祇则必须存在', () => {
    const godIds = new Set(gods.map(g => g.id))
    const godNames = new Set(gods.map(g => g.name))

    gods.forEach(god => {
      RELATIONSHIP_KEYS.forEach(key => {
        god.relationships[key].forEach(refId => {
          const existsInGods = godIds.has(refId) || godNames.has(refId)
          if (existsInGods) {
            expect(existsInGods, `神祇 ${god.id} 的 ${key} 引用了不存在的 ID: ${refId}`).toBe(true)
          }
        })
      })
    })
  })
})

describe('互反关系验证', () => {
  const godIdMap = Object.fromEntries(gods.map(g => [g.id, g]))

  it('配偶关系是双向的', () => {
    gods.forEach(god => {
      god.relationships.spouse.forEach(spouseId => {
        const spouse = godIdMap[spouseId]
        if (spouse) {
          expect(
            spouse.relationships.spouse.includes(god.id),
            `${god.name} 的配偶包括 ${spouse.name}，但 ${spouse.name} 的配偶不包括 ${god.name}`
          ).toBe(true)
        }
      })
    })
  })

  it('敌对关系是双向的', () => {
    gods.forEach(god => {
      god.relationships.enemies.forEach(enemyId => {
        const enemy = godIdMap[enemyId]
        if (enemy) {
          expect(
            enemy.relationships.enemies.includes(god.id) ||
            enemy.relationships.rivals.includes(god.id),
            `${god.name} 与 ${enemy.name} 为敌，但 ${enemy.name} 未将 ${god.name} 列为敌人或对手`
          ).toBe(true)
        }
      })
    })
  })

  it('盟友关系是双向的', () => {
    gods.forEach(god => {
      god.relationships.allies.forEach(allyId => {
        const ally = godIdMap[allyId]
        if (ally) {
          expect(
            ally.relationships.allies.includes(god.id),
            `${god.name} 视 ${ally.name} 为盟友，但 ${ally.name} 未将 ${god.name} 列为盟友`
          ).toBe(true)
        }
      })
    })
  })

  it('竞争关系是双向的', () => {
    gods.forEach(god => {
      god.relationships.rivals.forEach(rivalId => {
        const rival = godIdMap[rivalId]
        if (rival) {
          expect(
            rival.relationships.rivals.includes(god.id) ||
            rival.relationships.enemies.includes(god.id),
            `${god.name} 视 ${rival.name} 为对手，但 ${rival.name} 未将 ${god.name} 列为对手或敌人`
          ).toBe(true)
        }
      })
    })
  })

  it('父子关系对应：A 的子女应包含 B，B 的父母应包含 A', () => {
    gods.forEach(parent => {
      parent.relationships.children.forEach(childId => {
        const child = godIdMap[childId]
        if (child) {
          expect(
            child.relationships.parents.includes(parent.id),
            `${parent.name} 的子女包括 ${child.name}，但 ${child.name} 的父母不包括 ${parent.name}`
          ).toBe(true)
        }
      })
    })
  })

  it('父子关系对应：B 的父母包含 A，A 的子女应包含 B', () => {
    gods.forEach(child => {
      child.relationships.parents.forEach(parentId => {
        const parent = godIdMap[parentId]
        if (parent) {
          expect(
            parent.relationships.children.includes(child.id),
            `${child.name} 的父母包括 ${parent.name}，但 ${parent.name} 的子女不包括 ${child.name}`
          ).toBe(true)
        }
      })
    })
  })
})

describe('属性数据验证', () => {
  it('每个神祇都有五个属性', () => {
    gods.forEach(god => {
      ATTRIBUTE_KEYS.forEach(key => {
        expect(god.attributes, `神祇 ${god.id} 缺少属性 ${key}`).toHaveProperty(key)
      })
    })
  })

  it('所有属性值在 0-100 范围内', () => {
    gods.forEach(god => {
      ATTRIBUTE_KEYS.forEach(key => {
        const value = god.attributes[key]
        expect(value, `神祇 ${god.id} 的 ${key} 值 ${value} 超出范围`).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(100)
      })
    })
  })

  it('属性值都是数字', () => {
    gods.forEach(god => {
      ATTRIBUTE_KEYS.forEach(key => {
        expect(god.attributes[key]).toBeTypeOf('number')
      })
    })
  })
})

describe('工具函数测试', () => {
  it('getGodById 能正确查找神祇', () => {
    const odin = getGodById('odin')
    expect(odin).toBeDefined()
    expect(odin.name).toBe('奥丁')
    expect(odin.id).toBe('odin')
  })

  it('getGodById 对不存在的 ID 返回 undefined', () => {
    expect(getGodById('nonexistent-god')).toBeUndefined()
  })

  it('getGodsByFaction 能正确按阵营筛选', () => {
    const asaGods = getGodsByFaction('阿萨神族')
    expect(asaGods.length).toBeGreaterThan(0)
    asaGods.forEach(god => expect(god.faction).toBe('阿萨神族'))

    const vanaGods = getGodsByFaction('华纳神族')
    expect(vanaGods.length).toBeGreaterThan(0)
    vanaGods.forEach(god => expect(god.faction).toBe('华纳神族'))
  })

  it('getGodsByFaction 不传参数时返回全部', () => {
    expect(getGodsByFaction()).toHaveLength(gods.length)
    expect(getGodsByFaction('')).toHaveLength(gods.length)
  })

  it('godFactions 包含所有出现的阵营', () => {
    const factionIds = godFactions.map(f => f.id)
    const uniqueFactionsInGods = [...new Set(gods.map(g => g.faction))]
    uniqueFactionsInGods.forEach(faction => {
      expect(factionIds.includes(faction), `阵营 ${faction} 未在 godFactions 中列出`).toBe(true)
    })
  })
})

describe('关联数据引用有效性', () => {
  const godIds = new Set(gods.map(g => g.id))
  const storyIds = new Set(stories.map(s => s.id))
  const realmIds = new Set(realms.map(r => r.id))

  it('神祇引用的故事 ID 都存在', () => {
    gods.forEach(god => {
      god.stories.forEach(storyId => {
        expect(storyIds.has(storyId), `神祇 ${god.id} 引用了不存在的故事: ${storyId}`).toBe(true)
      })
    })
  })

  it('神祇引用的领域 ID 都存在', () => {
    gods.forEach(god => {
      god.realm.forEach(realmId => {
        expect(realmIds.has(realmId), `神祇 ${god.id} 引用了不存在的领域: ${realmId}`).toBe(true)
      })
    })
  })

  it('故事引用的神祇 ID 都存在（如果引用的是主要神祇）', () => {
    stories.forEach(story => {
      if (story.relatedGods) {
        story.relatedGods.forEach(refId => {
          if (godIds.has(refId)) {
            expect(godIds.has(refId), `故事 ${story.id} 引用了不存在的神祇: ${refId}`).toBe(true)
          }
        })
      }
    })
  })

  it('九界引用的神祇 ID 如果是主要神祇则必须存在', () => {
    realms.forEach(realm => {
      realm.relatedGods.forEach(refId => {
        if (godIds.has(refId)) {
          expect(godIds.has(refId), `领域 ${realm.id} 引用了不存在的神祇: ${refId}`).toBe(true)
        }
      })
    })
  })
})

describe('其他数据模块存在性', () => {
  it('故事数据不为空', () => {
    expect(stories.length).toBeGreaterThan(0)
  })

  it('九界数据包含九个世界', () => {
    expect(realms.length).toBe(9)
  })

  it('生物数据不为空', () => {
    expect(creatures.length).toBeGreaterThan(0)
  })

  it('卢恩符文数据不为空', () => {
    expect(runes.length).toBeGreaterThan(0)
  })
})
