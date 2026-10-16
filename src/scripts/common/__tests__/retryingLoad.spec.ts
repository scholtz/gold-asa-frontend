import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import retryingLoad from '../retryingLoad'

describe('retryingLoad', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('retries after 10 seconds when the load throws', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue({ data: 'ok', complete: true })
    const onData = vi.fn()
    retryingLoad({ load, onData })
    await vi.advanceTimersByTimeAsync(0)
    expect(onData).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(9_999)
    expect(load).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(load).toHaveBeenCalledTimes(2)
    expect(onData).toHaveBeenCalledWith('ok')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('publishes partial data and keeps retrying until complete', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce({ data: [1], complete: false })
      .mockResolvedValue({ data: [1, 2], complete: true })
    const onData = vi.fn()
    retryingLoad({ load, onData })
    await vi.advanceTimersByTimeAsync(0)
    expect(onData).toHaveBeenLastCalledWith([1])
    await vi.advanceTimersByTimeAsync(10_000)
    expect(onData).toHaveBeenLastCalledWith([1, 2])
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('stops retrying once stopped', async () => {
    const load = vi.fn().mockRejectedValue(new Error('down'))
    const stop = retryingLoad({ load, onData: vi.fn() })
    await vi.advanceTimersByTimeAsync(0)
    stop()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('ignores a result that arrives after stop', async () => {
    let resolve!: (v: { data: string; complete: boolean }) => void
    const load = vi.fn().mockReturnValue(new Promise((r) => (resolve = r)))
    const onData = vi.fn()
    const stop = retryingLoad({ load, onData })
    stop()
    resolve({ data: 'late', complete: false })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(onData).not.toHaveBeenCalled()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not reload when the consumer throws on a complete result', async () => {
    const load = vi.fn().mockResolvedValue({ data: 1, complete: true })
    retryingLoad({
      load,
      onData: () => {
        throw new Error('consumer bug')
      }
    })
    await vi.advanceTimersByTimeAsync(60_000)
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('slows down retries after the fast retries, for failures as well as incomplete results', async () => {
    for (const load of [
      vi.fn().mockResolvedValue({ data: 1, complete: false }),
      vi.fn().mockRejectedValue(new Error('down'))
    ]) {
      const stop = retryingLoad({ load, onData: vi.fn(), fastRetries: 2 })
      await vi.advanceTimersByTimeAsync(20_000)
      expect(load).toHaveBeenCalledTimes(3)
      await vi.advanceTimersByTimeAsync(59_999)
      expect(load).toHaveBeenCalledTimes(3)
      await vi.advanceTimersByTimeAsync(1)
      expect(load).toHaveBeenCalledTimes(4)
      stop()
    }
  })

  it('keeps retrying when the consumer throws on an incomplete result', async () => {
    const load = vi.fn().mockResolvedValue({ data: 1, complete: false })
    const stop = retryingLoad({
      load,
      onData: () => {
        throw new Error('consumer bug')
      }
    })
    await vi.advanceTimersByTimeAsync(10_000)
    expect(load).toHaveBeenCalledTimes(2)
    stop()
  })
})
