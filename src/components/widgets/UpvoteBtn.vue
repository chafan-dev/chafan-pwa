<script setup lang="ts">
import { useDisplay } from 'vuetify';
import AppIcon from '@/components/icons/AppIcon.vue';

defineProps<{
  count: number;
}>();
const display = useDisplay();
</script>

<template>
  <v-btn v-bind="$attrs" class="slim-btn" variant="tonal" size="small">
    <AppIcon name="Upvote"  />
    <template v-if="display.mdAndUp">赞 ({{ count }})</template>
    <template v-else>{{ count }}</template>
  </v-btn>
</template>
