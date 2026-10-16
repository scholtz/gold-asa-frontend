<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
</script>
<template>
  <Layout :hideTopMenu="false">
    <header class="page-hero">
      <div class="container">
        <h1>My transactions</h1>
      </div>
    </header>
    <section class="section">
      <div class="container">
        <div class="empty">
          <p>Your transactions will be listed here.</p>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped>
.empty {
  max-width: 30rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--muted);
  background: var(--surface);
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-lg);
}
.empty p {
  margin: 0;
}
</style>
