<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <Layout :hide-top-menu="false">
    <Panel
      :header="t('trading.priceList')"
      class="m-4 flex flex-grow-1 flex-column"
      toggleableContent="text"
    >
      <h2>{{ t('priceList.buyGoldTokenDex') }}</h2>
      <p>{{ t('priceList.ourCommission') }} 0%</p>
      <p><RouterLink to="/trade-gold">{{ t('priceList.serviceLink') }}</RouterLink></p>
      <p>
        {{ t('priceList.dexCharges') }}
      </p>

      <h2>{{ t('priceList.sellGoldTokenDex') }}</h2>
      <p>{{ t('priceList.ourCommission') }} 0%</p>
      <p>
        {{ t('priceList.dexCharges') }}
      </p>
      <p><RouterLink to="/trade-gold">{{ t('priceList.serviceLink') }}</RouterLink></p>

      <h2>{{ t('priceList.buyGoldTokenBank') }}</h2>
      <p>{{ t('priceList.ourCommission') }} 0.1%</p>
      <p>
        {{ t('priceList.bankCharges') }}
      </p>
      <p>{{ t('priceList.rfqPrice') }}</p>
      <p>{{ t('priceList.rfqFinal') }}</p>
      <p><RouterLink to="/buy-gold-with-eur">{{ t('priceList.serviceLink') }}</RouterLink></p>

      <h2>{{ t('priceList.addGoldCoin') }}</h2>
      <p>{{ t('priceList.ourCommission') }} 3%</p>
      <p>
        {{ t('priceList.addGoldDescription') }}
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
      <p>Owner of the NFT can request physical deliver to EEC countries.</p>
      <p><RouterLink to="/buy-gold-coins">Service link</RouterLink></p>
    </Panel></Layout
  >
</template>
