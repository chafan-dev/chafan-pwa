<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiRefresh } from '@mdi/js';

const svgPath = mdiRefresh;
</script>
