<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiBroadcast } from '@mdi/js';

const svgPath = mdiBroadcast;
</script>
