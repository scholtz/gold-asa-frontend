import type algosdk from 'algosdk'
import getAsa from './getAsa'
import type INFTDetail from '@/types/INFTDetail'
import loadIPFSFile from '../ipfs/loadIPFSFile'
import type INFT from '@/types/INFT'
import { useAppStore } from '@/stores/app'
import getBoxReferenceNFT from '../boxes/getBoxReferenceNFTUInt'
import parseAsaData from './parseAsaData'
interface IInput {
  client: algosdk.Algodv2
  assetId: number
}

const getARC0003Details = async (input: IInput): Promise<INFTDetail | null> => {
  const { client, assetId } = input
  const token = await getAsa({ client, assetId })
  console.log('token', token)
  if (!token) return null

  if (!token.params.url.endsWith('#arc3')) return null
  console.log('token.params.url', token.params.url)
  if (!token.params.url.startsWith('ipfs://')) return null
  const url = token.params.url.replace('#arc3', '').replace('ipfs://', '')
  console.log('url', url)
  const data: INFT = await loadIPFSFile(url)
  if (!data) return null
  if (!data.properties.pictures.length) return null
  if (!data.properties.pictures[0].thumbnail) return null

  const store = useAppStore()
  const box = await client
    .getApplicationBoxByName(store.state.appId, getBoxReferenceNFT({ nftAsset: assetId }))
    .do()
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
