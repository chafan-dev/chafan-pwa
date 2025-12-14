<script setup lang="ts">
import UpvotedBtnIcon from '@/components/icons/UpvotedIcon.vue';

defineProps<{
  count: number;
}>();
</script>

<template>
  <v-btn v-bind="$attrs" v-on="$listeners" class="slim-btn" depressed small>
    <UpvotedBtnIcon />
    <template v-if="$vuetify.breakpoint.mdAndUp"> 已赞 ({{ count }})</template>
    <template v-else>
      {{ count }}
    </template>
  </v-btn>
</template>
