<script setup lang="ts">
import Penel from 'primevue/panel'
import Layout from '@/layouts/AuthLayout.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <Layout :hideTopMenu="false">
    <Penel :header="t('trading.goldToken')" class="m-4">
      <div class="grid">
        <div class="col-12 md:col-9">
          <p>
            {{ t('tokens.goldTokenMainnetId') }}
            <a href="https://allo.info/asset/1241944285" target="_blank">1241944285</a>
          </p>
          <p>
            {{ t('tokens.reservesAddress') }}
            <a
              href="https://allo.info/account/OAOYIJWXVC44DBCX5GKCDZVDGGHQJFAKHLTYDCT5DKJPQL7TNWLUFH5KOM/assets"
              target="_blank"
              >OAOY..5KOM</a
            >
          </p>
          <p>
            {{ t('tokens.goldTokenWhitePaper') }}
            <a href="/gold.pdf" target="_blank">gold.pdf</a>
          </p>
          <p>
            {{ t('tokens.goldTokenDescription') }}
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
