<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiFlag } from '@mdi/js';

const svgPath = mdiFlag;
</script>
