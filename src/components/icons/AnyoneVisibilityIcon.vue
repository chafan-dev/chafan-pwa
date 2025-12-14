<template>
  <v-icon v-bind="$attrs" small>{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiEarth } from '@mdi/js';

const svgPath = mdiEarth;
</script>
