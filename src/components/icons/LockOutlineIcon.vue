<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiLockOutline } from '@mdi/js';

const svgPath = mdiLockOutline;
</script>
