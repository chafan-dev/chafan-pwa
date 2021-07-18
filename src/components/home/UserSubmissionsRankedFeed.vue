<template>
  <div>
    <v-progress-linear v-if="loadingSubmissions" indeterminate />
    <SubmissionPreview
      v-for="submission in submissions"
      :key="submission.uuid"
      class="ma-4"
      :submission="submission"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ISubmission, IUserProfile } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import SubmissionPreview from '@/components/SubmissionPreview.vue';

@Component({
  components: { SubmissionPreview },
})
export default class UserSubmissionsRankedFeed extends Vue {
  @Prop() public readonly userProfile!: IUserProfile;

  private loadingSubmissions = false;
  private submissions: ISubmission[] | null = null;

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.loadingSubmissions = true;
      this.submissions = (await apiSubmission.getForUser(this.$store.state.main.token)).data;
      this.loadingSubmissions = false;
    });
  }
}
</script>
