<script setup lang="ts">
import Layout from '@/layouts/AuthLayout.vue'
import { onMounted, ref } from 'vue'
import { ProductService } from '@/service/ProductService'
import type IEshopItem from '@/types/IEshopItem'
import ProductBox from '@/components/ProductBox.vue'
import Panel from 'primevue/panel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { RouterLink } from 'vue-router'
onMounted(async () => {
  products.value = (await ProductService.getAllProducts()).filter((c) => c.state.state == 1)
})

const products = ref<IEshopItem[]>()
</script>

<template>
  <Layout :hideTopMenu="false">
    <div v-if="products">
      <Panel
        header="Proof of reserves"
        class="m-4 flex flex-grow-1 flex-column"
        toggleableContent="text"
      >
        <div class="flex flex-row flex-wrap">
          <table class="w-full text-left">
            <thead>
              <tr>
                <th>ASA ID</th>
                <th>Name</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in products" :key="item.asa">
                <td>
                  <RouterLink :to="`/coin/${item.nft.properties.slugName}`">{{
                    item.asa
                  }}</RouterLink>
                </td>
                <td>{{ item.nft.name }}</td>
                <td>{{ item.state.weight / 10 ** 6 }} g</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th>
                  {{
                    products
                      .map((a) => a.state.weight)
                      .reduce(function (a, b) {
                        return a + b
                      }) /
                    10 ** 6
                  }}
                  g
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>
    </div>
    <div v-else>
      <div class="m-2 text-center">Loading..</div>
      <Skeleton class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="10rem" class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="5rem" borderRadius="16px" class="mb-2"></Skeleton>
      <Skeleton height="2rem" class="mb-2" borderRadius="16px"></Skeleton>
      <Skeleton width="10rem" height="4rem" borderRadius="16px"></Skeleton>
    </div>
  </Layout>
</template>
