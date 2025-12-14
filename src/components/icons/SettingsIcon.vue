<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiCogOutline } from '@mdi/js';

const svgPath = mdiCogOutline;
</script>
