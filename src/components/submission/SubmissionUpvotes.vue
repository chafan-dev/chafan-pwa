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

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Upvote from '@/components/Upvote.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { readToken } from '@/store/main/getters';
import { ISubmissionUpvotes } from '@/interfaces';
import { CVue } from '@/common';
import { apiSubmission } from '@/api/submission';

@Component({
  components: { Upvote },
})
export default class SubmissionUpvotes extends CVue {
  @Prop() public readonly uuid!: string;
  @Prop() public readonly disabled!: boolean;
  @Prop() public readonly upvotesPlaceholder: ISubmissionUpvotes | undefined;

  private upvotes: ISubmissionUpvotes | null = null;

  async mounted() {
    if (this.upvotesPlaceholder) {
      this.upvotes = this.upvotesPlaceholder;
    } else {
      this.upvotes = (await apiSubmission.getUpvotes(readToken(this.$store), this.uuid)).data;
    }
  }

  private async upvote() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.upvotes = (await apiSubmission.upvote(this.token, this.uuid)).data;
    });
  }

  private async cancelUpvote() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.upvotes = (await apiSubmission.cancelUpvote(this.token, this.uuid)).data;
    });
  }
}
</script>
