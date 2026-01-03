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
                :to="`/article-editor?articleColumnId=${this.article.article_column.uuid}&articleId=${this.article.uuid}`"
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
                        <div class="pa-1 text-center" style="float: right">
                          <v-img v-if="shareQrCodeUrl" :src="shareQrCodeUrl" max-width="100" />
                          <span class="text-caption">查看原文</span>
                        </div>
                        <p style="overflow-wrap: anywhere">{{ articlePreviewBody }}</p>
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
                  style="cursor: pointer"
                  @click="unbookmark"
                >
                  <BookmarkedIcon :disabled="unbookmarkIntermediate" />
                  <span class="mr-1">{{ userBookmark.bookmarkers_count }}</span>
                </span>
                <span
                  v-if="!userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                  style="cursor: pointer"
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

<script lang="ts">
import { Component } from 'vue-property-decorator';
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
import { Route, RouteRecord } from 'vue-router';
import { CVue, isEqual, updateHead } from '@/common';
import ShareCardButton from '@/components/ShareCardButton.vue';
import Viewer from '@/components/Viewer.vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import { getArticleDraft } from '@/utils';
import Upvote from '@/components/Upvote.vue';
import { AxiosError } from 'axios';

@Component({
  components: {
    Upvote,
    CommentBtn,
    UpvoteBtn,
    UpvotedBtn,
    ShareCardButton,
    UserLink,
    QuestionLink,
    CommentBlock,
    SiteBtn,
    BookmarkedIcon,
    ToBookmarkIcon,
    DeleteIcon,
    CollapseUpIcon,
    LinkIcon,
  },
})
export default class Article extends CVue {
  private article: IArticle | null = null;
  private upvotes: IArticleUpvotes | null = null;
  private userBookmark: IUserArticleBookmark | null = null;
  private confirmDeleteDialog = false;
  private loading = true;
  private deleteArticleIntermediate = false;
  private bookmarkIntermediate = false;
  private unbookmarkIntermediate = false;
  private currentUserIsAuthor = false;
  private editButtonText = '编辑';
  private showHasDraftBadge = false;
  private commentSubmitIntermediate = false;
  private articlePreviewBody: string = '';

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  get id() {
    return this.$route.params.id;
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'article');
    if (matched && !isEqual(to.params, from.params)) {
      this.loading = true;
      this.load();
    }
  }

  private async load() {
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        this.article = (await apiArticle.getArticle(this.token, this.id)).data;
        this.updateStateWithLoadedArticle(this.article);
        this.loading = false;
      },
      errorFilter: (err: AxiosError) => {
        const matched = this.commitErrMsg(err);
        if (matched) {
          this.$router.push('/');
        }
        return matched !== null;
      },
    });
  }

  private onClickShare() {
    this.articlePreviewBody = (this.$refs.viewer as any).textContent || '';
    if (this.articlePreviewBody.length > 40) {
      this.articlePreviewBody = this.articlePreviewBody.substring(0, 40) + '...';
    }
  }

  private async mounted() {
    await this.load();
  }

  private async upvote() {
    if (!this.userProfile) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.upvotes = (await apiArticle.upvoteArticle(this.token, this.article.uuid)).data;
      }
    });
  }

  private async cancelUpvote() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.upvotes = (await apiArticle.cancelUpvoteArticle(this.token, this.article.uuid)).data;
      }
    });
  }

  private async bookmark() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.bookmarkIntermediate = true;
        this.userBookmark = (await apiMe.bookmarkArticle(this.token, this.article.uuid)).data;
        this.bookmarkIntermediate = false;
      }
    });
  }

  private async unbookmark() {
    this.unbookmarkIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.userBookmark = (await apiMe.unbookmarkArticle(this.token, this.article.uuid)).data;
        this.unbookmarkIntermediate = false;
      }
    });
  }

  private async submitNewArticleCommentBody({ body, body_text, editor, mentioned }) {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.commentSubmitIntermediate = true;
        const response = await apiComment.postComment(this.token, {
          article_uuid: this.article.uuid,
          content: {
            source: body,
            rendered_text: body_text,
            editor,
          },
          mentioned,
        });
        const comment = response.data;
        this.article.comments.push(comment);
        this.commentSubmitIntermediate = false;
      }
    });
  }

  private updateStateWithLoadedArticle(article: IArticle) {
    updateHead(this.$route.path, article.title);
    if (this.token) {
      apiArticle.bumpViewsCounter(this.token, article.uuid);
    }
    this.currentUserIsAuthor = this.userProfile?.uuid === article.author.uuid;
    if (this.currentUserIsAuthor) {
      getArticleDraft(this.$dayjs, this.token, this.id).then((draft) => {
        if (draft && this.article) {
          // Override article title -> this is a server-side behavior
          this.article.title = draft.title || '';
          this.editButtonText = '编辑草稿';
          this.showHasDraftBadge = true;
        }
      });
    }

    this.upvotes = {
      article_uuid: article.uuid,
      count: article.upvotes_count,
      upvoted: article.upvoted,
    };
    this.userBookmark = {
      article_uuid: article.uuid,
      bookmarkers_count: article.bookmark_count,
      bookmarked_by_me: article.bookmarked,
    };
    this.loading = false;
  }

  private async deleteArticle() {
    if (this.article) {
      await apiArticle.deleteArticle(this.token, this.article.uuid);
      commitAddNotification(this.$store, {
        content: '文章已永久删除',
        color: 'success',
      });
      this.confirmDeleteDialog = false;
      await this.$router.push(`/article-columns/${this.article.article_column.uuid}`);
    }
  }
}
</script>

<style scoped>
.fixed-narrow-col {
  max-width: 800px;
}
</style>
