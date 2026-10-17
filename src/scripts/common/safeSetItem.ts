/** localStorage cache write that never throws (quota exceeded, storage blocked in private mode) */
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch (e: any) {
    console.error(`Unable to cache ${key}: ${e?.message ?? e}`)
  }
}
export default safeSetItem
