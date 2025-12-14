<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiLinkedin } from '@mdi/js';

const svgPath = mdiLinkedin;
</script>
