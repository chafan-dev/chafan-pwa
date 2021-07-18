<template>
  <span>
    <Upvote
      v-if="upvotes !== null"
      :upvotes-count="upvotes.count"
      :upvoted="upvotes.upvoted"
      :disabled="disabled"
      :on-cancel-vote="cancelUpvote"
      :on-vote="upvote"
    />
    <v-skeleton-loader type="button" height="28" width="48" v-else />
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

  private upvotes: IQuestionUpvotes | null = null;

  async mounted() {
    this.upvotes = (await apiQuestion.getUpvotes(readToken(this.$store), this.uuid)).data;
  }

  get token() {
    return readToken(this.$store);
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
