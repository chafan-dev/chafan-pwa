<template>
  <div v-if="data">
    <ContribGraph
      v-for="pair in data"
      :data="pair.data"
      :key="pair.year"
      v-show="year === pair.year"
    />
    <!--
      max-w-80 (80px) came from Vuetify 2, whose select was narrower. Under
      Vuetify 3 the compact select's own padding plus the dropdown arrow leave
      too little room for a four-digit year, and "2026" renders ellipsised as
      "2··". 100px fits it.
    -->
    <v-select
      class="max-w-100"
      v-model="year"
      :items="data.map((p) => p.year)"
      density="compact"
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
