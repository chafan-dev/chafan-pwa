<template>
  <v-container fluid>
    <v-progress-linear v-if="questionPage === null" indeterminate />
    <v-row v-else class="px-2" justify="center">
      <v-col
        :class="{
          'col-8': isDesktop,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !isDesktop,
        }"
        class="mb-12"
        fluid
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
                <div class="pa-1 text-center" style="float: right">
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

        <div class="d-flex justify-end mb-2">
          <ReactionBlock :objectId="question.uuid" objectType="question" />
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

<script lang="ts">
import { Component } from 'vue-property-decorator';

import Answer from '@/components/Answer.vue';
import QuestionInfo from '@/components/question/QuestionInfo.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import ReactionBlock from '@/components/ReactionBlock.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';

import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import { warn } from '@/logging';

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
import { Route, RouteRecord } from 'vue-router';
import { CVue, isEqual, updateHead } from '@/common';
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

@Component({
  components: {
    TopicChip,
    LockOutlineIcon,
    SiteSearch,
    TransferIcon,
    QuestionUpvotes,
    DotsIcon,
    CommentBtn,
    ShareCardButton,
    AnswerIcon,
    Answer,
    QuestionInfo,
    CommentBlock,
    UserLink,
    EditIcon,
    SiteBtn,
    ReactionBlock,
    BookmarkedIcon,
    ToBookmarkIcon,
    HistoryIcon,
    InfoIcon,
    CommentsIcon,
    Viewer,
    SimpleEditor,
  },
})
export default class Question extends CVue {
  private questionPage: IQuestionPage | null = null;
  private showEditor: boolean = false;
  private newQuestionTitle: string = '';
  private showQuestionEditor: boolean = false;
  private showComments: boolean = false;
  private newQuestionTopicNames: string[] = [];
  private hintTopicNames: string[] = []; // TODO
  private showConfirmHideQuestionDialog = false;
  private commitQuestionEditIntermediate = false;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;
  private savedNewAnswer: IAnswer | null = null;
  private handlingNewEdit = false;
  private archives: IQuestionArchive[] = [];
  private historyDialog = false;
  private commentSubmitIntermediate = false;
  private savedLocalEdit: LocalEdit | null = null;
  private answers: IAnswer[] = [];
  private answeredBefore: boolean = false;

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  get id() {
    return this.$route.params.id;
  }

  get answerUUID() {
    const aid = this.$route.params.aid;
    if (aid) {
      return aid;
    } else {
      return null;
    }
  }

  get answerCommentId() {
    const acid = this.$route.params.acid;
    if (acid) {
      return acid;
    } else {
      return null;
    }
  }

  get answerSuggestionId() {
    const asid = this.$route.params.asid;
    if (asid) {
      return asid;
    } else {
      return null;
    }
  }

