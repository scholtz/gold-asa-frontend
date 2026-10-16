import { describe, expect, it, vi } from 'vitest'
import { createPublicKey, verify } from 'node:crypto'
import algosdk from 'algosdk'
import { createBiatecAuth } from '../biatecAuth'

const params = (): algosdk.SuggestedParams => ({
  fee: 0n,
  flatFee: true,
  firstValid: 1000n,
  lastValid: 2000n,
  genesisID: 'mainnet-v1.0',
  genesisHash: new Uint8Array(32).fill(1),
  minFee: 1000n
})

const setup = (scope = 'https://router.api.biatec.io') => {
  let now = 1_000_000
  const state = { scope }
  const getParams = vi.fn(async () => params())
  const generateAccount = vi.fn(() => algosdk.generateAccount())
  const auth = createBiatecAuth({
    getParams,
    generateAccount,
    getScope: () => state.scope,
    now: () => now
  })
  return { auth, getParams, generateAccount, state, advance: (ms: number) => (now += ms) }
}

const decode = (header: string) =>
  algosdk.decodeSignedTransaction(Buffer.from(header.replace(/^SigTx /, ''), 'base64'))

describe('createBiatecAuth (random session account)', () => {
  it('creates a signed BiatecRouter ARC-14 header without any user interaction', async () => {
    const { auth } = setup()
    const header = await auth.getHeader()
    expect(header.startsWith('SigTx ')).toBe(true)
    const signed = decode(header)
    expect(new TextDecoder().decode(signed.txn.note)).toBe('BiatecRouter#ARC14')
    expect(signed.txn.sender.toString()).toBe(signed.txn.payment!.receiver.toString())
    expect(signed.txn.payment!.amount).toBe(0n)
    expect(signed.txn.fee).toBe(0n)
    expect(signed.sig).toBeDefined()
  })

  it('has a valid Ed25519 signature of the session account', async () => {
    const { auth } = setup()
    const signed = decode(await auth.getHeader())
    const key = createPublicKey({
      key: Buffer.concat([
        Buffer.from('302a300506032b6570032100', 'hex'),
        Buffer.from(signed.txn.sender.publicKey)
      ]),
      format: 'der',
      type: 'spki'
    })
    const message = Buffer.concat([
      Buffer.from('TX'),
      Buffer.from(algosdk.encodeUnsignedTransaction(signed.txn))
    ])
    expect(verify(null, message, key, Buffer.from(signed.sig!))).toBe(true)
  })

  it('uses a random account per session and keeps it for all headers of the session', async () => {
    const one = setup()
    const two = setup()
    const a = decode(await one.auth.getHeader()).txn.sender.toString()
    const b = decode(await two.auth.getHeader()).txn.sender.toString()
    expect(a).not.toBe(b)
    expect(one.auth.sessionAddress).toBe(a)
    one.advance(31 * 60 * 1000)
    const again = decode(await one.auth.getHeader()).txn.sender.toString()
    expect(again).toBe(a)
    expect(one.generateAccount).toHaveBeenCalledTimes(1)
  })

  it('caches the header and shares one creation between parallel calls', async () => {
    const { auth, getParams } = setup()
    const [a, b, c] = await Promise.all([auth.getHeader(), auth.getHeader(), auth.getHeader()])
    expect(a).toBe(b)
    expect(b).toBe(c)
    await auth.getHeader()
    expect(getParams).toHaveBeenCalledTimes(1)
  })

  it('refreshes after expiry', async () => {
    const { auth, getParams, advance } = setup()
    await auth.getHeader()
    advance(31 * 60 * 1000)
    await auth.getHeader()
    expect(getParams).toHaveBeenCalledTimes(2)
  })

  it('drops a rejected header, but keeps one that was just created', async () => {
    const { auth, getParams, advance } = setup()
    await auth.getHeader()
    auth.invalidate() // late rejection of an older header: ignored
    await auth.getHeader()
    expect(getParams).toHaveBeenCalledTimes(1)
    advance(11 * 1000)
    auth.invalidate()
    await auth.getHeader()
    expect(getParams).toHaveBeenCalledTimes(2)
  })

  it('does not reuse a header for another scope (router host)', async () => {
    const { auth, getParams, state } = setup()
    await auth.getHeader()
    state.scope = 'https://other.example.com'
    await auth.getHeader()
    expect(getParams).toHaveBeenCalledTimes(2)
  })

  it('retries after a failed creation (e.g. algod down)', async () => {
    let fail = true
    const auth = createBiatecAuth({
      getParams: async () => {
        if (fail) throw new Error('algod down')
        return params()
      }
    })
    await expect(auth.getHeader()).rejects.toThrow('algod down')
    fail = false
    await expect(auth.getHeader()).resolves.toContain('SigTx ')
  })
})
