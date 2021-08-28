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
import { Component, Prop, Vue } from 'vue-property-decorator';
import Upvote from '@/components/Upvote.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiQuestion } from '@/api/question';
import { readToken } from '@/store/main/getters';
import { IQuestionUpvotes } from '@/interfaces';

@Component({
  components: { Upvote },
})
export default class QuestionUpvotes extends Vue {
  @Prop() public readonly uuid!: string;
  @Prop() public readonly disabled!: boolean;
  @Prop() public readonly upvotesPlaceholder: IQuestionUpvotes | undefined;

  private upvotes: IQuestionUpvotes | null = null;

  get token() {
    return readToken(this.$store);
  }

  async mounted() {
    if (this.upvotesPlaceholder) {
      this.upvotes = this.upvotesPlaceholder;
    } else {
      this.upvotes = (await apiQuestion.getUpvotes(readToken(this.$store), this.uuid)).data;
    }
  }

  private async upvote() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.upvotes = (await apiQuestion.upvoteQuestion(this.token, this.uuid)).data;
    });
  }

  private async cancelUpvote() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.upvotes = (await apiQuestion.cancelUpvoteQuestion(this.token, this.uuid)).data;
    });
  }
}
</script>
