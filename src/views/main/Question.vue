<template>
  <v-container fluid>
    <v-progress-linear v-if="question === null" indeterminate />
    <v-row v-else class="px-2" justify="center">
      <v-col
        :class="{
          'col-8': $vuetify.breakpoint.mdAndUp,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !$vuetify.breakpoint.mdAndUp,
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
              <v-chip
                v-for="topic in question.topics"
                :key="topic.uuid"
                :to="'/topics/' + topic.uuid"
                small
              >
                {{ topic.name }}
              </v-chip>
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
        <v-slide-group v-if="!showQuestionEditor" class="d-flex my-1">
          <v-btn
            v-if="currentUserAnswerUUID"
            class="mr-1 slim-btn"
            depressed
            small
            @click="goToCurrentUserAnswer"
          >
            我的回答
          </v-btn>

          <v-btn
            v-else-if="savedLocalEdit"
            class="mr-1 slim-btn"
            color="primary"
            depressed
            small
            @click="loadSavedLocalEdit"
          >
            载入本地草稿
          </v-btn>

          <v-btn
            v-else-if="answerWritable"
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
            <span>该圈子仅会员可以写回答</span>
          </v-tooltip>

          <CommentBtn :count="question.comments.length" class="mr-1" @click="toggleShowComments" />

          <QuestionUpvotes
            :disabled="!userProfile || userProfile.uuid === question.author.uuid"
            :uuid="question.uuid"
            class="mr-1"
          />

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
                  <p v-if="question.description" style="overflow-wrap: anywhere">
                    {{ question.description_text }}
                  </p>
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
              <v-btn v-bind="attrs" v-on="on" class="slim-btn" depressed small>
                <DotsIcon small />
                <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">更多</span>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item v-if="editable" dense @click="showQuestionEditor = true">
                <EditIcon class="mr-1" />
                编辑
              </v-list-item>
              <v-list-item dense @click="showHistoryDialog">
                <HistoryIcon v-if="editable && userProfile" class="mr-1" />
                编辑历史
              </v-list-item>
              <v-list-item
                v-if="questionSubscription && questionSubscription.subscribed_by_me"
                :disabled="cancelSubscriptionIntermediate"
                dense
                @click="cancelSubscription"
              >
                <ToBookmarkIcon class="mr-1" />
                收藏
              </v-list-item>
              <v-list-item v-else :disabled="subscribeIntermediate" dense @click="subscribe">
                <BookmarkedIcon class="mr-1" />
                取消收藏
              </v-list-item>
            </v-list>
          </v-menu>

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
        </v-slide-group>

        <!-- Question editor control -->
        <div v-if="showQuestionEditor && userProfile" class="d-flex">
          <v-btn
            v-show="editable"
            :disabled="commitQuestionEditIntermediate"
            class="ma-1 slim-btn"
            color="primary"
            depressed
            small
            @click="commitQuestionEdit"
            >保存
          </v-btn>
          <v-btn
            v-show="editable"
            class="ma-1 slim-btn"
            depressed
            small
            @click="cancelQuestionUpdate"
            >取消
          </v-btn>
          <v-spacer />

          <v-btn
            v-if="showQuestionEditor & canHide"
            class="ml-2"
            color="warning"
            depressed
            small
            @click="showConfirmHideQuestionDialog = true"
          >
            隐藏问题
          </v-btn>
          <v-dialog v-model="showConfirmHideQuestionDialog" max-width="600">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">确认隐藏问题</div>
              </v-card-title>
              <v-card-text>隐藏后问题将对所有用户不可见。</v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="warning" depressed small @click="confirmHideQuestion"
                  >确认隐藏
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
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
            :writable="commentWritable"
            commentLabel="评论问题"
            @submit-new-comment="submitNewQuestionCommentBody"
          />
        </v-expand-transition>

        <div class="ml-2 text-center">
          <span v-if="showEditor && userProfile" class="text-caption grey--text">编辑答案</span>
          <span
            v-else-if="loadedFullAnswers.length === 0 && answerPreviews.length === 0"
            class="text-caption grey--text"
            >暂无答案</span
          >
        </div>

        <!-- Answer editor -->
        <v-expand-transition v-if="userProfile">
          <AnswerEditor
            v-if="showEditor"
            :inPrivateSite="!question.site.public_readable"
            :questionIdProp="question.uuid"
            class="ma-1"
            @updated-answer="updatedAnswerCallback"
            @cancel-edit="cancelHandler"
            @delete-draft="deleteDraft"
          />
        </v-expand-transition>

        <!-- Answers -->
        <div
          v-for="answer in loadedFullAnswers"
          :key="answer.uuid"
          :class="theme.question.answer.classes"
          class="mb-4"
        >
          <Answer
            :answerPreview="answer"
            :answerProp="answer"
            :loadFull="true"
            :showAuthor="true"
            :showCommentId="answerCommentId"
            :showQuestionInCard="false"
            @delete-answer="deleteHandler"
          />
        </div>

        <div
          v-for="answerPreview in answerPreviews"
          :key="answerPreview.uuid"
          :class="theme.question.answer.classes"
          class="mb-4"
        >
          <Answer
            :answerPreview="answerPreview"
            :loadFull="answerPreviews.indexOf(answerPreview) <= 2"
            :showAuthor="true"
            :showCommentId="answerPreview.uuid === answerUUID ? answerCommentId : undefined"
            :showQuestionInCard="false"
            @load="loadingFullAnswer = false"
            @delete-answer="deleteHandler"
          />
        </div>

        <div v-if="answerPreviews.length && loadingFullAnswer" class="text-center">
          <v-progress-circular color="grey" indeterminate size="20" />
        </div>
      </v-col>

      <v-col
        v-if="$vuetify.breakpoint.mdAndUp"
        :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'"
      >
        <QuestionInfo :question="question" :questionSubscription="questionSubscription" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="bottom-btn">
            <InfoIcon />
            <span class="ml-1 grey--text">问题信息</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <QuestionInfo :question="question" :questionSubscription="questionSubscription" />
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

