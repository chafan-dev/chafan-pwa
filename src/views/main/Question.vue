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
            <v-textarea v-else v-model="newQuestionTitle" auto-grow dense label="标题" rows="1" />
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
        <v-slide-group v-if="!showQuestionEditor" class="d-flex mt-3 mb-1">
          <v-btn
            v-if="savedLocalEdit"
            class="mr-1 slim-btn"
            color="primary"
            depressed
            small
            @click="loadSavedLocalEdit"
          >
            载入本地草稿
          </v-btn>

          <v-btn
            v-else-if="questionPage.flags.answer_writable && !answeredBefore"
            class="mr-1 slim-btn"
            color="primary"
            depressed
            small
            @click="showEditor = !showEditor"
          >
            写回答
          </v-btn>

          <v-tooltip v-else bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                :ripple="false"
                class="mr-1 slim-btn grey--text"
                depressed
                elevation="0"
                plain
                small
              >
                写回答
              </v-btn>
            </template>
            <span v-if="answeredBefore">已回答过</span>
            <span v-else>该圈子仅会员可以写回答</span>
          </v-tooltip>

          <CommentBtn
            :count="recursiveCommentsCount(question.comments)"
            class="mr-1"
            @click="toggleShowComments"
          />

          <QuestionUpvotes
            :disabled="!userProfile || userProfile.uuid === question.author.uuid"
            :uuid="question.uuid"
            :upvotes-placeholder="questionPage.question.upvotes"
            class="mr-1"
          />

          <v-btn
            v-if="questionPage.flags.editable"
            @click="showQuestionEditor = true"
            class="mr-1 slim-btn"
            depressed
            elevation="0"
            small
          >
            <EditIcon />
            <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">编辑</span>
          </v-btn>

          <ShareCardButton
            v-slot="{ shareQrCodeUrl }"
            :link="`/questions/${question.uuid}`"
            :link-text="question.title"
            class="mr-1"
          >
            <v-card-title>
              {{ question.title }}
            </v-card-title>
            <v-card-text>
              <div class="pt-2 d-flex">
                <div class="text--primary text-body-1">
                  <Viewer v-if="question.desc" :content="question.desc" />
                  <p>
                    <CommentsIcon class="mr-1" small />
                    <span class="text-caption"> {{ question.comments.length }}条评论 </span>
                  </p>
                  <p>
                    <AnswerIcon class="mr-1" small />
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
          </ShareCardButton>

          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="slim-btn" small depressed>
                <DotsIcon small />
                <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">更多</span>
              </v-btn>
            </template>
            <v-list dense>
              <template v-if="questionPage.question_subscription">
                <v-list-item
                  v-if="questionPage.question_subscription.subscribed_by_me"
                  :disabled="cancelSubscriptionIntermediate"
                  dense
                  @click="cancelSubscription"
                >
                  <BookmarkedIcon class="mr-1" />
                  取消关注
                </v-list-item>
                <v-list-item v-else :disabled="subscribeIntermediate" dense @click="subscribe">
                  <ToBookmarkIcon class="mr-1" />
                  关注
                </v-list-item>
              </template>
              <v-list-item dense @click="showHistoryDialog">
                <HistoryIcon class="mr-1" />
                问题历史
              </v-list-item>
              <v-list-item dense @click="transferQuestionDialog = true">
                <TransferIcon class="mr-1" />
                转移问题
              </v-list-item>
              <v-list-item
                dense
                v-if="questionPage.flags.hideable"
                @click="showConfirmHideQuestionDialog = true"
              >
                <LockOutlineIcon class="mr-1" />
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
                <v-btn small depressed color="primary" @click="transferQuestion">申请转移</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="historyDialog" max-width="900">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">编辑历史</div>
                <v-spacer />
                <span class="text-caption grey--text">点击展开</span>
              </v-card-title>
              <v-expansion-panels>
                <v-expansion-panel v-for="archive in archives" :key="archive.id">
                  <v-expansion-panel-header>
                    {{ $dayjs.utc(archive.created_at).local().fromNow() }}
                    <span v-if="archive.editor"> - <UserLink :userPreview="archive.editor" /></span>
                    <v-spacer />
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-chip-group>
                      <v-chip
                        v-for="topic in archive.topics"
                        :key="topic.uuid"
                        :to="'/topics/' + topic.uuid"
                        >{{ topic.name }}
                      </v-chip>
                    </v-chip-group>
                    <div class="headline primary--text">
                      {{ archive.title }}
                    </div>
                    <Viewer v-if="archive.desc" :content="archive.desc" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-dialog>
          <v-dialog v-model="showConfirmHideQuestionDialog" max-width="600">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">确认隐藏问题</div>
              </v-card-title>
              <v-card-text>隐藏后问题仍可通过地址访问，但是会从问题列表中隐藏。</v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="warning" depressed small @click="confirmHideQuestion"
                  >确认隐藏
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-slide-group>

        <!-- Question editor control -->
        <div v-if="showQuestionEditor && userProfile" class="d-flex">
          <v-btn
            v-show="questionPage.flags.editable"
            :disabled="commitQuestionEditIntermediate"
            class="ma-1 slim-btn"
            color="primary"
            depressed
            small
            @click="commitQuestionEdit"
            >保存
          </v-btn>
          <v-btn
            v-show="questionPage.flags.editable"
            class="ma-1 slim-btn"
            depressed
            small
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
          <span v-if="showEditor && userProfile" class="text-caption grey--text">编辑答案</span>
          <span v-else-if="answers.length === 0" class="text-caption grey--text">暂无答案</span>
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
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="bottom-btn">
            <InfoIcon />
            <span class="ml-1 grey--text">问题信息</span>
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
import store from '@/store';
import { useRoute, useRouter } from 'vue-router/composables';

