<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiShieldCheck } from '@mdi/js';

const svgPath = mdiShieldCheck;
</script>
