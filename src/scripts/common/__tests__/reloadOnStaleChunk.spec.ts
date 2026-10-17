import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isStaleChunkError, reloadOnce, reloadOnStaleChunk } from '../reloadOnStaleChunk'

const reload = vi.fn()
const originalLocation = window.location

afterEach(() => {
  Object.defineProperty(window, 'location', { value: originalLocation, configurable: true })
})

beforeEach(() => {
  sessionStorage.clear()
  reload.mockClear()
  Object.defineProperty(window, 'location', { value: { reload }, configurable: true })
})

describe('isStaleChunkError', () => {
  it('detects failed dynamic imports of the main browsers', () => {
    expect(
      isStaleChunkError(new TypeError('Failed to fetch dynamically imported module: x.js'))
    ).toBe(true)
    expect(isStaleChunkError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isStaleChunkError(new Error('Importing a module script failed.'))).toBe(true)
  })
  it('ignores other errors', () => {
    expect(isStaleChunkError(new Error('Network Error'))).toBe(false)
    expect(isStaleChunkError(undefined)).toBe(false)
  })
})

describe('reloadOnce', () => {
  it('reloads once, then not again within the interval', () => {
    expect(reloadOnce(1_000_000)).toBe(true)
    expect(reloadOnce(1_005_000)).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
    expect(reloadOnce(1_020_000)).toBe(true)
  })
})

describe('reloadOnStaleChunk', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'], now: Date.now() + 3_600_000 }))
  afterEach(() => vi.useRealTimers())
  it('reloads on router chunk errors and on vite:preloadError', () => {
    let handler: (e: unknown) => void = () => {}
    reloadOnStaleChunk({ onError: (h) => (handler = h) })
    handler(new Error('Failed to fetch dynamically imported module'))
    expect(reload).toHaveBeenCalledTimes(1)
    sessionStorage.clear()
    vi.setSystemTime(Date.now() + 60_000)
    window.dispatchEvent(new Event('vite:preloadError', { cancelable: true }))
    expect(reload).toHaveBeenCalledTimes(2)
  })
})
