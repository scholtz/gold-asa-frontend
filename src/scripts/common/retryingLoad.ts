export const RETRY_DELAY_MS = 10_000

export interface ILoadResult<T> {
  data: T
  /** false when part of the data could not be loaded and another attempt is worthwhile */
  complete: boolean
}

interface IInput<T> {
  load: () => Promise<ILoadResult<T>>
  onData: (data: T) => void
  retryMs?: number
  /** how often an incomplete (but not failed) result is retried; failures retry indefinitely */
  maxIncompleteRetries?: number
}

/**
 * Runs `load` immediately and again after `retryMs` whenever it throws or returns an incomplete
 * result, until it succeeds completely. Partial data is passed to `onData` right away.
 * Returns a function that stops all further attempts (call it when the component unmounts).
 */
const retryingLoad = <T>(input: IInput<T>): (() => void) => {
  const { load, onData, retryMs = RETRY_DELAY_MS, maxIncompleteRetries = 6 } = input
  let stopped = false
  let incompleteRetries = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  const schedule = () => {
    if (!stopped) timer = setTimeout(run, retryMs)
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
    if (!result.complete && incompleteRetries++ < maxIncompleteRetries) schedule()
  }

  run()
  return () => {
    stopped = true
    if (timer) clearTimeout(timer)
  }
}
export default retryingLoad
