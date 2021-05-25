<template>
  <v-row :loading="loading" justify="center">
    <v-col
      :class="{
        'col-8': $vuetify.breakpoint.mdAndUp,
        'fixed-narrow-col': isNarrowFeedUI,
      }"
      fluid
    >
      <div v-if="article" class="my-4 px-2">
        <div class="d-flex align-center">
          <UserLink :showAvatar="true" :userPreview="article.author" />
          <span
            v-if="article.author.personal_introduction && $vuetify.breakpoint.mdAndUp"
            class="grey--text ml-2"
          >
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
          <span v-if="$vuetify.breakpoint.mdAndUp" class="text-caption grey--text mr-3">
            发表于
            {{ $dayjs.utc(article.updated_at).local().fromNow() }}
          </span>
        </div>

        <div class="headline my-2 mx-1 font-weight-bold">
          {{ article.title }}
        </div>
        <div class="my-3 mx-1">
          <v-chip v-if="article && !article.is_published" class="mb-1" color="warning" small
            >此为初稿仅自己可见
          </v-chip>
          <v-chip v-else-if="showHasDraftBadge" class="mb-1" color="info" small
            >编辑器中有未发表的草稿
          </v-chip>
          <Viewer
            ref="viewer"
            :body="article.body"
            :bodyFormat="article.body_format"
            :editor="article.editor"
          />
        </div>

        <div class="mx-1">
          <v-row>
            <v-col class="d-flex">
              <template v-if="token">
                <v-dialog v-model="showCancelUpvoteDialog" max-width="300">
                  <v-card>
                    <v-card-title primary-title>
                      <div class="headline primary--text">确定收回赞？</div>
                    </v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn class="mr-1" depressed small @click="showCancelUpvoteDialog = false"
                        >{{ $t('No') }}
                      </v-btn>
                      <v-btn
                        :disabled="cancelUpvoteIntermediate"
                        color="warning"
                        depressed
                        small
                        @click="cancelUpvote"
                        >{{ $t('Yes') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <span class="mr-1" v-if="upvotes !== null">
                  <UpvotedBtn
                    v-if="upvotes.upvoted"
                    @click="showCancelUpvoteDialog = true"
                    :count="upvotes.count"
                  />
                  <UpvoteBtn
                    v-else
                    :disabled="currentUserIsAuthor || upvoteIntermediate"
                    @click="upvote"
                    :count="upvotes.count"
                  >
                    {{ $t('赞') }} ({{ upvotes.count }})
                  </UpvoteBtn>
                </span>
              </template>

              <CommentBtn
                class="mr-1"
                @click="toggleShowComments"
                :count="article.comments.length"
              />

              <v-btn
                v-show="currentUserIsAuthor"
                :to="`/article-editor?articleColumnId=${this.article.article_column.uuid}&articleId=${this.article.uuid}`"
                class="mr-1"
                depressed
                small
                >{{ editButtonText }}
              </v-btn>

              <v-menu v-if="currentUserIsAuthor" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" class="mr-1" depressed small
                    >{{ $t('设置') }}
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="confirmDeleteDialog = true">
                    <v-list-item-icon>
                      <DeleteIcon />
                    </v-list-item-icon>
                    <v-list-item-content>{{ $t('永久删除') }}</v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>

              <ShareCardButton
                :link="`/articles/${article.uuid}`"
                :link-text="article.title"
                v-slot="{ shareQrCodeUrl }"
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
                          <v-img :src="shareQrCodeUrl" v-if="shareQrCodeUrl" max-width="100" />
                          <span class="text-caption">查看原文</span>
                        </div>
                        <p style="overflow-wrap: anywhere">{{ articlePreviewBody }}</p>
                      </div>
                      <div>
                        <UserLink :showAvatar="true" :userPreview="article.author" />
                        <span
                          v-if="article.author.personal_introduction"
                          :class="{ 'text-caption': !$vuetify.breakpoint.mdAndUp }"
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
                    <div class="headline primary--text">
                      {{ $t('确定永久删除文章及其所有历史版本？') }}
                    </div>
                  </v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn class="mr-1" depressed small @click="confirmDeleteDialog = false"
                      >{{ $t('No') }}
                    </v-btn>
                    <v-btn
                      :disabled="deleteArticleIntermediate"
                      class="mr-1"
                      color="warning"
                      depressed
                      small
                      @click="deleteArticle"
                      >{{ $t('Yes') }}
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
              <span class="text-caption grey--text ma-2">{{
                $t('已被阅读n次', { times: article.view_times })
              }}</span>
            </v-col>
          </v-row>

          <div class="d-flex justify-end mt-1">
            <ReactionBlock :objectId="article.uuid" class="ml-1" objectType="article" />
          </div>

          <!-- Comments -->
          <v-expand-transition>
            <CommentBlock
              v-show="showComments"
              :commentSubmitIntermediate="commentSubmitIntermediate"
              :comments="article.comments"
              :writable="token"
              class="mt-6"
              commentLabel="评论文章"
              @submit-new-comment="submitNewArticleCommentBody"
            >
            </CommentBlock>
          </v-expand-transition>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IArticle, IArticleUpvotes, IUserArticleBookmark } from '@/interfaces';
import ReactionBlock from '@/components/ReactionBlock.vue';
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
import { dispatchCaptureApiError } from '@/store/main/actions';

import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { apiComment } from '@/api/comment';
import { readNarrowUI, readToken, readUserProfile } from '@/store/main/getters';
import { apiMe } from '@/api/me';
import { Route, RouteRecord } from 'vue-router';
import { isEqual, updateHead } from '@/common';
import ShareCardButton from '@/components/ShareCardButton.vue';
import Viewer from '@/components/Viewer.vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import { getArticleDraft } from '@/utils';

@Component({
  components: {
    CommentBtn,
    UpvoteBtn,
    UpvotedBtn,
    ShareCardButton,
    UserLink,
    QuestionLink,
    CommentBlock,
    SiteBtn,
    ReactionBlock,
    BookmarkedIcon,
    ToBookmarkIcon,
    DeleteIcon,
    CollapseUpIcon,
    LinkIcon,
  },
})
export default class Article extends Vue {
  private article: IArticle | null = null;
  private upvotes: IArticleUpvotes | null = null;
  private showComments: boolean = false;
  private userBookmark: IUserArticleBookmark | null = null;
  private showCancelUpvoteDialog: boolean = false;
  private confirmDeleteDialog = false;
  private loading = true;
  private upvoteIntermediate = false;
  private cancelUpvoteIntermediate = false;
  private deleteArticleIntermediate = false;
  private bookmarkIntermediate = false;
  private unbookmarkIntermediate = false;
  private currentUserIsAuthor = false;
  private editButtonText = '编辑';
  private showHasDraftBadge = false;
  private commentSubmitIntermediate = false;

  get token() {
    return readToken(this.$store);
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  get id() {
    return this.$route.params.id;
  }

  get articleCommentId() {
    const acid = this.$route.params.article_comment_id;
    if (acid) {
      return acid;
    } else {
      return null;
    }
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'article');
    if (matched && !isEqual(to.params, from.params)) {
      this.showComments = false;
      this.loading = true;
      this.load();
    }
  }

  private async load() {
    if (this.articleCommentId) {
      this.showComments = true;
    }

    this.article = (await apiArticle.getArticle(this.token, this.id)).data;
    this.updateStateWithLoadedArticle(this.article);
    this.loading = false;
  }

  private articlePreviewBody: string = '';

  private onClickShare() {
    this.articlePreviewBody = (this.$refs.viewer as Viewer).textContent || '';
    if (this.articlePreviewBody.length > 40) {
      this.articlePreviewBody = this.articlePreviewBody.substring(0, 40) + '...';
    }
  }

  private async mounted() {
    await this.load();
  }

  private async upvote() {
    this.upvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.upvotes = (await apiArticle.upvoteArticle(this.token, this.article.uuid)).data;
        this.upvoteIntermediate = false;
      }
    });
  }

  private async cancelUpvote() {
    this.cancelUpvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.upvotes = (await apiArticle.cancelUpvoteArticle(this.token, this.article.uuid)).data;
        this.cancelUpvoteIntermediate = false;
        this.showCancelUpvoteDialog = false;
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
          body,
          body_text,
          editor,
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
      getArticleDraft(this.$dayjs, this.token, article.uuid).then((draft) => {
        if (draft) {
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
        content: this.$t('文章已永久删除').toString(),
        color: 'success',
      });
      this.confirmDeleteDialog = false;
      this.$router.push(`/article-columns/${this.article.article_column.uuid}`);
    }
  }

  private toggleShowComments() {
    if (!this.userProfile?.uuid && this.article!.comments.length === 0) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.showComments = !this.showComments;
  }
}
</script>

<style scoped>
.fixed-narrow-col {
  max-width: 800px;
}
</style>
