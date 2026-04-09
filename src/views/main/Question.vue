<template>
  <v-container fluid>
    <v-progress-linear v-if="questionPage === null" indeterminate />
    <v-row v-else class="px-2" justify="center">
      <v-col
        :class="{
          'col-8': isDesktop && !isNarrowFeedUI,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !isDesktop,
        }"
        class="mb-12"
      >
        <!-- Question info/editor -->
        <div>
          <!-- Question topics display/editor -->
          <v-slide-group
            v-if="!showQuestionEditor"
            class="d-flex justify-space-between align-center"
          >
            <SiteBtn :site="question.site" class="elevation-0" />
            <v-chip-group>
              <TopicChip
                v-for="topic in question.topics"
                :key="topic.uuid"
                :topic="topic"
                :more-margin="false"
              />
            </v-chip-group>
          </v-slide-group>
          <v-combobox
            v-else
            v-model="newQuestionTopicNames"
            :delimiters="[',', '，', '、']"
            :items="hintTopicNames"
            label="话题"
            hide-selected
            multiple
            small-chips
          />

          <!-- Question title display/editor -->
          <div class="pt-1">
            <div v-if="!showQuestionEditor" class="text-h5">
              {{ question.title }}
            </div>
            <v-textarea v-else v-model="newQuestionTitle" auto-grow density="compact" label="标题" rows="1" />
          </div>

          <!-- Question description display/editor -->
          <Viewer v-if="!showQuestionEditor && question.desc" :content="question.desc" />
          <div v-else-if="showQuestionEditor">
            <SimpleEditor
              ref="descEditor"
              :editor-prop="question.desc ? question.desc.editor : undefined"
              :initialValue="question.desc ? question.desc.source : undefined"
              :show-menu="true"
              class="mb-2"
              placeholder="描述（选填）"
            />
          </div>
        </div>

        <!-- Question control -->
        <QuestionActionBar
          v-if="!showQuestionEditor"
          :saved-local-edit="savedLocalEdit"
          :answer-writable="questionPage.flags.answer_writable"
          :answered-before="answeredBefore"
          :comments-count="recursiveCommentsCount(question.comments)"
          :upvote-disabled="!userProfile || userProfile.uuid === question.author.uuid"
          :question-uuid="question.uuid"
          :upvotes-placeholder="questionPage.question.upvotes"
          :editable="questionPage.flags.editable"
          :share-link="`/questions/${question.uuid}`"
          :share-link-text="question.title"
          :question-subscription="questionPage.question_subscription"
          :cancel-subscription-intermediate="cancelSubscriptionIntermediate"
          :subscribe-intermediate="subscribeIntermediate"
          :hideable="questionPage.flags.hideable"
          :history-dialog-visible="historyDialog"
          :archives="archives"
          @load-saved-edit="loadSavedLocalEdit"
          @toggle-editor="showEditor = !showEditor"
          @toggle-comments="toggleShowComments"
          @edit-question="showQuestionEditor = true"
          @cancel-subscription="cancelSubscription"
          @subscribe="subscribe"
          @show-history="showHistoryDialog"
          @transfer-question="transferQuestion"
          @confirm-hide="confirmHideQuestion"
          @update:history-dialog="historyDialog = $event"
        >
          <template #share-card="{ shareQrCodeUrl }">
            <v-card-title>
              {{ question.title }}
            </v-card-title>
            <v-card-text>
              <div class="pt-2 d-flex">
                <div class="text--primary text-body-1">
                  <Viewer v-if="question.desc" :content="question.desc" />
                  <p>
                    <AppIcon name="Comments" class="mr-1" size="small" />
                    <span class="text-caption"> {{ question.comments.length }}条评论 </span>
                  </p>
                  <p>
                    <AppIcon name="Answer" class="mr-1" size="small" />
                    <span class="text-caption"> {{ question.answers_count }}个回答 </span>
                  </p>
                </div>
                <v-spacer />
                <div class="pa-1 text-center float-right">
                  <v-img v-if="shareQrCodeUrl" :src="shareQrCodeUrl" max-width="100" />
                  <span class="text-caption">查看原问题</span>
                </div>
              </div>
            </v-card-text>
          </template>
        </QuestionActionBar>

        <!-- Question editor control -->
        <div v-if="showQuestionEditor && userProfile" class="d-flex">
          <v-btn
            v-show="questionPage.flags.editable"
            :disabled="commitQuestionEditIntermediate"
            class="ma-1 slim-btn"
            color="primary"
            variant="flat"
            size="small"
            @click="commitQuestionEdit"
            >保存
          </v-btn>
          <v-btn
            v-show="questionPage.flags.editable"
            class="ma-1 slim-btn"
            variant="tonal"
            size="small"
            @click="cancelQuestionUpdate"
            >取消
          </v-btn>
          <v-spacer />
        </div>

        <!-- Comments -->
        <v-expand-transition>
          <CommentBlock
            v-show="showComments"
            :commentSubmitIntermediate="commentSubmitIntermediate"
            :comments="question.comments"
            :siteId="question.site ? question.site.uuid : undefined"
            :writable="questionPage.flags.comment_writable"
            commentLabel="评论问题"
            @submit-new-comment="submitNewQuestionCommentBody"
          />
        </v-expand-transition>

        <div class="ml-2 text-center">
          <span v-if="showEditor && userProfile" class="text-caption text-grey">编辑答案</span>
          <span v-else-if="answers.length === 0" class="text-caption text-grey">暂无答案</span>
        </div>

        <!-- Answer editor -->
        <v-expand-transition v-if="userProfile">
          <AnswerEditor
            v-if="showEditor"
            :inPrivateSite="!question.site.public_readable"
            :questionIdProp="question.uuid"
            @updated-answer="updatedAnswerCallback"
            @cancel-edit="cancelHandler"
            @delete-draft="deleteDraft"
          />
        </v-expand-transition>

        <!-- Answers -->
        <div
          v-for="answer in answers"
          :key="answer.uuid"
          :class="theme.question.answer.classes"
          class="mb-4"
        >
          <Answer
            :answerPreview="answerPreviewOf(answer.uuid)"
            :answerProp="answer"
            :loadFull="answers.indexOf(answer) <= 2"
            :showCommentId="answerCommentId"
            :show-suggestion-uuid="answerSuggestionId"
            :showQuestionInCard="false"
            @delete-answer="deleteHandler"
          />
        </div>
      </v-col>

      <v-col v-if="isDesktop" :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'">
        <QuestionInfo
          :question="question"
          :questionSubscription="questionPage.question_subscription"
        />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ props }">
          <div v-bind="props" class="bottom-btn">
            <AppIcon name="Info"  />
            <span class="ml-1 text-grey">问题信息</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <QuestionInfo
            :question="question"
            :questionSubscription="questionPage.question_subscription"
          />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';

