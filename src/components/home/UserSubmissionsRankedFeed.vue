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

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { ISubmission } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import { CVue } from '@/common';

@Component({
  components: { SubmissionPreview },
})
export default class UserSubmissionsRankedFeed extends CVue {
  private loadingSubmissions = false;
  private submissions: ISubmission[] | null = null;

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.loadingSubmissions = true;
      this.submissions = (await apiSubmission.getForUser(this.token)).data;
      this.loadingSubmissions = false;
    });
  }
}
</script>
