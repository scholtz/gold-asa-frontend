<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
</script>
<template>
  <Layout :hide-top-menu="false">
    <Panel
      header="Price list - List of all services provided by asa.gold and its prices"
      class="m-4 flex flex-grow-1 flex-column"
      toggleableContent="text"
    >
      <h2>Buy gold token using DEX aggregator</h2>
      <p>Our commission: 0%</p>
      <p><RouterLink to="/trade-gold">Service link</RouterLink></p>
      <p>
        DEX aggregator charges approx 0,1% from the volume, and according to the selected AMM pools
        they charge liquidity slippage fees.
      </p>

      <h2>Sell gold token using DEX aggregator</h2>
      <p>Our commission: 0%</p>
      <p>
        DEX aggregator charges approx 0,1% from the volume, and according to the selected AMM pools
        they charge liquidity slippage fees.
      </p>
      <p><RouterLink to="/trade-gold">Service link</RouterLink></p>

      <h2>Buy gold token using bank transfer</h2>
      <p>Our commission: 0.1%</p>
      <p>
        Your bank may charge you additional fee. We will reimburse any fees to our bank account to
        you (SEPA standard and SEPA instant payments are free. This mostly applies to SWIFT
        payments.).
      </p>
      <p>RFQ price acquired is calculated as top price from multiple gold selling price feeds.</p>
      <p>Your RFQ price is final and includes the commission.</p>
      <p><RouterLink to="/buy-gold-with-eur">Service link</RouterLink></p>

      <h2>Add gold coin to reserves</h2>
      <p>Our commission: 3%</p>
      <p>
        When we purchase real gold coin or ignot, we state the price of this purchase as numismatic
        value at time of purchase to the NFT. This numismatic price is expressed in the gold token
        price which means that the price divided by grams of gold at the purchase gives the real
        percentage of numismatic value. We add usually 3% to this price and sell it to public
        through NFT sale. The numismatic value added may change in special cases such as a rare
        coins or may be lower in some discounted sales.
      </p>
      <p>
        Price in the E-Shop is stored on blockchain and when person pays the price in asa.gold token
        he pays it directly back to reserves account effectivly burning the token. Whole process is
        governed by smart contract.
      </p>
      <p><RouterLink to="/buy-gold-coins">Service link</RouterLink></p>

      <h2>Secondary marketplace</h2>
      <p>Our commission: 0,1%</p>
      <p>
        Owner of the NFT can set his token on sale. He can select multiple combinations of price and
        tokens to be received and when buyer executes the buy command the smart contract takes 0,1%
        commission to our account.
      </p>
      <p><RouterLink to="/buy-gold-coins">Service link</RouterLink></p>

      <h2>Physical delivery</h2>
      <p>Our commission: 0,9 gold token</p>
      <p>Postal services: 0,8% of requested insurance price</p>
      <p>Owner of the NFT can request physical deliver to EHS countries.</p>
      <p><RouterLink to="/buy-gold-coins">Service link</RouterLink></p>
    </Panel></Layout
  >
</template>
