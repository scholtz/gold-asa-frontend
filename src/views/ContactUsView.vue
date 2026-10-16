<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const team = [
  {
    image: '/images/OS.png',
    name: 'Olga Scholtz',
    title: 'contact.cooTitle',
    description: 'contact.cooDescription'
  },
  {
    image: '/images/MF.webp',
    name: 'Michal Fecko',
    title: 'contact.cfoTitle',
    description: 'contact.cfoDescription'
  },
  {
    image: '/images/SZ.jpg',
    name: 'Samuel Zubo',
    title: 'contact.cmoTitle',
    description: 'contact.cmoDescription'
  },
  {
    image: '/images/DD.webp',
    name: 'Daniel Dohne',
    title: 'contact.ctoTitle',
    description: 'contact.ctoDescription'
  }
]
</script>

<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('contact.title') }}</h1>
        <p>{{ t('contact.subtitle') }}</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <p class="main-mail">
          <a href="mailto:support@asa.gold">support@asa.gold</a>
        </p>
        <div class="contacts">
          <article class="contact">
            <span class="contact__icon"><UiIcon name="mail" /></span>
            <h2>{{ t('contact.inquiries') }}</h2>
            <dl>
              <dt>{{ t('common.general') }}</dt>
              <dd><a href="mailto:support@asa.gold">support@asa.gold</a></dd>
              <dt>{{ t('common.orders') }}</dt>
              <dd><a href="mailto:orders@asa.gold">orders@asa.gold</a></dd>
            </dl>
          </article>
          <article class="contact">
            <span class="contact__icon"><UiIcon name="chat" /></span>
            <h2>Other Contact Info</h2>
            <dl>
              <dt>Press</dt>
              <dd><a href="mailto:media@asa.gold">media@asa.gold</a></dd>
              <dt>Warranty and complaints</dt>
              <dd><a href="mailto:complaints@asa.gold">complaints@asa.gold</a></dd>
            </dl>
          </article>
          <article class="contact">
            <span class="contact__icon"><UiIcon name="shield" /></span>
            <h2>Legal inquiries</h2>
            <dl>
              <dt>Legal inquiries</dt>
              <dd><a href="mailto:legal@asa.gold">legal@asa.gold</a></dd>
            </dl>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container company">
        <div class="section-head">
          <p class="eyebrow">Scholtz &amp; Company, j.s.a.</p>
          <h2>Company Identification</h2>
          <p>
            Spoločnosť Scholtz &amp; Company, j.s.a.V roku 2018 v období od 1.8 do 31.12 zverejnila
            tržby 0 € so ziskom 0 €.
          </p>
        </div>
        <dl class="company__facts">
          <div>
            <dt>Company Name</dt>
            <dd>Scholtz &amp; Company, j.s.a.</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd>51882272</dd>
          </div>
          <div>
            <dt>VAT ID</dt>
            <dd>2120828105</dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>Švabinského 21, 851 01 Bratislava, Slovakia</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">{{ t('contact.ceoTitle') }}</p>
          <h2>{{ t('contact.teamTitle') }}</h2>
          <p>{{ t('contact.teamDescription') }}</p>
        </div>
        <div class="team">
          <article class="member member--ceo">
            <img
              src="/images/LS.png"
              alt="Ludo Scholtz, Everyday Algonaut"
              class="member__photo"
              loading="lazy"
            />
            <div class="member__body">
              <h3>Ludo Scholtz, Everyday Algonaut</h3>
              <span class="member__role">{{ t('contact.ceoTitle') }}</span>
              <p>{{ t('contact.ceoDescription') }}</p>
            </div>
          </article>
          <article v-for="person in team" :key="person.name" class="member">
            <img :src="person.image" :alt="person.name" class="member__photo" loading="lazy" />
            <div class="member__body">
              <h3>{{ person.name }}</h3>
              <span class="member__role">{{ t(person.title) }}</span>
              <p>{{ t(person.description) }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.main-mail {
  margin: 0 0 2rem;
  text-align: center;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.2rem);
}
.contacts {
  display: grid;
  gap: 1.25rem;
}
.contact {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.contact__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.8rem;
  height: 2.8rem;
  margin-bottom: 0.9rem;
  border-radius: 50%;
  background: var(--gold-50);
  color: var(--gold-700);
}
.contact h2 {
  margin: 0 0 0.8rem;
  font-size: 1.25rem;
}
.contact dt {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 0.7rem;
}
.contact dd {
  margin: 0.1rem 0 0;
  overflow-wrap: anywhere;
}
.company {
  max-width: 760px;
}
.company__facts {
  margin: 0;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.company__facts div {
  display: grid;
  gap: 0.15rem 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--line);
}
.company__facts div:last-child {
  border-bottom: 0;
}
.company__facts dt {
  font-size: 0.85rem;
  color: var(--muted);
}
.company__facts dd {
  margin: 0;
  font-weight: 600;
}
.team {
  display: grid;
  gap: 1.25rem;
}
.member {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.member__photo {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-position: top;
  background: var(--surface-alt);
}
.member__body {
  padding: 1.1rem 1.25rem 1.4rem;
}
.member__body h3 {
  margin: 0 0 0.2rem;
  font-size: 1.15rem;
}
.member__role {
  display: block;
  margin-bottom: 0.7rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gold-700);
}
.member__body p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.95rem;
}
@media (min-width: 576px) {
  .team {
    grid-template-columns: repeat(2, 1fr);
  }
  .company__facts div {
    grid-template-columns: 160px 1fr;
  }
}
@media (min-width: 768px) {
  .contacts {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 992px) {
  .team {
    grid-template-columns: repeat(4, 1fr);
  }
  .member--ceo {
    grid-column: 1 / -1;
    flex-direction: row;
  }
  .member--ceo .member__photo {
    width: 260px;
    aspect-ratio: auto;
    flex-shrink: 0;
  }
  .member--ceo .member__body {
    align-self: center;
    padding: 2rem;
  }
  .member--ceo .member__body h3 {
    font-size: 1.5rem;
  }
}
</style>
