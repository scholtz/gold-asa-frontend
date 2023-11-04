import { Contract } from '@algorandfoundation/tealscript'
// state
// 1 : In reserve [changeQuotation callable]
// 2 : Not for sale (nft can be withdrawn from reserve)
// 3 : Secondary trading [changeQuotation callable]
// 4 : Requested parcel delivery - Activate parcel delivery process by owner of the NFT
// 5 : Shipped to customer or in the parcel delivery process
// seller : who receives the tokens. In case of public audit reserves this MUST be the reserve account of the token issued
// owner : who can update this record..
//  vaultOwnerAddress : the original owner address. This address can change the status of the coin 4->5 (user requested parcel delivery -> in parcel delivery)
// weight : weight of the gold in gold coin in grams
// QUOTES - available options to purchase this asset
// quoteAsset1: quote in uint64.. this amount of asset1 (gold token) must be paid in order to allow transfer of this token
// asset1 : gold token asset id
// quoteAsset2 : quote in uint64.. this amount of asset2 (fe usdc token) must be paid in order to allow transfer of this token
// asset2 : fe usdc asset id

type AsaData = {
  state: uint64
  seller: Address
  owner: Address
  vaultOwnerAddress: Address
  weight: uint64
  quoteAsset1: uint64
  asset1: Asset
  quoteAsset2: uint64
  asset2: Asset
  quoteAsset3: uint64
  asset3: Asset
  quoteAsset4: uint64
  asset4: Asset
  quoteAsset5: uint64
  asset5: Asset
}

const SCALE = 10_000
const BOX_SIZE = 200
// eslint-disable-next-line no-unused-vars
class AsaGoldSmartcontract extends Contract {
  data = BoxMap<Asset, AsaData>()
  //reserves = BoxMap<Asset, uint64>();
  governor = GlobalStateKey<Address>({ key: 'g' }) // account which receives royalty payments
  fee = GlobalStateKey<uint64>({ key: 'f' })

  createApplication(fee: uint64): void {
    this.governor.value = this.txn.sender
    this.fee.value = fee
  }
  /**
   * Deposit Gold coin NFT, set seller owner and price for sale
   *
   * @param nftDepositTx NFT deposit tx
   * @param vaultOwnerAddress Address of the account which can set state Shipped to customer
   * @param weight The weight of the gold contained in the gold coin
   * @param price The price in gold token for which the asset can be sold to clients
   * @returns The sum of a and b
   */
  public sellAssetWithDeposit(
    nftDepositTx: AssetTransferTxn,
    vaultOwnerAddress: Address,
    nftAsset: Asset,
    tokenAsset: Asset,
    weight: uint64,
    price: uint64
  ): void {
    assert(!this.data(nftDepositTx.xferAsset).exists) // the asset must not be defined
    assert(weight > 0)
    assert(tokenAsset.reserve.hasAsset(tokenAsset)) // check if the reserve address is active
    const newItem: AsaData = {
      state: 1,
      seller: tokenAsset.reserve,
      owner: this.txn.sender, //person who made deposit of this nft is owner
      vaultOwnerAddress: vaultOwnerAddress, //when the sale is done, the received assets will go back to reserve account of the gold token
      weight: weight,
      quoteAsset1: price,
      asset1: tokenAsset,
      quoteAsset2: 0, //initial deposit can be sold only for the gold token asset
      asset2: Asset.zeroIndex,
      quoteAsset3: 0,
      asset3: Asset.zeroIndex,
      quoteAsset4: 0,
      asset4: Asset.zeroIndex,
      quoteAsset5: 0,
      asset5: Asset.zeroIndex
    }
    verifyTxn(nftDepositTx, {
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      sender: this.txn.sender
    })

    assert(nftDepositTx.xferAsset.total == 1) // there is always only one nft representation for the gold coin
    // check if nft is present when put on sale
    assert(this.app.address.assetBalance(nftDepositTx.xferAsset) == 1)
    assert(nftDepositTx.xferAsset == nftAsset)
    // if item exists - rewrite
    this.data(nftDepositTx.xferAsset).create(BOX_SIZE)
    this.data(nftAsset).value = newItem

    // RESERVES MANAGEMENT
    // var newReserves = newItem.weight
    // if(this.reserves(goldTokenAsset).exists){
    //   newReserves += this.reserves(goldTokenAsset).value
    // }
    // this.reserves(goldTokenAsset).value = newReserves;
  }

