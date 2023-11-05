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
let buyer: algosdk.Account
describe('AsaGoldSmartcontract', () => {
  beforeEach(fixture.beforeEach)

  beforeAll(async () => {
    await fixture.beforeEach()
    const { algod, generateAccount } = fixture.context
    accountDeploy = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 10
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

    buyer = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })
    const params = await algod.getTransactionParams().do()
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
      suggestedParams: params
    })

    const tx = await algod.sendRawTransaction(goldTokenTx.signTxn(accountDeployGoldToken.sk)).do()
    const tx2 = await algokit.waitForConfirmation(tx.txId, 3, algod)
    goldToken = Number(tx2.assetIndex)
    console.log(`goldTokenTx done ${goldToken}`)

    // accountDeploy - opt in to all assets where trade can be done.. as fee collector
    await algod.sendRawTransaction(
      algosdk
        .makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: accountDeploy.addr,
          to: accountDeploy.addr,
          amount: 0,
          assetIndex: goldToken,
          suggestedParams: { ...params }
        })
        .signTxn(accountDeploy.sk)
    )
    console.log(`accountDeploy optin goldToken ${goldToken} done`)

    // deposit minimum balance, opt in to gold token

    const fundAppTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: accountDeploy.addr,
      to: appRef.appAddress,
      amount: 392200,
      suggestedParams: { ...params }
    })
    await algod.sendRawTransaction(fundAppTx.signTxn(accountDeploy.sk)).do()
    console.log(`fundAppTx  done`)

    await appClient.optinAsset(
      { nftAsset: goldToken },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 2000 })
        }
      }
    )
    console.log(`optinAsset ${goldToken} done`)
  })

  test('goldToken is issued', async () => {
    expect(goldToken).toBeGreaterThan(0)
  })

  test('0->1 sellAssetWithDeposit test', async () => {
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
      amount: 292200,
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
      name: new Uint8Array(Buffer.concat([Buffer.from('d'), algosdk.bigIntToBytes(nftAsset, 8)])) // data box
    }
    var box2: algosdk.BoxReference = {
      appIndex: Number(appRef.appId),
      name: new Uint8Array(Buffer.concat([Buffer.from('r'), algosdk.bigIntToBytes(goldToken, 8)])) // reserves box
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
    console.log('box2', box2, Buffer.from(box2.name).toString('hex'))
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
        boxes: [box, box2],
        accounts: [goldTokenAssetReserveAccount]
      }
    )
    console.log(`sellAssetWithDeposit done`)
  })
  test('1->1 changeQuotation test', async () => {
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
      amount: 292200,
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
      name: new Uint8Array(Buffer.concat([Buffer.from('d'), algosdk.bigIntToBytes(nftAsset, 8)])) // data box
    }
    var box2: algosdk.BoxReference = {
      appIndex: Number(appRef.appId),
      name: new Uint8Array(Buffer.concat([Buffer.from('r'), algosdk.bigIntToBytes(goldToken, 8)])) // reserves box
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
    console.log('box2', box2, Buffer.from(box2.name).toString('hex'))
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
        boxes: [box, box2],
        accounts: [goldTokenAssetReserveAccount]
      }
    )
    console.log('sell.confirmations', sell.confirmations)

    const changePrice = await appClient2.changeQuotation(
      {
        nftAsset: nftAsset,
        numbers: [102000, goldToken, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 2000 })
        },
        boxes: [box],
        accounts: []
      }
    )
    console.log('changePrice.confirmations', changePrice.confirmations)
  })
  test('1->2 buyNFT test', async () => {
    const { algod, generateAccount } = fixture.context
    const accountDeployNFT = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })
    const params = await algod.getTransactionParams().do()
    const nftTokenTx = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
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
    const tx = await algod.sendRawTransaction(nftTokenTx.signTxn(accountDeployNFT.sk)).do()
    const tx2 = await algokit.waitForConfirmation(tx.txId, 3, algod)
    var nftAsset = Number(tx2.assetIndex)
    console.log(`nftTokenTx done ${nftAsset}`)

    const fundAppTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: accountDeployNFT.addr,
      to: appRef.appAddress,
      amount: 392200,
      suggestedParams: { ...params }
    })
    const fundAppTxResult = await algod
      .sendRawTransaction(fundAppTx.signTxn(accountDeployNFT.sk))
      .do()
    console.log('fundAppTx done')

    await appClient.optinAsset(
      { nftAsset: nftAsset },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 2000 })
        }
      }
    )
    const seller = accountDeployNFT
    // accountDeploy - opt in to all assets where trade can be done.. as fee collector
    await algod.sendRawTransaction(
      algosdk
        .makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: seller.addr,
          to: seller.addr,
          amount: 0,
          assetIndex: goldToken,
          suggestedParams: { ...params }
        })
        .signTxn(seller.sk)
    )
    console.log(`seller optin goldToken ${goldToken} done`)

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
      name: new Uint8Array(Buffer.concat([Buffer.from('d'), algosdk.bigIntToBytes(nftAsset, 8)])) // data box
    }
    var box2: algosdk.BoxReference = {
      appIndex: Number(appRef.appId),
      name: new Uint8Array(Buffer.concat([Buffer.from('r'), algosdk.bigIntToBytes(goldToken, 8)])) // reserves box
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
    console.log('box2', box2, Buffer.from(box2.name).toString('hex'))
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
        boxes: [box, box2],
        accounts: [goldTokenAssetReserveAccount]
      }
    )
    console.log('sellAssetWithDeposit done')

    const changePrice = await appClient2.changeQuotation(
      {
        nftAsset: nftAsset,
        numbers: [102000, goldToken, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 1000 })
        },
        boxes: [box],
        accounts: []
      }
    )
    console.log('changePrice done')

    var appClientBuyer = new AsaGoldSmartcontractClient(
      {
        sender: buyer,
        resolveBy: 'id',
        id: appRef.appId
      },
      algod
    )

    await algod
      .sendRawTransaction(
        algosdk
          .makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: buyer.addr,
            amount: 0,
            assetIndex: goldToken,
            to: buyer.addr,
            suggestedParams: { ...params, fee: 1000 }
          })
          .signTxn(buyer.sk)
      )
      .do()
    console.log('optinBuyerToGold done')
    const fundBuyerWithGold = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: accountDeployGoldToken.addr,
      amount: 102000,
      assetIndex: goldToken,
      to: buyer.addr,
      suggestedParams: { ...params, fee: 1000 }
    })
    await algod.sendRawTransaction(fundBuyerWithGold.signTxn(accountDeployGoldToken.sk)).do()
    console.log('fundBuyerWithGold done')

    await algod
      .sendRawTransaction(
        algosdk
          .makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: accountDeploy.addr,
            amount: 0,
            assetIndex: goldToken,
            to: accountDeploy.addr,
            suggestedParams: { ...params, fee: 1000 }
          })
          .signTxn(accountDeploy.sk)
      )
      .do()
    console.log('accountDeploy optin goldToken done')

    console.log(
      'appRef.appAddress,accountDeploy,seller,accountDeployGoldToken',
      appRef.appAddress,
      accountDeploy.addr,
      seller.addr,
      accountDeployGoldToken.addr
    )
    console.log('nftAsset, goldToken', nftAsset, goldToken)

    const purchaseAssetDepositTx = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: buyer.addr,
      amount: 102000,
      assetIndex: goldToken,
      to: appRef.appAddress,
      suggestedParams: { ...params, fee: 1000 }
    })
    const buyNFT = await appClientBuyer.buyNft(
      {
        purchaseAssetDepositTx: purchaseAssetDepositTx,
        nftAsset: nftAsset
      },
      {
        sendParams: {
          fee: new AlgoAmount({ microAlgos: 3000 })
        },
        boxes: [box, box2],
        assets: [nftAsset, goldToken],
        accounts: [appRef.appAddress, accountDeploy.addr, seller.addr, accountDeployGoldToken.addr]
      }
    )
    console.log('buyNFT done')
  })
})