import Answer from '@/components/Answer.vue';
import QuestionInfo from '@/components/question/QuestionInfo.vue';
import QuestionActionBar from '@/components/question/QuestionActionBar.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';
import AnswerEditor from '@/components/AnswerEditor.vue';

import {
  IAnswer,
  INewCommentInternal,
  IQuestionArchive,
  IQuestionPage,
  IRichEditorState,
  IRichText,
  ISite,
} from '@/interfaces';
import Viewer from '@/components/Viewer.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import { apiQuestion } from '@/api/question';
import { apiMe } from '@/api/me';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';
import { AxiosError } from 'axios';
import { isEqual, updateHead } from '@/common';
import { loadLocalEdit, LocalEdit } from '@/utils';
import TopicChip from '@/components/widgets/TopicChip.vue';
import { warn, info } from '@/logging';
import { useAuth, useTheme, useResponsive, useErrorHandling } from '@/composables';
import { useMainStore } from '@/stores/main';
import AppIcon from '@/components/icons/AppIcon.vue';
const store = useMainStore();
const display = useDisplay();

const route = useRoute();
const router = useRouter();
const { token, userProfile, loggedIn } = useAuth();
const { theme } = useTheme();
const { isDesktop } = useResponsive();
const { commitErrMsg, recursiveCommentsCount } = useErrorHandling();

const questionPage = ref<IQuestionPage | null>(null);
const showEditor = ref(false);
const newQuestionTitle = ref('');
const showQuestionEditor = ref(false);
const showComments = ref(false);
const newQuestionTopicNames = ref<string[]>([]);
const hintTopicNames = ref<string[]>([]); // TODO
const commitQuestionEditIntermediate = ref(false);
const cancelSubscriptionIntermediate = ref(false);
const subscribeIntermediate = ref(false);
const savedNewAnswer = ref<IAnswer | null>(null);
const handlingNewEdit = ref(false);
const archives = ref<IQuestionArchive[]>([]);
const historyDialog = ref(false);
const commentSubmitIntermediate = ref(false);
const savedLocalEdit = ref<LocalEdit | null>(null);
const answers = ref<IAnswer[]>([]);
const answeredBefore = ref(false);
const descEditor = ref<any>(null);

