<script setup lang="ts">
import Penel from 'primevue/panel'
import Layout from '@/layouts/AuthLayout.vue'
</script>
<template>
  <Layout :hideTopMenu="false">
    <Penel header="Gold token" class="m-4">
      <div class="grid">
        <div class="col-12 md:col-9">
          <p>
            Gold token Algorand Mainnet ID:
            <a href="https://allo.info/asset/1241944285" target="_blank">1241944285</a>
          </p>
          <p>
            Address holding all gold reserves NFTs:
            <a
              href="https://allo.info/account/OAOYIJWXVC44DBCX5GKCDZVDGGHQJFAKHLTYDCT5DKJPQL7TNWLUFH5KOM/assets"
              target="_blank"
              >OAOY..5KOM</a
            >
          </p>
          <p>
            Gold token white paper:
            <a href="/gold.pdf" target="_blank">gold.pdf</a>
          </p>
          <p>
            ASA.Gold is the groundbreaking publicly auditable gold token. Backed by physical gold
            reserves, our onchain eshop ensures real-time audits accessible to all, guaranteeing the
            authenticity and value of each token. Invest with confidence in a new era of gold-backed
            digital assets, where trust and accountability converge seamlessly.
          </p>
          <p>
            <a href="https://explorer.perawallet.app/assets/1241944285/" target="_blank"
              >Verified</a
            >
            by Pera since 2023-11-14
          </p>
          <p>
            Price development
            <a href="https://vestige.fi/asset/1241944285" target="_blank">by Vestige</a>
          </p>
          <p>
            Download ASA.Gold
            <a href="/ASA.Gold-Pitch-Deck.pdf" target="_blank">Pitch deck</a>
          </p>
        </div>
        <div class="col-12 md:col-3">
          <img
            src="https://bff.asa.gold/ipfs/QmR2BAeKaPRxY17MzKyPDSG6WAjsSGWC8j4v2C9TKTJbPD"
            class="w-full"
            alt="DAO Token"
          />
        </div>
      </div> </Penel
  ></Layout>
</template>
