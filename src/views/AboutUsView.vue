<script setup lang="ts">
import Layout from "@/layouts/AuthLayout.vue";
import Panel from "primevue/panel";
import OrganizationChart from "primevue/organizationchart";
import { ref } from "vue";
import Avatar from "primevue/avatar";
import AOS from "aos";
import "aos/dist/aos.css";
import Steps from "primevue/steps";
import Splitter from "primevue/splitter";
import Card from "primevue/card";
import SplitterPanel from "primevue/splitterpanel";
import Timeline from "primevue/timeline";
import { onMounted, onBeforeUnmount } from "vue";
const isMobile = ref(false);
const events = ref([
  {
    status: "Ordered",
    date: "Oct 19th 2023",
    icon: "pi pi-circle",
    color: "#9C27B0",
    image: "game-controller.jpg",
    content:
      "Web2 Authentication Experience - We created algorand-authentication-component-vue component free for use for anybody.",
  },
  {
    status: "Shipped",
    date: "Oct 21st 2023",
    icon: "pi pi-circle",
    color: "#FF9800",
    content: "Domain has been registered",
  },
  {
    status: "Delivered",
    date: "Oct 26th 2023",
    icon: "pi pi-circle",
    color: "#607D8B",
    content:
      "We have integrated Folks Router for swapping Gold to Algorand, USDC and BTC and vice versa",
  },

  {
    status: "Delivered",
    date: "Nov 1st 2023 ",
    icon: "pi pi-circle",
    color: "#607D8B",
    content:
      "We have integrated email templates, and on email verification we airdop some algos so that web2 users have even better xp",
  },
  {
    status: "Delivered",
    date: "Nov 5th 2023 ",
    icon: "pi pi-circle",
    color: "#607D8B",
    content: "Smart contract has been finished with full test coverage",
  },
  {
    status: "Delivered",
    date: "Nov 6th 2023",
    icon: "pi pi-circle",
    color: "#607D8B",
    content: "ASA.Gold NPM package has been published",
  },
  {
    status: "Delivered",
    date: "Nov 12th 2023",
    icon: "pi pi-circle",
    color: "#607D8B",
    content: "Eshop is working",
  },
  {
    status: "Delivered",
    date: "Nov 13th 2023",
    icon: "pi pi-circle",
    color: "#607D8B",
    content: "Testnet launched at https://testnet.asa.gold/",
  },
  {
    status: "Delivered",
    date: "Nov 14th 2023",
    icon: "pi pi-circle",
    color: "#607D8B",
    content:
      "Mainnet launched at https://www.asa.gold/. Gold token has been minted: Gold: 1241944285, and DAO governance token has been minted: GoldDAO: 1241945177",
  },
]);
function handleResize() {
  if (window.innerWidth <= 941) {
    isMobile.value = true;
  } else {
    isMobile.value = false;
  }
}

onMounted(() => {
  if (window.innerWidth <= 941) {
    isMobile.value = true;
  }
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});
const datas = ref([
  {
    key: "0_0",
    type: "person",
    data: {
      image: "/images/OS.png",
      name: "Olga Scholtz",
      title: "COO Operations",
      description:
        "Ankur has 27 years of production and techno-commercial marketing experience in the Indian gems and jewellery industry.",
    },
  },
  {
    key: "0_1",
    type: "person",
    data: {
      image: "/images/MF.webp",
      name: "Michal Fecko",
      title: "CFO Finance",
      description:
        "Ankur has 27 years of production and techno-commercial marketing experience in the Indian gems and jewellery industry.",
    },
  },
  {
    key: "0_2",
    type: "person",
    data: {
      image: "/images/SZ.jpg",
      name: "Samuel Zubo",
      title: "CMO Marketing",
      description:
        "Ankur has 27 years of production and techno-commercial marketing experience in the Indian gems and jewellery industry.",
    },
  },
  {
    key: "0_3",
    type: "person",
    data: {
      image: "/images/DD.webp",
      name: "Daniel Dohne",
      title: "CTO Development",
      description:
        "Ankur has 27 years of production and techno-commercial marketing experience in the Indian gems and jewellery industry.",
    },
  },
]);
AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
});
</script>

