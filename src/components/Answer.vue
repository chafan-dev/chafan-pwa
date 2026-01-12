<template>
  <div v-if="!showEditor" class="pt-1 mx-2">
    <div v-if="isHiddenByMod">
      <v-card-text>内容已被隐藏</v-card-text>
    </div>
    <div v-else>
      <div v-if="showQuestionInCard" class="title mb-2">
        <QuestionLink :questionPreview="answerPreview.question" />
      </div>
      <v-progress-linear indeterminate v-if="loading" height="2" class="mb-2" />
      <template>
        <div v-if="preview || !answer" class="cursor-pointer" @click="expandDown">
          <span v-show="!inAnswerQuestionFeedCard">
            <UserLink :showAvatar="true" :userPreview="answerPreview.author" />:
          </span>
          <template v-if="answerPreview">
            {{ answerPreview.body }}
          </template>
          <span :class="theme.answer.expand.text.classes">展开全文</span>
        </div>
        <div v-if="answer" v-show="!preview">
          <!-- Author block -->
          <div v-if="!inAnswerQuestionFeedCard" class="d-flex align-center">
            <UserLink v-show="!preview" :showAvatar="true" :userPreview="answer.author" />
            <span
              v-if="answer.author.personal_introduction"
              :class="{ 'text-caption': !isDesktop }"
              class="grey--text ml-2"
            >
              {{ truncatedIntro(answer.author.personal_introduction) }}
            </span>
            <v-spacer />
            <!-- Featured badge -->
            <v-chip v-if="currentUserIsAuthor" color="info" label small class="mr-1"
              >我的回答</v-chip
            >
          </div>

          <!-- Answer Content Block -->
          <div class="mb-2 mt-1">
            <!-- Draft content -->
            <template v-if="draftMode && draftContent !== null">
              <v-chip class="mb-1" v-if="answer" color="info" small>草稿</v-chip>
              <Viewer :content="draftContent" />
            </template>
            <!-- Published content -->
            <template v-else>
              <v-chip v-if="answer && !answer.is_published" color="warning" small class="mb-1">
                此为初稿仅自己可见
              </v-chip>
              <v-chip v-else-if="showHasDraftBadge" color="info" small class="mb-1">
                编辑器中有未发表的草稿
              </v-chip>

              <Viewer v-intersect.once="onReadFullAnswer" :content="answer.content" />
            </template>
          </div>

          <div :class="theme.answer.controls.classes">
            <!-- Main control block -->
            <div class="d-flex">
              <div :class="theme.answer.controls.buttonsCol.classes" class="align-self-center">
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
                    :count="recursiveCommentsCount(answer.comments)"
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
                      <EditIcon class="mr-1" />
                      {{ editButtonText }}
                    </v-btn>

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
                              <div class="pa-1 text-center float-right">
                                <v-img
                                  v-if="shareQrCodeUrl"
                                  :src="shareQrCodeUrl"
                                  max-width="100"
                                />
                                <span class="text-caption">查看原文</span>
                              </div>
                              <p class="overflow-wrap-anywhere" v-if="answerPreview">
                                {{ answerPreview.body }}
                              </p>
                            </div>
                            <div>
                              <UserLink :showAvatar="true" :userPreview="answer.author" />
                              <span
                                v-if="answer.author.personal_introduction"
                                :class="{ 'text-caption': !isDesktop }"
                                class="grey--text ml-2"
                              >
                                {{ answer.author.personal_introduction }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </ShareCardButton>

                    <v-menu offset-y>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn v-bind="attrs" v-on="on" class="slim-btn ml-1" depressed small>
                          <DotsIcon small />
                          <span v-if="isDesktop" class="ml-1">更多</span>
                        </v-btn>
                      </template>
                      <v-list dense>
                        <v-list-item
                          dense
                          v-if="!currentUserIsAuthor && loggedIn && answer.suggest_editable"
                          @click="loadEditor"
                        >
                          <EditIcon class="mr-1" />
                          提交编辑建议
                        </v-list-item>
                        <template v-if="userBookmark">
                          <v-list-item
                            v-if="userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                            :disabled="unbookmarkIntermediate || bookmarkIntermediate"
                            dense
                            @click="unbookmark"
                          >
                            <BookmarkedIcon class="mr-1" />
                            取消收藏（{{ userBookmark.bookmarkers_count }}）
                          </v-list-item>
                          <v-list-item
                            v-if="!userBookmark.bookmarked_by_me && !currentUserIsAuthor"
                            :disabled="unbookmarkIntermediate || bookmarkIntermediate"
                            dense
                            @click="bookmark"
                          >
                            <ToBookmarkIcon class="mr-1" />
                            收藏（{{ userBookmark.bookmarkers_count }}）
                          </v-list-item>
                        </template>
                        <v-list-item dense @click="webArchiveRequest">
                          <BookshelfIcon class="mr-1" />
                          Web Archive
                        </v-list-item>
                        <v-list-item dense @click="reportDialog = true">
                          <FlagIcon class="mr-1" />
                          举报
                        </v-list-item>
                        <v-list-item v-if="currentUserIsAuthor" @click="confirmDeleteDialog = true">
                          <v-list-item-icon>
                            <DeleteIcon class="mr-1" />
                            永久删除
                          </v-list-item-icon>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </template>

                  <v-dialog v-model="reportDialog" max-width="600">
                    <v-card>
                      <v-card-title
                        >举报 <UserLink :user-preview="answerPreview.author" />的回答
                        <v-spacer />
                        <CloseIcon @click="reportDialog = false" />
                      </v-card-title>
                      <v-card-text>
                        <p>
                          <v-select
                            :items="reportReasonItems"
                            v-model="reportReason"
                            item-text="text"
                            item-value="value"
                            label="举报原因"
                          />
                        </p>
                        <p>
                          <v-textarea
                            v-model="reportReasonComment"
                            hide-details
                            label="备注（可选）"
                          />
                        </p>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          color="warning"
                          small
                          depressed
                          @click="submitReport"
                          :disabled="submitReportIntermediate"
                        >
                          提交
                          <v-progress-circular
                            v-if="submitReportIntermediate"
                            indeterminate
                            size="15"
                            class="ml-1"
                          />
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <CollapseUpIcon class="pl-1 pr-1" @click="preview = true" />
                </div>
              </div>

              <v-spacer />

              <!-- Column of variable width -->
              <div v-if="isDesktop & !preview && userProfile" class="align-self-center">
                <span class="text-caption grey--text mr-1">
                  <span v-if="!inAnswerQuestionFeedCard"
                    >编辑于 {{ fromNow(answer.updated_at) }}，</span
                  >
                  已被阅读{{ answer.view_times }}次
                </span>
              </div>
            </div>


            <!-- Suggested edits -->
            <v-expansion-panels
              v-if="answer && suggestedEdits && suggestedEdits.length"
              class="mt-2"
              v-model="openedSuggestionIdx"
            >
              <v-expansion-panel v-for="suggestion in suggestedEdits" :key="suggestion.uuid">
                <v-expansion-panel-header
                  :class="{
                    'grey--text': suggestion.status !== 'pending',
                    'primary--text': suggestion.uuid === showSuggestionUuid,
                  }"
                >
                  <span>
                    <UserLink :show-avatar="true" :user-preview="suggestion.author" /> 的建议编辑：
                    <template v-if="suggestion.status === 'pending'">
                      待处理（{{ fromNow(suggestion.created_at) }}）
                    </template>
                    <template v-if="suggestion.status === 'accepted'">
                      已接受（{{ fromNow(suggestion.accepted_at) }}）
                    </template>
                    <template v-if="suggestion.status === 'rejected'">
                      已拒绝（{{ fromNow(suggestion.rejected_at) }}）
                    </template>
                    <template v-if="suggestion.status === 'retracted'">
                      已撤回（{{ fromNow(suggestion.retracted_at) }}）
                    </template>
                  </span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div v-if="suggestion.comment">
                    <span class="font-weight-bold">附言：</span>{{ suggestion.comment }}
                  </div>
                  <template
                    v-if="suggestion.status === 'accepted' && suggestion.accepted_diff_base"
                  >
                    <div
                      v-if="
                        suggestion.accepted_diff_base.source !== suggestion.body_rich_text.source
                      "
                    >
                      <DiffView
                        :s1="suggestion.accepted_diff_base.rendered_text"
                        :s2="suggestion.body_rich_text.rendered_text"
                      />
                    </div>
                    <div v-else>无改动</div>
                  </template>
                  <template v-else-if="suggestion.status !== 'accepted'">
                    <div v-if="answer.content.source !== suggestion.body_rich_text.source">
                      <DiffView
                        :s1="answer.content.rendered_text"
                        :s2="suggestion.body_rich_text.rendered_text"
                      />
                    </div>
                  </template>
                  <div class="d-flex justify-end mt-1">
                    <template v-if="suggestion.status === 'pending'">
                      <v-btn class="mr-2" outlined small @click="previewSuggestion(suggestion)">
                        预览
                      </v-btn>
                      <v-btn
                        v-if="userProfile.uuid === suggestion.author.uuid"
                        outlined
                        small
                        @click="retractSuggestion(suggestion)"
                      >
                        撤回
                      </v-btn>
                      <template v-if="currentUserIsAuthor">
                        <v-btn
                          class="mr-2"
                          color="green"
                          outlined
                          small
                          @click="acceptSuggestion(suggestion)"
                        >
                          接受
                        </v-btn>
                        <v-btn color="warning" outlined small @click="rejectSuggestion(suggestion)">
                          拒绝
                        </v-btn>
                      </template>
                    </template>
                    <template v-if="suggestion.status === 'rejected'">
                      <v-btn
                        v-if="userProfile.uuid === suggestion.author.uuid"
                        outlined
                        small
                        @click="retractSuggestion(suggestion)"
                      >
                        撤回
                      </v-btn>
                      <template v-if="currentUserIsAuthor">
                        <v-btn
                          class="mr-2"
                          color="green"
                          outlined
                          small
                          @click="acceptSuggestion(suggestion)"
                        >
                          接受
                        </v-btn>
                      </template>
                    </template>
                    <template v-if="suggestion.status === 'retracted'">
                      <v-btn
                        v-if="userProfile.uuid === suggestion.author.uuid"
                        outlined
                        small
                        @click="revertRetractSuggestion(suggestion)"
                      >
                        取消撤回
                      </v-btn>
                    </template>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-dialog v-model="showSuggestionPreviewDialog">
              <v-card v-if="previewedSuggestion" :key="previewedSuggestion.uuid">
                <v-card-title> 建议改动后内容预览 </v-card-title>
                <v-card-text>
                  <Viewer :content="previewedSuggestion.body_rich_text" />
                </v-card-text>
              </v-card>
            </v-dialog>

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
      </template>
    </div>
  </div>
  <div v-else-if="answer && showEditor">
    <AnswerEditor
      ref="editorRef"
      :answerIdProp="answer.uuid"
      :archivesCount="answer.archives_count"
      :inPrivateSite="!answer.site.public_readable"
      :questionIdProp="answer.question.uuid"
      :is-author="currentUserIsAuthor"
      :submit-answer-suggest-edit-callback="submitAnswerSuggestEditCallback"
      @delete-draft="deleteDraft"
      @cancel-edit="cancelHandler"
      @updated-answer="updatedAnswerCallback"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router/composables';
