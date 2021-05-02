<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
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
          <v-chip-group v-if="!showQuestionEditor">
            <v-chip
              v-for="topic in question.topics"
              :key="topic.uuid"
              :to="'/topics/' + topic.uuid"
            >
              {{ topic.name }}
            </v-chip>
          </v-chip-group>
          <v-combobox
            v-if="showQuestionEditor"
            v-model="newQuestionTopicNames"
            :delimiters="[',', '，', '、']"
            :items="hintTopicNames"
            :label="$t('Topics')"
            hide-selected
            multiple
            small-chips
          />

          <!-- Question title display/editor -->
          <div>
            <div v-if="!showQuestionEditor" class="text-h5 mb-2">
              {{ question.title }}
            </div>
            <v-textarea
              v-else
              v-model="newQuestionTitle"
              :label="$t('Title')"
              auto-grow
              dense
              rows="1"
            />
          </div>

          <!-- Question description display/editor -->
          <SimpleViewer
            v-if="!showQuestionEditor && question.description"
            :body="question.description"
            :editor="question.description_editor"
          />
          <div v-else-if="showQuestionEditor">
            <SimpleEditor
              ref="descEditor"
              :initialValue="question.description"
              :placeholder="$t('描述（选填）')"
              :show-menu="true"
              class="mb-2"
            />
          </div>
        </div>

        <!-- Question control -->
        <v-row justify="space-between">
          <v-col v-if="!showQuestionEditor" class="d-flex">
            <v-btn
              v-if="currentUserAnswerUUID"
              class="ma-1 slim-btn"
              depressed
              small
              @click="goToCurrentUserAnswer"
            >
              {{ $t('我的回答') }}
            </v-btn>

            <v-btn
              v-else-if="savedLocalEdit"
              class="ma-1 slim-btn"
              color="primary"
              depressed
              small
              @click="loadSavedLocalEdit"
              >{{ $t('载入本地草稿') }}
            </v-btn>

            <v-btn
              v-else-if="answerWritable"
              class="ma-1 slim-btn"
              color="primary"
              depressed
              small
              @click="showEditor = !showEditor"
              >{{ $t('写回答') }}
            </v-btn>

            <v-tooltip v-else bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  :ripple="false"
                  class="ma-1 slim-btn grey--text"
                  depressed
                  elevation="0"
                  plain
                  small
                >
                  {{ $t('写回答') }}
                </v-btn>
              </template>
              <span>{{ $t('该圈子仅会员可以写回答') }}</span>
            </v-tooltip>

            <v-btn class="ma-1 slim-btn" depressed small @click="toggleShowComments">
              <CommentsIcon class="mr-1" small />
              <span v-if="$vuetify.breakpoint.mdAndUp">
                {{
                  question.comments.length === 0
                    ? $t('评论')
                    : $t('查看n条评论', { amount: question.comments.length })
                }}
              </span>
              <span v-else-if="question.comments.length"> {{ question.comments.length }}</span>
            </v-btn>

            <v-dialog v-model="showCancelUpvoteDialog" max-width="300">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">
                    {{ $t('确定取消标记为好问题？') }}
                  </div>
                </v-card-title>
                <v-card-actions>
                  <v-spacer />
                  <v-btn depressed @click="showCancelUpvoteDialog = false">{{ $t('No') }}</v-btn>
                  <v-btn
                    :disabled="cancelUpvoteIntermediate"
                    color="warning"
                    depressed
                    @click="cancelUpvote"
                  >
                    {{ $t('Yes') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-btn
              v-if="upvotes && upvotes.upvoted"
              class="slim-btn ma-1"
              color="primary lighten-2"
              depressed
              small
              @click="showCancelUpvoteDialog = true"
            >
              <UpvoteIcon />
              <span v-if="$vuetify.breakpoint.mdAndUp">{{ $t('好问题') }}</span>
              ({{ upvotes.count }})
            </v-btn>
            <v-btn
              v-else-if="upvotes"
              :disabled="userProfile.uuid === question.author.uuid || upvoteIntermediate"
              class="slim-btn ma-1"
              color="primary"
              depressed
              small
              @click="upvote"
            >
              <UpvoteIcon />
              <span v-if="$vuetify.breakpoint.mdAndUp">{{ $t('好问题') }}</span>
              ({{ upvotes.count }})
            </v-btn>

            <v-btn
              class="slim-btn ma-1"
              depressed
              small
              :color="showUpdateDetailsButton ? 'primary' : undefined"
              @click="showQuestionEditor = true"
              v-show="editable"
            >
              <EditIcon />
              <span v-if="showUpdateDetailsButton">{{ $t('添加细节') }}</span>
              <span v-else>{{ $t('编辑问题') }}</span>
            </v-btn>

            <BookmarkedIcon
              v-if="questionSubscription && questionSubscription.subscribed_by_me"
              :disabled="cancelSubscriptionIntermediate"
              class="ma-1"
              @click="cancelSubscription"
            />
            <ToBookmarkIcon
              v-else
              :disabled="subscribeIntermediate"
              class="ma-1"
              @click="subscribe"
            />

            <ShareCardButton :link="`/questions/${question.uuid}`" v-slot="{ shareQrCodeUrl }">
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
                      <span class="text-caption">
                        {{ $t('n条评论', { n: question.comments.length }) }}
                      </span>
                    </p>
                    <p>
                      <AnswerIcon class="mr-1" small />
                      <span class="text-caption">
                        {{ $t('n个回答', { n: question.answers_count }) }}
                      </span>
                    </p>
                  </div>
                  <v-spacer />
                  <div class="pa-1 text-center" style="float: right">
                    <v-img :src="shareQrCodeUrl" v-if="shareQrCodeUrl" max-width="100" />
                    <span class="text-caption">查看原问题</span>
                  </div>
                </div>
              </v-card-text>
            </ShareCardButton>
          </v-col>

          <v-col
            v-if="!showQuestionEditor"
            :class="{
              'col-12': !$vuetify.breakpoint.mdAndUp,
              'less-top-padding': !$vuetify.breakpoint.mdAndUp,
            }"
            align-self="center"
            class="d-flex"
          >
            <v-spacer />
            <SiteBtn :site="question.site" class="elevation-0" />
            <HistoryIcon v-if="editable && userProfile" @click="showHistoryDialog" />
          </v-col>

          <v-col v-if="showQuestionEditor && userProfile" class="d-flex">
            <v-btn
              v-show="editable"
              :disabled="commitQuestionEditIntermediate"
              class="ma-1 slim-btn"
              color="primary"
              depressed
              small
              @click="commitQuestionEdit"
              >{{ $t('更新问题描述') }}
            </v-btn>
            <v-btn
              v-show="editable"
              class="ma-1 slim-btn"
              color="warning"
              depressed
              small
              @click="showQuestionEditor = false"
              >{{ $t('取消更新') }}
            </v-btn>
            <v-spacer />
            <v-btn v-if="showQuestionEditor" depressed small @click="prepareShowMoveQuestionDialog">
              {{ $t('转移问题') }}
            </v-btn>
            <v-dialog v-model="showMoveQuestionDialog" max-width="600">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">{{ $t('转移问题') }}</div>
                </v-card-title>
                <v-card-text>
                  <span>{{ $t('现问题所属圈子') }}: {{ question.site.name }}</span>
                  <v-select
                    v-model="newQuestionSite"
                    :items="siteProfiles"
                    :label="$t('新的圈子')"
                    item-text="site.name"
                    item-value="site"
                  />
                </v-card-text>
                <v-card-actions>
                  <span>{{ $t('没有权限？联系管理员帮助转移') }}</span>
                  <v-spacer />
                  <v-btn color="warning" depressed small @click="confirmMoveQuestion"
                    >{{ $t('确认转移') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-btn
              v-if="showQuestionEditor & canHide"
              class="ml-2"
              color="warning"
              depressed
              small
              @click="showConfirmHideQuestionDialog = true"
            >
              {{ $t('隐藏问题') }}
            </v-btn>
            <v-dialog v-model="showConfirmHideQuestionDialog" max-width="600">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">
                    {{ $t('确认隐藏问题？') }}
                  </div>
                </v-card-title>
                <v-card-text> 隐藏后问题将对所有用户不可见。</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="warning" depressed small @click="confirmHideQuestion"
                    >{{ $t('确认隐藏') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
          <v-dialog v-model="historyDialog" max-width="900">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">{{ $t('问题历史') }}</div>
                <v-spacer></v-spacer>
                <span class="text-caption grey--text">{{ $t('点击展开') }}</span>
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
                    <SimpleViewer :body="archive.description" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-dialog>
        </v-row>

        <div class="d-flex justify-end">
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
          <span v-if="showEditor && userProfile" class="text-caption grey--text">{{
            $t('编辑答案')
          }}</span>
          <span
            v-else-if="loadedFullAnswers.length === 0 && answerPreviews.length === 0"
            class="text-caption grey--text"
            >{{ $t('暂无答案') }}</span
          >
        </div>

        <!-- Answer editor -->
        <v-expand-transition v-if="userProfile">
          <AnswerEditor
            :questionIdProp="question.uuid"
            v-if="showEditor"
            :inPrivateSite="!question.site.public_readable"
            class="ma-1"
            @updated-answer="updatedAnswerCallback"
            @cancel-edit="cancelHandler"
            @delete-draft="deleteDraft"
          />
        </v-expand-transition>

        <!-- Answers -->
        <div v-if="loadingFullAnswer" class="text-center">
          <v-progress-circular indeterminate size="30" />
        </div>
        <Answer
          v-for="answer in loadedFullAnswers"
          :key="answer.uuid"
          :answerPreview="answer"
          :answerProp="answer"
          :loadFull="true"
          :showAuthor="true"
          :showCommentId="answerCommentId"
          :showQuestionInCard="false"
          class="mb-4"
          @delete-answer="deleteHandler"
        />
        <Answer
          v-for="answerPreview in answerPreviews"
          :key="answerPreview.uuid"
          :answerPreview="answerPreview"
          :loadFull="answerPreviews.indexOf(answerPreview) <= 2"
          :showAuthor="true"
          :showCommentId="answerPreview.uuid === answerUUID ? answerCommentId : undefined"
          :showQuestionInCard="false"
          class="mb-4"
          @load="loadingFullAnswer = false"
          @delete-answer="deleteHandler"
        />
      </v-col>

      <v-col
        v-if="$vuetify.breakpoint.mdAndUp"
        :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'"
      >
        <QuestionInfo :question="question" :questionSubscription="questionSubscription" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" bottom fab fixed right>
            <InfoIcon />
          </v-btn>
        </template>
        <v-sheet class="pa-2">
          <QuestionInfo :question="question" :questionSubscription="questionSubscription" />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

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
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';

import {
  commitAddNotification,
  commitSetShowLoginPrompt,
  commitSetWorkingDraft,
} from '@/store/main/mutations';
import { api } from '@/api';

import {
  readIsLoggedIn,
  readNarrowUI,
  readToken,
  readUserMode,
  readUserProfile,
} from '@/store/main/getters';
import {
  IAnswer,
  IAnswerPreview,
  IQuestion,
  IQuestionArchive,
  IQuestionUpvotes,
  IRichEditorState,
  ISite,
  IUserQuestionSubscription,
  IUserSiteProfile,
} from '@/interfaces';
import SimpleViewer from '@/components/SimpleViewer.vue';
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
import { isEqual, updateHead } from '@/common';
import { loadLocalEdit, LocalEdit } from '@/utils';
import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';

@Component({
  components: {
    ShareCardButton,
    AnswerIcon,
    Answer,
    QuestionInfo,
    CommentBlock,
    UserLink,
    EditIcon,
    UpvoteIcon,
    SiteBtn,
    ReactionBlock,
    BookmarkedIcon,
    ToBookmarkIcon,
    HistoryIcon,
    InfoIcon,
    CommentsIcon,
    SimpleViewer,
    SimpleEditor,
  },
})
export default class Question extends Vue {
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
  private loadingProgress = 0;
  private loading = true;
  private isModerator = false;
  private isShowInHome = false;
  private commitQuestionEditIntermediate = false;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;
  private showMoveQuestionDialog = false;
  private savedNewAnswer: IAnswer | null = null;
  private handlingNewEdit = false;
  private showCancelUpvoteDialog: boolean = false;
  private upvoteIntermediate: boolean = false;
  private cancelUpvoteIntermediate = false;
  private upvotes: IQuestionUpvotes | null = null;
  private archives: IQuestionArchive[] = [];
  private historyDialog = false;
  private siteProfiles: IUserSiteProfile[] = [];
  private newQuestionSite: ISite | null = null;
  private currentUserAnswerUUID: string | null = null;
  private commentSubmitIntermediate = false;
  private showUpdateDetailsButton = false;
  private savedLocalEdit: LocalEdit | null = null;

  get userProfile() {
    return readUserProfile(this.$store);
  }

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

  get token() {
    return readToken(this.$store);
  }

  private beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'question');
    if (matched && !isEqual(to.params, from.params)) {
      this.loading = true;
      this.loadingProgress = 0;
      this.showEditor = false;
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
      this.showUpdateDetailsButton = false;
      this.loadQuestion();
    }
  }

  private async loadQuestion() {
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        const response = await apiQuestion.getQuestion(this.token, this.id);
        this.question = response.data;
      },
      errorFilter: (err: AxiosError) => {
        if (
          err.response &&
          err.response.data.detail === "The question doesn't exists in the system."
        ) {
          commitAddNotification(this.$store, {
            content: this.$t('问题不存在，返回主页').toString(),
            color: 'error',
          });
          this.$router.push('/');
          return true;
        }
        return false;
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

          updateHead(this.$route.path, this.question.title, this.question.description_text);

          this.loadingProgress = 33;

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
          const answerPreviews = (await api.getQuestionAnswers(this.token, this.question!.uuid))
            .data;
          if (this.answerUUID !== null) {
            if (!answerPreviews.find((preview) => preview.uuid === this.answerUUID)) {
              commitAddNotification(this.$store, {
                content: this.$t('答案不存在').toString(),
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
          this.loadingProgress = 66;

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

          this.loadingProgress = 100;
          this.loading = false;
        });
      }
    });
  }

  private async mounted() {
    try {
      if (localStorage.getItem('new-question')) {
        this.showUpdateDetailsButton = true;
        localStorage.removeItem('new-question');
      }
    } catch (e) {} // FIXME: is there a better way than just ignoring disabled localStorage?

    this.loadQuestion();
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

  private async submitNewQuestionCommentBody({ body, body_text, editor }) {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.question) {
        this.commentSubmitIntermediate = true;
        const response = await apiComment.postComment(this.token, {
          site_uuid: this.question?.site.uuid,
          question_uuid: this.id,
          body,
          body_text,
          editor,
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
      if (this.question && descEditor.content) {
        const responses = await Promise.all(
          this.newQuestionTopicNames.map((name) => apiTopic.createTopic(this.token, { name }))
        );
        const topicsUUIDs = responses.map((r) => r.data.uuid);
        const response = await apiQuestion.updateQuestion(this.token, this.question.uuid, {
          title: this.newQuestionTitle,
          description: descEditor.content,
          description_text: descEditor.getTextContent() || undefined,
          description_editor: descEditor.editor,
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
        const r = await apiMe.unsubscribeQuestion(this.token, this.question.uuid);
        this.questionSubscription = r.data;
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
        const r = await apiMe.subscribeQuestion(this.token, this.question.uuid);
        this.questionSubscription = r.data;
        this.subscribeIntermediate = false;
      }
    });
  }

  private async upvote() {
    this.upvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.question) {
        this.upvotes = (await apiQuestion.upvoteQuestion(this.token, this.question.uuid)).data;
        this.upvoteIntermediate = false;
      }
    });
  }

  private async cancelUpvote() {
    this.cancelUpvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.question) {
        this.upvotes = (
          await apiQuestion.cancelUpvoteQuestion(this.token, this.question.uuid)
        ).data;
        this.cancelUpvoteIntermediate = false;
        this.showCancelUpvoteDialog = false;
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
        description: this.question.description,
        topics: this.question.topics,
        created_at: this.question.updated_at,
        editor: this.question.editor,
      });
      if (this.archives.length > 0) {
        this.historyDialog = true;
      } else {
        commitAddNotification(this.$store, {
          content: this.$t('尚无历史存档').toString(),
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

  private async prepareShowMoveQuestionDialog() {
    this.siteProfiles = (await apiMe.getUserSiteProfiles(this.token)).data;
    this.showMoveQuestionDialog = true;
  }

  private async confirmMoveQuestion() {
    if (this.question) {
      if (!this.newQuestionSite) {
        commitAddNotification(this.$store, {
          content: this.$t('未选择新的圈子').toString(),
          color: 'info',
        });
      }
      if (this.question.site.uuid === this.newQuestionSite?.uuid) {
        commitAddNotification(this.$store, {
          content: this.$t('没有变化').toString(),
          color: 'info',
        });
      }
      await dispatchCaptureApiError(this.$store, async () => {
        this.question = (
          await apiQuestion.moveQuestion(
            this.$store.state.main.token,
            this.question!.uuid,
            this.newQuestionSite!.uuid
          )
        ).data;
        commitAddNotification(this.$store, {
          content: this.$t('转移成功').toString(),
          color: 'success',
        });
        this.showMoveQuestionDialog = false;
        this.showQuestionEditor = false;
      });
    }
  }

  private async confirmHideQuestion() {
    await dispatchCaptureApiError(this.$store, async () => {
      await apiQuestion.hideQuestion(this.$store.state.main.token, this.question!.uuid);
      commitAddNotification(this.$store, {
        content: this.$t('已隐藏').toString(),
        color: 'info',
      });
      this.$router.push(`/sites/${this.question!.site.subdomain}`);
    });
  }

  private async goToCurrentUserAnswer() {
    if (this.currentUserAnswerUUID) {
      this.$router.replace(
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
}
</script>

<style scoped>
.slim-btn {
  padding: 0 4px !important;
}

.less-top-padding {
  padding-top: 0 !important;
}

.less-left-right-padding {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

/* FIXME: Potential code duplication with Home.vue */
.fixed-narrow-col {
  max-width: 800px;
}

.fixed-narrow-sidecol {
  max-width: 400px;
}
</style>
