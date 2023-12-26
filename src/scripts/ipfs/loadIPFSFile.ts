import axios from 'axios'
interface ICache {
  time: string
  data: any
}

export const loadIPFSFile = async (hash: string) => {
  const cacheKey = `ipfs-${hash}`
  const ipfsGateways = [
    'bff.asa.gold',
    'cloudflare-ipfs.com',
    'gateway.ipfs.io',
    'ipfs.io',
    'dweb.link'
  ]
  const cache = localStorage.getItem(cacheKey)
  if (cache) {
    try {
      const cacheObj = JSON.parse(cache) as ICache
      console.log('cacheObj', cacheObj)
      const cacheTime = new Date(cacheObj.time)
      const compareTime = new Date()
      compareTime.setDate(new Date().getDate() - 30) // cache for 30 days
      console.log('cacheTime > compareTime', cacheTime > compareTime, cacheTime, compareTime)
      if (cacheTime > compareTime) {
        return cacheObj.data
      }
    } catch (e: any) {
      console.log(`Error deserializing ipfs data ${hash}: ${e.message}`, e)
    }
  }

  let ipfsData
  for (let i = 0; i < ipfsGateways.length; i++) {
    // try every gateway, ive had some gateways be down so this should handle that.
    // can also always add more gateways
    // also thinking of adding a time limit instead of the 504 limit because that's a long time and if it takes longer than a second or two its probably not gonna connect
    try {
      console.log('fetching from', ipfsGateways[i])
      ipfsData = await axios.get(`https://${ipfsGateways[i]}/ipfs/${hash}`)
      if (ipfsData?.data) {
        break
      }
    } catch (e) {
      console.log(e)
    }
  }

  if (ipfsData?.data) {
    const cacheValue: ICache = { time: new Date().toISOString(), data: ipfsData?.data }
    localStorage.setItem(cacheKey, JSON.stringify(cacheValue))
    return ipfsData?.data
  }
  return null
  // return requests[0];
}

export default loadIPFSFile
