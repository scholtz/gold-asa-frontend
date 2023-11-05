import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals'
import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk, { BoxReference } from 'algosdk'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { AsaGoldSmartcontractClient } from '../contracts/clients/AsaGoldSmartcontractClient'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import { AppMetadata, AppReference } from '@algorandfoundation/algokit-utils/types/app'
import { Buffer } from 'buffer'

const fixture = algorandFixture()

let appClient: AsaGoldSmartcontractClient
let goldToken: number
let appRef: AppMetadata | AppReference
let accountDeploy: algosdk.Account
let accountDeployGoldToken: algosdk.Account
describe('AsaGoldSmartcontract', () => {
  beforeEach(fixture.beforeEach)

  beforeAll(async () => {
    await fixture.beforeEach()
    const { algod, generateAccount } = fixture.context
    accountDeploy = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    appClient = new AsaGoldSmartcontractClient(
      {
        sender: accountDeploy,
        resolveBy: 'id',
        id: 0
      },
      algod
    )

    const app = await appClient.create.createApplication({ fee: 10 }) // 10/10000 = 0.1%
    appRef = await appClient.appClient.getAppReference()

    accountDeployGoldToken = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const goldTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: accountDeployGoldToken.addr,
      reserve: accountDeployGoldToken.addr,
      decimals: 6,
      defaultFrozen: false,
      total: 1_000_000_000_000_000,
      assetName: 'GOLD',
      assetURL: 'https://asa.gold',
      manager: accountDeployGoldToken.addr,
      unitName: 'GOLD',
      suggestedParams: await algod.getTransactionParams().do()
    })

    const tx = await algod.sendRawTransaction(goldTokenTx.signTxn(accountDeployGoldToken.sk)).do()
    const tx2 = await algokit.waitForConfirmation(tx.txId, 3, algod)
    goldToken = Number(tx2.assetIndex)
  })

  test('goldToken is issued', async () => {
    expect(goldToken).toBeGreaterThan(0)
  })

  test('sellAssetWithDeposit test', async () => {
    const { algod, generateAccount } = fixture.context
    const accountDeployNFT = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })
    const params = await algod.getTransactionParams().do()
    const goldTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: accountDeployNFT.addr,
      reserve: accountDeployNFT.addr,
      decimals: 0,
      defaultFrozen: false,
      total: 1,
      assetName: 'NFT',
      assetURL: 'https://asa.gold',
      manager: accountDeployNFT.addr,
      unitName: 'NFT',
      suggestedParams: { ...params }
    })
    const tx = await algod.sendRawTransaction(goldTokenTx.signTxn(accountDeployNFT.sk)).do()
    const tx2 = await algokit.waitForConfirmation(tx.txId, 3, algod)
    var nftAsset = Number(tx2.assetIndex)

    const fundAppTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: accountDeployNFT.addr,
      to: appRef.appAddress,
      amount: 282500,
      suggestedParams: { ...params }
    })
    const fundAppTxResult = await algod
      .sendRawTransaction(fundAppTx.signTxn(accountDeployNFT.sk))
      .do()

    await appClient.optinAsset(
      { nftAsset: nftAsset },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 2000 })
        }
      }
    )

    var appClient2 = new AsaGoldSmartcontractClient(
      {
        sender: accountDeployNFT,
        resolveBy: 'id',
        id: appRef.appId
      },
      algod
    )
    var box: algosdk.BoxReference = {
      appIndex: Number(appRef.appId),
      name: algosdk.bigIntToBytes(nftAsset, 8)
    }
    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr
    const depositTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: accountDeployNFT.addr,
      amount: 1,
      assetIndex: nftAsset,
      to: appRef.appAddress,
      suggestedParams: { ...params, fee: 1000 }
    })
    console.log('box', box, Buffer.from(box.name).toString('hex'))
    const sell = await appClient2.sellAssetWithDeposit(
      {
        nftDepositTx: depositTx,
        nftAsset: nftAsset,
        price: 101000,
        tokenAsset: goldToken,
        vaultOwnerAddress: accountDeploy.addr,
        weight: 100000
      },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 2000 })
        },
        boxes: [box],
        accounts: [goldTokenAssetReserveAccount]
      }
    )
    console.log('sell.confirmations', sell.confirmations)
  })
})
