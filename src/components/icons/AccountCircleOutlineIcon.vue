<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiAccountCircleOutline } from '@mdi/js';

const svgPath = mdiAccountCircleOutline;
</script>
