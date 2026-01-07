<template>
  <div v-if="data">
    <ContribGraph
      v-for="pair in data"
      :data="pair.data"
      :key="pair.year"
      v-show="year === pair.year"
    />
    <v-select
      style="max-width: 80px"
      v-model="year"
      :items="data.map((p) => p.year)"
      dense
      hide-details
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ContribGraph from '@/components/widgets/ContribGraph.vue';

interface GraphData {
  year: number;
  data: number[] | undefined;
}

const props = withDefaults(
  defineProps<{
    data?: GraphData[];
  }>(),
  {
    data: () => [
      { year: 2021, data: undefined },
      { year: 2020, data: undefined },
    ],
  }
);

const year = ref<number | null>(null);

onMounted(() => {
  year.value = props.data ? props.data[0].year : null;
});
</script>
