/** localStorage cache read that never throws (storage blocked in private mode) */
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch (e: any) {
    console.error(`Unable to read cache ${key}: ${e?.message ?? e}`)
    return null
  }
}
export default safeGetItem
