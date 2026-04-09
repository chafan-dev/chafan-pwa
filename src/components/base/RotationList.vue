<template>
  <div>
    <div class="d-flex">
      <span class="font-weight-bold text-subtitle-1">{{ title }}</span>
      <v-spacer />
      <v-btn color="secondary" variant="outlined" size="small" @click="rotate" v-if="items.length > PAGE_SIZE">
        <span class="mr-1">换一批</span>
        <AppIcon name="Refresh"  />
      </v-btn>
    </div>
    <div v-for="item in itemsSubset" :key="item.uuid" class="pt-1">
      <slot :item="item"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps<{
  title: string;
  items: unknown[];
}>();

const PAGE_SIZE = 5;
const itemsSubset = ref<unknown[]>([]);
const subsetIndex = ref(0);

onMounted(() => {
  itemsSubset.value = props.items.slice(0, PAGE_SIZE);
});

function rotate() {
  const pages = Math.ceil(props.items.length / PAGE_SIZE);
  subsetIndex.value = (subsetIndex.value + 1) % pages;
  itemsSubset.value = props.items.slice(
    subsetIndex.value * PAGE_SIZE,
    (subsetIndex.value + 1) * PAGE_SIZE
  );
}
</script>
