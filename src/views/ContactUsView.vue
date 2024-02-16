<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
// import OrganizationChart from "primevue/organizationchart";
import AOS from 'aos'
import 'aos/dist/aos.css'
import { ref } from 'vue'

const datas = ref([
  {
    key: '0_0',
    type: 'person',
    data: {
      image: '/images/OS.png',
      name: 'Olga Scholtz',
      title: 'COO Operations',
      description: 'Olga is good in operations and managing the company legal activities.'
    }
  },
  {
    key: '0_1',
    type: 'person',
    data: {
      image: '/images/MF.webp',
      name: 'Michal Fecko',
      title: 'CFO Finance',
      description: 'Michal is skilled equity and commodities traders based in switzerland.'
    }
  },
  {
    key: '0_2',
    type: 'person',
    data: {
      image: '/images/SZ.jpg',
      name: 'Samuel Zubo',
      title: 'CMO Marketing',
      description: 'Samo has extensive knowledge in running the eshops and online services.'
    }
  },
  {
    key: '0_3',
    type: 'person',
    data: {
      image: '/images/DD.webp',
      name: 'Daniel Dohne',
      title: 'CTO Development',
      description: 'Daniel is expert in the blockchain technology and adoption.'
    }
  }
])
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
})
const selection = ref({})
</script>

<template>
  <Layout :hideTopMenu="false">
    <div>
      <div class="contact-us-background">
        <div
          class="col-md-12 col-sm-12 text-secondary welcome-banner text-center nav-text text-center"
        >
          <div class="welcome-content">
            <h3 class="rn-sub-badge" data-aos="fade-down">
              <span class="title">Contact US</span>
            </h3>
            <h3 class="rn-sub-badge" data-aos="fade-down">
              <span class="subtitle">About ASA.Gold Project</span>
            </h3>
          </div>
        </div>
      </div>
      <div class="contactus-background">
        <div class="rwt-contact-area rn-section-gap">
          <div class="container">
            <div class="section-title text-center" data-aos="fade-up">
              <h2 class="title w-600">
                <a href="mailto:support@asa.gold">support@asa.gold</a>
              </h2>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="row row--15 ptb-80" data-aos="fade-up">
            <div class="lg:col-4 md:col-6 sm:col-6 col-12">
              <div class="rn-address">
                <div class="icon">
                  <i class="size-40"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="feather feather-mail vue-feather__content"
                    >
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      ></path>
                      <polyline points="22,6 12,13 2,6"></polyline></svg
                  ></i>
                </div>
                <div class="inner">
                  <h4 class="title">Inquiries</h4>
                  <p>
                    General : <br /><br /><a href="mailto:support@asa.gold">support@asa.gold</a>
                  </p>
                  <p>Orders : <br /><br /><a href="mailto:orders@asa.gold">orders@asa.gold</a></p>
                </div>
              </div>
            </div>
            <div class="lg:col-4 md:col-6 sm:col-6 col-12">
              <div class="rn-address">
                <div class="icon">
                  <i class="size-40"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="feather feather-mail vue-feather__content"
                    >
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      ></path>
                      <polyline points="22,6 12,13 2,6"></polyline></svg
                  ></i>
                </div>
                <div class="inner">
                  <h4 class="title">Other Contact Info</h4>
                  <p>
                    Press : <br /><br />
                    <a href="mailto:media@asa.gold">media@asa.gold</a>
                  </p>
                  <p>
                    Warranty and complaints : <br /><br />
                    <a href="mailto:complaints@asa.gold">complaints@asa.gold</a>
                  </p>
                </div>
              </div>
            </div>
            <div class="lg:col-4 md:col-6 sm:col-6 col-12">
              <div class="rn-address">
                <div class="icon">
                  <i class="size-40"
                    ><svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="feather feather-mail vue-feather__content"
                    >
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      ></path>
                      <polyline points="22,6 12,13 2,6"></polyline></svg
                  ></i>
                </div>
                <div class="inner">
                  <h4 class="title">Legal inquiries</h4>
                  <p>
                    Legal inquiries : <br /><br /><a href="mailto:legal@asa.gold">legal@asa.gold</a>
                  </p>
                  <p><br /><br /><br /><a href="tel:+222 222 222 333"></a></p>
                </div>
              </div>
            </div>
          </div>
          <section class="features-area-two bg-f7fafd" data-aos="fade-up">
            <div class="container">
              <div class="row h-100 justify-content-center align-items-center">
                <div class="col-12 md:col-6 services-content" data-aos="fade-up">
                  <div class="section-title">
                    <h2>Company Identification</h2>
                    <div class="bar"></div>
                    <p>
                      Spoločnosť Scholtz & Company, j.s.a.V roku 2018 v období od 1.8 do 31.12
                      zverejnila tržby 0 € so ziskom 0 €.
                    </p>
                  </div>
                  <div class="row">
                    <div class="col-12 md:col-126 lg:col-12">
                      <div class="box">Company Name : Scholtz & Company, j.s.a.</div>
                    </div>
                    <div class="col-12 md:col-12 lg:col-12">
                      <div class="box">ID : 51882272</div>
                    </div>
                    <div class="col-12 md:col-12 lg:col-12">
                      <div class="box">VAT ID : 2120828105</div>
                    </div>
                    <div class="col-12 md:col-12 lg:col-12">
                      <div class="box">Address : Švabinského 21, 851 01 Bratislava, Slovakia</div>
                    </div>
                  </div>
                </div>
                <div class="lg:col-6 iot-features-image" data-aos="fade-up">
                  <img src="/images/development/1.67188455.png" alt="image" />
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="team-area repair-team-area ptb-80 bg-f9f6f6" data-aos="fade-up">
          <div class="section-title" data-aos="fade-up">
            <h2 data-aos="fade-up">Our Awesome Team Organization Chart</h2>
            <div class="bar"></div>
            <p data-aos="fade-up">Everyday Algonaut is main founder and CEO of ASA.Gold project.</p>
          </div>
          <div class="container our-team-members mt-2" data-aos="fade-up">
            <div class="row">
              <div class="col-12 md:col-6 lg:col-4">
                <div class="single-team">
                  <div class="team-image">
                    <img src="/images/LS.png" alt="image" />
                  </div>
                  <div class="team-content">
                    <div class="team-info">
                      <h3>Ludo Scholtz, Everyday Algonaut</h3>
                      <span>CEO</span>
                    </div>
                    <p>
                      Ludo, Everyday Algonaut, is founder of ASA.Gold, AWallet, Vote Coin and other
                      algorand's significant projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="container our-team-members">
            <div class="row">
              <div class="col-12 md:col-6 lg:col-3" v-for="(item, index) in datas" :key="index">
                <div class="single-team">
                  <div class="team-image">
                    <img :src="item.data.image" alt="image" />
                  </div>
                  <div class="team-content">
                    <div class="team-info">
                      <h3>{{ item.data.name }}</h3>
                      <span>{{ item.data.title }}</span>
                    </div>
                    <p>
                      {{ item.data.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
