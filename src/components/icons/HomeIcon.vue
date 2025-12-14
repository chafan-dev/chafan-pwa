<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiHome } from '@mdi/js';

const svgPath = mdiHome;
</script>
