<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Button from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
})
</script>
<template>
  <Layout :hideTopMenu="false">
    <section class="hero">
      <div class="container hero__inner">
        <span class="eyebrow hero__eyebrow">ASA.Gold</span>
        <h1 class="hero__title">{{ t('home.aurumStandardAsset') }}</h1>
        <p class="hero__lead">{{ t('home.letsBreakGoldMarket') }}</p>
        <div class="hero__actions">
          <RouterLink to="/buy-gold-coins">
            <Button size="large">{{ t('home.buyTheGoldCoin') }}</Button>
          </RouterLink>
          <RouterLink to="/proof-of-reserve">
            <Button size="large" severity="secondary" outlined class="hero__ghost">{{
              t('navigation.proofOfReserves')
            }}</Button>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>{{ t('home.aurumStandardAsset') }}</h2>
          <p>{{ t('home.buyUseAudit') }}</p>
        </div>
        <div class="features">
          <article class="feature">
            <span class="feature__icon"><UiIcon name="user" size="1.5em" /></span>
            <h3>{{ t('home.aboutAsaGoldProject') }}</h3>
            <p>{{ t('home.startupDescription') }}</p>
          </article>
          <article class="feature">
            <span class="feature__icon"><UiIcon name="shield" size="1.5em" /></span>
            <h3>{{ t('home.goldMarketRevolution') }}</h3>
            <p>{{ t('home.revolutionDescription') }}</p>
          </article>
          <article class="feature">
            <span class="feature__icon"><UiIcon name="coins" size="1.5em" /></span>
            <h3>{{ t('navigation.buyGoldCoins') }}</h3>
            <p>{{ t('carousel.buyGoldNftTrade') }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <ProductsCarousel />
      </div>
    </section>

    <section class="section section--dark cta">
      <div class="container cta__inner">
        <h2>{{ t('home.letsBreakGoldMarket') }}</h2>
        <RouterLink to="/buy-gold-coins">
          <Button size="large">{{ t('home.buyTheGoldCoin') }}</Button>
        </RouterLink>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  color: var(--on-dark);
  background: linear-gradient(135deg, var(--dark) 0%, var(--dark-2) 100%);
  border-bottom: 3px solid var(--gold-500);
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(60% 80% at 80% 20%, rgba(227, 199, 102, 0.22), transparent 70%),
    url('/background.jpg') center / cover no-repeat;
  opacity: 0.18;
}
.hero__inner {
  padding-top: 5rem;
  padding-bottom: 5rem;
  max-width: 860px;
  text-align: center;
}
.hero__eyebrow {
  color: var(--gold-300);
}
.hero__title {
  margin: 0 0 1rem;
  color: var(--on-dark);
  font-size: clamp(2.2rem, 6vw, 3.75rem);
  line-height: 1.1;
}
.hero__lead {
  max-width: 40ch;
  margin: 0 auto 2rem;
  font-size: clamp(1.05rem, 2.5vw, 1.35rem);
  color: var(--on-dark-muted);
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
.hero__actions a {
  text-decoration: none;
}
.hero__ghost {
  color: var(--on-dark);
  border-color: rgba(244, 241, 232, 0.5);
}

.features {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}
.feature {
  padding: 1.75rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.feature h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1.2rem;
}
.feature p {
  margin: 0;
  color: var(--ink-soft);
}
.feature__icon {
  display: inline-grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  color: var(--gold-700);
  background: var(--gold-50);
  border: 1px solid var(--gold-300);
  border-radius: 50%;
}

.cta__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}
.cta__inner h2 {
  margin: 0;
  max-width: 28ch;
}
.cta__inner a {
  text-decoration: none;
}

@media (min-width: 768px) {
  .hero__inner {
    padding-top: 7rem;
    padding-bottom: 7rem;
  }
  .features {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
