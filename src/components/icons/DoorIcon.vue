<template>
  <v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiDoor } from '@mdi/js';

const svgPath = mdiDoor;
</script>
