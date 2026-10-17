<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from '@/components/ui/UiPanel.vue'
import Button from '@/components/ui/UiButton.vue'
import InputText from '@/components/ui/UiInputText.vue'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import { useAppStore } from '@/stores/app'
import SelectButton from '@/components/ui/UiSelectButton.vue'
import { onMounted, reactive, watch, computed } from 'vue'
import Dropdown from '@/components/ui/UiDropdown.vue'
import countries from '../../scripts/common/countries'
import { bffGetProfile, bffUpdateProfile } from '@/scripts/axios/BFF'
import type IProfile from '@/types/IProfile'
import { useToast } from '@/components/ui/useToast'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useAppStore()

const emptyProfile: IProfile = {
  legalEntity: 'natural-person',
  firstName: '',
  lastName: '',
  company: '',
  taxId: '',
  deliveryAddress: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  residentialAddress: {
    street: '',
    city: '',
    zip: '',
    country: ''
  },
  companyAddress: {
    street: '',
    city: '',
    zip: '',
    country: ''
  }
}
const state = reactive({
  legalEntityOptions: computed(() => [
    {
      name: t('profile.naturalPerson'),
      value: 'natural-person'
    },
    {
      name: t('profile.legalEntity'),
      value: 'legal-entity'
    }
  ]),
  profile: emptyProfile,
  saving: false,
  saved: false
})

const addressSections = computed(() => [
  {
    key: 'delivery',
    title: t('profile.deliveryAddress'),
    model: state.profile.deliveryAddress,
    show: true
  },
  {
    key: 'residential',
    title: t('profile.residentialAddress'),
    model: state.profile.residentialAddress,
    show: true
  },
  {
    key: 'company',
    title: t('profile.companyAddress'),
    model: state.profile.companyAddress,
    show: state.profile.legalEntity == 'legal-entity'
  }
])

const toast = useToast()
async function storeProfile() {
  state.saving = true
  try {
    if (!store.state.authState?.arc14Header) {
      console.error('Missing arc14Header')
      return
    }
    const profile = await bffUpdateProfile(state.profile, store.state.authState.arc14Header)
    if (!profile) return
    state.saving = false
    state.saved = true
    await loadProfile()
  } catch (err: any) {
    console.error('err.storeProfile', err)
    if (err?.response?.data?.title) {
      toast.add({
        severity: 'error',
        detail: err.response.data.title,
        life: 5000
      })
    } else {
      toast.add({
        severity: 'error',
        detail: t('profile.errorOccurred') + ' ' + err.message,
        life: 5000
      })
    }
  }
}
async function loadProfile() {
  if (!store.state.authState?.arc14Header) return
  const profile = await bffGetProfile(store.state.authState.arc14Header)
  if (!profile) return
  const profileObj = profile as IProfile
  state.profile = profileObj
}

watch(store.state.authState, async () => {
  await loadProfile()
})

onMounted(async () => {
  await loadProfile()
})
</script>

<template>
  <Layout :hideTopMenu="true">
    <MenuLevel2Settings />
    <header class="page-hero">
      <div class="container">
        <h1>{{ t('profile.title') }}</h1>
      </div>
    </header>
    <div class="section">
      <div class="container profile">
        <Panel :header="t('profile.title')">
          <div class="form-grid">
            <div class="field field--full">
              <SelectButton
                v-model="state.profile.legalEntity"
                :options="state.legalEntityOptions"
                optionLabel="name"
                optionValue="value"
                aria-label="Legal entity"
              />
            </div>
            <div class="field">
              <label for="firstname">{{ t('profile.firstName') }}</label>
              <InputText id="firstname" type="text" v-model="state.profile.firstName" />
            </div>
            <div class="field">
              <label for="lastname">{{ t('profile.lastName') }}</label>
              <InputText id="lastname" type="text" v-model="state.profile.lastName" />
            </div>
            <template v-if="state.profile.legalEntity == 'legal-entity'">
              <div class="field">
                <label for="company">{{ t('profile.companyName') }}</label>
                <InputText id="company" type="text" v-model="state.profile.company" />
              </div>
              <div class="field">
                <label for="taxid">{{ t('profile.taxId') }}</label>
                <InputText id="taxid" type="text" v-model="state.profile.taxId" />
              </div>
            </template>
          </div>
        </Panel>

        <div class="profile__addresses">
          <template v-for="section in addressSections" :key="section.key">
            <Panel v-if="section.show" :header="section.title">
              <div class="form-grid form-grid--single">
                <div class="field">
                  <label :for="`${section.key}Street`">{{ t('profile.street') }}</label>
                  <InputText
                    :id="`${section.key}Street`"
                    type="text"
                    v-model="section.model.street"
                  />
                </div>
                <div class="field">
                  <label :for="`${section.key}City`">{{ t('profile.city') }}</label>
                  <InputText :id="`${section.key}City`" type="text" v-model="section.model.city" />
                </div>
                <div class="field">
                  <label :for="`${section.key}Zip`">{{ t('profile.zipCode') }}</label>
                  <InputText :id="`${section.key}Zip`" type="text" v-model="section.model.zip" />
                </div>
                <div class="field">
                  <label :for="`${section.key}Country`">{{ t('profile.country') }}</label>
                  <Dropdown
                    filter
                    :id="`${section.key}Country`"
                    v-model="section.model.country"
                    optionLabel="countryName"
                    optionValue="countryName"
                    :options="countries"
                  />
                </div>
              </div>
            </Panel>
          </template>
        </div>

        <div class="profile__footer">
          <p v-if="store.state.authState.account" class="profile__account">
            You are authenticated using address
            <code>{{ store.state.authState.account }}</code>
          </p>
          <Button
            :disabled="state.saving"
            @click="storeProfile"
            :severity="state.saved ? 'success' : 'primary'"
            >Save</Button
          >
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped>
.profile {
  display: grid;
  gap: 1.5rem;
}
.profile__addresses {
  display: grid;
  gap: 1.5rem;
  align-items: start;
}
.form-grid {
  display: grid;
  gap: 1.1rem 1.5rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}
.field label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--ink-soft);
}
.profile__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}
.profile__account {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}
.profile__account code {
  font-size: 0.85em;
}
@media (min-width: 768px) {
  .form-grid:not(.form-grid--single) {
    grid-template-columns: 1fr 1fr;
  }
  .field--full {
    grid-column: 1 / -1;
  }
  .profile__addresses {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
