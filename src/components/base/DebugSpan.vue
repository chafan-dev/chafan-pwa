<script setup lang="ts">
import { isDev } from '@/utils';
</script>

<template>
  <span style="background: #ffffa2">
    <template v-if="isDev || $route.query.debug_mode">
      <slot />
    </template>
  </span>
</template>
