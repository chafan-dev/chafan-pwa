<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiTransferRight } from '@mdi/js';

const svgPath = mdiTransferRight;
</script>
