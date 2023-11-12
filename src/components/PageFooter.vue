<script setup lang="ts">
import Divider from 'primevue/divider'
</script>
<template>
  <div class="footer">
    <div class="grid">
      <div class="col-8 col-offset-2">
        <Divider class="mt-6 mb-2" />
      </div>
      <div class="col-12 md:col-6 text-right">
        <h4>Stay in touch</h4>
        <div>
          <div>
            <a href="mailto:support@asa.gold">support@asa.gold</a>
          </div>
          <div><a href="https://discord.gg/8m4KTcVSH9">Discord</a></div>
          <div><a href="https://t.me/+mWQObAvGe_5lNDNk">t.me/AsaRealGold</a></div>
        </div>
      </div>
      <div class="col-12 md:col-6">
        <h4>Links</h4>
        <div><RouterLink to="/about-asa-gold">About ASA.Gold project</RouterLink></div>
        <div><RouterLink to="/contact-us">Contact us</RouterLink></div>
        <div><RouterLink to="/gdpr/latest">GDPR policy</RouterLink></div>
        <div>
          <RouterLink to="/terms/latest">Terms and agreement, MiCA regulatory documents</RouterLink>
        </div>
        <div><RouterLink to="/settings">Settings</RouterLink></div>
        <div><RouterLink to="/price-list">Price list</RouterLink></div>
      </div>
      <div class="col-12 text-center">&copy; Scholtz &amp; Company, jsa 2023</div>
    </div>
  </div>
</template>
<style scoped>
.footer {
  font-size: smaller;
}
</style>
