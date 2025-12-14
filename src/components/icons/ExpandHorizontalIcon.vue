<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiArrowExpandHorizontal } from '@mdi/js';

const svgPath = mdiArrowExpandHorizontal;
</script>
