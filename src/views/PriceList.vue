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
        {{ t('priceList.priceStoredOnBlockchain') }}
      </p>
      <p><RouterLink to="/buy-gold-coins">Service link</RouterLink></p>

      <h2>{{ t('priceList.secondaryMarketplace') }}</h2>
      <p>{{ t('priceList.ourCommission') }} 0,1%</p>
      <p>
        {{ t('priceList.secondaryMarketplaceDescription') }}
      </p>
      <p><RouterLink to="/buy-gold-coins">{{ t('priceList.serviceLink') }}</RouterLink></p>

      <h2>{{ t('priceList.physicalDelivery') }}</h2>
      <p>{{ t('priceList.ourCommission') }} 0,9 gold token</p>
      <p>{{ t('priceList.postalServices') }}</p>
      <p>{{ t('priceList.physicalDeliveryDescription') }}</p>
      <p><RouterLink to="/buy-gold-coins">{{ t('priceList.serviceLink') }}</RouterLink></p>
    </Panel></Layout
  >
</template>
