import type { AsaData } from '@/types/ASAData'
import algosdk from 'algosdk'

const parseAsaData = (input: Uint8Array) => {
  const ret: AsaData = {
    state: algosdk.decodeUint64(input.subarray(0, 8), 'safe'),
    sellerAddr: algosdk.encodeAddress(input.subarray(8, 40)),
    ownerAddr: algosdk.encodeAddress(input.subarray(40, 72)),
    vaultOwnerAddressAddr: algosdk.encodeAddress(input.subarray(72, 104)),
    seller: algosdk.decodeAddress(algosdk.encodeAddress(input.subarray(8, 40))),
    owner: algosdk.decodeAddress(algosdk.encodeAddress(input.subarray(40, 72))),
    vaultOwnerAddress: algosdk.decodeAddress(algosdk.encodeAddress(input.subarray(72, 104))),
    weight: algosdk.decodeUint64(input.subarray(104, 112), 'safe'),
    quoteAsset1: algosdk.decodeUint64(input.subarray(112, 120), 'safe'),
    asset1: algosdk.decodeUint64(input.subarray(120, 128), 'safe'),
    quoteAsset2: algosdk.decodeUint64(input.subarray(128, 136), 'safe'),
    asset2: algosdk.decodeUint64(input.subarray(136, 144), 'safe'),
    quoteAsset3: algosdk.decodeUint64(input.subarray(144, 152), 'safe'),
    asset3: algosdk.decodeUint64(input.subarray(152, 160), 'safe'),
    quoteAsset4: algosdk.decodeUint64(input.subarray(160, 168), 'safe'),
    asset4: algosdk.decodeUint64(input.subarray(168, 176), 'safe'),
    quoteAsset5: algosdk.decodeUint64(input.subarray(176, 184), 'safe'),
    asset5: algosdk.decodeUint64(input.subarray(184, 192), 'safe')
  }
  return ret
}
export default parseAsaData
