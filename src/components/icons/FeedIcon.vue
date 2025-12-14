<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiNewspaperVariant } from '@mdi/js';

const svgPath = mdiNewspaperVariant;
</script>
