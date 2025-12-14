<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiMagnify } from '@mdi/js';

const svgPath = mdiMagnify;
</script>
