<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiBookshelf } from '@mdi/js';

const svgPath = mdiBookshelf;
</script>
