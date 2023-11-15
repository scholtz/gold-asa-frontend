<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
import OrganizationChart from 'primevue/organizationchart'
import { ref } from 'vue'
import Avatar from 'primevue/avatar'

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
        image: '/images/OS.png',
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
</script>

<template>
  <Layout :hideTopMenu="false">
    <Panel
      header="About ASA.Gold project"
      class="m-4 flex flex-grow-1 flex-column"
      toggleableContent="text"
    >
      <p>
        The startup ASA.Gold has been started in October 2023 with goal to tokenize real world asset
        which users can fully trust. To allow this we created hypothesis that if person can select
        in the eshop any product and this can be shipped to him, he trusts that all other products
        are real as well. There is no incentivization from ASA.Gold to cheat because of this public
        oversight.
      </p>

      <OrganizationChart :value="data" collapsible selectionMode="multiple">
        <template #person="slotProps">
          <div class="flex flex-column">
            <div class="flex flex-column align-items-center">
              <Avatar
                class="mr-2"
                size="xlarge"
                :image="slotProps.node.data.image"
                shape="circle"
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
      <p>
        Project has been initiated by and submitted to
        <a href="https://dorahacks.io/buidl/7763" target="_blank"
          >Algorand's Build a Bull hackathon</a
        >.
      </p>
      <p>Progress we have made so far:</p>
      <ul>
        <li>
          Oct 19th 2023 : Web2 Authentication Experience - We created
          <a href="https://github.com/scholtz/algorand-authentication-component-vue"
            >algorand-authentication-component-vue</a
          >
          component free for use for anybody.
        </li>
        <li>Oct 21st 2023 : Domain has been registered</li>
        <li>
          Oct 26th 2023 : We have integrated Folks Router for swapping Gold to Algorand, USDC and
          BTC and vice versa
        </li>
        <li>
          Nov 1st 2023 : We have integrated email templates, and on email verification we airdop
          some algos so that web2 users have even better xp
        </li>
        <li>Nov 5th 2023 : Smart contract has been finished with full test coverage</li>
        <li>
          Nov 6th 2023 : ASA.Gold
          <a href="https://www.npmjs.com/package/algorand-asa-gold">NPM package</a> has been
          published
        </li>
        <li>Nov 12th 2023 : Eshop is working</li>
        <li>
          Nov 13th 2023 : Testnet launched at
          <a href="https://testnet.asa.gold/">https://testnet.asa.gold/</a>
        </li>
        <li>
          Nov 14th 2023 : Mainnet launched at
          <a href="https://www.asa.gold/">https://www.asa.gold/</a>. Gold token has been minted:
          Gold: <a href="https://algoexplorer.io/asset/1241944285" target="_blank">1241944285</a>,
          and DAO governance token has been minted: GoldDAO:
          <a href="https://algoexplorer.io/asset/1241945177" target="_blank">1241945177</a>
        </li>
      </ul>
      <p>Check our open source progress:</p>
      <ul>
        <li>
          FE:
          <a href="https://github.com/scholtz/gold-asa-frontend"
            >https://github.com/scholtz/gold-asa-frontend</a
          >
        </li>
        <li>
          BFF:
          <a href="https://github.com/scholtz/AsaGoldBff">https://github.com/scholtz/AsaGoldBff</a>
        </li>
        <li>
          RepoApi:
          <a href="https://github.com/scholtz/AsaGoldRepository"
            >https://github.com/scholtz/AsaGoldRepository</a
          >
        </li>
        <li>
          EShop smart contract:
          <a href="https://github.com/scholtz/gold-asa-frontend/tree/main/asa-gold-smartcontract"
            >https://github.com/scholtz/gold-asa-frontend/tree/main/asa-gold-smartcontract</a
          >
        </li>
        <li>
          AuthComponent:
          <a href="https://github.com/scholtz/algorand-authentication-component-vue"
            >https://github.com/scholtz/algorand-authentication-component-vue</a
          >
        </li>
        <li>
          NPM package:
          <a href="https://www.npmjs.com/package/algorand-asa-gold"
            >https://www.npmjs.com/package/algorand-asa-gold</a
          >
        </li>
      </ul>
    </Panel></Layout
  >
</template>
