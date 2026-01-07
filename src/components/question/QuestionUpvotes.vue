<template>
  <span>
    <Upvote
      v-if="upvotes !== null"
      :disabled="disabled"
      :on-cancel-vote="cancelUpvote"
      :on-vote="upvote"
      :upvoted="upvotes.upvoted"
      :upvotes-count="upvotes.count"
    />
    <v-skeleton-loader v-else height="28" type="button" width="48" />
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Upvote from '@/components/Upvote.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiQuestion } from '@/api/question';
import { IQuestionUpvotes } from '@/interfaces';
import { useAuth } from '@/composables';
import store from '@/store';

const props = defineProps<{
  uuid: string;
  disabled: boolean;
  upvotesPlaceholder?: IQuestionUpvotes;
}>();

const { token } = useAuth();
const upvotes = ref<IQuestionUpvotes | null>(null);

onMounted(async () => {
  if (props.upvotesPlaceholder) {
    upvotes.value = props.upvotesPlaceholder;
  } else {
    upvotes.value = (await apiQuestion.getUpvotes(token.value, props.uuid)).data;
  }
});

async function upvote() {
  await dispatchCaptureApiError(store, async () => {
    upvotes.value = (await apiQuestion.upvoteQuestion(token.value, props.uuid)).data;
  });
}

async function cancelUpvote() {
  await dispatchCaptureApiError(store, async () => {
    upvotes.value = (await apiQuestion.cancelUpvoteQuestion(token.value, props.uuid)).data;
  });
}
</script>
