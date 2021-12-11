<template>
  <div v-if="!showEditor" class="pa-1">
    <div v-if="isHiddenByMod">
      <v-card-text>内容已被隐藏</v-card-text>
    </div>
    <div v-else>
      <div v-if="showQuestionInCard" class="title mb-2">
        <QuestionLink :questionPreview="answerPreview.question" />
      </div>
      <div v-if="preview || !answer" style="cursor: pointer" @click="expandDown">
        <span v-show="showAuthor">
          <UserLink :showAvatar="true" :userPreview="answerPreview.author" />:
        </span>
        {{ answerPreviewBody }}
        <span :class="theme.answer.expand.text.classes">展开全文</span>
        <v-progress-circular v-if="loading" class="ml-2" indeterminate size="20" />
      </div>
      <div v-if="answer" v-show="!preview">
        <div v-if="showAuthor" class="d-flex align-center">
          <UserLink v-show="!preview" :showAvatar="true" :userPreview="answer.author" />
          <span
            v-if="answer.author.personal_introduction"
            :class="{ 'text-caption': !$vuetify.breakpoint.mdAndUp }"
            class="grey--text ml-2"
          >
            {{ truncatedIntro(answer.author.personal_introduction) }}
          </span>
          <v-spacer />
          <span v-if="$vuetify.breakpoint.mdAndUp" class="text-caption grey--text">
            上次编辑：
            {{ $dayjs.utc(answer.updated_at).local().fromNow() }}
          </span>
        </div>

        <div class="mt-1">
          <template v-if="draftMode">
            <v-chip v-if="answer" color="info" small> 草稿</v-chip>
            <Viewer v-if="draftContent !== null" :content="draftContent" />
          </template>
          <template v-else>
            <v-chip v-if="answer && !answer.is_published" color="warning" small>
              此为初稿仅自己可见
            </v-chip>
            <v-chip v-else-if="showHasDraftBadge" color="info" small>
              编辑器中有未发表的草稿
            </v-chip>

            <Viewer v-intersect.once="onReadFullAnswer" :content="answer.content" />
          </template>
        </div>

        <div :class="theme.answer.controls.classes">
          <v-row>
            <v-col :class="theme.answer.controls.buttonsCol.classes" align-self="end">
              <div class="d-flex mt-1">
                <Upvote
                  v-if="upvotes"
                  :disabled="currentUserIsAuthor"
                  :on-cancel-vote="cancelUpvote"
                  :on-vote="upvote"
                  :upvoted="upvotes.upvoted"
                  :upvotes-count="upvotes.count"
                  class="mr-1"
                />
                <CommentBtn
                  :count="answer.comments.length"
                  class="mr-1"
                  @click="toggleShowComments"
                />

                <template v-if="userProfile">
                  <v-btn
                    v-show="currentUserIsAuthor"
                    class="slim-btn mr-1"
                    depressed
                    small
                    @click="loadEditor"
                  >
                    {{ editButtonText }}
                  </v-btn>

                  <v-menu v-if="currentUserIsAuthor" offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn v-bind="attrs" v-on="on" class="slim-btn mr-1" depressed small>
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

                  <v-dialog v-model="confirmDeleteDialog" max-width="400">
                    <v-card>
                      <v-card-title primary-title>
                        <div class="headline primary--text">
                          <template v-if="draftMode"> 确定永久删除答案草稿？</template>
                          <template v-else> 确定永久删除答案及其所有历史版本？</template>
                        </div>
                      </v-card-title>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn depressed small @click="confirmDeleteDialog = false"> 取消</v-btn>
                        <v-btn
                          :disabled="deleteAnswerIntermediate"
                          color="warning"
                          depressed
                          small
                          @click="deleteAnswer"
                        >
                          确认
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <ShareCardButton
                    v-slot="{ shareQrCodeUrl }"
                    :link="`/questions/${answer.question.uuid}/answers/${answerPreview.uuid}`"
                    :link-text="answer.question.title + ` - ${answer.author.handle} 的回答`"
                  >
                    <v-card-title class="font-weight-bold">
                      {{ answer.question.title }}
                    </v-card-title>
                    <v-card-text>
                      <div class="pt-2 d-flex">
                        <div>
                          <div class="text--primary text-body-1">
                            <div class="pa-1 text-center" style="float: right">
                              <v-img v-if="shareQrCodeUrl" :src="shareQrCodeUrl" max-width="100" />
                              <span class="text-caption">查看原文</span>
                            </div>
                            <p style="overflow-wrap: anywhere">{{ answerPreviewBody }}</p>
                          </div>
                          <div>
                            <UserLink :showAvatar="true" :userPreview="answer.author" />
                            <span
                              v-if="answer.author.personal_introduction"
                              :class="{ 'text-caption': !$vuetify.breakpoint.mdAndUp }"
                              class="grey--text ml-2"
                            >
                              {{ answer.author.personal_introduction }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </ShareCardButton>

                  <template v-if="userBookmark">
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
                </template>

                <CollapseUpIcon class="pl-1 pr-1" @click="preview = true" />
              </div>
            </v-col>

            <!-- Column of variable width -->
            <v-col v-if="$vuetify.breakpoint.mdAndUp & !preview && userProfile" md="auto">
              <span class="text-caption grey--text mt-2"> 已被阅读{{ answer.view_times }}次 </span>
            </v-col>
          </v-row>

          <!--
            NOTE: Layout of this part is tricky since it can be quite wide when there are six emojis.
            Let's fix them later.
                      -->
          <div class="d-flex justify-end mt-3">
            <ReactionBlock :objectId="answer.uuid" class="ml-1" objectType="answer" />
          </div>

          <!-- Comments -->
          <v-expand-transition v-if="!preview">
            <CommentBlock
              v-show="showComments"
              :commentSubmitIntermediate="commentSubmitIntermediate"
              :comments="answer.comments"
              :siteId="answer.site ? answer.site.uuid : undefined"
              :writable="commentWritable"
              commentLabel="评论答案"
              @submit-new-comment="submitNewAnswerCommentBody"
            >
            </CommentBlock>
          </v-expand-transition>
        </div>
      </div>
    </div>
    <div v-if="isModerator && !isUserMode">
      <v-row justify="end">
        <v-col md="auto">
          管理：
          <!-- Moderator -->
          <v-btn
            v-if="isHiddenByMod"
            :disabled="toggleHideAnswerIntermediate"
            class="slim-btn ma-1"
            color="warning"
            depressed
            small
            @click="toggleHideAnswer"
          >
            取消隐藏
          </v-btn>
          <v-btn
            v-else
            :disabled="toggleHideAnswerIntermediate"
            class="slim-btn ma-1"
            color="warning"
            depressed
            small
            @click="toggleHideAnswer"
          >
            隐藏
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
  <AnswerEditor
    v-else-if="answer && showEditor"
    ref="editor"
    :answerIdProp="answer.uuid"
    :archivesCount="answer.archives_count"
    :inPrivateSite="!answer.site.public_readable"
    :questionIdProp="answer.question.uuid"
    @delete-draft="deleteDraft"
    @cancel-edit="cancelHandler"
    @updated-answer="updatedAnswerCallback"
  />
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import {
  IAnswer,
  IAnswerDraft,
  IAnswerPreview,
  IAnswerUpvotes,
  IRichEditorState,
  IRichText,
  IUserAnswerBookmark,
} from '@/interfaces';
import ReactionBlock from '@/components/ReactionBlock.vue';
import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import CollapseUpIcon from '@/components/icons/CollapseUpIcon.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import { api } from '@/api';
import { apiAnswer } from '@/api/answer';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';

import {
  commitAddNotification,
  commitSetShowLoginPrompt,
  commitSetWorkingDraft,
} from '@/store/main/mutations';
import { apiComment } from '@/api/comment';
import { apiMe } from '@/api/me';
import { clearLocalEdit, loadLocalEdit, LocalEdit } from '@/utils';
import BaseCard from '@/components/base/BaseCard.vue';
import AnswerEditor from '@/components/AnswerEditor.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import Upvote from '@/components/Upvote.vue';
import { CVue } from '@/common';

@Component({
  components: {
    Upvote,
    CommentBtn,
    UpvotedBtn,
    UpvoteBtn,
    ShareCardButton,
    AnswerEditor,
    BaseCard,
    UserLink,
    QuestionLink,
    CommentBlock,
    SiteBtn,
    ReactionBlock,
    BookmarkedIcon,
    ToBookmarkIcon,
    DeleteIcon,
    CollapseUpIcon,
  },
})
export default class Answer extends CVue {
  @Prop() private readonly answerPreview!: IAnswerPreview;
  @Prop() private readonly answerProp: IAnswer | undefined;
  @Prop() private readonly answerUpvotesProp: IAnswerUpvotes | undefined;
  @Prop({ default: false }) private readonly loadFull!: boolean;
  @Prop() private readonly showAuthor!: boolean;
  @Prop({ default: false }) private readonly draftMode!: boolean;
  @Prop() private readonly showCommentId: number | undefined;
  @Prop({ default: true }) private readonly showQuestionInCard!: boolean;
  private answer: IAnswer | null = null;
  private upvotes: IAnswerUpvotes | null = null;
  private showComments: boolean = false;
  private isHiddenByMod: boolean = false;
  private isModerator = false;
  private commentWritable = false;
  private userBookmark: IUserAnswerBookmark | null = null;
  private showEditor: boolean = false;
  private confirmDeleteDialog = false;
  private loading = true;
  private preview = true;
  private deleteAnswerIntermediate = false;
  private bookmarkIntermediate = false;
  private unbookmarkIntermediate = false;
  private toggleHideAnswerIntermediate = false;
  private answerPreviewBody: string = this.answerPreview.body;
  private currentUserIsAuthor = false;
  private expandClicked = false;

  private editButtonText = '编辑';
  private showHasDraftBadge = false;
  private bodyDraftFromLocalSavedEdit: LocalEdit | null = null;
  private draftPromise: Promise<IAnswerDraft> | null = null;
  private commentSubmitIntermediate = false;
  private draftContent: IRichText | null = null;

  private async mounted() {
    if (this.showCommentId) {
      this.showComments = true;
    }

    this.isHiddenByMod = this.answerPreview.is_hidden_by_moderator;
    if (this.userProfile) {
      const mod = this.answerPreview.question.site.moderator;
      if (mod) {
        this.isModerator = this.userProfile.uuid === mod.uuid;
      }
    }

    if (this.answerProp) {
      await this.updateStateWithLoadedAnswer(this.answerProp);
    } else {
      const response = await apiAnswer.getAnswer(this.token, this.answerPreview.uuid);
      await this.updateStateWithLoadedAnswer(response.data);
    }

    if (this.loadFull || this.answerPreview.body_is_truncated === false) {
      this.setLoading();
    } else {
      this.loading = false;
    }
  }

  private async upvote() {
    if (!this.userProfile) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answer) {
        this.upvotes = (await apiAnswer.upvoteAnswer(this.token, this.answer.uuid)).data;
      }
    });
  }

  private async cancelUpvote() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answer) {
        this.upvotes = (await apiAnswer.cancelUpvoteAnswer(this.token, this.answer.uuid)).data;
      }
    });
  }

  private async bookmark() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answer) {
        this.bookmarkIntermediate = true;
        this.userBookmark = (await apiMe.bookmarkAnswer(this.token, this.answer.uuid)).data;
        this.bookmarkIntermediate = false;
      }
    });
  }

  private async unbookmark() {
    this.unbookmarkIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answer) {
        this.userBookmark = (await apiMe.unbookmarkAnswer(this.token, this.answer.uuid)).data;
        this.unbookmarkIntermediate = false;
      }
    });
  }

  private async submitNewAnswerCommentBody({ body, body_text, editor, mentioned }) {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answer) {
        this.commentSubmitIntermediate = true;
        const response = await apiComment.postComment(this.token, {
          site_uuid: this.answer.site.uuid,
          answer_uuid: this.answer.uuid,
          content: {
            source: body,
            rendered_text: body_text,
            editor,
          },
          mentioned,
        });
        const comment = response.data;
        this.answer.comments.push(comment);
        this.commentSubmitIntermediate = false;
      }
    });
  }

  private async toggleHideAnswer() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.answerPreview) {
        this.toggleHideAnswerIntermediate = true;
        await api.updateAnswerByMod(this.token, this.answerPreview.uuid, {
          is_hidden_by_moderator: !this.isHiddenByMod,
        });
        this.toggleHideAnswerIntermediate = false;
        this.isHiddenByMod = !this.isHiddenByMod;
      }
    });
  }

  private async updatedAnswerCallback(event: { answer: IAnswer; isAutoSaved: boolean }) {
    if (!event.isAutoSaved) {
      this.showHasDraftBadge = false;
      this.showEditor = false;
      await this.updateStateWithLoadedAnswer(event.answer);
    }
  }

  private async updateStateWithLoadedAnswer(answer: IAnswer) {
    this.$emit('load');
    this.answer = answer;
    if (this.userProfile) {
      this.currentUserIsAuthor = this.userProfile.uuid === this.answer.author.uuid;
      if (this.currentUserIsAuthor) {
        const localSavedEdit = loadLocalEdit('answer', answer.uuid);
        this.draftPromise = apiAnswer.getAnswerDraft(this.token, answer.uuid).then((response) => {
          const draft = response.data;
          if (
            draft.content_draft &&
            (localSavedEdit === null ||
              this.$dayjs.utc(draft.draft_saved_at).isAfter(this.$dayjs(localSavedEdit.createdAt)))
          ) {
            this.editButtonText = '编辑草稿';
            this.draftContent = draft.content_draft;
            this.showHasDraftBadge = true;
          } else if (localSavedEdit) {
            this.editButtonText = '编辑草稿';
            this.draftContent = {
              source: (localSavedEdit.edit as IRichEditorState).body || '',
              editor: (localSavedEdit.edit as IRichEditorState).editor,
            };
            this.bodyDraftFromLocalSavedEdit = localSavedEdit;
            this.showHasDraftBadge = true;
          }
          return draft;
        });
      }
    }
    if (this.answerUpvotesProp) {
      this.upvotes = this.answerUpvotesProp;
    } else {
      this.upvotes = (await apiAnswer.getAnswerUpvotes(this.token, this.answer.uuid)).data;
    }
    this.commentWritable = this.answer.comment_writable;
    this.userBookmark = {
      answer_uuid: this.answer.uuid,
      bookmarkers_count: this.answer.bookmark_count,
      bookmarked_by_me: this.answer.bookmarked,
    };
    this.loading = false;
  }

  private expandDown() {
    this.expandClicked = true;
    this.setLoading();
  }

  private setLoading() {
    this.preview = false;
    if (!this.answer) {
      this.loading = true;
    }
  }

  private onReadFullAnswer() {
    if (this.token) {
      apiAnswer.bumpViewsCounter(this.token, this.answerPreview.uuid);
    }
  }

  private async loadEditor() {
    if (this.answer && this.draftPromise) {
      const draft = await this.draftPromise;
      if (this.bodyDraftFromLocalSavedEdit) {
        commitAddNotification(this.$store, {
          content: '载入最近的草稿',
          color: 'success',
        });
        commitSetWorkingDraft(
          this.$store,
          this.bodyDraftFromLocalSavedEdit.edit as IRichEditorState
        );
      } else if (draft && draft.content_draft) {
        commitAddNotification(this.$store, {
          content: '载入最近的草稿',
          color: 'success',
        });
        commitSetWorkingDraft(this.$store, {
          body: draft.content_draft?.source || '',
          rendered_body_text: null,
          is_draft: true,
          editor: draft.content_draft?.editor || 'wysiwyg',
          visibility: this.answer.visibility,
        });
      } else {
        commitSetWorkingDraft(this.$store, {
          body: this.answer.content.source,
          rendered_body_text: null,
          visibility: this.answer.visibility,
          editor: this.answer.content.editor,
          is_draft: false,
        });
      }
      this.showEditor = true;
    }
  }

  private async deleteAnswer() {
    if (this.draftMode) {
      await (this.$refs.editor as AnswerEditor).deleteDraft();
      clearLocalEdit('answer', this.answerPreview.uuid);
      await apiAnswer.deleteAnswerDraft(this.token, this.answerPreview.uuid);
      commitAddNotification(this.$store, {
        content: '草稿已删除',
        color: 'success',
      });
    } else {
      dispatchCaptureApiError(this.$store, async () => {
        await apiAnswer.deleteAnswer(this.token, this.answerPreview.uuid);
        commitAddNotification(this.$store, {
          content: '答案已永久删除',
          color: 'success',
        });
        this.confirmDeleteDialog = false;
      });
    }
    this.$emit('delete-answer', this.answerPreview.uuid);
  }

  private toggleShowComments() {
    if (!this.userProfile && this.answer!.comments.length === 0) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.showComments = !this.showComments;
  }

  private cancelHandler() {
    this.showEditor = false;
  }

  private deleteDraft() {
    this.showEditor = false;
    this.showHasDraftBadge = false;
  }

  private truncatedIntro(intro: string) {
    if (this.$vuetify.breakpoint.mdAndUp) {
      if (intro.length > 30) {
        return intro.substring(0, 30) + '...';
      } else {
        return intro;
      }
    } else {
      if (intro.length > 18) {
        return intro.substring(0, 18) + '...';
      } else {
        return intro;
      }
    }
  }
}
</script>
