<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Card from '@/components/ui/UiCard.vue'
import Timeline from '@/components/ui/UiTimeline.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { computed } from 'vue'
import { aboutTimeline } from './aboutTimeline'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const events = computed(() => {
  const format = new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  })
  return aboutTimeline.map(([month, key]) => {
    const [year, m] = month.split('-').map(Number)
    return {
      date: format.format(new Date(Date.UTC(year, m - 1, 1))),
      content: t(`about.events.${key}`)
    }
  })
})

const repos = [
  { label: 'FE', icon: 'home', href: 'https://github.com/scholtz/gold-asa-frontend' },
  { label: 'BFF', icon: 'cog', href: 'https://github.com/scholtz/AsaGoldBff' },
  { label: 'RepoApi', icon: 'list', href: 'https://github.com/scholtz/AsaGoldRepository' },
  {
    labelKey: 'about.repoEshop',
    icon: 'shield',
    href: 'https://github.com/scholtz/gold-asa-frontend/tree/main/asa-gold-smartcontract'
  },
  {
    label: 'AuthComponent',
    icon: 'user',
    href: 'https://github.com/scholtz/algorand-authentication-component-vue'
  },
  {
    labelKey: 'about.repoNpm',
    icon: 'coins',
    href: 'https://www.npmjs.com/package/algorand-asa-gold'
  }
]

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
        <p class="eyebrow">ASA.Gold</p>
        <h1>{{ t('home.aboutAsaGoldProject') }}</h1>
        <p>
          {{ t('about.heroIntro') }}
        </p>
      </div>
    </header>

    <section class="section">
      <div class="container story">
        <h2>{{ t('about.storyTitle') }}</h2>
        <p class="story__lead">
          {{ t('about.storyLead') }}
        </p>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">{{ t('about.progressEyebrow') }}</p>
          <h2>
            <a href="https://dorahacks.io/buidl/7763" target="_blank" rel="noopener"
              >Algorand's Build a Bull hackathon</a
            >
          </h2>
          <p>{{ t('about.hackathonIntro') }}</p>
        </div>
        <div class="timeline">
          <Timeline :value="events" align="left">
            <template #marker>
              <span class="timeline__marker" aria-hidden="true"></span>
            </template>
            <template #content="slotProps">
              <Card class="timeline__card">
                <template #subtitle>{{ slotProps.item.date }}</template>
                <template #content>
                  <p>{{ slotProps.item.content }}</p>
                </template>
              </Card>
            </template>
          </Timeline>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">{{ t('about.openSourceEyebrow') }}</p>
          <h2>{{ t('about.openSourceTitle') }}</h2>
          <p>{{ t('about.openSourceLead') }}</p>
        </div>
        <ul class="repos">
          <li v-for="repo in repos" :key="repo.href">
            <a :href="repo.href" target="_blank" rel="noopener" class="repo">
              <span class="repo__icon"><UiIcon :name="repo.icon" /></span>
              <span class="repo__label">{{ repo.labelKey ? t(repo.labelKey) : repo.label }}</span>
              <UiIcon name="chevron-right" class="repo__arrow" />
            </a>
          </li>
        </ul>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-head">
          <p class="eyebrow">{{ t('contact.ceoTitle') }}</p>
          <h2>{{ t('about.teamTitle') }}</h2>
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
.story {
  max-width: 760px;
}
.story__lead {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--ink-soft);
}
.timeline {
  max-width: 760px;
  margin: 0 auto;
}
.timeline__marker {
  display: block;
  width: 0.9rem;
  height: 0.9rem;
  margin-top: 1.4rem;
  border-radius: 50%;
  background: var(--gold-500);
  border: 3px solid var(--surface);
  box-shadow: 0 0 0 1px var(--gold-600);
}
.timeline__card {
  margin-bottom: 1rem;
}
.timeline__card p {
  margin: 0;
  overflow-wrap: anywhere;
}
.repos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.9rem;
}
.repo {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.2rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  font-weight: 600;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.repo:hover {
  border-color: var(--gold-500);
  transform: translateY(-1px);
}
.repo__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--gold-50);
  color: var(--gold-700);
  flex-shrink: 0;
}
.repo__label {
  flex: 1;
}
.repo__arrow {
  color: var(--muted);
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
  .repos {
    grid-template-columns: repeat(2, 1fr);
  }
  .team {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 992px) {
  .repos {
    grid-template-columns: repeat(3, 1fr);
  }
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
