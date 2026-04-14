<template>
  <v-tooltip location="top" :text="fullText" open-delay="200">
    <template v-slot:activator="{ props: activatorProps }">
      <span v-bind="{ ...activatorProps, ...$attrs }">{{ relativeText }}</span>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from '@/dayjs';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  datetime: string;
}>();

const relativeText = computed(() => dayjs.utc(props.datetime).local().fromNow());
const fullText = computed(() =>
  dayjs.utc(props.datetime).local().format('YYYY-MM-DD HH:mm:ss')
);
</script>
