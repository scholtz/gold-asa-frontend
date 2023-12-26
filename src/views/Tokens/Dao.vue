<script setup lang="ts">
import Penel from 'primevue/panel'
import Layout from '@/layouts/AuthLayout.vue'
</script>
<template>
  <Layout :hideTopMenu="false">
    <Penel header="ASA.Gold governance token" class="m-4">
      <div class="grid">
        <div class="col-12 md:col-9">
          <p>
            ASA.Gold governance token Algorand Mainnet ID:
            <a href="https://algoexplorer.io/asset/1241945177" target="_blank">1241945177</a>
          </p>
          <p>
            GoldDAO token white paper:
            <a href="/dao.pdf" target="_blank">dao.pdf</a>
          </p>
          <p>
            DAO governance token for gold-backed project - ASA.Gold. Empower community members to
            influence project decisions through a transparent, onchain, publicly auditable process.
            Shape the future of gold-backed digital assets collaboratively, ensuring trust,
            fairness, and a stake in the success of ASA.Gold. Join the gold revolution now!
          </p>
          <p>
            <a href="https://explorer.perawallet.app/assets/1241945177/" target="_blank"
              >Verified</a
            >
            by Pera since 2023-11-14
          </p>
          <p>
            Price development
            <a href="https://vestige.fi/asset/1241945177" target="_blank">by Vestige</a>
          </p>
          <p>
            Download ASA.Gold
            <a href="/ASA.Gold-Pitch-Deck.pdf" target="_blank">Pitch deck</a>
          </p>
        </div>
        <div class="col-12 md:col-3">
          <img
            src="https://bff.asa.gold/ipfs/QmUvP2dfc2qhn7Ym3p2h4B6MQHFLx9F3UFmowyoZ89NkXy"
            class="w-full"
            alt="DAO Token"
          />
        </div>
      </div> </Penel
  ></Layout>
</template>
