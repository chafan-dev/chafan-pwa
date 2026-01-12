<template>
  <div>
    <v-progress-linear v-if="loadingSubmissions" indeterminate />
    <SubmissionPreview
      v-for="submission in submissions"
      :key="submission.uuid"
      :submission="submission"
      class="ma-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import store from '@/store';
import { ISubmission } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import { useAuth } from '@/composables';

const { token } = useAuth();

const loadingSubmissions = ref(false);
const submissions = ref<ISubmission[] | null>(null);

onMounted(async () => {
  await dispatchCaptureApiError(store, async () => {
    loadingSubmissions.value = true;
    submissions.value = (await apiSubmission.getForUser(token.value)).data;
    loadingSubmissions.value = false;
  });
});
</script>