import Answer from '@/components/Answer.vue';
import QuestionInfo from '@/components/question/QuestionInfo.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';
import AnswerEditor from '@/components/AnswerEditor.vue';

import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';

import {
  commitAddNotification,
  commitSetShowLoginPrompt,
  commitSetWorkingDraft,
} from '@/store/main/mutations';

import { readNarrowUI } from '@/store/main/getters';
import {
  IAnswer,
  IQuestionArchive,
  IQuestionPage,
  IRichEditorState,
  IRichText,
  ISite,
} from '@/interfaces';
import Viewer from '@/components/Viewer.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import {
  dispatchCaptureApiError,
  dispatchCaptureApiErrorWithErrorHandler,
} from '@/store/main/actions';
import { apiQuestion } from '@/api/question';
import { apiMe } from '@/api/me';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';
import { AxiosError } from 'axios';
import { isEqual, updateHead } from '@/common';
import { loadLocalEdit, LocalEdit } from '@/utils';
import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import CommentBtn from '@/components/widgets/CommentBtn.vue';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import QuestionUpvotes from '@/components/question/QuestionUpvotes.vue';
import TransferIcon from '@/components/icons/TransferIcon.vue';
import SiteSearch from '@/components/SiteSearch.vue';
import LockOutlineIcon from '@/components/icons/LockOutlineIcon.vue';
import TopicChip from '@/components/widgets/TopicChip.vue';
import { warn, info } from '@/logging';
import { useAuth, useTheme, useResponsive, useErrorHandling } from '@/composables';

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
const showConfirmHideQuestionDialog = ref(false);
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
const transferToSite = ref<ISite | null>(null);
const transferQuestionDialog = ref(false);
const descEditor = ref<any>(null);

const isNarrowFeedUI = computed(() => readNarrowUI(store));

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
  await dispatchCaptureApiErrorWithErrorHandler(store, {
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

  await dispatchCaptureApiError(store, async () => {
    if (questionPage.value) {
      const questionVal = questionPage.value.question;
      const _response = await apiQuestion.bumpViewsCounter(token.value, questionVal.uuid);
      // TODO put it in another place, don't block the whole function 2025-07-03
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
          commitAddNotification(store, {
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
      commitAddNotification(store, {
        content: '点击「编辑」加入更多细节',
        color: 'info',
      });
      localStorage.removeItem('new-question');
    }
  } catch (e) {} // FIXME: is there a better way than just ignoring disabled localStorage?

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

async function submitNewQuestionCommentBody({ body, body_text, editor, mentioned }: any) {
  await dispatchCaptureApiError(store, async () => {
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
  await dispatchCaptureApiError(store, async () => {
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
  await dispatchCaptureApiError(store, async () => {
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
    commitSetShowLoginPrompt(store, true);
    return;
  }
  await dispatchCaptureApiError(store, async () => {
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
      commitAddNotification(store, {
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
  await dispatchCaptureApiError(store, async () => {
    await apiQuestion.hideQuestion(token.value, question.value!.uuid);
    commitAddNotification(store, {
      content: '已隐藏',
      color: 'info',
    });
    await router.push(`/sites/${questionPage.value!.question.site.subdomain}`);
  });
}

function toggleShowComments() {
  if (!userProfile.value && question.value!.comments.length === 0) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  showComments.value = !showComments.value;
}

function loadSavedLocalEdit() {
  commitSetWorkingDraft(store, savedLocalEdit.value!.edit as IRichEditorState);
  showEditor.value = true;
}

async function cancelQuestionUpdate() {
  showQuestionEditor.value = false;
}

async function transferQuestion() {
  if (transferToSite.value) {
    warn('This function is turned off during dev. TODO');
  }
  return null;
}

function answerPreviewOf(uuid: string) {
  return questionPage.value!.answer_previews?.find((a) => a.uuid === uuid);
}
</script>
