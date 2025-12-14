<template>
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiEmoticonHappyOutline } from '@mdi/js';

const svgPath = mdiEmoticonHappyOutline;
</script>
