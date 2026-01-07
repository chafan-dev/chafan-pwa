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

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { info } from '@/logging';

const props = withDefaults(defineProps<{
  pageLimit?: number;
  loadItems: (skip: number, limit: number) => Promise<(any | null)[] | null>;
}>(), {
  pageLimit: 20,
});

const items = ref<any[] | null>(null);
const currentPage = ref(0);
const noMore = ref(false);
const emptyItems = ref(false);
const loading = ref(false);

async function tryLoadMore(ignoreScroll?: boolean) {
  if (noMore.value) {
    return;
  }
  if (loading.value) {
    info('tryLoadMore waiting for a current loading task');
    return;
  }
  loading.value = true;

  info('tryLoadMore, currentPage = ' + currentPage.value.toString());
  currentPage.value += 1;
  const newItems = await props.loadItems(
    (currentPage.value - 1) * props.pageLimit,
    props.pageLimit
  );
  if (newItems) {
    const newNotNullItems: any[] = newItems.filter((x) => x !== null) as any[];
    if (!items.value) {
      items.value = newNotNullItems;
    } else {
      items.value.push(...newNotNullItems);
    }
    info('tryLoadMore, get netItems ' + newItems.length.toString());
    if (newItems.length < props.pageLimit) {
      noMore.value = true;
      info('tryLoadMore got no new items. List in total ' + (items.value?.length || 0).toString());
      if (!items.value) {
        emptyItems.value = true;
      }
    }
  }
  loading.value = false;
}

function handleScroll() {
  tryLoadMore(false);
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll);
  await tryLoadMore(true);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
