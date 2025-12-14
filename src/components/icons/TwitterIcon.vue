<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiTwitter } from '@mdi/js';

const svgPath = mdiTwitter;
</script>