import {
  IAnswer,
  IAnswerDraft,
  IAnswerPreview,
  IAnswerSuggestEdit,
  IAnswerUpvotes,
  IComment,
  INewCommentInternal,
  IRichEditorState,
  IRichText,
  ISevereReportReason,
  IUserAnswerBookmark,
} from '@/interfaces';
import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import CollapseUpIcon from '@/components/icons/CollapseUpIcon.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import { api } from '@/api';
import { apiAnswer } from '@/api/answer';
import UserLink from '@/components/UserLink.vue';
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
import { clearLocalEdit, delay, loadLocalEdit, LocalEdit } from '@/utils';
import AnswerEditor from '@/components/AnswerEditor.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import Upvote from '@/components/Upvote.vue';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import DiffView from '@/components/widgets/DiffView.vue';
import FlagIcon from '@/components/icons/FlagIcon.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import BookshelfIcon from '@/components/icons/BookshelfIcon.vue';
import Viewer from '@/components/Viewer.vue';
import { useAuth, useTheme, useResponsive, useDayjs } from '@/composables';
import store from '@/store';

const props = withDefaults(defineProps<{
  answerPreview: IAnswerPreview;
  answerProp?: IAnswer;
  answerPropDelayMilliSecondsForTest?: number;
  answerUpvotesProp?: IAnswerUpvotes;
  loadFull?: boolean;
  inAnswerQuestionFeedCard?: boolean;
  draftMode?: boolean;
  showCommentId?: string;
  showSuggestionUuid?: string;
  showQuestionInCard?: boolean;
}>(), {
  loadFull: false,
  inAnswerQuestionFeedCard: false,
  draftMode: false,
  showQuestionInCard: true,
});

