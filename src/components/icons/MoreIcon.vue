<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiDotsHorizontalCircleOutline } from '@mdi/js';

const svgPath = mdiDotsHorizontalCircleOutline;
</script>
