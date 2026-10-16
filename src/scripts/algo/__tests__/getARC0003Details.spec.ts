import { beforeEach, describe, expect, it, vi } from 'vitest'

const getAsa = vi.fn()
const loadIPFSFile = vi.fn()
const getBoxFromCache = vi.fn()

vi.mock('../getAsa', () => ({ default: (i: any) => getAsa(i) }))
vi.mock('../../ipfs/loadIPFSFile', () => ({ default: (h: string) => loadIPFSFile(h) }))
vi.mock('../getBoxFromCache', () => ({ default: (i: any) => getBoxFromCache(i) }))
vi.mock('@/stores/app', () => ({ useAppStore: () => ({ state: { appId: 1 } }) }))

import getARC0003Details from '../getARC0003Details'

const input = { client: {} as any, assetId: 5 }
const token = { params: { url: 'ipfs://abc#arc3' } }
const nft = { properties: { pictures: [{ thumbnail: 't' }] } }

describe('getARC0003Details', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    getAsa.mockReset().mockResolvedValue(token)
    loadIPFSFile.mockReset().mockResolvedValue(nft)
    getBoxFromCache.mockReset().mockResolvedValue({ value: new Uint8Array(10) })
  })

  it('returns null for an asset without ARC3 url', async () => {
    getAsa.mockResolvedValue({ params: {} })
    expect(await getARC0003Details(input)).toBeNull()
  })

  it('throws when the IPFS metadata cannot be loaded (transient)', async () => {
    loadIPFSFile.mockResolvedValue(null)
    await expect(getARC0003Details(input)).rejects.toThrow('IPFS')
  })

  it('throws on a transient algod error', async () => {
    getAsa.mockRejectedValue(Object.assign(new Error('boom'), { status: 500 }))
    await expect(getARC0003Details(input)).rejects.toThrow('boom')
  })

  it('returns null when the asset does not exist (404)', async () => {
    getAsa.mockRejectedValue(Object.assign(new Error('nf'), { status: 404 }))
    expect(await getARC0003Details(input)).toBeNull()
  })

  it('returns null when the box does not exist (404)', async () => {
    getBoxFromCache.mockRejectedValue(Object.assign(new Error('nf'), { response: { status: 404 } }))
    expect(await getARC0003Details(input)).toBeNull()
  })

  it('returns null when the box data is invalid', async () => {
    // 10 bytes is not a valid 192 byte box
    expect(await getARC0003Details(input)).toBeNull()
  })
})
