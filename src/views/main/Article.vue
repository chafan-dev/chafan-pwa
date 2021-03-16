<template>
  <v-row justify="center" :loading="loading">
    <v-col
      :class="{
        'col-8': $vuetify.breakpoint.mdAndUp,
        'less-left-right-padding': !$vuetify.breakpoint.mdAndUp,
      }"
      fluid
    >
      <div v-if="article">
        <div v-if="article" class="my-4">
          <div class="d-flex align-center">
            <UserLink :userPreview="article.author" :showAvatar="true" />
            <span
              class="grey--text ml-2"
              v-if="article.author.personal_introduction && $vuetify.breakpoint.mdAndUp"
            >
              {{ article.author.personal_introduction }}
            </span>
            <v-spacer />
            <span class="mr-3">
              <a
                class="text-decoration-none"
                target="_blank"
                :href="`/article-columns/${article.article_column.uuid}`"
              >
                {{ article.article_column.name }}
              </a>
            </span>
            <span v-if="$vuetify.breakpoint.mdAndUp" class="text-caption grey--text mr-3">
              {{ $t('上次发表：') }}
              {{ $dayjs.utc(article.updated_at).local().fromNow() }}
            </span>
          </div>

          <div class="headline mt-2">
            {{ article.title }}
          </div>
          <div class="ma-2">
            <v-chip small class="ml-2" color="warning" v-if="article && !article.is_published">{{
              $t('此为初稿仅自己可见')
            }}</v-chip>
            <v-chip small class="ml-2" color="info" v-else-if="showHasDraftBadge">{{
              $t('编辑器中有未发表的草稿')
            }}</v-chip>
            <Viewer :body="article.body" />
          </div>

          <div fluid>
            <v-row>
              <v-col>
                <template v-if="token">
                  <v-dialog max-width="300" v-model="showCancelUpvoteDialog">
                    <v-card>
                      <v-card-title primary-title>
                        <div class="headline primary--text">
                          {{ $t('确定收回点赞？') }}
                        </div>
                      </v-card-title>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          small
                          depressed
                          class="mr-1"
                          @click="showCancelUpvoteDialog = false"
                          >{{ $t('No') }}</v-btn
                        >
                        <v-btn
                          small
                          depressed
                          color="warning"
                          @click="cancelUpvote"
                          :disabled="cancelUpvoteIntermediate"
                          >{{ $t('Yes') }}</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <v-btn
                    small
                    depressed
                    class="mr-1"
                    @click="showCancelUpvoteDialog = true"
                    color="primary lighten-2"
                    v-if="upvotes && upvotes.upvoted"
                  >
                    {{ $t('已赞') }} ({{ upvotes.count }})
                  </v-btn>
                  <v-btn
                    small
                    depressed
                    class="mr-1"
                    color="primary"
                    @click="upvote"
                    v-else
                    :disabled="currentUserIsAuthor || upvoteIntermediate"
                  >
                    {{ $t('赞') }} ({{ upvotes.count }})
                  </v-btn>
                </template>

                <v-btn small depressed class="mr-1" @click="toggleShowComments">
                  {{
                    article.comments.length == 0
                      ? $t('评论')
                      : $t('查看n条评论', { amount: article.comments.length })
                  }}
                </v-btn>

                <v-btn
                  small
                  depressed
                  class="mr-1"
                  :href="`/article-editor?articleColumnId=${this.article.article_column.uuid}&articleId=${this.article.uuid}`"
                  v-show="currentUserIsAuthor"
                  >{{ $t(editButtonText) }}</v-btn
                >

                <v-menu offset-y v-if="currentUserIsAuthor">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" small depressed class="mr-1">{{
                      $t('设置')
                    }}</v-btn>
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

                <v-dialog max-width="300" v-model="confirmDeleteDialog">
                  <v-card>
                    <v-card-title primary-title>
                      <div class="headline primary--text">
                        {{ $t('确定永久删除文章及其所有历史版本？') }}
                      </div>
                    </v-card-title>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn small depressed class="mr-1" @click="confirmDeleteDialog = false">{{
                        $t('No')
                      }}</v-btn>
                      <v-btn
                        small
                        depressed
                        class="mr-1"
                        color="warning"
                        @click="deleteArticle"
                        :disabled="deleteArticleIntermediate"
                        >{{ $t('Yes') }}</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <template v-if="token">
                  <span
                    v-if="userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                    @click="unbookmark"
                    style="cursor: pointer"
                  >
                    <BookmarkedIcon :disabled="unbookmarkIntermediate" />
                    <span class="mr-1">{{ userBookmark.bookmarkers_count }}</span>
                  </span>
                  <span
                    v-if="!userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                    @click="bookmark"
                    style="cursor: pointer"
                  >
                    <ToBookmarkIcon :disabled="bookmarkIntermediate" />
                    <span class="mr-1">{{ userBookmark.bookmarkers_count }}</span>
                  </span>
                </template>
              </v-col>

              <!-- Column of variable width -->
              <v-col md="auto" v-if="$vuetify.breakpoint.mdAndUp && article.view_times">
                <span class="text-caption grey--text ma-2">{{
                  $t('已被阅读n次', { times: article.view_times })
                }}</span>
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-1">
              <ReactionBlock objectType="article" class="ml-1" :objectId="article.uuid" />
            </div>

            <!-- Comments -->
            <v-expand-transition>
              <CommentBlock
                class="mt-6"
                v-show="showComments"
                :commentSubmitIntermediate="commentSubmitIntermediate"
                commentLabel="评论文章"
                :comments="article.comments"
                :writable="token"
                @submit-new-comment="submitNewArticleCommentBody"
              >
              </CommentBlock>
            </v-expand-transition>
          </div>
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

