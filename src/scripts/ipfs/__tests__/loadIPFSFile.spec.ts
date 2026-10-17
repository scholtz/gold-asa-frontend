import { describe, it, expect, vi, beforeEach } from 'vitest'

const get = vi.fn()
vi.mock('axios', () => ({ default: { get: (...args: unknown[]) => get(...args) } }))

import loadIPFSFile from '../loadIPFSFile'

const store = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  clear: () => store.clear()
})

const meta = { name: 'coin', properties: {} }
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
const seed = (hash: string, days: number, data: unknown = meta) =>
  localStorage.setItem(`ipfs-${hash}`, JSON.stringify({ time: daysAgo(days), data }))

describe('loadIPFSFile', () => {
  beforeEach(() => {
    localStorage.clear()
    get.mockReset()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('returns a fresh cache entry without any request', async () => {
    seed('h1', 1)
    expect(await loadIPFSFile('h1')).toEqual(meta)
    expect(get).not.toHaveBeenCalled()
  })

  it('fetches from the BFF and caches when the cache is expired', async () => {
    seed('h2', 40, { name: 'old' })
    get.mockResolvedValue({ data: meta })
    expect(await loadIPFSFile('h2')).toEqual(meta)
    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toBe('https://bff.asa.gold/ipfs/h2')
    expect(JSON.parse(localStorage.getItem('ipfs-h2')!).data).toEqual(meta)
  })

  it('retries the BFF once before falling back to the next gateway', async () => {
    get.mockRejectedValueOnce(new Error('net')).mockResolvedValueOnce({ data: meta })
    expect(await loadIPFSFile('h3')).toEqual(meta)
    expect(get.mock.calls.map((c) => c[0])).toEqual([
      'https://bff.asa.gold/ipfs/h3',
      'https://bff.asa.gold/ipfs/h3'
    ])
  })

  it('skips gateways that return a non-metadata body', async () => {
    get
      .mockResolvedValueOnce({ data: '<html>error</html>' })
      .mockResolvedValueOnce({ data: '<html>error</html>' })
      .mockResolvedValueOnce({ data: meta })
    expect(await loadIPFSFile('h4')).toEqual(meta)
    expect(get.mock.calls[2][0]).toBe('https://ipfs.io/ipfs/h4')
  })

  it('falls back to the expired cache when every gateway fails', async () => {
    seed('h5', 40)
    get.mockRejectedValue(new Error('net'))
    expect(await loadIPFSFile('h5')).toEqual(meta)
  })

  it('returns null when nothing is cached and every gateway fails', async () => {
    get.mockRejectedValue(new Error('net'))
    expect(await loadIPFSFile('h6')).toBeNull()
  })

  it('ignores a cached entry that is not a metadata object', async () => {
    seed('h7', 1, 'garbage')
    get.mockResolvedValue({ data: meta })
    expect(await loadIPFSFile('h7')).toEqual(meta)
    expect(get).toHaveBeenCalled()
  })
})
