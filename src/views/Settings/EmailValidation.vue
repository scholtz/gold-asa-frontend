<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import MenuLevel2Settings from '@/components/MenuLevel2Settings.vue'
import EmailValidationComponent from '@/components/EmailValidationComponent.vue'
</script>

<template>
  <Layout :hideTopMenu="true">
    <MenuLevel2Settings />
    <EmailValidationComponent />
  </Layout>
</template>