  get questionCommentId() {
    const qcid = this.$route.params.qcid;
    if (qcid) {
      return qcid;
    } else {
      return null;
    }
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'question');
    if (matched && !isEqual(to.params, from.params)) {
      this.showEditor = false;
      this.showQuestionEditor = false;
      this.showComments = false;
      this.answers = [];
      this.showConfirmHideQuestionDialog = false;
      this.savedNewAnswer = null;
      this.archives = [];
      this.questionPage = null;
      this.loadQuestion();
    }
  }

  private async loadQuestion() {
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        const response = await apiQuestion.getQuestionPage(this.token, this.id);
        this.questionPage = response.data;
      },
      errorFilter: (err: AxiosError) => {
        const matched = this.commitErrMsg(err);
        if (matched) {
          this.$router.push('/');
        }
        return matched !== null;
      },
    });

    await dispatchCaptureApiError(this.$store, async () => {
      if (this.questionPage) {
        const question = this.questionPage.question;
        if (this.questionCommentId !== null) {
          this.showComments = true;
        }
        updateHead(this.$route.path, question.title, question.desc?.rendered_text);

        this.newQuestionTitle = question.title;
        this.newQuestionTopicNames = question.topics.map((topic) => topic.name);
        const answers = this.questionPage.full_answers;
        if (this.answerUUID !== null) {
          // TODO: Fix when there is continuation
          if (!answers.find((preview) => preview.uuid === this.answerUUID)) {
            commitAddNotification(this.$store, {
              content: '答案不存在',
              color: 'error',
            });
          }
        }
        if (answers.length === 0 && !this.showQuestionEditor) {
          this.showEditor = true;
        }
        this.answers = answers.sort((a, b) => {
          // First priority
          if (a.uuid === this.answerUUID) {
            return -1;
          }
          if (b.uuid === this.answerUUID) {
            return 1;
          }
          // Second priority
          if (a.author.uuid === this.userProfile?.uuid) {
            return -1;
          }
          if (b.author.uuid === this.userProfile?.uuid) {
            return 1;
          }
          return 1;
        });
        this.answeredBefore =
          answers.filter((a) => a.author.uuid === this.userProfile?.uuid).length > 0;
        if (!this.answeredBefore) {
          this.savedLocalEdit = loadLocalEdit('answer', 'answer-of-' + question.uuid);
        }
      }
    });
  }

  async mounted() {
    try {
      if (localStorage.getItem('new-question')) {
        commitAddNotification(this.$store, {
          content: '点击「编辑」加入更多细节',
          color: 'info',
        });
        localStorage.removeItem('new-question');
      }
    } catch (e) {} // FIXME: is there a better way than just ignoring disabled localStorage?

    await this.loadQuestion();
  }

  private updateOrAddFullyLoadedAnswer(answer: IAnswer) {
    this.$router.go(0);
  }

  private updatedAnswerCallback(event: { answer: IAnswer; isAutoSaved: boolean }) {
    this.handlingNewEdit = true;
    this.savedNewAnswer = event.answer;
    if (!event.isAutoSaved) {
      this.showEditor = false;
      this.updateOrAddFullyLoadedAnswer(event.answer);
    }
    this.handlingNewEdit = false;
  }

  private async submitNewQuestionCommentBody({ body, body_text, editor, mentioned }) {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.questionPage) {
        this.commentSubmitIntermediate = true;
        const response = await apiComment.postComment(this.token, {
          site_uuid: this.question!.site.uuid,
          question_uuid: this.id,
          content: {
            source: body,
            rendered_text: body_text,
            editor,
          },
          mentioned,
        });
        const comment = response.data;
        this.questionPage.question.comments.push(comment);
        this.commentSubmitIntermediate = false;
      }
    });
  }

  private async commitQuestionEdit() {
    this.commitQuestionEditIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const descEditor = this.$refs.descEditor as SimpleEditor;
      if (this.questionPage && (this.newQuestionTitle || descEditor.getContent())) {
        const responses = await Promise.all(
          this.newQuestionTopicNames.map((name) => apiTopic.createTopic(this.token, { name }))
        );
        const topicsUUIDs = responses.map((r) => r.data.uuid);
        let desc: IRichText | null = null;
        const content = descEditor.getContent();
        if (content) {
          desc = {
            source: content,
            rendered_text: descEditor.getTextContent() || undefined,
            editor: descEditor.editor,
          };
        }
        const response = await apiQuestion.updateQuestion(this.token, this.question!.uuid, {
          title: this.newQuestionTitle,
          desc: desc,
          topic_uuids: topicsUUIDs,
        });
        if (response) {
          this.questionPage.question = response.data;
        }
      }
      this.commitQuestionEditIntermediate = false;
      this.showQuestionEditor = false;
    });
  }

  private async cancelSubscription() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.questionPage) {
        this.cancelSubscriptionIntermediate = true;
        this.questionPage.question_subscription = (
          await apiMe.unsubscribeQuestion(this.token, this.question!.uuid)
        ).data;
        this.cancelSubscriptionIntermediate = false;
      }
    });
  }

  private async subscribe() {
    if (!this.userProfile) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.questionPage) {
        this.subscribeIntermediate = true;
        this.questionPage.question_subscription = (
          await apiMe.subscribeQuestion(this.token, this.question!.uuid)
        ).data;
        this.subscribeIntermediate = false;
      }
    });
  }

  private deleteDraft() {
    this.savedLocalEdit = null;
    this.showEditor = false;
  }

  private async showHistoryDialog() {
    if (this.question) {
      this.archives = (await apiQuestion.getQuestionArchives(this.token, this.question.uuid)).data;
      this.archives.unshift({
        id: 0,
        title: this.question.title,
        desc: this.question.desc,
        topics: this.question.topics,
        created_at: this.question.updated_at,
        editor: this.question.editor,
      });
      if (this.archives.length > 0) {
        this.historyDialog = true;
      } else {
        commitAddNotification(this.$store, {
          content: '尚无历史存档',
          color: 'info',
        });
      }
    }
  }

  private cancelHandler() {
    this.showEditor = false;
    if (this.questionPage && this.savedNewAnswer) {
      this.answers.unshift(this.savedNewAnswer);
    }
  }

  private removeAnswer(answerUUID: string) {
    let idx = this.answers.findIndex((answer) => answer.uuid === answerUUID);
    if (idx !== -1) {
      this.answers.splice(idx, 1);
    }
  }

  private deleteHandler(answerUUID: string) {
    this.removeAnswer(answerUUID);
    if (this.answerUUID === answerUUID) {
      this.$router.push(`/questions/${this.question!.uuid}`);
    }
  }

  private async confirmHideQuestion() {
    await dispatchCaptureApiError(this.$store, async () => {
      await apiQuestion.hideQuestion(this.token, this.question!.uuid);
      commitAddNotification(this.$store, {
        content: '已隐藏',
        color: 'info',
      });
      await this.$router.push(`/sites/${this.questionPage!.question.site.subdomain}`);
    });
  }

  private toggleShowComments() {
    if (!this.userProfile && this.question!.comments.length === 0) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    this.showComments = !this.showComments;
  }

  private loadSavedLocalEdit() {
    commitSetWorkingDraft(this.$store, this.savedLocalEdit!.edit as IRichEditorState);
    this.showEditor = true;
  }

  private async cancelQuestionUpdate() {
    this.showQuestionEditor = false;
  }

  private transferToSite: ISite | null = null;
  private transferQuestionDialog: boolean = false;
  private async transferQuestion() {
    if (this.transferToSite) {
        warn("This function is turned off during dev. TODO");
    }
    return null;
  }

  get question() {
    return this.questionPage?.question;
  }

  private answerPreviewOf(uuid: string) {
    return this.questionPage!.answer_previews?.find((a) => a.uuid === uuid);
  }
}
</script>
