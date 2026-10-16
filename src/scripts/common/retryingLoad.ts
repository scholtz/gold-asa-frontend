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
  /** after this many retries of an incomplete (but not failed) result, retry only every minute */
  fastIncompleteRetries?: number
}

/**
 * Runs `load` immediately and again after `retryMs` whenever it throws or returns an incomplete
 * result, until it succeeds completely. Partial data is passed to `onData` right away.
 * Returns a function that stops all further attempts (call it when the component unmounts).
 */
const retryingLoad = <T>(input: IRetryingLoadInput<T>): (() => void) => {
  const { load, onData, retryMs = RETRY_DELAY_MS, fastIncompleteRetries = 6 } = input
  let stopped = false
  let incompleteRetries = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const schedule = (delayMs = retryMs) => {
    if (!stopped) timer = setTimeout(run, delayMs)
  }
  const run = async () => {
    let result: ILoadResult<T>
    try {
      result = await load()
    } catch (e: any) {
      console.error(`Loading failed, retrying in ${retryMs} ms: ${e?.message ?? e}`)
      schedule()
      return
    }
    if (stopped) return
    // a consumer error must not turn a finished load into an endless reload loop
    try {
      onData(result.data)
    } catch (e: any) {
      console.error(`Unable to use loaded data: ${e?.message ?? e}`)
      return
    }
    // a coin that can never load must not keep hammering algod and IPFS every 10 s
    if (!result.complete) {
      schedule(incompleteRetries++ < fastIncompleteRetries ? retryMs : SLOW_RETRY_DELAY_MS)
    }
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
