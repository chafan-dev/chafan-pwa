<template>
  <v-row :loading="loading" justify="center">
    <v-col
      :class="{
        'col-8': isDesktop && !isNarrowFeedUI,
        'fixed-narrow-col': isNarrowFeedUI,
      }"
    >
      <div v-if="article" class="my-4 px-2">
        <div class="d-flex align-center">
          <UserLink :showAvatar="true" :userPreview="article.author" />
          <span v-if="article.author.personal_introduction && isDesktop" class="grey--text ml-2">
            {{ article.author.personal_introduction }}
          </span>
          <v-spacer />
          <span class="mr-3">
            <router-link
              :to="`/article-columns/${article.article_column.uuid}`"
              class="text-decoration-none"
              target="_blank"
            >
              {{ article.article_column.name }}
            </router-link>
          </span>
          <span v-if="isDesktop" class="text-caption grey--text">
            发表于
            {{ fromNow(article.updated_at) }}
          </span>
        </div>

        <div class="headline my-2 font-weight-bold">
          {{ article.title }}
        </div>
        <div class="my-3">
          <v-chip v-if="article && !article.is_published" class="mb-1" color="warning" small
            >初稿预览
          </v-chip>
          <v-chip v-else-if="showHasDraftBadge" class="mb-1" color="info" small
            >编辑器中有未发表的草稿
          </v-chip>
          <Viewer ref="viewer" :content="article.content" />
        </div>

        <div>
          <v-row>
            <v-col class="d-flex">
              <Upvote
                v-if="upvotes !== null"
                :disabled="currentUserIsAuthor"
                :on-cancel-vote="cancelUpvote"
                :on-vote="upvote"
                :upvoted="upvotes.upvoted"
                :upvotes-count="upvotes.count"
                class="mr-1"
              />
              <v-btn
                v-show="currentUserIsAuthor"
                :to="`/article-editor?articleColumnId=${article.article_column.uuid}&articleId=${article.uuid}`"
                class="mr-1 slim-btn"
                depressed
                small
                >{{ editButtonText }}
              </v-btn>

              <v-menu v-if="currentUserIsAuthor" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" class="mr-1 slim-btn" depressed small>
                    设置
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="confirmDeleteDialog = true">
                    <v-list-item-icon>
                      <DeleteIcon />
                    </v-list-item-icon>
                    <v-list-item-content>永久删除</v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>

              <ShareCardButton
                v-slot="{ shareQrCodeUrl }"
                :link="`/articles/${article.uuid}`"
                :link-text="article.title"
                :onClickShare="onClickShare"
              >
                <v-card-title>
                  {{ article.title }}
                </v-card-title>
                <v-card-text>
                  <div class="pt-2 d-flex">
                    <div>
                      <div class="text--primary text-body-1">
                        <div class="pa-1 text-center float-right">
                          <v-img v-if="shareQrCodeUrl" :src="shareQrCodeUrl" max-width="100" />
                          <span class="text-caption">查看原文</span>
                        </div>
                        <p class="overflow-wrap-anywhere">{{ articlePreviewBody }}</p>
                      </div>
                      <div>
                        <UserLink :showAvatar="true" :userPreview="article.author" />
                        <span
                          v-if="article.author.personal_introduction"
                          :class="{ 'text-caption': !isDesktop }"
                          class="grey--text ml-2"
                        >
                          {{ article.author.personal_introduction }}
                        </span>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </ShareCardButton>

              <v-dialog v-model="confirmDeleteDialog" max-width="300">
                <v-card>
                  <v-card-title primary-title>
                    <div class="headline primary--text">确定永久删除文章及其所有历史版本？</div>
                  </v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn class="mr-1" depressed small @click="confirmDeleteDialog = false">
                      取消
                    </v-btn>
                    <v-btn
                      :disabled="deleteArticleIntermediate"
                      class="mr-1"
                      color="warning"
                      depressed
                      small
                      @click="deleteArticle"
                    >
                      确定
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

              <template v-if="token">
                <span
                  v-if="userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                  class="cursor-pointer"
                  @click="unbookmark"
                >
                  <BookmarkedIcon :disabled="unbookmarkIntermediate" />
                  <span class="mr-1">{{ userBookmark.bookmarkers_count }}</span>
                </span>
                <span
                  v-if="!userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                  class="cursor-pointer"
                  @click="bookmark"
                >
                  <ToBookmarkIcon :disabled="bookmarkIntermediate" />
                  <span class="mr-1">{{ userBookmark.bookmarkers_count }}</span>
                </span>
              </template>
            </v-col>

            <!-- Column of variable width -->
            <v-col v-if="$vuetify.breakpoint.mdAndUp && article.view_times" md="auto">
              <span class="text-caption grey--text ma-2"> 已被阅读{{ article.view_times }}次 </span>
            </v-col>
          </v-row>

          <!-- Comments -->
          <div>
            <CommentBlock
              :commentSubmitIntermediate="commentSubmitIntermediate"
              :comments="article.comments"
              :show-title="true"
              :writable="loggedIn"
              class="mt-6"
              commentLabel="评论文章"
              @submit-new-comment="submitNewArticleCommentBody"
            >
            </CommentBlock>
          </div>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import store from '@/store';
import { useRoute, useRouter } from 'vue-router/composables';
import { IArticle, IArticleUpvotes, IUserArticleBookmark } from '@/interfaces';
import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import CollapseUpIcon from '@/components/icons/CollapseUpIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import { apiArticle } from '@/api/article';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import {
  dispatchCaptureApiError,
  dispatchCaptureApiErrorWithErrorHandler,
} from '@/store/main/actions';

