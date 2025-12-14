<script setup lang="ts">
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';

defineProps<{
  count: number;
}>();
</script>

<template>
  <v-btn v-bind="$attrs" v-on="$listeners" class="slim-btn" depressed small>
    <UpvoteIcon />
    <template v-if="$vuetify.breakpoint.mdAndUp">赞 ({{ count }})</template>
    <template v-else>{{ count }}</template>
  </v-btn>
</template>
