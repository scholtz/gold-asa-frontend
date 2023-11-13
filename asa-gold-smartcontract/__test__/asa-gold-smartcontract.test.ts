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
console.log('APPID', appId)
const fixture = algorandFixture()

let appClient: AsaGoldSmartcontractClient
let goldToken: number
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

describe('AsaGoldSmartcontract', () => {
  beforeEach(fixture.beforeEach)

  beforeAll(async () => {
    await fixture.beforeEach()
    const { kmd, generateAccount } = fixture.context
    accountDeploy = process.env.accountDeploy
      ? algosdk.mnemonicToSecretKey(process.env.accountDeploy)
      : await generateAccount({
          initialFunds: new AlgoAmount({
            algos: 100
          }),
          suppressLog: false
        })

    await algokit.ensureFunded(
      {
        accountToFund: accountDeploy.addr,
        minSpendingBalance: algokit.algos(100) // algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log(`accountDeploy:${algosdk.secretKeyToMnemonic(accountDeploy.sk)}`)
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
    accountDeployGoldToken = process.env.accountDeployGoldToken
      ? algosdk.mnemonicToSecretKey(process.env.accountDeployGoldToken)
      : await generateAccount({
          initialFunds: new AlgoAmount({
            algos: 100
          }),
          suppressLog: false
        })

    await algokit.ensureFunded(
      {
        accountToFund: accountDeployGoldToken.addr,
        minSpendingBalance: algokit.algos(100) // algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log(`accountDeployGoldToken:${algosdk.secretKeyToMnemonic(accountDeployGoldToken.sk)}`)
    buyer = process.env.buyer
      ? algosdk.mnemonicToSecretKey(process.env.buyer)
      : await generateAccount({
          initialFunds: new AlgoAmount({
            algos: 100
          }),
          suppressLog: false
        })
    await algokit.ensureFunded(
      {
        accountToFund: buyer.addr,
        minSpendingBalance: algokit.algos(100) // algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log(`buyer:${algosdk.secretKeyToMnemonic(buyer.sk)}`)
    buyer2 = process.env.buyer2
      ? algosdk.mnemonicToSecretKey(process.env.buyer2)
      : await generateAccount({
          initialFunds: new AlgoAmount({
            algos: 100
          }),
          suppressLog: false
        })
    await algokit.ensureFunded(
      {
        accountToFund: buyer2.addr,
        minSpendingBalance: algokit.algos(100) // algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log(`buyer2:${algosdk.secretKeyToMnemonic(buyer2.sk)}`)

    goldToken = process.env.goldToken
      ? parseInt(process.env.goldToken)
      : await createGoldToken({ accountDeployGoldToken, algod })
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

  test('0->1 issue initial nfts test', async () => {
    const { kmd, generateAccount } = fixture.context
    const seller = process.env.seller
      ? algosdk.mnemonicToSecretKey(process.env.seller)
      : await generateAccount({
          initialFunds: new AlgoAmount({
            algos: 1
          }),
          suppressLog: false
        })
    await algokit.ensureFunded(
      {
        accountToFund: seller.addr,
        minSpendingBalance: algokit.algos(10) // algokit.microAlgos(392200)
      },
      algod,
      kmd
    )
    console.log('seller account: ' + seller.addr)
    const network = 'testnet'
    for (let sn = 1; sn <= 12; sn++) {
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
      const integrity = readFileSync(`arc0003/${network}/${file}.integrity`).toString('utf-8')

      const ipfs = readFileSync(`arc0003/${network}/${file}.ipfs`)
      const nftAsset = await createNFTToken({
        account: seller,
        algod,
        integrity: Buffer.from(integrity, 'base64'),
        ipfs: ipfs.toString('utf8')
      })

      console.log(`nftTokenTx done ${nftAsset}`)
      await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
      console.log(`nftToken opted in to app done ${nftAsset}`)
      console.log('appId', appId, appRef)
      var appClientSeller = getClient({
        appId: appId ? appId : appRef.appId,
        sender: seller,
        algod
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
  test('0->1 sellAssetWithDeposit test', async () => {
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

    console.log(`nftTokenTx done ${nftAsset}`)
    await clientOptinAsset({ algod, account: accountDeploy, appClient, assetIndex: nftAsset })
    console.log(`nftToken opted in to app done ${nftAsset}`)
    console.log('appId', appId, appRef)
    var appClientSeller = getClient({ appId: appId ? appId : appRef.appId, sender: seller, algod })

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
      price: 4083399,
      weight: 3109689
    })
    console.log('sellAssetWithDeposit done')
  })
  test('1->1 changeQuotation test', async () => {
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, ipfs, integrity })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4083399,
      weight: 3109689
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

  test('2->2 depositNFT test', async () => {
    const integrity = Buffer.from('qDx7WOE8M6iJETwWOfVcHSCcGbLygjZn6+RtnvwLatM=', 'base64')
    const ipfs = 'Qmave4H2Mnx4TB4TygbrjPJgUHvE5q8jZ999pcwXBQtEA2'
    const { generateAccount } = fixture.context
    const seller = await generateAccount({
      initialFunds: new AlgoAmount({
        algos: 1
      }),
      suppressLog: false
    })

    const nftAsset = await createNFTToken({ account: seller, algod, integrity, ipfs })

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
      goldToken,
      price: 4000000,
      weight: 3110000
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
      sellerAddress: buyer2.addr
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
