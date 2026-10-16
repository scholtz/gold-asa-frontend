import { describe, expect, it, vi } from 'vitest'
import algosdk from 'algosdk'
import { createBiatecAuth } from '../biatecAuth'
import { RouterAuthRequiredError } from '../types'

const params = (): algosdk.SuggestedParams => ({
  fee: 0n,
  flatFee: true,
  firstValid: 1000n,
  lastValid: 2000n,
  genesisID: 'mainnet-v1.0',
  genesisHash: new Uint8Array(32).fill(1),
  minFee: 1000n
})

const setup = (account = algosdk.generateAccount()) => {
  let now = 1_000_000
  const sign = vi.fn(async (encoded: Uint8Array[]) =>
    encoded.map((bytes) => algosdk.decodeUnsignedTransaction(bytes).signTxn(account.sk))
  )
  const state = { account: account.addr.toString() }
  const auth = createBiatecAuth({
    getAccount: () => state.account,
    sign,
    getParams: async () => params(),
    now: () => now
  })
  return { auth, sign, state, advance: (ms: number) => (now += ms) }
}

describe('createBiatecAuth', () => {
  it('requires a logged in account', async () => {
    const { auth, state } = setup()
    state.account = ''
    await expect(auth.getHeader()).rejects.toBeInstanceOf(RouterAuthRequiredError)
  })

  it('signs a BiatecRouter ARC-14 transaction and formats the header', async () => {
    const { auth } = setup()
    const header = await auth.getHeader()
    expect(header.startsWith('SigTx ')).toBe(true)
    const signed = algosdk.decodeSignedTransaction(Buffer.from(header.slice(6), 'base64'))
    expect(new TextDecoder().decode(signed.txn.note)).toBe('BiatecRouter#ARC14')
    expect(signed.txn.sender.toString()).toBe(signed.txn.payment!.receiver.toString())
    expect(signed.txn.payment!.amount).toBe(0n)
    expect(signed.txn.fee).toBe(0n)
  })

  it('caches the header and asks the wallet once for parallel calls', async () => {
    const { auth, sign } = setup()
    const [a, b, c] = await Promise.all([auth.getHeader(), auth.getHeader(), auth.getHeader()])
    expect(a).toBe(b)
    expect(b).toBe(c)
    await auth.getHeader()
    expect(sign).toHaveBeenCalledTimes(1)
  })

  it('refreshes after expiry and after invalidate', async () => {
    const { auth, sign, advance } = setup()
    await auth.getHeader()
    advance(31 * 60 * 1000)
    await auth.getHeader()
    expect(sign).toHaveBeenCalledTimes(2)
    auth.invalidate()
    await auth.getHeader()
    expect(sign).toHaveBeenCalledTimes(3)
  })

  it('does not reuse a header for another account', async () => {
    const { auth, sign, state } = setup()
    await auth.getHeader()
    state.account = algosdk.generateAccount().addr.toString()
    await auth.getHeader()
    expect(sign).toHaveBeenCalledTimes(2)
  })

  it('stops prompting after a declined signature until reset', async () => {
    const account = algosdk.generateAccount()
    const sign = vi.fn(async () => {
      throw new Error('User rejected')
    })
    const auth = createBiatecAuth({
      getAccount: () => account.addr.toString(),
      sign,
      getParams: async () => params()
    })
    await expect(auth.getHeader()).rejects.toThrow('User rejected')
    await expect(auth.getHeader()).rejects.toBeInstanceOf(RouterAuthRequiredError)
    expect(sign).toHaveBeenCalledTimes(1)
    auth.reset()
    await expect(auth.getHeader()).rejects.toThrow('User rejected')
    expect(sign).toHaveBeenCalledTimes(2)
  })
})
