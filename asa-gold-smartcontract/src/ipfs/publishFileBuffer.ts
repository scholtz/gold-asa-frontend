import getClient from './getClient'

/**
 * Uploads the string content to IPFS
 * @param {string} content - Content of the file to be uploaded
 * @returns - IPFS link or undefined
 */
const publishFileBuffer = async (content: Buffer): Promise<string> => {
  try {
    const ipfs = getClient()
    if (ipfs) {
      const added = await ipfs.add(content)
      return added.path
    }
  } catch (e) {
    console.error(e)
  }
  return ''
}
export default publishFileBuffer
