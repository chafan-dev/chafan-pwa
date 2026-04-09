<template>
  <div class="d-flex py-2">
    <Upvote
      class="mr-1"
      v-if="upvotes"
      :disabled="upvoteDisabled"
      :on-cancel-vote="() => $emit('cancel-upvote')"
      :on-vote="() => $emit('upvote')"
      :upvoted="upvotes.upvoted"
      :upvotes-count="upvotes.count"
    />

    <v-btn
      v-if="editable"
      @click="$emit('edit')"
      class="slim-btn mr-1"
      variant="tonal"
      size="small"
    >
      <AppIcon name="Edit" />
      <span v-if="display.mdAndUp" class="ml-1">编辑</span>
    </v-btn>

    <ShareCardButton
      v-slot="{ shareQrCodeUrl }"
      :link="shareLink"
      :link-text="shareLinkText"
      class="text-decoration-none mr-1"
    >
      <slot name="share-card" :shareQrCodeUrl="shareQrCodeUrl" />
    </ShareCardButton>

    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="slim-btn" variant="tonal" size="small">
          <AppIcon name="Dots" size="small" />
          <span v-if="isDesktop" class="ml-1">更多</span>
        </v-btn>
      </template>
      <v-list density="compact">
        <v-list-item v-if="suggestionEditable" @click="$emit('edit')">
          <AppIcon name="Edit" class="mr-1" />
          提交编辑建议
        </v-list-item>

        <v-list-item density="compact" @click="$emit('show-history')">
          <AppIcon name="History" class="mr-1" />
          查看编辑历史
        </v-list-item>

        <template v-if="submissionSubscription">
          <v-list-item
            v-if="submissionSubscription.subscribed_by_me"
            :disabled="cancelSubscriptionIntermediate"
            density="compact"
            @click="$emit('cancel-subscription')"
          >
            <AppIcon name="Bookmarked" class="mr-1" />
            取消收藏
          </v-list-item>
          <v-list-item v-else :disabled="subscribeIntermediate" density="compact" @click="$emit('subscribe')">
            <AppIcon name="ToBookmark" class="mr-1" />
            收藏
          </v-list-item>
        </template>
      </v-list>
    </v-menu>

    <v-dialog v-model="showConfirmHideDialog" max-width="600">
      <v-card>
        <v-card-title>
          <div class="text-h5 text-primary">确认隐藏分享？</div>
        </v-card-title>
        <v-card-text>隐藏后分享将对所有用户不可见。</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="warning" variant="flat" mr-1 size="small" @click="$emit('confirm-hide')">
            确认隐藏
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { ISubmissionUpvotes, IUserSubmissionSubscription } from '@/interfaces';
import Upvote from '@/components/Upvote.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import AppIcon from '@/components/icons/AppIcon.vue';
import { useResponsive } from '@/composables';

const display = useDisplay();
const { isDesktop } = useResponsive();

defineProps<{
  upvotes: ISubmissionUpvotes | null;
  upvoteDisabled: boolean;
  editable: boolean;
  suggestionEditable: boolean;
  shareLink: string;
  shareLinkText: string;
  submissionSubscription: IUserSubmissionSubscription | null;
  cancelSubscriptionIntermediate: boolean;
  subscribeIntermediate: boolean;
}>();

defineEmits<{
  (e: 'upvote'): void;
  (e: 'cancel-upvote'): void;
  (e: 'edit'): void;
  (e: 'show-history'): void;
  (e: 'cancel-subscription'): void;
  (e: 'subscribe'): void;
  (e: 'confirm-hide'): void;
}>();

const showConfirmHideDialog = ref(false);
</script>
