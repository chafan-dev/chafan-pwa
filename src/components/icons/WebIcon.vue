<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiWeb } from '@mdi/js';

const svgPath = mdiWeb;
</script>
