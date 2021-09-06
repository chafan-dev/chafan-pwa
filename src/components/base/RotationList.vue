<template>
  <div>
    <div class="d-flex">
      <span class="font-weight-bold subtitle-1">{{ title }}</span>
      <v-spacer />
      <v-btn color="secondary" outlined small @click="rotate">
        <span class="mr-1">换一批</span>
        <RefreshIcon />
      </v-btn>
    </div>
    <div v-for="item in itemsSubset" :key="item.uuid" class="pt-1">
      <slot :item="item"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';

@Component({
  components: { RefreshIcon },
})
export default class RotationList<T> extends Vue {
  @Prop() public readonly title!: string;
  @Prop() public readonly items!: T[];
  private itemsSubset: T[] = [];
  private subsetIndex = 0;

  private mounted() {
    this.itemsSubset = this.items.slice(0, 5);
  }

  private rotate() {
    const pages = Math.ceil(this.items.length / 5);
    this.subsetIndex = (this.subsetIndex + 1) % pages;
    this.itemsSubset = this.items.slice(this.subsetIndex * 5, (this.subsetIndex + 1) * 5);
  }
}
</script>
