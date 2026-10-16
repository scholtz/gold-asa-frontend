import type algosdk from 'algosdk2'
import getAsa from './getAsa'
import type INFTDetail from '@/types/INFTDetail'
import loadIPFSFile from '../ipfs/loadIPFSFile'
import type INFT from '@/types/INFT'
import { useAppStore } from '@/stores/app'
import getBoxReferenceNFT from '../boxes/getBoxReferenceNFTUInt'
import parseAsaData from './parseAsaData'
import getBoxFromCache from './getBoxFromCache'
interface IInput {
  client: algosdk.Algodv2
  assetId: number
}

const getARC0003Details = async (input: IInput): Promise<INFTDetail | null> => {
  // returns null for assets that are not gold coins; throws when the data could not be loaded
  const { client, assetId } = input
  const token = await getAsa({ client, assetId })
  console.log('token', token)
  if (!token) return null

  if (!token.params.url?.endsWith('#arc3')) return null
  console.log('token.params.url', token.params.url)
  if (!token.params.url.startsWith('ipfs://')) return null
  const url = token.params.url.replace('#arc3', '').replace('ipfs://', '')
  console.log('url', url)
  const data: INFT = await loadIPFSFile(url)
  if (!data) throw new Error(`Unable to load IPFS metadata ${url}`)
  if (!data.properties) return null
  if (!data.properties.pictures) return null
  if (!data.properties.pictures.length) return null
  if (!data.properties.pictures[0].thumbnail) return null

  const store = useAppStore()

  const box = await getBoxFromCache({
    client,
    index: store.state.appId,
    boxName: getBoxReferenceNFT({ nftAsset: assetId })
  })
  console.log('box', box)
  const state = parseAsaData(box.value)

  console.log('box', state, box)
  return {
    asa: assetId,
    ipfsUrl: token?.params.url,
    nft: data,
    state: state
  }
}
export default getARC0003Details
