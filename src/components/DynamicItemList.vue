<template>
  <div>
    <DebugSpan>noMore={{ noMore }}, emptyItems={{ emptyItems }}, loading={{ loading }}</DebugSpan>
    <div v-if="items !== null && items.length > 0">
      <div v-for="item in items" :key="item.uuid" class="ma-3">
        <slot :item="item" class="my-4"></slot>
      </div>
      <div class="text-center">
        <span v-if="noMore">
              没有更多了
        </span>
      </div>
    </div>
    <EmptyPlaceholder v-if="emptyItems" />
    <div v-if="!noMore" class="my-4 text-center">
      <v-progress-circular color="primary" indeterminate size="20" v-intersect="tryLoadMore" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import { CVue } from '@/common';
import DebugSpan from '@/components/base/DebugSpan.vue';
import  { info }  from '@/logging'

@Component({
  components: { DebugSpan, EmptyPlaceholder },
})
export default class DynamicItemList<T> extends CVue {
  @Prop({ default: 20 }) public readonly pageLimit!: number;
  @Prop() public readonly loadItems!: (skip: number, limit: number) => Promise<(T | null)[] | null>;

  private items: T[] | null = null;

  private currentPage = 0;
  private noMore = false;
  private emptyItems = false;
  private loading = false;

  private async mounted() {
    window.onscroll = () => {
      this.tryLoadMore(false);
    };
    await this.tryLoadMore(true);
  }

  private async tryLoadMore(ignoreScroll: boolean) {
    if (this.noMore) {
      return;
    }
    if (this.loading) {
      return;
    }
    this.loading = true;
    const bottomOfWindow =
      Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
        window.innerHeight +
        300 >=
      document.documentElement.offsetHeight;
    if (!ignoreScroll && !bottomOfWindow) {
      return;
    }

    info("tryLoadMore, currentPage = " + this.currentPage.toString());
    this.currentPage += 1;
    const newItems = await this.loadItems((this.currentPage - 1) * this.pageLimit, this.pageLimit);
    if (newItems) {
      const newNotNullItems: T[] = newItems.filter((x) => x !== null) as T[];
      if (!this.items) {
        this.items = newNotNullItems;
      } else {
        this.items.push(...newNotNullItems);
      }
      if (newItems.length < this.pageLimit) {
        this.noMore = true;
        if (!this.items) {
          this.emptyItems = true;
        }
      }
    }
    this.loading = false;
  }
}
</script>
