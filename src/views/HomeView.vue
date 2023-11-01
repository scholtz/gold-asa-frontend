<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import Panel from 'primevue/panel'
</script>

<template>
  <Layout>
    <Panel header="We will go to mainnet soon" class="m-4">
      <p>This web is still under construction, but we plan to finish at most on November 15th.</p>
      <p>Progress we have made so far:</p>
      <ul>
        <li>
          Oct 16th 2023 : Web2 Authentication Experience - We created
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
        <li>We are working now on smart contract</li>
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
          AuthComponent:
          <a href="https://github.com/scholtz/algorand-authentication-component-vue"
            >https://github.com/scholtz/algorand-authentication-component-vue</a
          >
        </li>
      </ul>
    </Panel>
  </Layout>
</template>
