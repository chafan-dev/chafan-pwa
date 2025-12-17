<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js';

const svgPath = mdiOpenInNew;
</script>
