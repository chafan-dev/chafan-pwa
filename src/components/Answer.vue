<template>
  <div v-if="!showEditor" class="pt-1 mx-2">
    <div v-if="isHiddenByMod">
      <v-card-text>内容已被隐藏</v-card-text>
    </div>
    <div v-else>
      <div v-if="showQuestionInCard" class="text-h6 mb-2">
        <QuestionLink :questionPreview="answerPreview.question" />
      </div>
      <v-progress-linear indeterminate v-if="loading" height="2" class="mb-2" />
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
              class="text-grey ml-2"
            >
              {{ truncatedIntro(answer.author.personal_introduction) }}
            </span>
            <v-spacer />
            <!-- Featured badge -->
            <v-chip v-if="currentUserIsAuthor" color="info" label size="small" class="mr-1"
              >我的回答</v-chip
            >
          </div>

          <!-- Answer Content Block -->
          <div class="mb-2 mt-1">
            <!-- Draft content -->
            <template v-if="draftMode && draftContent !== null">
              <v-chip class="mb-1" v-if="answer" color="info" size="small">草稿</v-chip>
              <Viewer :content="draftContent" />
            </template>
            <!-- Published content -->
            <template v-else>
              <v-chip v-if="answer && !answer.is_published" color="warning" size="small" class="mb-1">
                此为初稿仅自己可见
              </v-chip>
              <v-chip v-else-if="showHasDraftBadge" color="info" size="small" class="mb-1">
                编辑器中有未发表的草稿
              </v-chip>

              <Viewer v-intersect.once="onReadFullAnswer" :content="answer.content" />
            </template>
          </div>

          <div :class="theme.answer.controls.classes">
            <!-- Main control block -->
            <div class="d-flex">
              <div :class="theme.answer.controls.buttonsCol.classes" class="align-self-center">
                <AnswerActions
                  :upvotes="upvotes"
                  :current-user-is-author="currentUserIsAuthor"
                  :edit-button-text="editButtonText"
                  :draft-mode="draftMode"
                  :delete-intermediate="deleteAnswerIntermediate"
                  :share-link="`/questions/${answer.question.uuid}/answers/${answerPreview.uuid}`"
                  :share-link-text="answer.question.title + ` - ${answer.author.handle} 的回答`"
                  :suggest-editable="answer.suggest_editable"
                  :user-bookmark="userBookmark"
                  :bookmark-loading="unbookmarkIntermediate || bookmarkIntermediate"
                  :comments-count="recursiveCommentsCount(answer.comments)"
                  @upvote="upvote"
                  @cancel-upvote="cancelUpvote"
                  @toggle-comments="toggleShowComments"
                  @load-editor="loadEditor"
                  @delete-answer="deleteAnswer"
                  @bookmark="bookmark"
                  @unbookmark="unbookmark"
                  @report="reportDialog = true"
                  @collapse="preview = true"
                >
                  <template #share-card="{ shareQrCodeUrl }">
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
                              class="text-grey ml-2"
                            >
                              {{ answer.author.personal_introduction }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </v-card-text>
                  </template>
                </AnswerActions>

                <AnswerReportDialog
                  :visible="reportDialog"
                  :answer-uuid="answerPreview.uuid"
                  :answer-author="answerPreview.author"
                  @update:visible="reportDialog = $event"
                />
              </div>

              <v-spacer />

              <!-- Column of variable width -->
              <div v-if="isDesktop & !preview && userProfile" class="align-self-center">
                <span class="text-caption text-grey mr-1">
                  <span v-if="!inAnswerQuestionFeedCard"
                    >编辑于 {{ fromNow(answer.updated_at) }}，</span
                  >
                  已被阅读{{ answer.view_times }}次
                </span>
              </div>
            </div>

            <!-- Suggested edits -->
            <AnswerSuggestedEdits
              v-if="answer && suggestedEdits && suggestedEdits.length"
              :suggested-edits="suggestedEdits"
              :answer-content-source="answer.content.source"
              :answer-content-rendered-text="answer.content.rendered_text"
              :is-author="currentUserIsAuthor"
              :current-user-uuid="userProfile?.uuid"
              :highlight-uuid="showSuggestionUuid"
              @accept="acceptSuggestion"
              @reject="rejectSuggestion"
              @retract="retractSuggestion"
              @revert-retract="revertRetractSuggestion"
              @preview="previewSuggestion"
            />

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
import { useRouter } from 'vue-router';
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
  IUserAnswerBookmark,
} from '@/interfaces';
import { api } from '@/api';
import { apiAnswer } from '@/api/answer';
import UserLink from '@/components/UserLink.vue';
import QuestionLink from '@/components/question/QuestionLink.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import { apiComment } from '@/api/comment';
import { apiMe } from '@/api/me';
import { clearLocalEdit, delay, loadLocalEdit, LocalEdit } from '@/utils';
import AnswerEditor from '@/components/AnswerEditor.vue';
import Viewer from '@/components/Viewer.vue';
import AnswerReportDialog from '@/components/answer/AnswerReportDialog.vue';
import AnswerActions from '@/components/answer/AnswerActions.vue';
import AnswerSuggestedEdits from '@/components/answer/AnswerSuggestedEdits.vue';
import { useAuth, useTheme, useResponsive, useDayjs } from '@/composables';
import { useMainStore } from '@/stores/main';
const store = useMainStore();

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

