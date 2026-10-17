<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('governance.governanceToken') }}</h1>
        <p>{{ t('governance.daoTokenDescription') }}</p>
      </div>
    </header>
    <div class="section">
      <div class="container token">
        <div class="token__body">
          <ul class="token__list">
            <li>
              <span>{{ t('tokens.governanceTokenMainnetId') }}</span>
              <a href="https://allo.info/asset/1241945177" target="_blank" rel="noopener">1241945177</a>
            </li>
            <li>
              <span>{{ t('tokens.daoTokenWhitePaper') }}</span>
              <a href="/dao.pdf" target="_blank" rel="noopener">dao.pdf</a>
            </li>
            <li>
              <a href="https://explorer.perawallet.app/assets/1241945177/" target="_blank" rel="noopener">{{ t('governance.verifiedBy') }}</a>
              <span>by Pera {{ t('governance.since') }} 2023-11-14</span>
            </li>
            <li>
              <span>{{ t('governance.priceDevelopment') }}</span>
              <a href="https://algorand.scan.biatec.io/asset/1241945177" target="_blank" rel="noopener">by Biatec Scan</a>
            </li>
            <li>
              <span>{{ t('tokens.downloadAsaGold') }}</span>
              <a href="/ASA.Gold-Pitch-Deck.pdf" target="_blank" rel="noopener">{{ t('governance.pitchDeck') }}</a>
            </li>
          </ul>
        </div>
        <figure class="token__media">
          <img
            src="https://bff.asa.gold/ipfs/QmUvP2dfc2qhn7Ym3p2h4B6MQHFLx9F3UFmowyoZ89NkXy"
            alt="DAO Token"
            loading="lazy"
          />
        </figure>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.token {
  display: grid;
  gap: 2rem;
  align-items: start;
}
.token__list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.token__list li {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
  color: var(--ink-soft);
}
.token__list li:last-child {
  border-bottom: 0;
}
.token__media {
  margin: 0;
  max-width: 280px;
}
.token__media img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}
@media (min-width: 768px) {
  .token {
    grid-template-columns: 1fr 260px;
  }
}
</style>