const emit = defineEmits<{
  (e: 'load'): void;
  (e: 'delete-answer', uuid: string): void;
  (e: 'delete-answer-draft', uuid: string): void;
}>();

const router = useRouter();
const { token, userProfile, loggedIn } = useAuth();
const { theme } = useTheme();
const { isDesktop } = useResponsive();
const { dayjs, fromNow } = useDayjs();

// Template ref
const editorRef = ref<InstanceType<typeof AnswerEditor> | null>(null);

// State
const answer = ref<IAnswer | null>(null);
const upvotes = ref<IAnswerUpvotes | null>(null);
const showComments = ref(false);
const isHiddenByMod = ref(false);
const commentWritable = ref(false);
const userBookmark = ref<IUserAnswerBookmark | null>(null);
const showEditor = ref(false);
const confirmDeleteDialog = ref(false);
const loading = ref(true);
const preview = ref(true);
const deleteAnswerIntermediate = ref(false);
const bookmarkIntermediate = ref(false);
const unbookmarkIntermediate = ref(false);
const toggleHideAnswerIntermediate = ref(false);
const currentUserIsAuthor = ref(false);
const expandClicked = ref(false);
const answerSuggestEditComment = ref<string | null>(null);

const editButtonText = ref('编辑');
const showHasDraftBadge = ref(false);
const bodyDraftFromLocalSavedEdit = ref<LocalEdit | null>(null);
const draftPromise = ref<Promise<IAnswerDraft> | null>(null);
const commentSubmitIntermediate = ref(false);
const draftContent = ref<IRichText | null>(null);
const openedSuggestionIdx = ref<number | null>(null);
const suggestedEdits = ref<IAnswerSuggestEdit[]>([]);

