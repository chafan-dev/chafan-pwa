<template>
  <div>
    <div v-if="items !== null && items.length > 0">
      <div v-for="item in items" :key="item.uuid" class="ma-3">
        <slot :item="item" class="my-4"></slot>
      </div>
      <div class="text-center">
        <span v-if="noMore">{{ $t('没有更多了') }}</span>
        <v-progress-circular v-else size="20" color="primary" indeterminate />
      </div>
    </div>
    <div class="my-4 text-center" v-else-if="items !== null">
      {{ $t(emptyItemsText) }}
    </div>
    <div class="my-4 text-center" v-else>
      {{ $t(nullItemsText) }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class DynamicContentList<T> extends Vue {
  @Prop({ default: 10 }) public readonly pageLimit!: number;
  @Prop() public readonly emptyItemsText!: string;
  @Prop() public readonly nullItemsText!: string;
  @Prop() public readonly loadItems!: (skip: number, limit: number) => Promise<T[] | null>;

  private items: T[] | null = null;

  private currentPage = 0;
  private noMore = false;

  private async mounted() {
    window.onscroll = () => {
      this.tryLoadMore();
    };
    this.tryLoadMore();
  }

  private async tryLoadMore() {
    if (this.noMore) {
      return;
    }
    const bottomOfWindow =
      Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
        window.innerHeight +
        300 >=
      document.documentElement.offsetHeight;
    if (!bottomOfWindow) {
      return;
    }

    this.currentPage += 1;
    const newItems = await this.loadItems((this.currentPage - 1) * this.pageLimit, this.pageLimit);
    if (newItems && newItems.length > 0) {
      if (this.items) {
        this.items.push(...newItems);
      } else {
        this.items = newItems;
      }
      setTimeout(this.tryLoadMore, 100);
    } else {
      this.noMore = true;
    }
  }
}
</script>
