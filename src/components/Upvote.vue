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

<script setup lang="ts">
import { ref } from 'vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import { useTheme } from '@/composables';

const props = defineProps<{
  upvotesCount: number;
  upvoted: boolean;
  disabled: boolean;
  onVote: () => void | Promise<void>;
  onCancelVote: () => void | Promise<void>;
}>();

const { theme } = useTheme();

const cancelUpvoteIntermediate = ref(false);
const upvoteIntermediate = ref(false);
const showCancelUpvoteDialog = ref(false);

async function _onUpvoteClick() {
  upvoteIntermediate.value = true;
  await props.onVote();
  upvoteIntermediate.value = false;
}

async function onConfirmCancel() {
  cancelUpvoteIntermediate.value = true;
  await props.onCancelVote();
  showCancelUpvoteDialog.value = false;
  cancelUpvoteIntermediate.value = false;
}
</script>

<style>
/*- Must be here to override properly */
.theme--light.v-btn.v-btn--disabled.v-btn--has-bg {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
