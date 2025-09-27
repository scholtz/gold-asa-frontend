<script setup lang="ts">
import Penel from 'primevue/panel'
import Layout from '@/layouts/AuthLayout.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <Layout :hideTopMenu="false">
    <Penel :header="t('governance.governanceToken')" class="m-4">
      <div class="grid">
        <div class="col-12 md:col-9">
          <p>
            {{ t('tokens.governanceTokenMainnetId') }}
            <a href="https://allo.info/asset/1241945177" target="_blank">1241945177</a>
          </p>
          <p>
            {{ t('tokens.daoTokenWhitePaper') }}
            <a href="/dao.pdf" target="_blank">dao.pdf</a>
          </p>
          <p>
            {{ t('governance.daoTokenDescription') }}
          </p>
          <p>
            <a href="https://explorer.perawallet.app/assets/1241945177/" target="_blank"
              >{{ t('governance.verifiedBy') }}</a
            >
            by Pera {{ t('governance.since') }} 2023-11-14
          </p>
          <p>
            {{ t('governance.priceDevelopment') }}
            <a href="https://vestige.fi/asset/1241945177" target="_blank">by Vestige</a>
          </p>
          <p>
            {{ t('tokens.downloadAsaGold') }}
            <a href="/ASA.Gold-Pitch-Deck.pdf" target="_blank">{{ t('governance.pitchDeck') }}</a>
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
