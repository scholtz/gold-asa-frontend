<script setup lang="ts">
import Image from 'primevue/image'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const isMobile = ref(false)

function handleResize() {
  if (window.innerWidth <= 768) {
    isMobile.value = true
  } else {
    isMobile.value = false
  }
}

onMounted(() => {
  if (window.innerWidth <= 768) {
    isMobile.value = true
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
<template>
  <div class="surface-section custom-footer py-7 md:px-6 lg:px-8">
    <div class="grid">
      <div class="lg:col-3 md:col-6 md:text-center sm:col-12 mb-4 px-5 text-center">
        <span class="mb-3 inline-block footer-name" style="border-radius: 10px">
          <img
            class="md:ml-auto block md:h-full"
            src="/images/logo.png"
            style="width: 80px"
            alt="logo"
            @click="router.push('/')"
          />
        </span>
        <div class="text-900 text-xl mb-3 font-medium footer-name">ASA - Real gold</div>
        <span class="text-300 line-height-3">&copy; 2023 Scholtz &amp; Company, jsa</span>
      </div>
      <div
        :class="
          isMobile
            ? 'col-12 px-5 font-style text-center'
            : 'lg:col-3 md:col-6 md:text-center sm:col-12 px-5 font-style'
        "
      >
        <div class="text-900 text-xl mb-3 font-medium">{{ t('footer.ourLinks') }}</div>
        <div class="font-style-div">
          <RouterLink to="/about-asa-gold">{{ t('footer.aboutAsaGoldProject') }}</RouterLink>
        </div>
        <div class="font-style-div">
          <RouterLink to="/contact-us">{{ t('footer.contactUs') }}</RouterLink>
        </div>
        <div class="font-style-div">
          <RouterLink to="/gdpr/latest">{{ t('footer.gdprPolicy') }}</RouterLink>
        </div>
        <div class="font-style-div">
          <RouterLink to="/terms/latest">{{ t('footer.termsAndAgreement') }}</RouterLink>
        </div>
      </div>

      <div
        :class="
          isMobile
            ? 'col-12 px-5 font-style text-center mt-2'
            : 'lg:col-3 md:col-6 md:text-center sm:col-12 px-5 font-style'
        "
      >
        <div class="text-900 text-xl mb-3 font-medium">{{ t('footer.resources') }}</div>
        <div class="font-style-div">
          <a href="https://www.asa.gold/">{{ t('footer.mainNet') }}</a>
        </div>
        <div class="font-style-div">
          <a href="https://testnet.asa.gold/">{{ t('footer.testNet') }}</a>
        </div>

        <div class="font-style-div">
          <RouterLink to="/settings">{{ t('footer.settings') }}</RouterLink>
        </div>
        <div class="font-style-div">
          <RouterLink to="/price-list">{{ t('footer.priceList') }}</RouterLink>
        </div>
        <div class="font-style-div">
          <RouterLink to="/token/dao">{{ t('footer.daoToken') }}</RouterLink>
        </div>
        <div class="font-style-div">
          <RouterLink to="/token/gold">{{ t('footer.goldToken') }}</RouterLink>
        </div>
      </div>
      <div
        :class="
          isMobile
            ? 'col-12 px-5 font-style text-center mt-2 contactus'
            : 'lg:col-3 md:col-6 md:text-center sm:col-12 px-5 font-style contactus'
        "
      >
        <div class="text-900 text-xl mb-3 font-medium ml-2">{{ t('footer.contactUs') }}</div>
        <a href="https://discord.gg/8m4KTcVSH9">
          <Button icon="pi pi-discord" severity="info" text raised rounded aria-label="User" />
        </a>
        <a href="https://t.me/+mWQObAvGe_5lNDNk">
          <Button
            icon="pi pi-telegram"
            severity="warning"
            label=""
            text
            raised
            rounded
            aria-label="Notification"
          />
        </a>
        <a href="https://twitter.com/eAlgonaut/">
          <Button icon="pi pi-twitter" severity="help" text raised rounded aria-label="Favorite" />
        </a>
      </div>
    </div>
  </div>
</template>
<style scoped>
.use-text-subtitle {
  color: #fff;
  margin-bottom: 48px;
  font-size: 30px;
  line-height: 36px;
  font-weight: var(--font-medium) !important;
}
.custom-footer {
  background-color: #333e48 !important;
}
.footer-name {
  color: #d4aa00 !important;
}
.font-style a {
  color: white !important;
  font-size: 14px !important;
  text-decoration: none !important;
}
.font-style .font-medium {
  color: white !important;
  font-size: 20px !important;
  font-weight: var(--font-bold);
  text-transform: uppercase;
}
.font-style-div {
  padding-top: 15px !important;
}
.font-style button {
  background-color: #d4aa00 !important;
  color: white;
  height: 45px;
  margin: 10px;
  width: 45px;
}
.footer-two {
  padding-top: 40px;
  border-top: 1px solid rgb(216 216 216 / 53%);
  max-width: 100%;
  clip: rect(0, auto, auto, 0);
  height: 100%;
  overflow: hidden;
  top: 0;
  width: 100%;
}
</style>
