const KEY = 'staleChunkReloadAt'
const MIN_INTERVAL_MS = 10_000

const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Failed to load module script|Loading chunk \d+ failed/i

/** True when the error means a lazy-loaded file is gone, i.e. a new version was deployed. */
export const isStaleChunkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return CHUNK_ERROR.test(message)
}

let reloadedAt = 0

/**
 * Reload the page once so the browser fetches the new index.html and its current chunk names.
 * Returns false (and does nothing) if we already reloaded a moment ago, to avoid a reload loop
 * when the file is really missing.
 */
export const reloadOnce = (now = Date.now()): boolean => {
  if (now - reloadedAt < MIN_INTERVAL_MS) return false
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (now - last < MIN_INTERVAL_MS) return false
    sessionStorage.setItem(KEY, String(now))
  } catch {
    // storage unavailable: the in-memory guard above still limits it to one reload per page load
  }
  reloadedAt = now
  window.location.reload()
  return true
}

/** Reload when a new deployment removed the chunks this (old) page still references. */
export const reloadOnStaleChunk = (router: {
  onError: (handler: (error: unknown) => void) => unknown
}) => {
  // thrown by Vite when a dynamic import or its CSS fails to preload
  window.addEventListener('vite:preloadError', (event) => {
    // only swallow the error when we are reloading; otherwise let it surface
    if (reloadOnce()) event.preventDefault()
  })
  // route navigation to a lazy view whose chunk is gone; the navigation would otherwise stay stuck
  router.onError((error) => {
    if (isStaleChunkError(error) && reloadOnce()) return
    console.error(error)
  })
}
