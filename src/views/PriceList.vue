<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <Layout :hide-top-menu="false">
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('trading.priceList') }}</h1>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="card-grid price-grid">
          <article class="price-card">
            <h2>{{ t('priceList.buyGoldTokenDex') }}</h2>
            <p class="price-card__fee">{{ t('priceList.ourCommission') }} <strong>0%</strong></p>
            <p>{{ t('priceList.dexCharges') }}</p>
            <RouterLink class="price-card__link" to="/trade-gold">{{
              t('priceList.serviceLink')
            }}</RouterLink>
          </article>

          <article class="price-card">
            <h2>{{ t('priceList.sellGoldTokenDex') }}</h2>
            <p class="price-card__fee">{{ t('priceList.ourCommission') }} <strong>0%</strong></p>
            <p>{{ t('priceList.dexCharges') }}</p>
            <RouterLink class="price-card__link" to="/trade-gold">{{
              t('priceList.serviceLink')
            }}</RouterLink>
          </article>

          <article class="price-card">
            <h2>{{ t('priceList.buyGoldTokenBank') }}</h2>
            <p class="price-card__fee">{{ t('priceList.ourCommission') }} <strong>0.1%</strong></p>
            <p>{{ t('priceList.bankCharges') }}</p>
            <p>{{ t('priceList.rfqPrice') }}</p>
            <p>{{ t('priceList.rfqFinal') }}</p>
            <RouterLink class="price-card__link" to="/buy-gold-with-eur">{{
              t('priceList.serviceLink')
            }}</RouterLink>
          </article>

          <article class="price-card">
            <h2>{{ t('priceList.addGoldCoin') }}</h2>
            <p class="price-card__fee">{{ t('priceList.ourCommission') }} <strong>3%</strong></p>
            <p>{{ t('priceList.addGoldDescription') }}</p>
            <p>{{ t('priceList.priceStoredOnBlockchain') }}</p>
            <RouterLink class="price-card__link" to="/buy-gold-coins">{{
              t('priceList.serviceLink')
            }}</RouterLink>
          </article>

          <article class="price-card">
            <h2>{{ t('priceList.secondaryMarketplace') }}</h2>
            <p class="price-card__fee">{{ t('priceList.ourCommission') }} <strong>0,1%</strong></p>
            <p>{{ t('priceList.secondaryMarketplaceDescription') }}</p>
            <RouterLink class="price-card__link" to="/buy-gold-coins">{{
              t('priceList.serviceLink')
            }}</RouterLink>
          </article>

          <article class="price-card">
            <h2>{{ t('priceList.physicalDelivery') }}</h2>
            <p class="price-card__fee">
              {{ t('priceList.ourCommission') }} <strong>0,9 gold token</strong>
            </p>
            <p>{{ t('priceList.postalServices') }}</p>
            <p>{{ t('priceList.physicalDeliveryDescription') }}</p>
            <RouterLink class="price-card__link" to="/buy-gold-coins">{{
              t('priceList.serviceLink')
            }}</RouterLink>
          </article>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.price-grid {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
}
.price-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.price-card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}
.price-card p {
  color: var(--ink-soft);
  font-size: 0.95rem;
}
.price-card__fee {
  align-self: flex-start;
  padding: 0.3rem 0.7rem;
  background: var(--gold-50);
  border: 1px solid var(--gold-100);
  border-radius: 999px;
  color: var(--gold-700);
  font-size: 0.9rem;
}
.price-card__link {
  margin-top: auto;
  padding-top: 0.5rem;
  font-weight: 600;
}
</style>
