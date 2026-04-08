<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { iconMap } from './iconMap';

const props = defineProps<{
  name: string;
}>();

const svgPath = computed(() => {
  const path = iconMap[props.name];
  if (!path) {
    console.warn(`AppIcon: unknown icon name "${props.name}"`);
    return '';
  }
  return path;
});
</script>
