<template>
  <template v-for="(part, idx) in parts" :key="idx">
    <slot v-if="part.slot" :name="part.slot" />
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Renders `template`, substituting each `{name}` placeholder with the slot of
// the same name, so components (links, previews) can sit mid-sentence.
// Placeholders without a matching slot render as nothing.
const props = defineProps<{
  template: string;
}>();

interface Part {
  slot?: string;
  text: string;
}

const parts = computed<Part[]>(() =>
  props.template
    .split(/(\{\w+\})/)
    .filter((s) => s !== '')
    .map((s) => {
      const m = /^\{(\w+)\}$/.exec(s);
      return m ? { slot: m[1], text: '' } : { text: s };
    })
);
</script>
