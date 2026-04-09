<template>
  <div class="d-flex mt-1">
    <Upvote
      v-if="upvotes"
      :disabled="currentUserIsAuthor"
      :on-cancel-vote="() => $emit('cancel-upvote')"
      :on-vote="() => $emit('upvote')"
      :upvoted="upvotes.upvoted"
      :upvotes-count="upvotes.count"
      class="mr-1"
    />
    <CommentBtn
      :count="commentsCount"
      class="mr-1"
      @click="$emit('toggle-comments')"
    />

    <template v-if="userProfile">
      <v-btn
        v-show="currentUserIsAuthor"
        class="slim-btn mr-1"
        variant="tonal"
        size="small"
        @click="$emit('load-editor')"
      >
        <AppIcon name="Edit" class="mr-1" />
        {{ editButtonText }}
      </v-btn>

      <v-dialog v-model="confirmDeleteDialog" max-width="400">
        <v-card>
          <v-card-title>
            <div class="text-h5 text-primary">
              <template v-if="draftMode"> 确定永久删除答案草稿？</template>
              <template v-else> 确定永久删除答案及其所有历史版本？</template>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="tonal" size="small" @click="confirmDeleteDialog = false"> 取消</v-btn>
            <v-btn
              :disabled="deleteIntermediate"
              color="warning"
              variant="flat"
              size="small"
              @click="$emit('delete-answer')"
            >
              确认
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <ShareCardButton
        v-slot="{ shareQrCodeUrl }"
        :link="shareLink"
        :link-text="shareLinkText"
      >
        <slot name="share-card" :shareQrCodeUrl="shareQrCodeUrl" />
      </ShareCardButton>

      <v-menu location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="slim-btn ml-1" variant="tonal" size="small">
            <AppIcon name="Dots" size="small" />
            <span v-if="isDesktop" class="ml-1">更多</span>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item density="compact"
            v-if="!currentUserIsAuthor && loggedIn && suggestEditable"
            @click="$emit('load-editor')"
          >
            <AppIcon name="Edit" class="mr-1" />
            提交编辑建议
          </v-list-item>
          <template v-if="userBookmark">
            <v-list-item
              v-if="userBookmark.bookmarked_by_me && !currentUserIsAuthor"
              :disabled="bookmarkLoading" density="compact"
              @click="$emit('unbookmark')"
            >
              <AppIcon name="Bookmarked" class="mr-1" />
              取消收藏（{{ userBookmark.bookmarkers_count }}）
            </v-list-item>
            <v-list-item
              v-if="!userBookmark.bookmarked_by_me && !currentUserIsAuthor"
              :disabled="bookmarkLoading" density="compact"
              @click="$emit('bookmark')"
            >
              <AppIcon name="ToBookmark" class="mr-1" />
              收藏（{{ userBookmark.bookmarkers_count }}）
            </v-list-item>
          </template>
          <v-list-item density="compact" @click="webArchiveRequest">
            <AppIcon name="Bookshelf" class="mr-1" />
            Web Archive
          </v-list-item>
          <v-list-item density="compact" @click="$emit('report')">
            <AppIcon name="Flag" class="mr-1" />
            举报
          </v-list-item>
          <v-list-item v-if="currentUserIsAuthor" @click="confirmDeleteDialog = true">
            <template v-slot:prepend>
              <AppIcon name="Delete" class="mr-1" />
              永久删除
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <AppIcon name="CollapseUp" class="pl-1 pr-1" @click="$emit('collapse')" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IAnswerUpvotes, IUserAnswerBookmark, IUserProfile } from '@/interfaces';
import Upvote from '@/components/Upvote.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import AppIcon from '@/components/icons/AppIcon.vue';
import { useResponsive, useAuth } from '@/composables';

const { isDesktop } = useResponsive();
const { loggedIn, userProfile } = useAuth();

defineProps<{
  upvotes: IAnswerUpvotes | null;
  currentUserIsAuthor: boolean;
  editButtonText: string;
  draftMode: boolean;
  deleteIntermediate: boolean;
  shareLink: string;
  shareLinkText: string;
  suggestEditable: boolean;
  userBookmark: IUserAnswerBookmark | null;
  bookmarkLoading: boolean;
  commentsCount: number;
}>();

defineEmits<{
  (e: 'upvote'): void;
  (e: 'cancel-upvote'): void;
  (e: 'toggle-comments'): void;
  (e: 'load-editor'): void;
  (e: 'delete-answer'): void;
  (e: 'bookmark'): void;
  (e: 'unbookmark'): void;
  (e: 'report'): void;
  (e: 'collapse'): void;
}>();

const confirmDeleteDialog = ref(false);

function webArchiveRequest() {
  window.open('https://web.archive.org/web/*/' + window.location.href);
}
</script>
