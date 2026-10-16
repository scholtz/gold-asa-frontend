<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <RouterLink to="/" class="site-footer__logo" aria-label="ASA.Gold home">
            <img src="/images/logo.png" alt="" width="52" height="52" />
            <span>ASA<span>.Gold</span></span>
          </RouterLink>
          <p>ASA - Real gold</p>
          <div class="site-footer__social">
            <a href="https://discord.gg/8m4KTcVSH9" aria-label="Discord" rel="noopener" target="_blank">
              <UiIcon name="discord" size="1.3em" />
            </a>
            <a href="https://t.me/+mWQObAvGe_5lNDNk" aria-label="Telegram" rel="noopener" target="_blank">
              <UiIcon name="telegram" size="1.3em" />
            </a>
            <a href="https://twitter.com/eAlgonaut/" aria-label="X (Twitter)" rel="noopener" target="_blank">
              <UiIcon name="x" size="1.3em" />
            </a>
          </div>
        </div>

        <nav class="site-footer__col" :aria-label="t('footer.ourLinks')">
          <h2>{{ t('footer.ourLinks') }}</h2>
          <RouterLink to="/about-asa-gold">{{ t('footer.aboutAsaGoldProject') }}</RouterLink>
          <RouterLink to="/contact-us">{{ t('footer.contactUs') }}</RouterLink>
          <RouterLink to="/gdpr/latest">{{ t('footer.gdprPolicy') }}</RouterLink>
          <RouterLink to="/terms/latest">{{ t('footer.termsAndAgreement') }}</RouterLink>
        </nav>

        <nav class="site-footer__col" :aria-label="t('footer.resources')">
          <h2>{{ t('footer.resources') }}</h2>
          <a href="https://www.asa.gold/">{{ t('footer.mainNet') }}</a>
          <a href="https://testnet.asa.gold/">{{ t('footer.testNet') }}</a>
          <RouterLink to="/settings">{{ t('footer.settings') }}</RouterLink>
          <RouterLink to="/price-list">{{ t('footer.priceList') }}</RouterLink>
          <RouterLink to="/token/dao">{{ t('footer.daoToken') }}</RouterLink>
          <RouterLink to="/token/gold">{{ t('footer.goldToken') }}</RouterLink>
        </nav>

        <div class="site-footer__col">
          <h2>{{ t('footer.language') }}</h2>
          <LanguageSwitcher data-testid="footer-language-switcher" />
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>&copy; {{ year }} Scholtz &amp; Company, jsa</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: auto;
  padding: 3.5rem 0 1.5rem;
  color: var(--on-dark-muted);
  background: var(--dark);
  border-top: 3px solid var(--gold-500);
}
.site-footer__grid {
  display: grid;
  gap: 2.5rem;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
}
.site-footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--on-dark);
  text-decoration: none;
}
.site-footer__logo:hover {
  text-decoration: none;
  color: var(--on-dark);
}
.site-footer__logo img {
  border-radius: 50%;
}
.site-footer__logo span span {
  color: var(--gold-300);
}
.site-footer__brand p {
  margin: 0.8rem 0 1rem;
}
.site-footer__social {
  display: flex;
  gap: 0.6rem;
}
.site-footer__social a {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--on-dark);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}
.site-footer__social a:hover {
  color: var(--dark);
  background: var(--gold-300);
  border-color: var(--gold-300);
  text-decoration: none;
}
.site-footer__col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.55rem;
}
.site-footer__col h2 {
  margin: 0 0 0.4rem;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--on-dark);
}
.site-footer__col a {
  font-size: 0.93rem;
  color: var(--on-dark-muted);
}
.site-footer__col a:hover {
  color: var(--gold-300);
}
.site-footer__bottom {
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  font-size: 0.85rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 991px) {
  .site-footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 575px) {
  .site-footer__grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
