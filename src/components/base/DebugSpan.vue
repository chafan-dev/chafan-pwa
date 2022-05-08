<template>
  <span style="background: #ffffa2">
    <template v-if="isDev || $route.query.debug_mode">
      <slot />
    </template>
  </span>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { CVue } from '@/common';

@Component
export default class DebugSpan extends CVue {}
</script>
