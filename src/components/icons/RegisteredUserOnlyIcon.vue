<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiLock } from '@mdi/js';

const svgPath = mdiLock;
</script>
