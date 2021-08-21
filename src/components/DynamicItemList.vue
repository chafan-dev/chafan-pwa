<template>
  <div>
    <div v-if="items !== null && items.length > 0">
      <div v-for="item in items" :key="item.uuid" class="ma-3">
        <slot :item="item" class="my-4"></slot>
      </div>
      <div class="text-center">
        <span v-if="noMore">没有更多了</span>
      </div>
    </div>
    <EmptyPlaceholder v-else-if="items !== null" />
    <div v-if="!noMore" class="my-4 text-center">
      <v-progress-circular color="primary" indeterminate size="20" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';

@Component({
  components: { EmptyPlaceholder },
})
export default class DynamicItemList<T> extends Vue {
  @Prop({ default: 20 }) public readonly pageLimit!: number;
  @Prop() public readonly loadItems!: (skip: number, limit: number) => Promise<(T | null)[] | null>;

  private items: T[] | null = null;

  private currentPage = 0;
  private noMore = false;

  private async mounted() {
    window.onscroll = () => {
      this.tryLoadMore(false);
    };
    this.tryLoadMore(true);
  }

  private async tryLoadMore(ignoreScroll: boolean) {
    if (this.noMore) {
      return;
    }
    const bottomOfWindow =
      Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
        window.innerHeight +
        300 >=
      document.documentElement.offsetHeight;
    if (!ignoreScroll && !bottomOfWindow) {
      return;
    }

    this.currentPage += 1;
    const newItems = await this.loadItems((this.currentPage - 1) * this.pageLimit, this.pageLimit);
    if (newItems) {
      const newItemsNotNull: T[] = [];
      for (const item of newItems) {
        if (item) {
          newItemsNotNull.push(item);
        }
      }
      if (this.items) {
        this.items.push(...newItemsNotNull);
      } else {
        this.items = newItemsNotNull;
      }
      if (newItems.length < this.pageLimit) {
        this.noMore = true;
      }
    }
  }
}
</script>
