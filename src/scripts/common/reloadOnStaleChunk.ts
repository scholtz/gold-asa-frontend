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
 * With `target` it loads that URL instead, so a failed navigation still lands where the user clicked.
 * Returns false (and does nothing) if we already reloaded a moment ago, to avoid a reload loop
 * when the file is really missing.
 */
export const reloadOnce = (now = Date.now(), target?: string): boolean => {
  if (now - reloadedAt < MIN_INTERVAL_MS) return false
  try {
    const last = Number(sessionStorage.getItem(KEY) ?? 0)
    if (now - last < MIN_INTERVAL_MS) return false
    sessionStorage.setItem(KEY, String(now))
  } catch {
    // storage unavailable: the in-memory guard above still limits it to one reload per page load
  }
  reloadedAt = now
  if (target) window.location.assign(target)
  else window.location.reload()
  return true
}

/** Reload when a new deployment removed the chunks this (old) page still references. */
export const reloadOnStaleChunk = (router: {
  onError: (handler: (error: unknown, to?: { fullPath: string }) => void) => unknown
  resolve: (to: string) => { href: string }
}) => {
  // thrown by Vite when a dynamic import or its CSS fails to preload
  window.addEventListener('vite:preloadError', (event) => {
    // Defer so that router.onError (which knows the target route) gets the error first; this
    // covers lazy components that are not loaded by a navigation. The error is not swallowed.
    setTimeout(() => reloadOnce(), 0)
  })
  // route navigation to a lazy view whose chunk is gone; the navigation would otherwise stay stuck
  router.onError((error, to) => {
    if (isStaleChunkError(error) && reloadOnce(Date.now(), to && router.resolve(to.fullPath).href))
      return
    console.error(error)
  })
}
