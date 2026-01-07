<template>
  <span>
    <ExpandHorizontalIcon
      v-if="isDesktop && isNarrowFeedUI"
      @click="setNarrowFeedUI(false)"
    />
    <CollapseHorizontalIcon
      v-else-if="isDesktop"
      @click="setNarrowFeedUI(true)"
    />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import store from '@/store';
import ExpandHorizontalIcon from '@/components/icons/ExpandHorizontalIcon.vue';
import CollapseHorizontalIcon from '@/components/icons/CollapseHorizontalIcon.vue';
import { commitSetNarrowUI } from '@/store/main/mutations';
import { readNarrowUI } from '@/store/main/getters';
import { NARROW_FEED_UI_KEY } from '@/common';
import { useResponsive } from '@/composables';
const { isDesktop } = useResponsive();

const isNarrowFeedUI = computed(() => readNarrowUI(store));

function setNarrowFeedUI(value: boolean) {
  commitSetNarrowUI(store, value);
  try {
    localStorage.removeItem(NARROW_FEED_UI_KEY);
    localStorage.setItem(NARROW_FEED_UI_KEY, value.toString());
  } catch (e) {}
}
</script>
