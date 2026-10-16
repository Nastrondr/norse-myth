import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 模拟 uni storage（与 state.test.js 同款）
function createUniMock() {
  const store = new Map()
  return {
    store,
    uni: {
      setStorageSync(key, value) {
        store.set(key, JSON.parse(JSON.stringify(value)))
      },
      getStorageSync(key) {
        return store.has(key) ? JSON.parse(JSON.stringify(store.get(key))) : ''
      },
      removeStorageSync(key) {
        store.delete(key)
      },
      getStorageInfoSync() {
        return { keys: [...store.keys()] }
      }
    }
  }
}

async function freshState() {
  vi.resetModules()
  return await import('../src/state/index.js')
}

function readSrc(...segments) {
  return readFileSync(path.join(__dirname, '..', 'src', ...segments), 'utf8')
}

describe('主题设置（settings.theme）', () => {
  let mock
  beforeEach(() => {
    mock = createUniMock()
    globalThis.uni = mock.uni
  })

  it('未设置时默认主题为 dark', async () => {
    const { state } = await freshState()
    expect(state.get('settings.theme', 'dark')).toBe('dark')
  })

  it('写入 light 后读回 light，且不影响 settings 下其他字段', async () => {
    const { state } = await freshState()
    state.set('settings.bgmEnabled', true)
    state.set('settings.theme', 'light')
    expect(state.get('settings.theme', 'dark')).toBe('light')
    expect(state.get('settings.bgmEnabled')).toBe(true)
  })

  it('主题值跨模块实例持久化（同一存储分片）', async () => {
    const { state } = await freshState()
    state.set('settings.theme', 'light')
    const { state: state2 } = await freshState()
    expect(state2.get('settings.theme', 'dark')).toBe('light')
  })

  it('settings 页已注册为分包路由', () => {
    const pagesJson = readSrc('pages.json')
    expect(pagesJson).toContain('"root": "pages/settings"')
    expect(pagesJson).toContain('"path": "settings"')
  })

  it('App 启动时应用持久化主题，设置页写入主题与 data-theme', () => {
    const appVue = readSrc('App.vue')
    expect(appVue).toContain("state.get('settings.theme', 'dark')")
    expect(appVue).toContain("setAttribute('data-theme'")

    const settingsVue = readSrc('pages', 'settings', 'settings.vue')
    expect(settingsVue).toContain("state.set('settings.theme', value)")
    expect(settingsVue).toContain("setAttribute('data-theme', value)")
  })
})
