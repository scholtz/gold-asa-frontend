import { onMounted, onUnmounted } from 'vue'

export const RETRY_DELAY_MS = 10_000
export const SLOW_RETRY_DELAY_MS = 60_000

export interface ILoadResult<T> {
  data: T
  /** false when part of the data could not be loaded and another attempt is worthwhile */
  complete: boolean
}

export interface IRetryingLoadInput<T> {
  load: () => Promise<ILoadResult<T>>
  onData: (data: T) => void
  retryMs?: number
  /** after this many retries, retry only every SLOW_RETRY_DELAY_MS */
  fastRetries?: number
}

/**
 * Runs `load` immediately and again after `retryMs` whenever it throws or returns an incomplete
 * result, until it succeeds completely. Partial data is passed to `onData` right away.
 * Returns a function that stops all further attempts (call it when the component unmounts).
 */
const retryingLoad = <T>(input: IRetryingLoadInput<T>): (() => void) => {
  const { load, onData, retryMs = RETRY_DELAY_MS, fastRetries = 6 } = input
  let stopped = false
  let retries = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  // retry quickly a few times, then only once a minute so a permanent problem does not hammer algod
  const schedule = () => {
    if (stopped) return
    timer = setTimeout(run, retries++ < fastRetries ? retryMs : SLOW_RETRY_DELAY_MS)
  }
  const run = async () => {
    let result: ILoadResult<T>
    try {
      result = await load()
    } catch (e: any) {
      console.error(`Loading failed, retrying: ${e?.message ?? e}`)
      schedule()
      return
    }
    if (stopped) return
    try {
      onData(result.data)
    } catch (e: any) {
      console.error(`Unable to use loaded data: ${e?.message ?? e}`)
      // a consumer error must not turn a finished load into an endless reload loop
      if (result.complete) return
    }
    if (!result.complete) schedule()
  }

  run()
  return () => {
    stopped = true
    if (timer) clearTimeout(timer)
  }
}
/** Component helper: starts `retryingLoad` on mount and stops it on unmount. */
export const useRetryingLoad = <T>(input: IRetryingLoadInput<T>) => {
  let stop: (() => void) | undefined
  onMounted(() => {
    stop = retryingLoad(input)
  })
  onUnmounted(() => stop?.())
}
export default retryingLoad