import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { apiComment } from '@/api/comment';
import { readNarrowUI } from '@/store/main/getters';
import { apiMe } from '@/api/me';
import { isEqual, updateHead } from '@/common';
import ShareCardButton from '@/components/ShareCardButton.vue';
import Viewer from '@/components/Viewer.vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import { getArticleDraft } from '@/utils';
import Upvote from '@/components/Upvote.vue';
import { AxiosError } from 'axios';
import { useAuth, useResponsive, useDayjs, useErrorHandling } from '@/composables';

const route = useRoute();
const router = useRouter();
const { token, userProfile, loggedIn } = useAuth();
const { isDesktop } = useResponsive();
const { dayjs } = useDayjs();
const { commitErrMsg } = useErrorHandling();

const viewer = ref<any>(null);

const article = ref<IArticle | null>(null);
const upvotes = ref<IArticleUpvotes | null>(null);
const userBookmark = ref<IUserArticleBookmark | null>(null);
const confirmDeleteDialog = ref(false);
const loading = ref(true);
const deleteArticleIntermediate = ref(false);
const bookmarkIntermediate = ref(false);
const unbookmarkIntermediate = ref(false);
const currentUserIsAuthor = ref(false);
const editButtonText = ref('编辑');
const showHasDraftBadge = ref(false);
const commentSubmitIntermediate = ref(false);
const articlePreviewBody = ref('');

const isNarrowFeedUI = computed(() => readNarrowUI(store));
const id = computed(() => route.params.id as string);

function fromNow(date: string) {
  return dayjs(date).fromNow();
}

// Watch for route changes (replaces beforeRouteUpdate)
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId !== oldId && route.name === 'article') {
      loading.value = true;
      load();
    }
  }
);

async function load() {
  await dispatchCaptureApiErrorWithErrorHandler(store, {
    action: async () => {
      article.value = (await apiArticle.getArticle(token.value, id.value)).data;
      updateStateWithLoadedArticle(article.value);
      loading.value = false;
    },
    errorFilter: (err: AxiosError) => {
      const matched = commitErrMsg(err);
      if (matched) {
        router.push('/');
      }
      return matched !== null;
    },
  });
}

function onClickShare() {
  articlePreviewBody.value = viewer.value?.textContent || '';
  if (articlePreviewBody.value.length > 40) {
    articlePreviewBody.value = articlePreviewBody.value.substring(0, 40) + '...';
  }
}

onMounted(async () => {
  await load();
});

async function upvote() {
  if (!userProfile.value) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  await dispatchCaptureApiError(store, async () => {
    if (article.value) {
      upvotes.value = (await apiArticle.upvoteArticle(token.value, article.value.uuid)).data;
    }
  });
}

async function cancelUpvote() {
  await dispatchCaptureApiError(store, async () => {
    if (article.value) {
      upvotes.value = (await apiArticle.cancelUpvoteArticle(token.value, article.value.uuid)).data;
    }
  });
}

async function bookmark() {
  await dispatchCaptureApiError(store, async () => {
    if (article.value) {
      bookmarkIntermediate.value = true;
      userBookmark.value = (await apiMe.bookmarkArticle(token.value, article.value.uuid)).data;
      bookmarkIntermediate.value = false;
    }
  });
}

async function unbookmark() {
  unbookmarkIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    if (article.value) {
      userBookmark.value = (await apiMe.unbookmarkArticle(token.value, article.value.uuid)).data;
      unbookmarkIntermediate.value = false;
    }
  });
}

async function submitNewArticleCommentBody({ body, body_text, editor, mentioned }: any) {
  await dispatchCaptureApiError(store, async () => {
    if (article.value) {
      commentSubmitIntermediate.value = true;
      const response = await apiComment.postComment(token.value, {
        article_uuid: article.value.uuid,
        content: {
          source: body,
          rendered_text: body_text,
          editor,
        },
        mentioned,
      });
      const comment = response.data;
      article.value.comments.push(comment);
      commentSubmitIntermediate.value = false;
    }
  });
}

function updateStateWithLoadedArticle(articleData: IArticle) {
  updateHead(route.path, articleData.title);
  if (token.value) {
    apiArticle.bumpViewsCounter(token.value, articleData.uuid);
  }
  currentUserIsAuthor.value = userProfile.value?.uuid === articleData.author.uuid;
  if (currentUserIsAuthor.value) {
    getArticleDraft(dayjs, token.value, id.value).then((draft) => {
      if (draft && article.value) {
        // Override article title -> this is a server-side behavior
        article.value.title = draft.title || '';
        editButtonText.value = '编辑草稿';
        showHasDraftBadge.value = true;
      }
    });
  }

  upvotes.value = {
    article_uuid: articleData.uuid,
    count: articleData.upvotes_count,
    upvoted: articleData.upvoted,
  };
  userBookmark.value = {
    article_uuid: articleData.uuid,
    bookmarkers_count: articleData.bookmark_count,
    bookmarked_by_me: articleData.bookmarked,
  };
  loading.value = false;
}

async function deleteArticle() {
  if (article.value) {
    await apiArticle.deleteArticle(token.value, article.value.uuid);
    commitAddNotification(store, {
      content: '文章已永久删除',
      color: 'success',
    });
    confirmDeleteDialog.value = false;
    await router.push(`/article-columns/${article.value.article_column.uuid}`);
  }
}
</script>

<style scoped>
.fixed-narrow-col {
  max-width: 800px;
}
</style>
