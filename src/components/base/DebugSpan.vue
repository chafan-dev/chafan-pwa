<script setup lang="ts">
import { isDev } from '@/utils';
</script>

<template>
  <span class="debug-highlight">
    <template v-if="isDev || $route.query.debug_mode">
      <slot />
    </template>
  </span>
</template>