const isNarrowFeedUI = computed(() => store.narrowUI);

const id = computed(() => route.params.id);

const answerUUID = computed(() => {
  const aid = route.params.aid;
  return aid ? aid : null;
});

const answerCommentId = computed(() => {
  const acid = route.params.acid;
  return acid ? acid : null;
});

const answerSuggestionId = computed(() => {
  const asid = route.params.asid;
  return asid ? asid : null;
});

const questionCommentId = computed(() => {
  const qcid = route.params.qcid;
  return qcid ? qcid : null;
});

const question = computed(() => questionPage.value?.question);

// Watch for route changes (replacing beforeRouteUpdate)
watch(
  () => route.params,
  (newParams, oldParams) => {
    if (route.name === 'question' && !isEqual(newParams, oldParams)) {
      showEditor.value = false;
      showQuestionEditor.value = false;
      showComments.value = false;
      answers.value = [];
      showConfirmHideQuestionDialog.value = false;
      savedNewAnswer.value = null;
      archives.value = [];
      questionPage.value = null;
      loadQuestion();
    }
  }
);

async function loadQuestion() {
  let tokenValue: string = '';
  if (loggedIn.value) {
    info('logged in. Send token when get question page');
    tokenValue = token.value;
  } else {
    info('loading question when not logged in');
  }
  await store.captureApiErrorWithErrorHandler({
    action: async () => {
      const response = await apiQuestion.getQuestionPage(tokenValue, id.value);
      questionPage.value = response.data;
    },
    errorFilter: (err: AxiosError) => {
      const matched = commitErrMsg(err);
      if (matched) {
        router.push('/');
      }
      return matched !== null;
    },
  });

  await store.captureApiError(async () => {
    if (questionPage.value) {
      const questionVal = questionPage.value.question;
      if (token.value) {
        apiQuestion.bumpViewsCounter(token.value, questionVal.uuid);
      }
      if (questionCommentId.value !== null) {
        showComments.value = true;
      }
      updateHead(route.path, questionVal.title, questionVal.desc?.rendered_text);

      newQuestionTitle.value = questionVal.title;
      newQuestionTopicNames.value = questionVal.topics.map((topic) => topic.name);
      const answersData = questionPage.value.full_answers;
      if (answerUUID.value !== null) {
        // TODO: Fix when there is continuation
        if (!answersData.find((preview) => preview.uuid === answerUUID.value)) {
          store.notifications.push({
            content: '答案不存在',
            color: 'error',
          });
        }
      }
      if (answersData.length === 0 && !showQuestionEditor.value) {
        showEditor.value = true;
      }
      answers.value = answersData.sort((a, b) => {
        // First priority
        if (a.uuid === answerUUID.value) {
          return -1;
        }
        if (b.uuid === answerUUID.value) {
          return 1;
        }
        // Second priority
        if (a.author.uuid === userProfile.value?.uuid) {
          return -1;
        }
        if (b.author.uuid === userProfile.value?.uuid) {
          return 1;
        }
        return 1;
      });
      answeredBefore.value =
        answersData.filter((a) => a.author.uuid === userProfile.value?.uuid).length > 0;
      if (!answeredBefore.value) {
        savedLocalEdit.value = loadLocalEdit('answer', 'answer-of-' + questionVal.uuid);
      }
    }
  });
}

onMounted(async () => {
  try {
    if (localStorage.getItem('new-question')) {
      store.notifications.push({
        content: '点击「编辑」加入更多细节',
        color: 'info',
      });
      localStorage.removeItem('new-question');
    }
  } catch (e) { console.warn('localStorage is not available', e); }

  await loadQuestion();
});

function updateOrAddFullyLoadedAnswer(answer: IAnswer) {
  router.go(0);
}

function updatedAnswerCallback(event: { answer: IAnswer; isAutoSaved: boolean }) {
  handlingNewEdit.value = true;
  savedNewAnswer.value = event.answer;
  if (!event.isAutoSaved) {
    showEditor.value = false;
    updateOrAddFullyLoadedAnswer(event.answer);
  }
  handlingNewEdit.value = false;
}

