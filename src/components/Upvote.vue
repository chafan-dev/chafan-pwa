<template>
  <span>
    <v-dialog v-model="showCancelUpvoteDialog" max-width="400" @keydown.enter="onConfirmCancel">
      <v-card>
        <v-card-title primary-title>
          <div class="headline">确定收回点赞？</div>
        </v-card-title>

        <v-card-actions>
          <v-spacer />
          <v-btn small depressed @click="showCancelUpvoteDialog = false">{{ $t('No') }} </v-btn>
          <v-btn
            :disabled="cancelUpvoteIntermediate"
            color="warning"
            small
            depressed
            @click="onConfirmCancel"
            >{{ $t('Yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <UpvotedBtn
      v-if="upvoted"
      :disabled="disabled || cancelUpvoteIntermediate"
      @click="showCancelUpvoteDialog = true"
      :count="upvotesCount"
    />
    <UpvoteBtn
      v-else
      :disabled="disabled || upvoteIntermediate"
      @click="_onUpvoteClick"
      :count="upvotesCount"
    />
  </span>
</template>
<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';

@Component({
  components: { UpvoteBtn, UpvotedBtn },
})
export default class Upvote extends Vue {
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
