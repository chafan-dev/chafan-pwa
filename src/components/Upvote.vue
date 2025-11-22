<template>
  <span>
    <v-dialog v-model="showCancelUpvoteDialog" max-width="400" @keydown.enter="onConfirmCancel">
      <v-card>
        <v-card-title primary-title>
          <div class="headline">确定收回点赞？</div>
        </v-card-title>

        <v-card-actions>
          <v-spacer />
          <v-btn depressed small @click="showCancelUpvoteDialog = false">取消</v-btn>
          <v-btn
            :disabled="cancelUpvoteIntermediate"
            color="warning"
            depressed
            small
            @click="onConfirmCancel"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <UpvotedBtn
      v-if="upvoted"
      :class="theme.upvotedBtn.classes"
      :count="upvotesCount"
      :disabled="disabled || cancelUpvoteIntermediate"
      @click="showCancelUpvoteDialog = true"
    />
    <UpvoteBtn
      v-else
      :count="upvotesCount"
      :disabled="disabled || upvoteIntermediate"
      :outlined="theme.upvoteBtn.outlined"
      @click="_onUpvoteClick"
    />
  </span>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import { CVue } from '@/common';

@Component({
  components: { UpvoteBtn, UpvotedBtn },
})
export default class Upvote extends CVue {
  @Prop() public readonly upvotesCount!: number;
  @Prop() public readonly upvoted!: boolean;
  @Prop() public readonly disabled!: boolean;
  @Prop() public readonly onVote!: () => void;
  @Prop() public readonly onCancelVote!: () => void;

  private cancelUpvoteIntermediate = false;
  private upvoteIntermediate = false;
  private showCancelUpvoteDialog: boolean = false;

  private async _onUpvoteClick() {
    this.upvoteIntermediate = true;
    await this.onVote();
    this.upvoteIntermediate = false;
  }

  private async onConfirmCancel() {
    this.cancelUpvoteIntermediate = true;
    await this.onCancelVote();
    this.showCancelUpvoteDialog = false;
    this.cancelUpvoteIntermediate = false;
  }
}
</script>

<style>
/*- Must be here to override properly */
.theme--light.v-btn.v-btn--disabled.v-btn--has-bg {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