const previewedSuggestion = ref<IAnswerSuggestEdit | null>(null);
const showSuggestionPreviewDialog = ref(false);

const reportDialog = ref(false);
const reportReasonItems = [
  { value: 'SPAM', text: '垃圾信息' },
  { value: 'OFF_TOPIC', text: '和主题范围无关' },
  { value: 'RUDE_OR_ABUSIVE', text: '恶意、极端、偏激类言论' },
  { value: 'RIGHT_INFRINGEMENT', text: '抄袭或者侵犯他人隐私' },
  { value: 'NEED_MODERATOR_INTERVENTION', text: '需要管理员人工判断' },
];
const reportReason = ref<ISevereReportReason>('NEED_MODERATOR_INTERVENTION');
const reportReasonComment = ref<string | null>(null);
const submitReportIntermediate = ref(false);

function recursiveCommentsCount(comments: IComment[]): number {
  return (
    comments.length +
    comments.reduce((sum, comment) => sum + recursiveCommentsCount(comment.child_comments), 0)
  );
}

onMounted(async () => {
  const loadFullAnswer = props.loadFull || props.answerPreview.body_is_truncated === false;
  if (props.showCommentId) {
    showComments.value = true;
  }

  isHiddenByMod.value = props.answerPreview.is_hidden_by_moderator;

  if (!loadFullAnswer) {
    loading.value = false;
  }

  if (props.answerProp) {
    if (props.answerPropDelayMilliSecondsForTest) {
      await delay(props.answerPropDelayMilliSecondsForTest);
    }
    await updateStateWithLoadedAnswer(props.answerProp);
  } else if (props.answerPreview.full_answer) {
    await updateStateWithLoadedAnswer(props.answerPreview.full_answer);
  } else {
    const response = await apiAnswer.getAnswer(token.value, props.answerPreview.uuid);
    await updateStateWithLoadedAnswer(response.data);
  }

  if (loadFullAnswer) {
    preview.value = false;
  }
});

async function upvote() {
  if (!userProfile.value) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  await dispatchCaptureApiError(store, async () => {
    if (answer.value) {
      upvotes.value = (await apiAnswer.upvoteAnswer(token.value, answer.value.uuid)).data;
    }
  });
}

async function cancelUpvote() {
  await dispatchCaptureApiError(store, async () => {
    if (answer.value) {
      upvotes.value = (await apiAnswer.cancelUpvoteAnswer(token.value, answer.value.uuid)).data;
    }
  });
}

function webArchiveRequest() {
  window.open('https://web.archive.org/web/*/' + window.location.href);
}

async function bookmark() {
  await dispatchCaptureApiError(store, async () => {
    if (answer.value) {
      bookmarkIntermediate.value = true;
      userBookmark.value = (await apiMe.bookmarkAnswer(token.value, answer.value.uuid)).data;
      bookmarkIntermediate.value = false;
    }
  });
}