async function submitNewQuestionCommentBody({ body, body_text, editor, mentioned }: INewCommentInternal) {
  await store.captureApiError(async () => {
    if (questionPage.value) {
      commentSubmitIntermediate.value = true;
      const response = await apiComment.postComment(token.value, {
        site_uuid: question.value!.site.uuid,
        question_uuid: id.value,
        content: {
          source: body,
          rendered_text: body_text,
          editor,
        },
        mentioned,
      });
      const comment = response.data;
      questionPage.value.question.comments.push(comment);
      commentSubmitIntermediate.value = false;
    }
  });
}

async function commitQuestionEdit() {
  commitQuestionEditIntermediate.value = true;
  await store.captureApiError(async () => {
    const descEditorRef = descEditor.value as any;
    if (questionPage.value && (newQuestionTitle.value || descEditorRef.getContent())) {
      const responses = await Promise.all(
        newQuestionTopicNames.value.map((name) => apiTopic.createTopic(token.value, { name }))
      );
      const topicsUUIDs = responses.map((r) => r.data.uuid);
      let desc: IRichText | null = null;
      const content = descEditorRef.getContent();
      if (content) {
        desc = {
          source: content,
          rendered_text: descEditorRef.getTextContent() || undefined,
          editor: descEditorRef.editor,
        };
      }
      const response = await apiQuestion.updateQuestion(token.value, question.value!.uuid, {
        title: newQuestionTitle.value,
        desc: desc,
        topic_uuids: topicsUUIDs,
      });
      if (response) {
        questionPage.value.question = response.data;
      }
    }
    commitQuestionEditIntermediate.value = false;
    showQuestionEditor.value = false;
  });
}

async function cancelSubscription() {
  await store.captureApiError(async () => {
    if (questionPage.value) {
      cancelSubscriptionIntermediate.value = true;
      questionPage.value.question_subscription = (
        await apiMe.unsubscribeQuestion(token.value, question.value!.uuid)
      ).data;
      cancelSubscriptionIntermediate.value = false;
    }
  });
}

async function subscribe() {
  if (!userProfile.value) {
    store.showLoginPrompt = true;
    return;
  }
  await store.captureApiError(async () => {
    if (questionPage.value) {
      subscribeIntermediate.value = true;
      questionPage.value.question_subscription = (
        await apiMe.subscribeQuestion(token.value, question.value!.uuid)
      ).data;
      subscribeIntermediate.value = false;
    }
  });
}

function deleteDraft() {
  savedLocalEdit.value = null;
  showEditor.value = false;
}

async function showHistoryDialog() {
  if (question.value) {
    archives.value = (await apiQuestion.getQuestionArchives(token.value, question.value.uuid)).data;
    archives.value.unshift({
      id: 0,
      title: question.value.title,
      desc: question.value.desc,
      topics: question.value.topics,
      created_at: question.value.updated_at,
      editor: question.value.editor,
    });
    if (archives.value.length > 0) {
      historyDialog.value = true;
    } else {
      store.notifications.push({
        content: '尚无历史存档',
        color: 'info',
      });
    }
  }
}

function cancelHandler() {
  showEditor.value = false;
  if (questionPage.value && savedNewAnswer.value) {
    answers.value.unshift(savedNewAnswer.value);
  }
}

function removeAnswer(answerUUID: string) {
  let idx = answers.value.findIndex((answer) => answer.uuid === answerUUID);
  if (idx !== -1) {
    answers.value.splice(idx, 1);
  }
}

function deleteHandler(answerUUID: string) {
  removeAnswer(answerUUID);
  if (answerUUID === answerUUID) {
    router.push(`/questions/${question.value!.uuid}`);
  }
}

async function confirmHideQuestion() {
  await store.captureApiError(async () => {
    await apiQuestion.hideQuestion(token.value, question.value!.uuid);
    store.notifications.push({
      content: '已隐藏',
      color: 'info',
    });
    await router.push(`/sites/${questionPage.value!.question.site.subdomain}`);
  });
}

function toggleShowComments() {
  if (!userProfile.value && question.value!.comments.length === 0) {
    store.showLoginPrompt = true;
    return;
  }
  showComments.value = !showComments.value;
}

function loadSavedLocalEdit() {
  store.workingDraft = savedLocalEdit.value!.edit as IRichEditorState;
  showEditor.value = true;
}

async function cancelQuestionUpdate() {
  showQuestionEditor.value = false;
}

async function transferQuestion(site: ISite | null) {
  if (site) {
    warn('This function is turned off during dev. TODO');
  }
  return null;
}

function answerPreviewOf(uuid: string) {
  return questionPage.value!.answer_previews?.find((a) => a.uuid === uuid);
}
</script>