  /**
   * Client can buy NFT which is for sale on the reserve sale or secondary sale
   *
   * @param purchaseAssetDepositTx Transfer to the smart contract with the purchase price
   * @param nftAsset Identifies NFT which client wants to buy
   */
  public buyNFT(purchaseAssetDepositTx: AssetTransferTxn, nftAsset: Asset): void {
    const old = this.data(nftAsset).value

    const newItem: AsaData = {
      state: 2, // not for sale .. user can set it for sale later, request nft to be withdrawn or request parcel delivery
      seller: this.txn.sender,
      owner: this.txn.sender,
      vaultOwnerAddress: old.vaultOwnerAddress,
      weight: old.weight,
      quoteAsset1: 0,
      asset1: Asset.zeroIndex,
      quoteAsset2: 0,
      asset2: Asset.zeroIndex,
      quoteAsset3: 0,
      asset3: Asset.zeroIndex,
      quoteAsset4: 0,
      asset4: Asset.zeroIndex,
      quoteAsset5: 0,
      asset5: Asset.zeroIndex
    }

    verifyTxn(purchaseAssetDepositTx, {
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      sender: this.txn.sender
    })

    var verifiedQuotation = false
    if (old.asset1 == purchaseAssetDepositTx.xferAsset && old.quoteAsset1 > 0) {
      assert(old.quoteAsset1 == purchaseAssetDepositTx.assetAmount)
      verifiedQuotation = true
    }
    if (old.asset2 == purchaseAssetDepositTx.xferAsset && old.quoteAsset2 > 0) {
      assert(old.quoteAsset2 == purchaseAssetDepositTx.assetAmount)
      verifiedQuotation = true
    }
    if (old.asset3 == purchaseAssetDepositTx.xferAsset && old.quoteAsset3 > 0) {
      assert(old.quoteAsset3 == purchaseAssetDepositTx.assetAmount)
      verifiedQuotation = true
    }
    if (old.asset4 == purchaseAssetDepositTx.xferAsset && old.quoteAsset4 > 0) {
      assert(old.quoteAsset4 == purchaseAssetDepositTx.assetAmount)
      verifiedQuotation = true
    }
    if (old.asset5 == purchaseAssetDepositTx.xferAsset && old.quoteAsset5 > 0) {
      assert(old.quoteAsset5 == purchaseAssetDepositTx.assetAmount)
      verifiedQuotation = true
    }
    assert(verifiedQuotation) // check that user paid requested price

    assert(old.state == 1 || old.state == 3) // on sale of nft we check that the old state is either new nft or secondary sale
    assert(newItem.state == 2) // new state must be always not for sale
    // check if nft is present when put on sale
    assert(this.app.address.assetBalance(nftAsset) == 1)

    var fee = (purchaseAssetDepositTx.assetAmount * this.fee.value) / SCALE

    // send fee from the purchase price to the fee collector account
    sendAssetTransfer({
      assetAmount: fee,
      xferAsset: purchaseAssetDepositTx.xferAsset,
      assetReceiver: this.governor.value,
      fee: 2000
    })

    // send purchase price minus fees to seller
    sendAssetTransfer({
      assetAmount: purchaseAssetDepositTx.assetAmount - fee,
      xferAsset: purchaseAssetDepositTx.xferAsset,
      assetReceiver: old.seller,
      fee: 3000
    })

    // rewrite item
    this.data(nftAsset).value = newItem

    // RESERVES MANAGEMENT
    // if(old.state == 1){ // we just sold the NFT from the reserves
    //   this.reserves(old.asset1).value = this.reserves(old.asset1).value - old.weight
    // }
  }

  /**
   * Change price quotes for NFT on sale
   *
   * @param nftAsset The gold coin NFT asset
   * @param numbers The bytes containing quoteAsset1, asset1, quoteAsset2 .. asset5
   */
  public changeQuotation(nftAsset: Asset, numbers: string): void {
    const old = this.data(nftAsset).value

    const newItem: AsaData = {
      state: old.state,
      seller: old.seller,
      owner: old.owner,
      vaultOwnerAddress: old.vaultOwnerAddress,
      weight: old.weight,
      quoteAsset1: btoi(substring3(numbers, 0, 8)),
      asset1: Asset.fromID(btoi(substring3(numbers, 8, 8))),
      quoteAsset2: btoi(substring3(numbers, 16, 8)),
      asset2: Asset.fromID(btoi(substring3(numbers, 24, 8))),
      quoteAsset3: btoi(substring3(numbers, 32, 8)),
      asset3: Asset.fromID(btoi(substring3(numbers, 40, 8))),
      quoteAsset4: btoi(substring3(numbers, 48, 8)),
      asset4: Asset.fromID(btoi(substring3(numbers, 56, 8))),
      quoteAsset5: btoi(substring3(numbers, 64, 8)),
      asset5: Asset.fromID(btoi(substring3(numbers, 72, 8)))
    }

    assert(this.txn.sender == old.owner) // only owner can change quotation
    // check if nft is present when put on sale
    assert(this.app.address.assetBalance(nftAsset) == 1)
    assert(newItem.state == 1 || newItem.state == 3) // current state must be in reserve or in secondary trading
    // rewrite
    this.data(nftAsset).value = newItem
  }

