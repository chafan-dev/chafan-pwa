<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiArrowUpBold } from '@mdi/js';

const svgPath = mdiArrowUpBold;
</script>
