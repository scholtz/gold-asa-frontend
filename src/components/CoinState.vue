<script setup lang="ts">
import type IEshopItem from '@/types/IEshopItem'
import Tag from 'primevue/tag'
const props = defineProps<{
  item: IEshopItem
}>()
</script>
<template>
  <div>
    <Tag v-if="props.item.state.state == 1" value="Sale from reserve" severity="success"></Tag>
    <Tag
      v-else-if="props.item.state.state == 2"
      value="Sold - not for sale"
      severity="warning"
    ></Tag>
    <Tag v-else-if="props.item.state.state == 3" value="For sale" severity="success"></Tag>
    <Tag
      v-else-if="props.item.state.state == 4"
      value="Parcel delivery requested"
      severity="warning"
    ></Tag>
    <Tag
      v-else-if="props.item.state.state == 5"
      value="Shipped to customer"
      severity="warning"
    ></Tag>
  </div>
</template>
