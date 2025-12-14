<script setup lang="ts">
withDefaults(defineProps<{
  companyName: string;
  positionName: string;
  compact?: boolean;
}>(), {
  compact: false,
});
</script>

<template>
  <div>
    <template v-if="compact"> {{ companyName }} · {{ positionName }} </template>
    <template v-else>
      <h3>{{ companyName }}</h3>
      <div>{{ positionName }}</div>
    </template>
  </div>
</template>
