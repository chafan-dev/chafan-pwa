<script setup lang="ts">
import { computed } from 'vue';
import { IQuestionPreview } from '@/interfaces';
import { useTheme } from '@/composables';

const props = defineProps<{
  questionPreview: IQuestionPreview;
}>();

const { theme } = useTheme();

const id = computed(() => props.questionPreview.uuid);
const title = computed(() => props.questionPreview.title);
</script>

<template>
  <router-link :class="theme.questionLink.link.classes" :to="'/questions/' + id">
    {{ title }}
  </router-link>
</template>