  public requestParcelDelivery(nftAsset: Asset): void {
    const old = this.data(nftAsset).value

    const newItem: AsaData = {
      state: 4, // 3 - request parcel delivery by owner
      seller: old.seller,
      owner: old.owner,
      vaultOwnerAddress: old.vaultOwnerAddress,
      weight: old.weight,
      quoteAsset1: 0,
      asset1: Asset.zeroIndex,
      quoteAsset2: 0,
      asset2: Asset.zeroIndex,
      quoteAsset3: 0,
      asset3: Asset.zeroIndex,
      quoteAsset4: 0,
      asset4: Asset.zeroIndex,
      quoteAsset5: 0,
      asset5: Asset.zeroIndex
    }
    assert(old.state == 2 || old.state == 3) // only sold nfts can be requested for parcel delivery
    assert(this.txn.sender == old.owner) // only owner can request parcel delivery
    // rewrite asset
    this.data(nftAsset).value = newItem
  }
  public setParcelDelivery(nftAsset: Asset): void {
    const old = this.data(nftAsset).value

    const newItem: AsaData = {
      state: 5, // 5 - parcel confirmed by vault owner
      seller: old.seller,
      owner: old.owner,
      vaultOwnerAddress: old.vaultOwnerAddress,
      weight: old.weight,
      quoteAsset1: 0,
      asset1: Asset.zeroIndex,
      quoteAsset2: 0,
      asset2: Asset.zeroIndex,
      quoteAsset3: 0,
      asset3: Asset.zeroIndex,
      quoteAsset4: 0,
      asset4: Asset.zeroIndex,
      quoteAsset5: 0,
      asset5: Asset.zeroIndex
    }
    assert(old.state == 4) // only sold nfts can be requested for parcel delivery
    assert(this.txn.sender == old.vaultOwnerAddress) // only initial owner can mark the asset as it is in parcel delivery
    // rewrite asset
    this.data(nftAsset).value = newItem
  }
  public setNotForSale(nftAsset: Asset): void {
    const old = this.data(nftAsset).value
    const newItem: AsaData = {
      state: 2, // 2 - not for sale
      seller: old.seller,
      owner: old.owner,
      vaultOwnerAddress: old.vaultOwnerAddress,
      weight: old.weight,
      quoteAsset1: 0,
      asset1: Asset.zeroIndex,
      quoteAsset2: 0,
      asset2: Asset.zeroIndex,
      quoteAsset3: 0,
      asset3: Asset.zeroIndex,
      quoteAsset4: 0,
      asset4: Asset.zeroIndex,
      quoteAsset5: 0,
      asset5: Asset.zeroIndex
    }
    assert(old.state == 3) // only sold nfts can be requested for parcel delivery
    assert(this.txn.sender == old.owner) // owner of NFT can set NFT not to be onsale
    // rewrite asset
    this.data(nftAsset).value = newItem
  }
  public withdrawNFT(nftAsset: Asset): void {
    const old = this.data(nftAsset).value

    assert(this.txn.sender == old.owner) // only owner can withdraw
    assert(old.state == 2 || old.state == 4 || old.state == 5) // allow withdraw NFT only if not on sale or in parcel

    // send purchase price minus fees to seller
    sendAssetTransfer({
      assetAmount: 1,
      xferAsset: nftAsset,
      assetReceiver: old.owner,
      fee: 4000
    })
  }
  public optinAsset(nftAsset: Asset): void {
    // anybody can opt in any asset
    sendAssetTransfer({
      assetAmount: 0,
      xferAsset: nftAsset,
      assetReceiver: this.app.address,
      fee: 0
    })
  }
  public depositNFT(nftDepositTx: AssetTransferTxn, seller: Address, numbers: string): void {
    assert(this.data(nftDepositTx.xferAsset).exists) // the asset must not be defined
    const old = this.data(nftDepositTx.xferAsset).value

    const newItem: AsaData = {
      state: 3,
      seller: seller,
      owner: this.txn.sender,
      vaultOwnerAddress: old.vaultOwnerAddress,
      weight: old.weight,
      quoteAsset1: btoi(substring3(numbers, 0, 8)),
      asset1: Asset.fromID(btoi(substring3(numbers, 8, 8))),
      quoteAsset2: btoi(substring3(numbers, 16, 8)),
      asset2: Asset.fromID(btoi(substring3(numbers, 24, 8))),
      quoteAsset3: btoi(substring3(numbers, 32, 8)),
      asset3: Asset.fromID(btoi(substring3(numbers, 40, 8))),
      quoteAsset4: btoi(substring3(numbers, 48, 8)),
      asset4: Asset.fromID(btoi(substring3(numbers, 56, 8))),
      quoteAsset5: btoi(substring3(numbers, 64, 8)),
      asset5: Asset.fromID(btoi(substring3(numbers, 72, 8)))
    }

    verifyTxn(nftDepositTx, {
      assetAmount: { greaterThan: 0 },
      assetReceiver: this.app.address,
      sender: this.txn.sender
    })

    // check if nft is present when put on sale
    assert(this.app.address.assetBalance(nftDepositTx.xferAsset) == 1)
    assert(old.state == 2 || old.state == 3) // allow withdraw NFT only if in secondary market. if parcel requested do not allow

    // rewrite
    this.data(nftDepositTx.xferAsset).value = newItem
  }
}
