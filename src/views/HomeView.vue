<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import ProductsCarousel from '@/components/ProductsCarousel.vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Button from 'primevue/button'
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
    <div class="grid grid-nogutter surface-section backgroundImage text-800">
      <div class="container">
        <div
          class="col-12 md:col-12 sm:col-12 text-secondary welcome-banner text-center nav-text text-center"
        >
          <div class="welcome-content">
            <section class="fontcolor">
              <div class="sm:m-2 md:m-4 allfont landing-container">
                <h1 class="m-0 p-0">{{ t('home.aurumStandardAsset') }}</h1>
                <p class="m-2 p-0">{{ t('home.letsBreakGoldMarket') }}</p>
                <RouterLink to="/buy-gold-coins">
                  <Button>{{ t('home.buyTheGoldCoin') }}</Button>
                </RouterLink>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <section class="services-area-two privacy-body ptb-80 bg-f9f6f6">
      <div class="container">
        <div class="section-title">
          <h2>{{ t('home.aurumStandardAsset') }}</h2>
          <div class="bar"></div>
          <p>
            {{ t('home.buyUseAudit') }}
          </p>
        </div>
      </div>
      <div class="container">
        <div class="row h-100 justify-content-center align-items-center">
          <div class="col-12 md:col-6 services-content" data-aos="fade-up">
            <div class="section-title">
              <h2>{{ t('home.aboutAsaGoldProject') }}</h2>
              <div class="bar"></div>
              <p>
                {{ t('home.startupDescription') }}
              </p>
            </div>
          </div>
          <div class="lg:col-6 iot-features-image" data-aos="fade-up">
            <img src="/images/policy/1.png" alt="image" />
          </div>
        </div>
        <div class="row h-100 justify-content-center align-items-center">
          <div class="lg:col-6 iot-features-image" data-aos="fade-up">
            <img src="/images/policy/3.png" alt="image" />
          </div>
          <div class="col-12 md:col-6 services-content" data-aos="fade-up">
            <div class="section-title">
              <h2>{{ t('home.goldMarketRevolution') }}</h2>
              <div class="bar"></div>
              <p>
                {{ t('home.revolutionDescription') }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="grid">
        <div class="col-12">
          <ProductsCarousel />
        </div>
      </div>
    </section>
  </Layout>
</template>

<style>
.fontcolor {
  font-size: '30px';
}
.background-container {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.landing-container {
  background-color: rgba(51, 51, 51, 0.9); /* #333 with 50% opacity */
  border-radius: 12px; /* adjust as needed */
  padding: 0 1em 1em 1em;
}
</style>
