/** true for an algod/HTTP 404, which will not go away by retrying */
const isNotFound = (e: any): boolean => (e?.status ?? e?.response?.status) === 404
export default isNotFound