import {
  commitAddNotification,
  commitSetShowLoginPrompt,
  commitSetWorkingDraft,
} from '@/store/main/mutations';
import { api } from '@/api';

import { readIsLoggedIn, readNarrowUI, readUserMode } from '@/store/main/getters';
import {
  IAnswer,
  IAnswerPreview,
  IQuestion,
  IQuestionArchive,
  IQuestionUpvotes,
  IRichEditorState,
  IRichText,
  IUserQuestionSubscription,
  IUserSiteProfile,
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

@Component({
  components: {
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
  private question: IQuestion | null = null;
  private showEditor: boolean = false;
  private newQuestionTitle: string = '';
  private showQuestionEditor: boolean = false;
  private showComments: boolean = false;
  private userSiteProfile: IUserSiteProfile | null = null;
  private questionSubscription: IUserQuestionSubscription | null = null;
  private newQuestionTopicNames: string[] = [];
  private hintTopicNames: string[] = []; // TODO
  private answerWritable = false;
  private commentWritable = false;
  private answerPreviews: IAnswerPreview[] = [];
  private loadedFullAnswers: IAnswer[] = [];
  private editable = false;
  private canHide = false;
  private showConfirmHideQuestionDialog = false;
  private loadingFullAnswer = true;
  private loading = true;
  private isModerator = false;
  private isShowInHome = false;
  private commitQuestionEditIntermediate = false;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;
  private savedNewAnswer: IAnswer | null = null;
  private handlingNewEdit = false;
  private upvotes: IQuestionUpvotes | null = null;
  private archives: IQuestionArchive[] = [];
  private historyDialog = false;
  private siteProfiles: IUserSiteProfile[] = [];
  private currentUserAnswerUUID: string | null = null;
  private commentSubmitIntermediate = false;
  private savedLocalEdit: LocalEdit | null = null;

  get isUserMode() {
    return readUserMode(this.$store);
  }

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

  get questionCommentId() {
    const qcid = this.$route.params.qcid;
    if (qcid) {
      return qcid;
    } else {
      return null;
    }
  }

  private beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'question');
    if (matched && !isEqual(to.params, from.params)) {
      this.loading = true;
      this.showEditor = false;
      this.showQuestionEditor = false;
      this.showComments = false;
      this.answerWritable = false;
      this.commentWritable = false;
      this.answerPreviews = [];
      this.loadedFullAnswers = [];
      this.editable = false;
      this.canHide = false;
      this.showConfirmHideQuestionDialog = false;
      this.loadingFullAnswer = true;
      this.isModerator = false;
      this.isShowInHome = false;
      this.savedNewAnswer = null;
      this.upvotes = null;
      this.archives = [];
      this.siteProfiles = [];
      this.currentUserAnswerUUID = null;
      this.loadQuestion();
    }
  }

  private async loadQuestion() {
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        const response = await apiQuestion.getQuestion(this.token, this.id, true);
        this.question = response.data;
      },
      errorFilter: (err: AxiosError) => {
        const matched = this.commitErrMsg(err);
        if (matched) {
          this.$router.push('/');
        }
        return matched;
      },
    });

    await dispatchCaptureApiError(this.$store, async () => {
      if (this.question) {
        if (readIsLoggedIn(this.$store)) {
          apiQuestion.bumpViewsCounter(this.token, this.question.uuid);
          this.upvotes = {
            question_uuid: this.question.uuid,
            count: this.question.upvotes_count,
            upvoted: this.question.upvoted,
          };

          if (this.questionCommentId !== null) {
            this.showComments = true;
          }

          this.isShowInHome = this.question.is_placed_at_home;

          updateHead(this.$route.path, this.question.title, this.question.desc?.rendered_text);

          this.newQuestionTitle = this.question.title;
          this.newQuestionTopicNames = this.question.topics.map((topic) => topic.name);
          if (this.userProfile) {
            if (this.userProfile.uuid === this.question.author.uuid) {
              this.editable = true;
              this.canHide = this.question.answers_count === 0;
            }
            const mod = this.question.site.moderator;
            if (mod) {
              this.isModerator = this.userProfile.uuid === mod.uuid;
            }
            if (this.isModerator) {
              this.canHide = this.question.answers_count === 0;
            }
          }
        }
        await dispatchCaptureApiError(this.$store, async () => {
          const answerPreviews = this.question?.answers
            ? this.question?.answers
            : (await api.getQuestionAnswers(this.token, this.question!.uuid)).data;
          if (this.answerUUID !== null) {
            if (!answerPreviews.find((preview) => preview.uuid === this.answerUUID)) {
              commitAddNotification(this.$store, {
                content: '答案不存在',
                color: 'error',
              });
            }
          }
          if (answerPreviews.length === 0 && !this.showQuestionEditor) {
            this.showEditor = true;
          }
          this.answerPreviews = answerPreviews.sort((a, b) => {
            if (a.uuid === this.answerUUID) {
              return -1;
            }
            if (b.uuid === this.answerUUID) {
              return 1;
            }
            if (a.upvotes_count > b.upvotes_count) {
              return -1;
            }
            return 1;
          });
          answerPreviews.forEach((a) => {
            if (a.author.uuid === this.userProfile?.uuid) {
              this.currentUserAnswerUUID = a.uuid;
            }
          });
          if (!this.currentUserAnswerUUID) {
            this.savedLocalEdit = loadLocalEdit('answer', 'answer-of-' + this.question!.uuid);
          }

          if (this.userProfile) {
            const questionSite = this.question!.site;

            this.userSiteProfile = (
              await api.getUserSiteProfile(this.token, questionSite.uuid, this.userProfile.uuid)
            ).data;
            if (this.userSiteProfile) {
              this.editable = true;
            }
            if (this.userSiteProfile !== null || questionSite.public_writable_answer) {
              this.answerWritable = true;
            }
            if (this.userSiteProfile !== null || questionSite.public_writable_comment) {
              this.commentWritable = true;
            }
            this.questionSubscription = (
              await apiMe.getQuestionSubscription(this.token, this.question!.uuid)
            ).data;
          }
        });
      }
    });
  }

  private async mounted() {
    try {
      if (localStorage.getItem('new-question')) {
        commitAddNotification(this.$store, {
          content: '点击「更多」编辑细节',
          color: 'info',
        });
        localStorage.removeItem('new-question');
      }
    } catch (e) {} // FIXME: is there a better way than just ignoring disabled localStorage?

    await this.loadQuestion();
  }

  private updateOrAddFullyLoadedAnswer(answer: IAnswer) {
    const answerUUIDx = this.loadedFullAnswers.findIndex((a) => a.uuid === answer.uuid);
    if (answerUUIDx === -1) {
      this.loadedFullAnswers.unshift(answer);
    } else {
      this.loadedFullAnswers[answerUUIDx] = answer;
    }
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
      if (this.question) {
        this.commentSubmitIntermediate = true;
        const response = await apiComment.postComment(this.token, {
          site_uuid: this.question?.site.uuid,
          question_uuid: this.id,
          content: {
            source: body,
            rendered_text: body_text,
            editor,
          },
          mentioned,
        });
        const comment = response.data;
        this.question.comments.push(comment);
        this.commentSubmitIntermediate = false;
      }
    });
  }

  private async commitQuestionEdit() {
    this.commitQuestionEditIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const descEditor = this.$refs.descEditor as SimpleEditor;
      if (this.question && (this.newQuestionTitle || descEditor.content)) {
        const responses = await Promise.all(
          this.newQuestionTopicNames.map((name) => apiTopic.createTopic(this.token, { name }))
        );
        const topicsUUIDs = responses.map((r) => r.data.uuid);
        let desc: IRichText | undefined = undefined;
        if (descEditor.content) {
          desc = {
            source: descEditor.content,
            rendered_text: descEditor.getTextContent() || undefined,
            editor: descEditor.editor,
          };
        }
        const response = await apiQuestion.updateQuestion(this.token, this.question.uuid, {
          title: this.newQuestionTitle,
          desc: desc,
          topic_uuids: topicsUUIDs,
        });
        if (response) {
          this.question = response.data;
        }
      }
      this.commitQuestionEditIntermediate = false;
      this.showQuestionEditor = false;
    });
  }

  private async cancelSubscription() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.question) {
        this.cancelSubscriptionIntermediate = true;
        this.questionSubscription = (
          await apiMe.unsubscribeQuestion(this.token, this.question.uuid)
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
      if (this.question) {
        this.subscribeIntermediate = true;
        this.questionSubscription = (
          await apiMe.subscribeQuestion(this.token, this.question.uuid)
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
    if (this.question && this.savedNewAnswer) {
      this.loadedFullAnswers.unshift(this.savedNewAnswer);
    }
  }

  private removeAnswer(answerUUID: string) {
    if (this.answerPreviews) {
      let idx = this.loadedFullAnswers.findIndex((answer) => answer.uuid === answerUUID);
      if (idx !== -1) {
        this.loadedFullAnswers.splice(idx, 1);
      }
      idx = this.answerPreviews.findIndex((answer) => answer.uuid === answerUUID);
      if (idx !== -1) {
        this.answerPreviews.splice(idx, 1);
      }
    }
  }

  private deleteHandler(answerUUID: string) {
    this.removeAnswer(answerUUID);
    if (this.answerUUID === answerUUID) {
      this.$router.push(`/questions/${this.question?.uuid}`);
    }
  }

  private async confirmHideQuestion() {
    await dispatchCaptureApiError(this.$store, async () => {
      await apiQuestion.hideQuestion(this.$store.state.main.token, this.question!.uuid);
      commitAddNotification(this.$store, {
        content: '已隐藏',
        color: 'info',
      });
      await this.$router.push(`/sites/${this.question!.site.subdomain}`);
    });
  }

  private async goToCurrentUserAnswer() {
    if (this.currentUserAnswerUUID) {
      await this.$router.replace(
        `/questions/${this.question?.uuid}/answers/${this.currentUserAnswerUUID}`
      );
    }
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
}
</script>
