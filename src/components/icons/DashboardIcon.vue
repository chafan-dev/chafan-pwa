<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiViewDashboard } from '@mdi/js';

const svgPath = mdiViewDashboard;
</script>
