import type algosdk from 'algosdk'

export interface AsaData {
  state: number
  seller: algosdk.Address
  owner: algosdk.Address
  vaultOwnerAddress: algosdk.Address
  sellerAddr: string
  ownerAddr: string
  vaultOwnerAddressAddr: string
  weight: number
  quoteAsset1: number
  asset1: number
  quoteAsset2: number
  asset2: number
  quoteAsset3: number
  asset3: number
  quoteAsset4: number
  asset4: number
  quoteAsset5: number
  asset5: number
}
