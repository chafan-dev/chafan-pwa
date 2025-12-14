<script setup lang="ts">
import { ITopic } from '@/interfaces';

withDefaults(defineProps<{
  topic: ITopic;
  moreMargin?: boolean;
}>(), {
  moreMargin: true,
});
</script>

<template>
  <v-chip
    :to="'/topics/' + topic.uuid"
    :classes="{ 'mr-1': moreMargin, 'mb-1': moreMargin }"
    small
    label
    color="grey lighten-4"
    >{{ topic.name }}
  </v-chip>
</template>
