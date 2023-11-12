<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import { useAppStore } from '@/stores/app'
import SelectButton from 'primevue/selectbutton'
import { onMounted, reactive, watch } from 'vue'
import Dropdown from 'primevue/dropdown'
import countries from '../../scripts/common/countries'
import { bffGetProfile, bffUpdateProfile } from '@/scripts/axios/BFF'
import type IProfile from '@/types/IProfile'
import { useToast } from 'primevue/usetoast'
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
  legalEntityOptions: [
    {
      name: 'Natural person',
      value: 'natural-person'
    },
    {
      name: 'Legal entity',
      value: 'legal-entity'
    }
  ],
  profile: emptyProfile,
  saving: false,
  saved: false
})

const toast = useToast()
async function storeProfile() {
  state.saving = true
  try {
    if (!store.state.authState?.arc14Header) return
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
        detail: 'Error occured:' + err.message,
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
    <Panel header="User profile" class="m-4 flex flex-grow-1 flex-column" toggleableContent="text">
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="field grid">
            <label class="col-12 mb-2 md:col-4 md:mb-0"></label>
            <div class="col-12 md:col-8">
              <SelectButton
                v-model="state.profile.legalEntity"
                :options="state.legalEntityOptions"
                optionLabel="name"
                optionValue="value"
                aria-labelledby="basic"
              />
            </div>
          </div>
          <div class="field grid">
            <label for="firstname" class="col-12 mb-2 md:col-4 md:mb-0">Firstname</label>
            <div class="col-12 md:col-8">
              <InputText
                id="firstname"
                type="text"
                class="w-full"
                v-model="state.profile.firstName"
              />
            </div>
          </div>
          <div class="field grid">
            <label for="lastname" class="col-12 mb-2 md:col-4 md:mb-0">Lastname</label>
            <div class="col-12 md:col-8">
              <InputText
                id="lastname"
                type="text"
                class="w-full"
                v-model="state.profile.lastName"
              />
            </div>
          </div>
          <div class="field grid" v-if="state.profile.legalEntity == 'legal-entity'">
            <label for="company" class="col-12 mb-2 md:col-4 md:mb-0">Company name</label>
            <div class="col-12 md:col-8">
              <InputText id="company" type="text" class="w-full" v-model="state.profile.company" />
            </div>
          </div>
          <div class="field grid" v-if="state.profile.legalEntity == 'legal-entity'">
            <label for="taxid" class="col-12 mb-2 md:col-4 md:mb-0">Tax ID</label>
            <div class="col-12 md:col-8">
              <InputText id="taxid" type="text" class="w-full" v-model="state.profile.taxId" />
            </div>
          </div>

          <Panel header="Delivery address">
            <div class="field grid">
              <label for="deliveryStreet" class="col-12 mb-2 md:col-4 md:mb-0">Street</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="deliveryStreet"
                  type="text"
                  class="w-full"
                  v-model="state.profile.deliveryAddress.street"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="deliveryCity" class="col-12 mb-2 md:col-4 md:mb-0">City</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="deliveryCity"
                  type="text"
                  class="w-full"
                  v-model="state.profile.deliveryAddress.city"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="deliveryZip" class="col-12 mb-2 md:col-4 md:mb-0">ZIP code</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="deliveryZip"
                  type="text"
                  class="w-full"
                  v-model="state.profile.deliveryAddress.zip"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="deliveryCountry" class="col-12 mb-2 md:col-4 md:mb-0">Country</label>
              <div class="col-12 md:col-8">
                <Dropdown
                  filter
                  id="deliveryCountry"
                  type="text"
                  class="w-full"
                  v-model="state.profile.deliveryAddress.country"
                  optionLabel="countryName"
                  optionValue="countryName"
                  :options="countries"
                />
              </div>
            </div>
          </Panel>
        </div>
        <div class="col-12 md:col-6">
          <Panel header="Your residential address">
            <div class="field grid">
              <label for="residentialStreet" class="col-12 mb-2 md:col-4 md:mb-0">Street</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="residentialStreet"
                  type="text"
                  class="w-full"
                  v-model="state.profile.residentialAddress.street"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="residentialCity" class="col-12 mb-2 md:col-4 md:mb-0">City</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="residentialCity"
                  type="text"
                  class="w-full"
                  v-model="state.profile.residentialAddress.city"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="residentialZip" class="col-12 mb-2 md:col-4 md:mb-0">ZIP code</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="residentialZip"
                  type="text"
                  class="w-full"
                  v-model="state.profile.residentialAddress.zip"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="residentialCountry" class="col-12 mb-2 md:col-4 md:mb-0">Country</label>
              <div class="col-12 md:col-8">
                <Dropdown
                  filter
                  id="residentialCountry"
                  type="text"
                  class="w-full"
                  v-model="state.profile.residentialAddress.country"
                  optionLabel="countryName"
                  optionValue="countryName"
                  :options="countries"
                />
              </div>
            </div>
          </Panel>
          <Panel
            header="Company address"
            class="my-2"
            v-if="state.profile.legalEntity == 'legal-entity'"
          >
            <div class="field grid">
              <label for="companyStreet" class="col-12 mb-2 md:col-4 md:mb-0">Street</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="companyStreet"
                  type="text"
                  class="w-full"
                  v-model="state.profile.companyAddress.street"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="companyCity" class="col-12 mb-2 md:col-4 md:mb-0">City</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="companyCity"
                  type="text"
                  class="w-full"
                  v-model="state.profile.companyAddress.city"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="companyZip" class="col-12 mb-2 md:col-4 md:mb-0">ZIP code</label>
              <div class="col-12 md:col-8">
                <InputText
                  id="companyZip"
                  type="text"
                  class="w-full"
                  v-model="state.profile.companyAddress.zip"
                />
              </div>
            </div>
            <div class="field grid">
              <label for="companyCountry" class="col-12 mb-2 md:col-4 md:mb-0">Country</label>
              <div class="col-12 md:col-8">
                <Dropdown
                  filter
                  id="companyCountry"
                  type="text"
                  class="w-full"
                  v-model="state.profile.companyAddress.country"
                  optionLabel="countryName"
                  optionValue="countryName"
                  :options="countries"
                />
              </div>
            </div>
          </Panel>
        </div>
        <div class="col-12 text-right">
          <Button
            :disabled="state.saving"
            @click="storeProfile"
            :severity="state.saved ? 'success' : 'primary'"
            >Save</Button
          >
        </div>
      </div>
    </Panel>
  </Layout>
</template>