const reportDialog = ref(false);

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
    const response = await apiAnswer.getAnswer(props.answerPreview.uuid);
    await updateStateWithLoadedAnswer(response.data);
  }

  if (loadFullAnswer) {
    preview.value = false;
  }
});

async function upvote() {
  if (!userProfile.value) {
    store.showLoginPrompt = true;
    return;
  }
  await store.captureApiError(async () => {
    if (answer.value) {
      upvotes.value = (await apiAnswer.upvoteAnswer(token.value, answer.value.uuid)).data;
    }
  });
}

async function cancelUpvote() {
  await store.captureApiError(async () => {
    if (answer.value) {
      upvotes.value = (await apiAnswer.cancelUpvoteAnswer(token.value, answer.value.uuid)).data;
    }
  });
}

async function bookmark() {
  await store.captureApiError(async () => {
    if (answer.value) {
      bookmarkIntermediate.value = true;
      userBookmark.value = (await apiMe.bookmarkAnswer(token.value, answer.value.uuid)).data;
      bookmarkIntermediate.value = false;
    }
  });
}

async function unbookmark() {
  unbookmarkIntermediate.value = true;
  await store.captureApiError(async () => {
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
  await store.captureApiError(async () => {
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
  await store.captureApiError(async () => {
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
    upvotes.value = (await apiAnswer.getAnswerUpvotes(loadedAnswer.uuid)).data;
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
        store.notifications.push({
          content: '载入最近的草稿',
          color: 'success',
        });
        store.workingDraft = bodyDraftFromLocalSavedEdit.value.edit as IRichEditorState;
      } else if (draft && draft.content_draft) {
        store.notifications.push({
          content: '载入最近的草稿',
          color: 'success',
        });
        store.workingDraft = {
          body: draft.content_draft?.source || '',
          rendered_body_text: null,
          is_draft: true,
          editor: draft.content_draft?.editor || 'wysiwyg',
          visibility: answer.value.visibility,
        };
      } else {
        store.workingDraft = {
          body: answer.value.content.source,
          rendered_body_text: null,
          visibility: answer.value.visibility,
          editor: answer.value.content.editor,
          is_draft: false,
        };
      }
      showEditor.value = true;
    }
    // Load editor for non-author user for suggest
    if (!currentUserIsAuthor.value && answer.value.suggest_editable) {
      store.workingDraft = {
        body: answer.value.content.source,
        rendered_body_text: null,
        visibility: answer.value.visibility,
        editor: answer.value.content.editor,
        is_draft: false,
      };
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
    store.notifications.push({
      content: '草稿已删除',
      color: 'success',
    });
    emit('delete-answer-draft', props.answerPreview.uuid);
  } else {
    await store.captureApiError(async () => {
      await apiAnswer.deleteAnswer(token.value, props.answerPreview.uuid);
      store.notifications.push({
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
    store.showLoginPrompt = true;
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
  await store.captureApiError(async () => {
    await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'accepted',
    });
    router.go(0);
  });
}

async function rejectSuggestion(suggestion: IAnswerSuggestEdit) {
  await store.captureApiError(async () => {
    const r = await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'rejected',
    });
    suggestion.status = r.data.status;
    suggestion.rejected_at = r.data.rejected_at;
  });
}

async function retractSuggestion(suggestion: IAnswerSuggestEdit) {
  await store.captureApiError(async () => {
    const r = await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'retracted',
    });
    suggestion.status = r.data.status;
    suggestion.retracted_at = r.data.retracted_at;
  });
}

async function revertRetractSuggestion(suggestion: IAnswerSuggestEdit) {
  await store.captureApiError(async () => {
    const r = await apiAnswer.updateSuggestion(token.value, suggestion.uuid, {
      status: 'pending',
    });
    suggestion.status = r.data.status;
  });
}

</script>
