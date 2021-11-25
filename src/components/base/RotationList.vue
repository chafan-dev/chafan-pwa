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
  private readonly PAGE_SIZE = 5;

  private mounted() {
    this.itemsSubset = this.items.slice(0, this.PAGE_SIZE);
  }

  private rotate() {
    const pages = Math.ceil(this.items.length / this.PAGE_SIZE);
    this.subsetIndex = (this.subsetIndex + 1) % pages;
    this.itemsSubset = this.items.slice(
      this.subsetIndex * this.PAGE_SIZE,
      (this.subsetIndex + 1) * this.PAGE_SIZE
    );
  }
}
</script>
