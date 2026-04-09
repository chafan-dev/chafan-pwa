<template>
  <span>
    <!-- Diff results are fully recalculated when inputs change, index key is acceptable -->
    <span v-for="(diff, idx) in diffs" :key="idx">
      <span v-if="diff.added" class="text-green">{{ diff.value }}</span>
      <span v-if="diff.removed" class="text-red">{{ diff.value }}</span>
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