<template>
  <Layout :hideTopMenu="false">
    <div>
      <div class="about-us-background">
        <div
          class="col-md-12 col-sm-12 text-white welcome-banner text-center nav-text text-center"
        >
          <div class="welcome-content">
            <h3 class="rn-sub-badge" data-aos="fade-down">
              <span class="title mt-5">About ASA.Gold project</span>
            </h3>
            <p data-aos="zoom-in">
              The startup ASA.Gold has been started in October 2023 with goal to tokenize
              real world asset which users can fully trust.
            </p>
          </div>
        </div>
      </div>
      <div class="asa-realabout">
        <div class="container">
          <div class="section-title">
            <h2>About ASA.Gold Project</h2>
            <div class="bar"></div>
            <p>
              The startup ASA.Gold has been started in October 2023 with goal to tokenize
              real world asset which users can fully trust. To allow this we created
              hypothesis that if person can select in the eshop any product and this can
              be shipped to him, he trusts that all other products are real as well. There
              is no incentivization from ASA.Gold to cheat because of this public
              oversight.
            </p>
          </div>
        </div>
        <div class="rbt-separator-mid">
          <div class="container"><hr class="rbt-separator m-0" /></div>
        </div>

        <div class="rn-service-area rn-section-gap">
          <div class="col-lg-12">
            <div class="section-title text-center" data-aos="fade-up">
              <h4 class="subtitle">
                <span class="theme-gradient">Progress we have made so far</span>
              </h4>
              <h2 class="title w-600">
                <a href="https://dorahacks.io/buidl/7763" target="_blank"
                  >Algorand's Build a Bull hackathon</a
                >
              </h2>
              <p class="description b1">
                Project has been initiated by and submitted to <br />
                <a href="https://dorahacks.io/buidl/7763" target="_blank"
                  >Algorand's Build a Bull hackathon</a
                >.
              </p>
            </div>
          </div>
        </div>
        <div class="card">
          <Timeline
            :value="events"
            align="alternate"
            class="customized-timeline"
            data-aos="fade-up"
          >
            <template #marker="slotProps">
              <span
                class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
              >
                <i :class="slotProps.item.icon" style="color: #059dff"></i>
              </span>
            </template>
            <template #content="slotProps">
              <Card class="mt-3">
                <template #subtitle>
                  {{ slotProps.item.date }}
                </template>
                <template #content>
                  <p>
                    {{ slotProps.item.content }}
                  </p>
                </template>
              </Card>
            </template>
          </Timeline>
        </div>
        <section class="features-area-two bg-f7fafd">
          <div class="container">
            <div class="row h-100 justify-content-center align-items-center">
              <div class="col-12 md:col-6 services-content">
                <div class="section-title">
                  <h2>Experience The Best Features Ever</h2>
                  <div class="bar"></div>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Check our
                    open source progress.
                  </p>
                </div>
                <div class="row">
                  <div class="col-6 md:col-6 lg:col-6">
                    <div class="box">
                      <i
                        data-name="lock"
                        data-tags="security,password,secure"
                        data-type="lock"
                        class="vue-feather vue-feather--lock"
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
                          class="feather feather-lock vue-feather__content"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg
                      ></i>
                      <a href="https://github.com/scholtz/gold-asa-frontend">FE</a>
                    </div>
                  </div>
                  <div class="col-6 md:col-6 lg:col-6">
                    <div class="box">
                      <i
                        data-name="watch"
                        data-tags="clock,time"
                        data-type="watch"
                        class="vue-feather vue-feather--watch"
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
                          class="feather feather-watch vue-feather__content"
                        >
                          <circle cx="12" cy="12" r="7"></circle>
                          <polyline points="12 9 12 12 13.5 13.5"></polyline>
                          <path
                            d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"
                          ></path></svg
                      ></i>
                      <a href="https://github.com/scholtz/AsaGoldBff">BFF</a>
                    </div>
                  </div>
                  <div class="col-6 md:col-6 lg:col-6">
                    <div class="box">
                      <i
                        data-name="users"
                        data-tags="group"
                        data-type="users"
                        class="vue-feather vue-feather--users"
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
                          class="feather feather-users vue-feather__content"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg
                      ></i>
                      <a href="https://github.com/scholtz/AsaGoldRepository">RepoApi</a>
                    </div>
                  </div>
                  <div class="col-6 md:col-6 lg:col-6">
                    <div class="box">
                      <i
                        data-name="trending-up"
                        data-tags=""
                        data-type="trending-up"
                        class="vue-feather vue-feather--trending-up"
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
                          class="feather feather-trending-up vue-feather__content"
                        >
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                          <polyline points="17 6 23 6 23 12"></polyline></svg
                      ></i>
                      <a
                        href="https://github.com/scholtz/gold-asa-frontend/tree/main/asa-gold-smartcontract"
                        >EShop smart contract</a
                      >
                    </div>
                  </div>
                  <div class="col-6 md:col-6 lg:col-6">
                    <div class="box">
                      <i
                        data-name="folder"
                        data-tags="directory"
                        data-type="folder"
                        class="vue-feather vue-feather--folder"
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
                          class="feather feather-folder vue-feather__content"
                        >
                          <path
                            d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                          ></path></svg
                      ></i>
                      <a
                        href=" https://github.com/scholtz/algorand-authentication-component-vue"
                        >AuthComponent</a
                      >
                    </div>
                  </div>
                  <div class="col-6 md:col-6 lg:col-6">
                    <div class="box">
                      <i
                        data-name="monitor"
                        data-tags="tv,screen,display"
                        data-type="monitor"
                        class="vue-feather vue-feather--monitor"
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
                          class="feather feather-monitor vue-feather__content"
                        >
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                          <line x1="8" y1="21" x2="16" y2="21"></line>
                          <line x1="12" y1="17" x2="12" y2="21"></line></svg
                      ></i>
                      <a href="https://www.npmjs.com/package/algorand-asa-gold"
                        >NPM package</a
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-lg-6 col-md-12 services-right-image">
                <img
                  src="/images/development/cercle-shape.47fe8b0d.png"
                  class="bg-image rotateme"
                />
                <img src="/images/development/main-pic.30fff806.png" />
              </div>
            </div>
          </div>
        </section>
        <div class="team-area repair-team-area ptb-80 bg-f9f6f6" data-aos="fade-up">
          <div class="section-title" data-aos="fade-up">
            <h2 data-aos="fade-up">Our Awesome Team</h2>
            <div class="bar"></div>
            <p data-aos="fade-up">
              Ludo, Everyday Algonaut has hosted Prague algorand meetup last year on Feb
              10th 2023 at Paralel polis. He was also speaker at ETH Denver
            </p>
          </div>
          <div class="container our-team-members" data-aos="fade-up">
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
                      Ludo, Everyday Algonaut has hosted Prague algorand meetup last year
                      on Feb 10th 2023 at Paralel polis. He was also speaker at ETH
                      Denver.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="container our-team-members">
            <div class="row">
              <div
                class="col-12 md:col-6 lg:col-3"
                v-for="(item, index) in datas"
                :key="index"
              >
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
    <!-- <Panel
      header="About ASA.Gold project"
      class="m-4 flex flex-grow-1 flex-column"
      toggleableContent="text"
    >
      <p>
        The startup ASA.Gold has been started in October 2023 with goal to tokenize real
        world asset which users can fully trust. To allow this we created hypothesis that
        if person can select in the eshop any product and this can be shipped to him, he
        trusts that all other products are real as well. There is no incentivization from
        ASA.Gold to cheat because of this public oversight.
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
          Oct 26th 2023 : We have integrated Folks Router for swapping Gold to Algorand,
          USDC and BTC and vice versa
        </li>
        <li>
          Nov 1st 2023 : We have integrated email templates, and on email verification we
          airdop some algos so that web2 users have even better xp
        </li>
        <li>Nov 5th 2023 : Smart contract has been finished with full test coverage</li>
        <li>
          Nov 6th 2023 : ASA.Gold
          <a href="https://www.npmjs.com/package/algorand-asa-gold">NPM package</a> has
          been published
        </li>
        <li>Nov 12th 2023 : Eshop is working</li>
        <li>
          Nov 13th 2023 : Testnet launched at
          <a href="https://testnet.asa.gold/">https://testnet.asa.gold/</a>
        </li>
        <li>
          Nov 14th 2023 : Mainnet launched at
          <a href="https://www.asa.gold/">https://www.asa.gold/</a>. Gold token has been
          minted: Gold:
          <a href="https://algoexplorer.io/asset/1241944285" target="_blank">1241944285</a
          >, and DAO governance token has been minted: GoldDAO:
          <a href="https://algoexplorer.io/asset/1241945177" target="_blank"
            >1241945177</a
          >
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
          <a href="https://github.com/scholtz/AsaGoldBff"
            >https://github.com/scholtz/AsaGoldBff</a
          >
        </li>
        <li>
          RepoApi:
          <a href="https://github.com/scholtz/AsaGoldRepository"
            >https://github.com/scholtz/AsaGoldRepository</a
          >
        </li>
        <li>
          EShop smart contract:
          <a
            href="https://github.com/scholtz/gold-asa-frontend/tree/main/asa-gold-smartcontract"
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
    </Panel> -->
  </Layout>
</template>

<style lang="scss" scoped>
@media screen and (max-width: 960px) {
  ::v-deep(.customized-timeline) {
    .p-timeline-event:nth-child(even) {
      flex-direction: row !important;

      .p-timeline-event-content {
        text-align: left !important;
      }
    }

    .p-timeline-event-opposite {
      flex: 0;
      display: none;
    }

    .asa-realabout .p-card.p-component {
      width: 100% !important;
    }
  }
}
</style>
