import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals'
import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk, { BoxReference } from 'algosdk'
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
import getBoxReferenceNFT from '../src/client/getBoxReferenceNFT'
import getBoxReferenceReserves from '../src/client/getBoxReferenceReserves'
import clientSellAssetWithDeposit from '../src/client/clientSellAssetWithDeposit'
import clientChangePrice from '../src/client/clientChangePrice'
import doAssetTransfer from '../src/doAssetTransfer'
import clientBuyNft from '../src/client/clientBuyNft'

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
    const { algod, kmd, generateAccount } = fixture.context
    accountDeploy = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 10
      }),
      suppressLog: false
    })

    appClient = getClient(0, accountDeploy, algod)
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

    goldToken = await createGoldToken(accountDeployGoldToken, algod)
    console.log(`goldTokenTx done ${goldToken}`)

    // accountDeploy - opt in to all assets where trade can be done.. as fee collector
    await optInToAsset(accountDeploy, goldToken, algod)
    console.log(`accountDeploy optin goldToken ${goldToken} done`)

    // deposit minimum balance, opt in to gold token
    await algokit.ensureFunded(
      {
        accountToFund: appRef.appAddress,
        minSpendingBalance: algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log(`fundAppTx  done`)
    await clientOptinAsset(appClient, goldToken)
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
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken(seller, algod)

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset(appClient, nftAsset)
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient(appRef.appId, seller, algod)

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit(
      appClientSeller,
      seller.addr,
      accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken,
      algod
    )
    console.log('sellAssetWithDeposit done')

    await clientChangePrice(appClientSeller, nftAsset, goldToken, 102000)
    console.log('changePrice done')

    console.log(
      'appRef.appAddress,accountDeploy,seller,accountDeployGoldToken,buyer',
      appRef.appAddress,
      accountDeploy.addr,
      seller.addr,
      accountDeployGoldToken.addr,
      buyer.addr
    )
    console.log('nftAsset, goldToken', nftAsset, goldToken)

    var appClientBuyer = getClient(appRef.appId, buyer, algod)
    const optin = await optInToAsset(buyer, goldToken, algod)
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer(
      accountDeployGoldToken,
      buyer.addr,
      goldToken,
      102000,
      algod
    )
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset(accountDeploy, goldToken, algod)
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      appClient: appClientBuyer,
      buyerAddr: buyer.addr,
      algod,
      assetBuy: goldToken,
      buyPrice: 102000,
      feeCollectorAddress: accountDeploy.addr,
      goldToken: goldToken,
      nftAsset: nftAsset,
      sellerAddress: goldTokenAssetReserveAccount
    })
    console.log('buyNFT done')
  })
})
