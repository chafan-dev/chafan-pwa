<template>
  <span>
    <AppIcon name="ExpandHorizontal"
      v-if="isDesktop && isNarrowFeedUI"
      @click="setNarrowFeedUI(false)"
     />
    <AppIcon name="CollapseHorizontal"
      v-else-if="isDesktop"
      @click="setNarrowFeedUI(true)"
     />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NARROW_FEED_UI_KEY } from '@/common';
import { useResponsive } from '@/composables';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();
const { isDesktop } = useResponsive();

const isNarrowFeedUI = computed(() => store.narrowUI);

function setNarrowFeedUI(value: boolean) {
  store.narrowUI = value;
  try {
    localStorage.removeItem(NARROW_FEED_UI_KEY);
    localStorage.setItem(NARROW_FEED_UI_KEY, value.toString());
  } catch (e) { console.warn('Failed to persist narrow UI setting', e); }
}
</script>
