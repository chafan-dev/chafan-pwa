<template>
  <span>
    <span v-for="(diff, idx) in diffs" :key="idx">
      <span v-if="diff.added" class="green--text text--darken-2">{{ diff.value }}</span>
      <span v-if="diff.removed" class="red--text text--darken-2">{{ diff.value }}</span>
      ...
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as diff from 'diff';

const props = defineProps<{
  s1: string;
  s2: string;
}>();

const diffs = computed(() => {
  return diff.diffLines(props.s1, props.s2, {
    newlineIsToken: true,
  });
});
</script>
