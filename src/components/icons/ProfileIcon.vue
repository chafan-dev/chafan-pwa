<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiAccountCircle } from '@mdi/js';

const svgPath = mdiAccountCircle;
</script>