@Component({
  components: {
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
  get token() {
    return this.$store.state.main.token;
  }

  get currentUserId() {
    if (!this.$store.state.main.userProfile) {
      return null;
    }
    return this.$store.state.main.userProfile.uuid;
  }
  get id() {
    return this.$router.currentRoute.params.id;
  }
  get articleCommentId() {
    const acid = this.$router.currentRoute.params.article_comment_id;
    if (acid) {
      return acid;
    } else {
      return null;
    }
  }
  private article: IArticle | null = null;
  private upvotes: IArticleUpvotes | null = null;
  private showComments: boolean = false;
  private newArticleCommentBody: string = '';

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

  private async mounted() {
    if (this.articleCommentId) {
      this.showComments = true;
    }

    this.article = (await apiArticle.getArticle(this.token, this.id)).data;
    this.updateStateWithLoadedArticle(this.article);
    this.loading = false;
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
        this.userBookmark = (await apiArticle.bookmarkArticle(this.token, this.article.uuid)).data;
        this.bookmarkIntermediate = false;
      }
    });
  }
  private async unbookmark() {
    this.unbookmarkIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.userBookmark = (
          await apiArticle.unbookmarkArticle(this.token, this.article.uuid)
        ).data;
        this.unbookmarkIntermediate = false;
      }
    });
  }
  private async submitNewArticleCommentBody(body: string) {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.article) {
        this.commentSubmitIntermediate = true;
        const response = await apiComment.postComment(this.token, {
          article_uuid: this.article.uuid,
          body,
        });
        const comment = response.data;
        this.article.comments.push(comment);
        this.commentSubmitIntermediate = false;
      }
    });
  }

  private updateStateWithLoadedArticle(article: IArticle) {
    if (!this.$route.query.title) {
      this.$router.replace({
        query: { ...this.$route.query, title: article.title },
      });
    }
    document.title = article.title;
    if (this.token) {
      apiArticle.bumpViewsCounter(this.token, article.uuid);
    }
    this.currentUserIsAuthor = this.currentUserId === article.author.uuid;
    if (this.currentUserIsAuthor) {
      apiArticle.getArticleDraft(this.token, article.uuid).then((response) => {
        const draft = response.data;
        if (draft.title_draft) {
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
    if (!this.currentUserId && this.article!.comments.length === 0) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.showComments = !this.showComments;
  }
}
</script>

<style scoped>
.slim-btn {
  padding: 0 8px !important;
}

.less-left-right-padding {
  padding-left: 6px !important;
  padding-right: 6px !important;
}
</style>
