import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals'
import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
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

const fixture = algorandFixture()

let appClient: AsaGoldSmartcontractClient
let goldToken: number
let usdcToken: number
let appRef: AppMetadata | AppReference
let accountDeploy: algosdk.Account
let accountDeployGoldToken: algosdk.Account
let buyer: algosdk.Account
let buyer2: algosdk.Account
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

    appClient = getClient({ appId: 0, sender: accountDeploy, algod })
    const app = await appClient.create.createApplication({ fee: 10 }) // 10/10000 = 0.1%
    appRef = await appClient.appClient.getAppReference()

    accountDeployGoldToken = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 10
      }),
      suppressLog: false
    })

    buyer = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 10
      }),
      suppressLog: false
    })

    buyer2 = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 10
      }),
      suppressLog: false
    })

    goldToken = await createGoldToken({ accountDeployGoldToken, algod })
    console.log(`goldTokenTx done ${goldToken}`)

    // accountDeploy - opt in to all assets where trade can be done.. as fee collector
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log(`accountDeploy optin goldToken ${goldToken} done`)

    // deposit minimum balance, opt in to gold token
    await algokit.ensureFunded(
      {
        accountToFund: appRef.appAddress,
        minSpendingBalance: algokit.algos(10) // algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log(`fundAppTx  done`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: goldToken })
    console.log(`optinAsset ${goldToken} done`)

    usdcToken = await createToken({ account: accountDeployGoldToken, name: 'USDC', algod })

    await optInToAsset({ account: buyer, assetIndex: usdcToken, algod })
    console.log(`buyer optInToAsset usdc done`)
    await optInToAsset({ account: buyer2, assetIndex: usdcToken, algod })
    console.log(`buyer2 optInToAsset usdc done`)
    await optInToAsset({ account: accountDeploy, assetIndex: usdcToken, algod })
    console.log(`accountDeploy (fee collector) optInToAsset usdc done`)
    await doAssetTransfer({
      algod,
      amount: 1_000_000_000,
      assetIndex: usdcToken,
      from: accountDeployGoldToken,
      to: buyer2.addr
    })
    console.log(`buyer2 fund usdc done`)

    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: usdcToken })
    console.log(`app optin usdc done`)
  })

  test('goldToken is issued', async () => {
    expect(goldToken).toBeGreaterThan(0)
  })

  test('0->1 sellAssetWithDeposit test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')
  })
  test('1->1 changeQuotation test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
    console.log('changePrice done')
  })
  test('1->2 buyNFT test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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

  test('2->2 withdrawNFT test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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
    await optInToAsset({ account: buyer, assetIndex: nftAsset, algod })
    await clientWithdrawNFT({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      ownerAddress: buyer.addr
    })
    console.log('clientWithdrawNFT done')
  })

  test('2->3 changeQuotation test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 100_000_000
    })
    console.log('changePrice done')
  })
  test('3->3 changeQuotation test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 100_000_000
    })
    console.log('changePrice done')

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 110_000_000
    })
    console.log('changePrice done')
  })
  test('3->2 buyNFT test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 100_000_000
    })
    console.log('changePrice done')

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 110_000_000
    })
    console.log('changePrice done')

    var appClientBuyer2 = getClient({ appId: appRef.appId, sender: buyer2, algod })
    await clientBuyNft({
      account: buyer2,
      appClient: appClientBuyer2,
      buyerAddr: buyer2.addr,
      algod,
      assetBuy: usdcToken,
      buyPrice: 110_000_000,
      feeCollectorAddress: accountDeploy.addr,
      goldToken: goldToken,
      nftAsset: nftAsset,
      sellerAddress: buyer.addr
    })
    console.log('clientBuyNft buyer->buyer2 done')
  })

  test('3->2 setNotForSale test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 100_000_000
    })
    console.log('changePrice done')

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 110_000_000
    })
    console.log('changePrice done')

    await clientNotForSale({ algod, account: buyer, appClient: appClientBuyer, nftAsset })
    console.log('clientNotForSale done')
  })
  test('2->4 requestParcelDelivery test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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
    await clientRequestParcelDelivery({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset
    })
    console.log('clientRequestParcelDelivery done')
  })
  test('3->4 requestParcelDelivery test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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

    await clientChangePrice({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      goldToken,
      goldTokenPrice: 103000,
      asa2: usdcToken,
      asa2Price: 100_000_000
    })
    console.log('changePrice done')

    await clientRequestParcelDelivery({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset
    })
    console.log('changePrice done')
  })
  test('4->5 setParcelDelivery test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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
    await clientRequestParcelDelivery({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset
    })
    console.log('clientRequestParcelDelivery done')
    await clientSetParcelDelivery({ algod, account: accountDeploy, appClient: appClient, nftAsset })
    console.log('clientSetParcelDelivery done')
  })
  test('2->3 depositNFT test', async () => {
    const { algod, generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)

    var appClientSeller = getClient({ appId: appRef.appId, sender: seller, algod })

    var goldTokenAssetReserveAccount = accountDeployGoldToken.addr

    await clientSellAssetWithDeposit({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftOwnerAddress: seller.addr,
      vaultOwnerAddress: accountDeploy.addr,
      goldTokenAssetReserveAccount,
      nftAsset,
      goldToken
    })
    console.log('sellAssetWithDeposit done')

    await clientChangePrice({
      algod,
      account: seller,
      appClient: appClientSeller,
      nftAsset,
      goldToken,
      goldTokenPrice: 102000
    })
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

    var appClientBuyer = getClient({ appId: appRef.appId, sender: buyer, algod })
    const optin = await optInToAsset({ account: buyer, assetIndex: goldToken, algod })
    console.log('optinBuyerToGold done', optin)
    const buyerDepositGold = await doAssetTransfer({
      from: accountDeployGoldToken,
      to: buyer.addr,
      assetIndex: goldToken,
      amount: 102000,
      algod
    })
    console.log('fundBuyerWithGold done', buyerDepositGold)
    await optInToAsset({ account: accountDeploy, assetIndex: goldToken, algod })
    console.log('accountDeploy optin goldToken done')
    await clientBuyNft({
      account: buyer,
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
    await optInToAsset({ account: buyer, assetIndex: nftAsset, algod })
    await clientWithdrawNFT({
      algod,
      account: buyer,
      appClient: appClientBuyer,
      nftAsset,
      ownerAddress: buyer.addr
    })
    console.log('clientWithdrawNFT done')

    await optInToAsset({ account: buyer2, assetIndex: nftAsset, algod })
    await doAssetTransfer({ algod, amount: 1, assetIndex: nftAsset, from: buyer, to: buyer2.addr })

    var appClientBuyer2 = getClient({ appId: appRef.appId, sender: buyer2, algod })
    await clientDepositNFT({
      algod,
      account: buyer2,
      appClient: appClientBuyer2,
      nftAsset,
      ownerAddress: buyer2.addr,
      sellerAddress: buyer2.addr,
      asa2: usdcToken,
      asa2Price: 100_000_000
    })
    console.log('clientDepositNFT done')
    await clientRequestParcelDelivery({
      algod,
      account: buyer2,
      appClient: appClientBuyer2,
      nftAsset
    })
    console.log('clientRequestParcelDelivery done')
    await clientSetParcelDelivery({ algod, account: accountDeploy, appClient: appClient, nftAsset })
    console.log('clientSetParcelDelivery done')
  })
})
