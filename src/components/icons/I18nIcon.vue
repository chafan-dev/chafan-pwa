<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiTranslate } from '@mdi/js';

const svgPath = mdiTranslate;
</script>
