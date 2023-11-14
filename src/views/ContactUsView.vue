<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import OrganizationChart from 'primevue/organizationchart'

import { ref } from 'vue'

const data = ref({
  key: '0',
  type: 'person',
  data: {
    image: '/images/LS.png',
    name: 'Ludo Scholtz, Everyday Algonaut',
    title: 'CEO'
  },
  children: [
    {
      key: '0_0',
      type: 'person',
      data: {
        image: '/images/OS.jpg',
        name: 'Olga Scholtz',
        title: 'COO'
      },
      children: [
        {
          key: '0_0_0',
          label: 'Operations'
        }
      ]
    },
    {
      key: '0_1',
      type: 'person',
      data: {
        image: '/images/MF.webp',
        name: 'Michal Fecko',
        title: 'CFO'
      },
      children: [
        {
          key: '0_1_0',
          label: 'Finance'
        }
      ]
    },
    {
      key: '0_2',
      type: 'person',
      data: {
        image: '/images/SZ.jpg',
        name: 'Samuel Zubo',
        title: 'CMO'
      },
      children: [
        {
          key: '0_1_0',
          label: 'Marketing'
        }
      ]
    },
    {
      key: '0_3',
      type: 'person',
      data: {
        image: '/images/DD.webp',
        name: 'Daniel Dohne',
        title: 'CTO'
      },
      children: [
        {
          key: '0_1_0',
          label: 'Development'
        }
      ]
    }
  ]
})
const selection = ref({})
</script>

<template>
  <Layout :hideTopMenu="false">
    <Panel header="Contact Us" class="m-4 flex flex-grow-1 flex-column" toggleableContent="text">
      <div class="grid">
        <div class="col-12 md:col-6">
          <h2>General inquiries</h2>
          <p><a href="mailto:support@asa.gold">support@asa.gold</a></p>
        </div>
        <div class="col-12 md:col-6">
          <h2>Orders inquiries</h2>
          <p><a href="mailto:orders@asa.gold">orders@asa.gold</a></p>
        </div>
        <div class="col-12 md:col-6">
          <h2>Press</h2>
          <p><a href="mailto:media@asa.gold">media@asa.gold</a></p>
        </div>
        <div class="col-12 md:col-6">
          <h2>Warranty and complaints</h2>
          <p><a href="mailto:complaints@asa.gold">complaints@asa.gold</a></p>
        </div>
        <div class="col-12 md:col-6">
          <h2>Legal inquiries</h2>
          <p><a href="mailto:complaints@asa.gold">legal@asa.gold</a></p>
        </div>

        <div class="col-12 md:col-6">
          <h2>Company identification</h2>
          <p>Scholtz & Company, j.s.a.</p>
          <p>ID: 51882272</p>
          <p>VAT ID: 2120828105</p>
          <p>Address: Švabinského 21, 851 01 Bratislava, Slovakia</p>
        </div>
        <div class="col-12">
          <h2>Organization Chart</h2>
          <OrganizationChart :value="data" collapsible selectionMode="multiple">
            <template #person="slotProps">
              <div class="flex flex-column">
                <div class="flex flex-column align-items-center">
                  <img
                    :alt="slotProps.node.data.name"
                    :src="slotProps.node.data.image"
                    class="mb-3 w-3rem h-3rem"
                  />
                  <span class="font-bold mb-2">{{ slotProps.node.data.name }}</span>
                  <span>{{ slotProps.node.data.title }}</span>
                </div>
              </div>
            </template>
            <template #default="slotProps">
              <span>{{ slotProps.node.label }}</span>
            </template>
          </OrganizationChart>
        </div>
      </div>
    </Panel>
  </Layout>
</template>
