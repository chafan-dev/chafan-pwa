<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiBookmarkCheck } from '@mdi/js';

const svgPath = mdiBookmarkCheck;
</script>
