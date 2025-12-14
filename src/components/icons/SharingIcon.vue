<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiForum } from '@mdi/js';

const svgPath = mdiForum;
</script>
