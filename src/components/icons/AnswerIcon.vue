<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiText } from '@mdi/js';

const svgPath = mdiText;
</script>
