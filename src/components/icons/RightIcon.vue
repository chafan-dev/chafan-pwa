<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';

const svgPath = mdiChevronRight;
</script>
