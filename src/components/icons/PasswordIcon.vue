<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiKey } from '@mdi/js';

const svgPath = mdiKey;
</script>
