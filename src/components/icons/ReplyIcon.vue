<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiReply } from '@mdi/js';

const svgPath = mdiReply;
</script>
