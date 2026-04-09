<template>
  <v-slide-group class="d-flex mt-3 mb-1">
    <v-btn
      v-if="savedLocalEdit"
      class="mr-1 slim-btn"
      color="primary"
      variant="flat"
      size="small"
      @click="$emit('load-saved-edit')"
    >
      载入本地草稿
    </v-btn>

    <v-btn
      v-else-if="answerWritable && !answeredBefore"
      class="mr-1 slim-btn"
      color="primary"
      variant="flat"
      size="small"
      @click="$emit('toggle-editor')"
    >
      写回答
    </v-btn>

    <v-tooltip v-else location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          :ripple="false"
          class="mr-1 slim-btn text-grey"
          variant="tonal"
          elevation="0"
          plain
          size="small"
        >
          写回答
        </v-btn>
      </template>
      <span v-if="answeredBefore">已回答过</span>
      <span v-else>该圈子仅会员可以写回答</span>
    </v-tooltip>

    <CommentBtn
      :count="commentsCount"
      class="mr-1"
      @click="$emit('toggle-comments')"
    />

    <QuestionUpvotes
      :disabled="upvoteDisabled"
      :uuid="questionUuid"
      :upvotes-placeholder="upvotesPlaceholder"
      class="mr-1"
    />

    <v-btn
      v-if="editable"
      @click="$emit('edit-question')"
      class="mr-1 slim-btn"
      variant="tonal"
      elevation="0"
      size="small"
    >
      <AppIcon name="Edit" />
      <span v-if="display.mdAndUp" class="ml-1">编辑</span>
    </v-btn>

    <ShareCardButton
      v-slot="{ shareQrCodeUrl }"
      :link="shareLink"
      :link-text="shareLinkText"
      class="mr-1"
    >
      <slot name="share-card" :shareQrCodeUrl="shareQrCodeUrl" />
    </ShareCardButton>

    <v-menu location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="slim-btn" size="small" variant="tonal">
          <AppIcon name="Dots" size="small" />
          <span v-if="display.mdAndUp" class="ml-1">更多</span>
        </v-btn>
      </template>
      <v-list density="compact">
        <template v-if="questionSubscription">
          <v-list-item
            v-if="questionSubscription.subscribed_by_me"
            :disabled="cancelSubscriptionIntermediate"
            density="compact"
            @click="$emit('cancel-subscription')"
          >
            <AppIcon name="Bookmarked" class="mr-1" />
            取消关注
          </v-list-item>
          <v-list-item v-else :disabled="subscribeIntermediate" density="compact" @click="$emit('subscribe')">
            <AppIcon name="ToBookmark" class="mr-1" />
            关注
          </v-list-item>
        </template>
        <v-list-item density="compact" @click="$emit('show-history')">
          <AppIcon name="History" class="mr-1" />
          问题历史
        </v-list-item>
        <v-list-item density="compact" @click="transferQuestionDialog = true">
          <AppIcon name="Transfer" class="mr-1" />
          转移问题
        </v-list-item>
        <v-list-item
          density="compact"
          v-if="hideable"
          @click="showConfirmHideDialog = true"
        >
          <AppIcon name="LockOutline" class="mr-1" />
          隐藏问题
        </v-list-item>
      </v-list>
    </v-menu>

    <v-dialog v-model="transferQuestionDialog" max-width="600">
      <v-card>
        <v-card-title> 转移问题 </v-card-title>
        <v-card-text>
          <SiteSearch v-model="transferToSite" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn size="small" variant="flat" color="primary" @click="$emit('transfer-question', transferToSite)">申请转移</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <QuestionHistoryDialog
      :visible="historyDialogVisible"
      :archives="archives"
      @update:visible="$emit('update:history-dialog', $event)"
    />
    <v-dialog v-model="showConfirmHideDialog" max-width="600">
      <v-card>
        <v-card-title>
          <div class="text-h5 text-primary">确认隐藏问题</div>
        </v-card-title>
        <v-card-text>隐藏后问题仍可通过地址访问，但是会从问题列表中隐藏。</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="warning" variant="flat" size="small" @click="$emit('confirm-hide')"
            >确认隐藏
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-slide-group>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { IQuestionArchive, IQuestionUpvotes, ISite, IUserQuestionSubscription } from '@/interfaces';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import QuestionUpvotes from '@/components/question/QuestionUpvotes.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import QuestionHistoryDialog from '@/components/question/QuestionHistoryDialog.vue';
import SiteSearch from '@/components/SiteSearch.vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const display = useDisplay();

defineProps<{
  savedLocalEdit: any;
  answerWritable: boolean;
  answeredBefore: boolean;
  commentsCount: number;
  upvoteDisabled: boolean;
  questionUuid: string;
  upvotesPlaceholder: IQuestionUpvotes | undefined;
  editable: boolean;
  shareLink: string;
  shareLinkText: string;
  questionSubscription: IUserQuestionSubscription | null;
  cancelSubscriptionIntermediate: boolean;
  subscribeIntermediate: boolean;
  hideable: boolean;
  historyDialogVisible: boolean;
  archives: IQuestionArchive[];
}>();

defineEmits<{
  (e: 'load-saved-edit'): void;
  (e: 'toggle-editor'): void;
  (e: 'toggle-comments'): void;
  (e: 'edit-question'): void;
  (e: 'cancel-subscription'): void;
  (e: 'subscribe'): void;
  (e: 'show-history'): void;
  (e: 'transfer-question', site: ISite | null): void;
  (e: 'confirm-hide'): void;
  (e: 'update:history-dialog', value: boolean): void;
}>();

const transferQuestionDialog = ref(false);
const transferToSite = ref<ISite | null>(null);
const showConfirmHideDialog = ref(false);
</script>
