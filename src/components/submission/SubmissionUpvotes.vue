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
import { ISubmissionUpvotes } from '@/interfaces';
import { useAuth } from '@/composables';
import { apiSubmission } from '@/api/submission';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

const props = defineProps<{
  uuid: string;
  disabled: boolean;
  upvotesPlaceholder?: ISubmissionUpvotes;
}>();

const { token } = useAuth();
const upvotes = ref<ISubmissionUpvotes | null>(null);

onMounted(async () => {
  if (props.upvotesPlaceholder) {
    upvotes.value = props.upvotesPlaceholder;
  } else {
    upvotes.value = (await apiSubmission.getUpvotes(token.value, props.uuid)).data;
  }
});

async function upvote() {
  await store.captureApiError(async () => {
    upvotes.value = (await apiSubmission.upvote(token.value, props.uuid)).data;
  });
}

async function cancelUpvote() {
  await store.captureApiError(async () => {
    upvotes.value = (await apiSubmission.cancelUpvote(token.value, props.uuid)).data;
  });
}
</script>
