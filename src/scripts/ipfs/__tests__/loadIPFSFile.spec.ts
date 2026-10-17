import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
const html = { data: '<html>error</html>' }
const status = (code: number) => ({ response: { status: code } })
const urls = () => get.mock.calls.map((c) => c[0])
const load = async (hash: string) => {
  const promise = loadIPFSFile(hash)
  await vi.runAllTimersAsync()
  return promise
}

describe('loadIPFSFile', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    get.mockReset()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => vi.useRealTimers())

  it('returns a cached entry of any age without a request', async () => {
    localStorage.setItem('ipfs-h1', JSON.stringify({ time: '2020-01-01T00:00:00Z', data: meta }))
    expect(await load('h1')).toEqual(meta)
    expect(get).not.toHaveBeenCalled()
  })

  it('ignores a cached entry that is not a metadata object', async () => {
    localStorage.setItem('ipfs-h2', JSON.stringify({ time: '2020-01-01T00:00:00Z', data: 'x' }))
    get.mockResolvedValue({ data: meta })
    expect(await load('h2')).toEqual(meta)
    expect(get).toHaveBeenCalledTimes(1)
  })

  it('fetches from the BFF and caches the result', async () => {
    get.mockResolvedValue({ data: meta })
    expect(await load('h3')).toEqual(meta)
    expect(urls()).toEqual(['https://bff.asa.gold/ipfs/h3'])
    expect(JSON.parse(localStorage.getItem('ipfs-h3')!).data).toEqual(meta)
  })

  it.each([
    ['a network error', { code: 'ERR_NETWORK' }],
    ['a 503', status(503)],
    ['a 429', status(429)]
  ])('retries the BFF once after %s', async (_name, error) => {
    get.mockRejectedValueOnce(error).mockResolvedValueOnce({ data: meta })
    expect(await load('h4')).toEqual(meta)
    expect(urls()).toEqual(['https://bff.asa.gold/ipfs/h4', 'https://bff.asa.gold/ipfs/h4'])
  })

  it('retries the BFF once after a non-metadata body', async () => {
    get.mockResolvedValueOnce(html).mockResolvedValueOnce({ data: meta })
    expect(await load('h5')).toEqual(meta)
    expect(urls()).toEqual(['https://bff.asa.gold/ipfs/h5', 'https://bff.asa.gold/ipfs/h5'])
  })

  it.each([
    ['a 404', status(404)],
    ['a timeout', { code: 'ECONNABORTED' }]
  ])('does not retry %s, it moves on to the next gateway', async (_name, error) => {
    get.mockRejectedValueOnce(error).mockResolvedValueOnce({ data: meta })
    expect(await load('h6')).toEqual(meta)
    expect(urls()).toEqual(['https://bff.asa.gold/ipfs/h6', 'https://ipfs.io/ipfs/h6'])
  })

  it('does not retry the public gateways', async () => {
    get.mockRejectedValue(status(503))
    expect(await load('h7')).toBeNull()
    expect(urls()).toEqual([
      'https://bff.asa.gold/ipfs/h7',
      'https://bff.asa.gold/ipfs/h7',
      'https://ipfs.io/ipfs/h7',
      'https://dweb.link/ipfs/h7'
    ])
  })

  it('returns null and caches nothing when every gateway fails', async () => {
    get.mockRejectedValue(status(404))
    expect(await load('h8')).toBeNull()
    expect(localStorage.getItem('ipfs-h8')).toBeNull()
  })

  it('shares one request between concurrent calls, each caller gets its own copy', async () => {
    get.mockResolvedValue({ data: meta })
    const [a, b] = await Promise.all([load('h9'), load('h9')])
    expect(get).toHaveBeenCalledTimes(1)
    expect(a).toEqual(meta)
    expect(a).not.toBe(b)
  })
})
