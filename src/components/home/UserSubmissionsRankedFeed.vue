<template>
  <div>
    <v-progress-linear v-if="loadingSubmissions" indeterminate />
    <div v-for="submission in submissions" :key="submission.uuid" class="my-4">
      <SubmissionCard
        :class="{
          'px-3': $vuetify.breakpoint.mdAndUp,
          'py-4': $vuetify.breakpoint.mdAndUp,
          'px-2': !$vuetify.breakpoint.mdAndUp,
          'py-3': !$vuetify.breakpoint.mdAndUp,
        }"
        :submission="submission"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ISubmission, IUserProfile } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import SubmissionCard from '@/components/SubmissionCard.vue';

@Component({
  components: { SubmissionCard },
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
