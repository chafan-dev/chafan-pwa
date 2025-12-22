<template>
  <span>
    <router-link
      v-if="comment.root_route"
      :to="comment.root_route + `/comments/${comment.uuid}`"
      class="text-decoration-none"
    >
      {{ shortComment }}
    </router-link>
    <span v-else>
      {{ shortComment }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IComment } from '@/interfaces';

const props = defineProps<{
  comment: IComment;
}>();

const shortComment = computed(() => {
  if (!props.comment.content.rendered_text) {
    return null;
  }
  return props.comment.content.rendered_text.length > 20
    ? props.comment.content.rendered_text.substring(0, 20) + '...'
    : props.comment.content.rendered_text;
});
</script>