async function unbookmark() {
  unbookmarkIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    if (answer.value) {
      userBookmark.value = (await apiMe.unbookmarkAnswer(token.value, answer.value.uuid)).data;
      unbookmarkIntermediate.value = false;
    }
  });
}

async function submitNewAnswerCommentBody(c: INewCommentInternal | undefined) {
  if (!c) {
    return;
  }
  await submitNewAnswerCommentBodyInternal(c);
}

async function submitNewAnswerCommentBodyInternal({
  body,
  body_text,
  editor,
  mentioned,
}: INewCommentInternal) {
  await dispatchCaptureApiError(store, async () => {
    if (answer.value) {
      commentSubmitIntermediate.value = true;
      const response = await apiComment.postComment(token.value, {
        site_uuid: answer.value.site.uuid,
        answer_uuid: answer.value.uuid,
        content: {
          source: body,
          rendered_text: body_text,
          editor,
        },
        mentioned,
      });
      const comment = response.data;
      answer.value.comments.push(comment);
      commentSubmitIntermediate.value = false;
    }
  });
}

async function toggleHideAnswer() {
  await dispatchCaptureApiError(store, async () => {
    if (props.answerPreview) {
      toggleHideAnswerIntermediate.value = true;
      await api.updateAnswerByMod(token.value, props.answerPreview.uuid, {
        is_hidden_by_moderator: !isHiddenByMod.value,
      });
      toggleHideAnswerIntermediate.value = false;
      isHiddenByMod.value = !isHiddenByMod.value;
    }
  });
}

async function updatedAnswerCallback(event: { answer: IAnswer; isAutoSaved: boolean }) {
  if (!event.isAutoSaved) {
    showHasDraftBadge.value = false;
    showEditor.value = false;
    await updateStateWithLoadedAnswer(event.answer);
  }
}

async function updateStateWithLoadedAnswer(loadedAnswer: IAnswer) {
  emit('load');
  answer.value = loadedAnswer;
  if (userProfile.value) {
    currentUserIsAuthor.value = userProfile.value.uuid === loadedAnswer.author.uuid;
    if (currentUserIsAuthor.value) {
      const localSavedEdit = loadLocalEdit('answer', loadedAnswer.uuid);
      draftPromise.value = apiAnswer.getAnswerDraft(token.value, loadedAnswer.uuid).then((response) => {
        const draft = response.data;
        if (
          draft.content_draft &&
          (localSavedEdit === null ||
            dayjs.utc(draft.draft_saved_at).isAfter(dayjs(localSavedEdit.createdAt)))
        ) {
          editButtonText.value = '编辑草稿';
          draftContent.value = draft.content_draft;
          showHasDraftBadge.value = true;
        } else if (localSavedEdit) {
          editButtonText.value = '编辑草稿';
          draftContent.value = {
            source: (localSavedEdit.edit as IRichEditorState).body || '',
            editor: (localSavedEdit.edit as IRichEditorState).editor,
          };
          bodyDraftFromLocalSavedEdit.value = localSavedEdit;
          showHasDraftBadge.value = true;
        }
        return draft;
      });
    }
  }
  if (props.answerUpvotesProp) {
    upvotes.value = props.answerUpvotesProp;
  } else if (loadedAnswer.upvotes) {
    upvotes.value = loadedAnswer.upvotes;
  } else {
    upvotes.value = (await apiAnswer.getAnswerUpvotes(token.value, loadedAnswer.uuid)).data;
  }
  commentWritable.value = loadedAnswer.comment_writable;
  userBookmark.value = {
    answer_uuid: loadedAnswer.uuid,
    bookmarkers_count: loadedAnswer.bookmark_count,
    bookmarked_by_me: loadedAnswer.bookmarked,
  };
  if (token.value) {
    suggestedEdits.value = (await apiAnswer.getSuggestions(token.value, loadedAnswer.uuid)).data;
    if (props.showSuggestionUuid) {
      openedSuggestionIdx.value = suggestedEdits.value.findIndex(
        (v) => v.uuid === props.showSuggestionUuid
      );
    }
  }
  loading.value = false;
}

function expandDown() {
  expandClicked.value = true;
  if (!answer.value) {
    loading.value = true;
  }
  preview.value = false;
}

function onReadFullAnswer() {
  if (token.value) {
    apiAnswer.bumpViewsCounter(token.value, props.answerPreview.uuid);
  }
}

