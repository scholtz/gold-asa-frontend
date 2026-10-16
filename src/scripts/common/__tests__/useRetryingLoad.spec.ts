import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useRetryingLoad } from '../retryingLoad'

describe('useRetryingLoad', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('loads on mount, retries, and stops on unmount', async () => {
    const load = vi.fn().mockRejectedValue(new Error('down'))
    const wrapper = mount(
      defineComponent({
        setup() {
          useRetryingLoad({ load, onData: vi.fn() })
          return () => null
        }
      })
    )
    await vi.advanceTimersByTimeAsync(0)
    expect(load).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(10_000)
    expect(load).toHaveBeenCalledTimes(2)
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(load).toHaveBeenCalledTimes(2)
  })
})
