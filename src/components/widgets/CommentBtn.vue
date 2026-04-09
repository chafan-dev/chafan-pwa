<template>
  <v-btn v-bind="$attrs" class="slim-btn" variant="tonal" size="small">
    <AppIcon name="Comments" class="mr-1" size="small"  />
    <template v-if="display.mdAndUp">
      评论 <span v-if="count">({{ count }})</span>
    </template>
    <template v-else>
      <span v-if="count">{{ count }}</span>
    </template>
  </v-btn>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';
import AppIcon from '@/components/icons/AppIcon.vue';

defineProps<{ count?: number }>();
const display = useDisplay();
</script>
