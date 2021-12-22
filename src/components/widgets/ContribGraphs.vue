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

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import ContribGraph from '@/components/widgets/ContribGraph.vue';

const defaultGraphs = [
  {
    year: 2021,
    data: undefined,
  },
  {
    year: 2020,
    data: undefined,
  },
];

@Component({
  components: { ContribGraph },
})
export default class ContribGraphs extends Vue {
  @Prop({ default: defaultGraphs }) readonly data!: { year: number; data: number[] | undefined }[];
  private year: number | null = null;
  mounted() {
    this.year = this.data ? this.data[0].year : null;
  }
}
</script>
