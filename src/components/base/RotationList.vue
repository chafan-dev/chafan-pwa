<template>
  <div>
    <div class="d-flex">
      <span class="font-weight-bold subtitle-1">{{ title }}</span>
      <v-spacer />
      <v-btn color="secondary" outlined small @click="rotate" v-if="items.length > PAGE_SIZE">
        <span class="mr-1">换一批</span>
        <RefreshIcon />
      </v-btn>
    </div>
    <div v-for="item in itemsSubset" :key="item.uuid" class="pt-1">
      <slot :item="item"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';

const props = defineProps<{
  title: string;
  items: any[];
}>();

const PAGE_SIZE = 5;
const itemsSubset = ref<any[]>([]);
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
