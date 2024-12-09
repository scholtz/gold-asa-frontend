import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals'
import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk, { Algodv2 } from 'algosdk'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { AsaGoldSmartcontractClient } from '../contracts/clients/AsaGoldSmartcontractClient'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { AppMetadata, AppReference } from '@algorandfoundation/algokit-utils/types/app'
import { Buffer } from 'buffer'
import getClient from '../src/getClient'
import createGoldToken from '../src/createGoldToken'
import optInToAsset from '../src/optInToAsset'
import clientOptinAsset from '../src/client/clientOptinAsset'
import createNFTToken from '../src/createNFTToken'
import clientSellAssetWithDeposit from '../src/client/clientSellAssetWithDeposit'
import clientChangePrice from '../src/client/clientChangeQuotation'
import doAssetTransfer from '../src/doAssetTransfer'
import clientBuyNft from '../src/client/clientBuyNFT'
import clientWithdrawNFT from '../src/client/clientWithdrawNFT'
import createToken from '../src/createToken'
import clientNotForSale from '../src/client/clientNotForSale'
import clientRequestParcelDelivery from '../src/client/clientRequestParcelDelivery'
import clientSetParcelDelivery from '../src/client/clientSetParcelDelivery'
import clientDepositNFT from '../src/client/clientDepositNFT'
import { exit } from 'process'
import { readFileSync } from 'fs'

const appId = process.env.appId ? parseInt(process.env.appId) : 0
const goldToken = process.env.goldToken ? parseInt(process.env.goldToken) : 0
console.log('APPID', appId)
console.log('goldToken', goldToken)

let appClient: AsaGoldSmartcontractClient
let usdcToken: number
let appRef: AppMetadata | AppReference
let accountDeploy: algosdk.Account

let accountDeployGoldToken: algosdk.Account
let buyer: algosdk.Account
let buyer2: algosdk.Account

var algod = new algosdk.Algodv2(
  process.env.algodToken ?? 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  process.env.algodHost ?? 'http://localhost',
  process.env.algodPort ?? '4001'
)

const fixture = algorandFixture()
describe('deploy', () => {
  beforeEach(fixture.beforeEach)

  beforeAll(async () => {
    await fixture.beforeEach()
  })

  test('goldToken is issued', async () => {
    expect(goldToken).toBeGreaterThan(0)
  })

  test('appId is created', async () => {
    expect(appId).toBeGreaterThan(0)
  })
  test('01 deploy app', async () => {
    if (!process.env.accountDeploy) throw Error('accountDeploy not defined')
    accountDeploy = algosdk.mnemonicToSecretKey(process.env.accountDeploy)

    console.log(`accountDeploy:${accountDeploy.addr}`)
    if (appId) {
      appClient = getClient({ appId: appId, sender: accountDeploy, algod })
      const app = await appClient.update.updateApplication({})
    } else {
      appClient = getClient({ appId: 0, sender: accountDeploy, algod })
      const app = await appClient.create.createApplication({
        fee: 10,
        governor: accountDeploy.addr
      }) // 10/10000 = 0.1%
    }

    appRef = await appClient.appClient.getAppReference()
    console.log('appRef.appId', appRef.appId)
  })
  test('02 optin contract to gold', async () => {
    if (!process.env.accountDeploy) throw Error('accountDeploy not defined')
    accountDeploy = algosdk.mnemonicToSecretKey(process.env.accountDeploy)
    appClient = getClient({ appId: appId, sender: accountDeploy, algod })

    await clientOptinAsset({
      algod,
      account: accountDeploy,
      appClient: appClient,
      assetIndex: goldToken
    })
  })
  test('03 deploy nfts', async () => {
    if (!process.env.seller) throw Error('Seller not defined')
    if (!process.env.accountDeploy) throw Error('accountDeploy not defined')
    if (!process.env.accountDeployGoldToken) throw Error('accountDeployGoldToken not defined')
    if (!goldToken) throw Error('goldToken not defined')
    if (!appId) throw Error('appId not defined')

    const network = 'mainnet'
    accountDeploy = algosdk.mnemonicToSecretKey(process.env.accountDeploy)
    accountDeployGoldToken = algosdk.mnemonicToSecretKey(process.env.accountDeployGoldToken)
    const seller = algosdk.mnemonicToSecretKey(process.env.seller)
    console.log('seller account: ' + seller.addr)

    for (let sn = 15; sn <= 16; sn++) {
      console.log('sn', sn)
      let file = `gold-coin-1-oz-sn-${sn}`
      let price = 500000000
      let weight = 31096890
      if (sn == 2) {
        price = 34759154
        weight = 31096890
      }
      if (sn >= 3) {
        file = `gold-coin-1-10-oz-sn-${sn}`
        price = 4083399
        weight = 3109689
      }
      if (sn == 13) {
        file = `gold-coin-1-oz-sn-${sn}`
        price = 33584641
        weight = 31096890
      }
      if (sn == 14) {
        file = `gold-coin-1-oz-sn-${sn}`
        price = 33403889
        weight = 31096890
      }
      if (sn == 15) {
        file = `gold-coin-1-oz-sn-${sn}`
        price = 33546472
        weight = 31096890
      }
      if (sn == 16) {
        file = `gold-coin-1-oz-sn-${sn}`
        price = 33546472
        weight = 31096890
      }
      const integrity = readFileSync(`arc0003/${network}/${file}.integrity`).toString('utf-8')

      const ipfs = readFileSync(`arc0003/${network}/${file}.ipfs`)
      const nftAsset = await createNFTToken({
        account: seller,
        algod,
        integrity: Buffer.from(integrity, 'base64'),
        ipfs: ipfs.toString('utf8')
      })

      console.log(`nftTokenTx done ${nftAsset}`)
      console.log(`nftToken opted in to app done ${nftAsset}`)
      console.log('appId', appId, appRef)
      var appClientSeller = getClient({
        appId: appId ? appId : appRef.appId,
        sender: seller,
        algod
      })
      await clientOptinAsset({
        algod,
        account: seller,
        appClient: appClientSeller,
        assetIndex: nftAsset
      })

      var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

      console.log('clientSellAssetWithDeposit', {
        algod,
        account: seller,
        appClient: appClientSeller,
        nftOwnerAddress: seller.addr,
        vaultOwnerAddress: accountDeploy.addr,
        goldTokenAssetReserveAccount,
        nftAsset,
        goldToken
      })
      await clientSellAssetWithDeposit({
        algod,
        account: seller,
        appClient: appClientSeller,
        nftOwnerAddress: seller.addr,
        vaultOwnerAddress: accountDeploy.addr,
        goldTokenAssetReserveAccount,
        nftAsset,
        goldToken,
        price,
        weight
      })
      console.log('sellAssetWithDeposit done')
    }
  })
})