async function loadEditor() {
  if (answer.value) {
    // load editor for author user
    if (currentUserIsAuthor.value && draftPromise.value) {
      const draft = await draftPromise.value;
      if (bodyDraftFromLocalSavedEdit.value) {
        commitAddNotification(store, {
          content: '载入最近的草稿',
          color: 'success',
        });
        commitSetWorkingDraft(store, bodyDraftFromLocalSavedEdit.value.edit as IRichEditorState);
      } else if (draft && draft.content_draft) {
        commitAddNotification(store, {
          content: '载入最近的草稿',
          color: 'success',
        });
        commitSetWorkingDraft(store, {
          body: draft.content_draft?.source || '',
          rendered_body_text: null,
          is_draft: true,
          editor: draft.content_draft?.editor || 'wysiwyg',
          visibility: answer.value.visibility,
        });
      } else {
        commitSetWorkingDraft(store, {
          body: answer.value.content.source,
          rendered_body_text: null,
          visibility: answer.value.visibility,
          editor: answer.value.content.editor,
          is_draft: false,
        });
      }
      showEditor.value = true;
    }
    // Load editor for non-author user for suggest
    if (!currentUserIsAuthor.value && answer.value.suggest_editable) {
      commitSetWorkingDraft(store, {
        body: answer.value.content.source,
        rendered_body_text: null,
        visibility: answer.value.visibility,
        editor: answer.value.content.editor,
        is_draft: false,
      });
      showEditor.value = true;
    }
  }
}

async function deleteAnswer() {
  if (props.draftMode) {
    if (editorRef.value) {
      await editorRef.value.deleteDraft();
    }
    clearLocalEdit('answer', props.answerPreview.uuid);
    await apiAnswer.deleteAnswerDraft(token.value, props.answerPreview.uuid);
    commitAddNotification(store, {
      content: '草稿已删除',
      color: 'success',
    });
    emit('delete-answer-draft', props.answerPreview.uuid);
  } else {
    await dispatchCaptureApiError(store, async () => {
      await apiAnswer.deleteAnswer(token.value, props.answerPreview.uuid);
      commitAddNotification(store, {
        content: '答案已永久删除',
        color: 'success',
      });
      confirmDeleteDialog.value = false;
    });
  }
  emit('delete-answer', props.answerPreview.uuid);
}

function toggleShowComments() {
  if (!userProfile.value && answer.value!.comments.length === 0) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  showComments.value = !showComments.value;
}

function cancelHandler() {
  showEditor.value = false;
}

function deleteDraft() {
  showEditor.value = false;
  showHasDraftBadge.value = false;
}

function truncatedIntro(intro: string) {
  if (isDesktop.value) {
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

function submitAnswerSuggestEditCallback(edit: IAnswerSuggestEdit) {
  showEditor.value = false;
  suggestedEdits.value.push(edit);
}

function previewSuggestion(suggestion: IAnswerSuggestEdit) {
  previewedSuggestion.value = suggestion;
  showSuggestionPreviewDialog.value = true;
}

async function acceptSuggestion(suggestion: IAnswerSuggestEdit) {
  await dispatchCaptureApiError(store, async () => {
    await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'accepted',
    });
    router.go(0);
  });
}

async function rejectSuggestion(suggestion: IAnswerSuggestEdit) {
  await dispatchCaptureApiError(store, async () => {
    const r = await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'rejected',
    });
    suggestion.status = r.data.status;
    suggestion.rejected_at = r.data.rejected_at;
  });
}

async function retractSuggestion(suggestion: IAnswerSuggestEdit) {
  await dispatchCaptureApiError(store, async () => {
    const r = await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'retracted',
    });
    suggestion.status = r.data.status;
    suggestion.retracted_at = r.data.retracted_at;
  });
}

async function revertRetractSuggestion(suggestion: IAnswerSuggestEdit) {
  await dispatchCaptureApiError(store, async () => {
    const r = await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'pending',
    });
    suggestion.status = r.data.status;
  });
}

async function submitReport() {
  submitReportIntermediate.value = true;
  await api.createReport(token.value, {
    answer_uuid: props.answerPreview.uuid,
    reason: reportReason.value,
    reason_comment: reportReasonComment.value || undefined,
  });
  commitAddNotification(store, {
    color: 'success',
    content: '举报提交成功',
  });
  submitReportIntermediate.value = false;
  reportDialog.value = false;
}
</script>
