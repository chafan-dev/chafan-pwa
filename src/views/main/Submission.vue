<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
    <v-row v-else justify="center">
      <v-col
        :class="{ 'col-8': $vuetify.breakpoint.mdAndUp, 'fixed-narrow-col': isNarrowFeedUI }"
        fluid
      >
        <ValidationObserver v-slot="{ handleSubmit }">
          <div class="d-flex justify-space-between">
            <UserLink :show-avatar="true" :userPreview="submission.author" />
            <SiteBtn :site="submission.site" class="elevation-0" />
          </div>

          <!-- Submission info/editor -->
          <div>
            <!-- Submission topics display/editor -->
            <v-chip-group v-if="!showSubmissionEditor">
              <v-chip
                v-for="topic in submission.topics"
                :key="topic.uuid"
                :to="'/topics/' + topic.uuid"
                small
              >
                {{ topic.name }}
              </v-chip>
            </v-chip-group>
            <v-combobox
              v-if="showSubmissionEditor"
              v-model="newSubmissionTopicNames"
              :delimiters="[',', '，', '、']"
              :items="hintTopicNames"
              hide-selected
              label="话题"
              multiple
              small-chips
            />

            <!-- Submission title display/editor -->
            <div class="pt-1">
              <div v-if="!showSubmissionEditor" class="text-h5 mb-2">
                {{ submission.title }}
              </div>
              <v-textarea
                v-else
                v-model="newSubmissionTitle"
                label="标题"
                auto-grow
                dense
                rows="1"
              />
            </div>

            <!-- Submission URL display -->
            <div v-if="submission.url">
              <LinkIcon />
              源链接：
              <a :href="submission.url" class="text-decoration-none" target="_blank">
                {{ submission.url }}
              </a>
            </div>

            <!-- Submission description display/editor -->
            <Viewer v-if="!showSubmissionEditor && submission.desc" :content="submission.desc" />
            <div v-else-if="showSubmissionEditor">
              <SimpleEditor
                ref="descEditor"
                :editorProp="submission.desc ? submission.desc.editor : 'tiptap'"
                :initialValue="submission.desc ? submission.desc.source : ''"
                class="my-2"
                placeholder="描述（选填）"
              />
            </div>
            <div
              v-if="submission.contributors.length && !showSubmissionEditor"
              class="d-flex justify-end"
            >
              <span class="text-caption grey--text">
                编辑贡献者:
                <template v-for="(contributor, idx) in submission.contributors">
                  <span v-if="idx" :key="idx">, </span>
                  <UserLink :key="idx" :show-avatar="false" :user-preview="contributor" />
                </template>
              </span>
            </div>

            <div class="d-flex">
              <v-spacer />
              <span class="grey--text caption"
                >上次编辑：{{ $dayjs.utc(submission.updated_at).local().fromNow() }}</span
              >
            </div>

            <!-- Suggestion comment -->
            <div v-if="suggestionEditable && showSubmissionEditor">
              <v-text-field v-model="newSuggestionCommment" clearable label="附言（可选）" />
            </div>
          </div>

          <v-dialog v-model="historyDialog" max-width="900">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">分享历史</div>
                <v-spacer />
                <span class="text-caption grey--text">点击展开</span>
              </v-card-title>
              <v-expansion-panels>
                <v-expansion-panel v-for="archive in archives" :key="archive.id">
                  <v-expansion-panel-header>
                    {{ $dayjs.utc(archive.created_at).local().fromNow() }}
                    <v-spacer />
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div class="headline primary--text">
                      {{ archive.title }}
                    </div>
                    <Viewer v-if="archive.desc" :content="archive.desc" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-dialog>

          <div v-if="!showSubmissionEditor" class="d-flex py-2">
            <Upvote
              class="mr-1"
              v-if="upvotes"
              :disabled="!userProfile || userProfile.uuid === submission.author.uuid"
              :on-cancel-vote="cancelUpvote"
              :on-vote="upvote"
              :upvoted="upvotes.upvoted"
              :upvotes-count="upvotes.count"
            />

            <v-btn
              v-if="editable"
              @click="showSubmissionEditor = true"
              class="slim-btn mr-1"
              depressed
              small
            >
              <EditIcon />
              <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">编辑</span>
            </v-btn>

            <ShareCardButton
              v-slot="{ shareQrCodeUrl }"
              :link="`/submissions/${submission.uuid}`"
              :link-text="submission.title"
              class="text-decoration-none mr-1"
            >
              <v-card-title>
                {{ submission.title }}
              </v-card-title>
              <v-card-text>
                <div class="pt-2 d-flex">
                  <div class="text--primary text-body-1">
                    <Viewer v-if="submission.desc" :content="submission.desc" />
                    <p>
                      <CommentsIcon class="mr-1" small />
                      <span class="text-caption"> {{ submission.comments.length }}条评论 </span>
                    </p>
                  </div>
                  <v-spacer />
                  <div class="pa-1 text-center" style="float: right">
                    <v-img v-if="shareQrCodeUrl" :src="shareQrCodeUrl" max-width="100" />
                    <span class="text-caption">查看原文</span>
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
                <v-list-item v-if="suggestionEditable" @click="showSubmissionEditor = true">
                  <EditIcon class="mr-1" />
                  提交编辑建议
                </v-list-item>

                <v-list-item dense @click="showHistoryDialog">
                  <HistoryIcon class="mr-1" />
                  查看编辑历史
                </v-list-item>

                <v-list-item
                  v-if="submissionSubscription && submissionSubscription.subscribed_by_me"
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

                <v-list-item
                  v-if="editable && canHide"
                  @click="showConfirmHideSubmissionDialog = true"
                >
                  <DeleteIcon class="mr-1" />
                  隐藏分享
                </v-list-item>
              </v-list>
            </v-menu>

            <v-dialog v-model="showConfirmHideSubmissionDialog" max-width="600">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">确认隐藏分享？</div>
                </v-card-title>
                <v-card-text>隐藏后分享将对所有用户不可见。</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="warning" depressed mr-1 small @click="confirmHideSubmission">
                    确认隐藏
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
          <div v-if="showSubmissionEditor" class="d-flex pt-2">
            <v-btn
              :disabled="commitSubmissionEditIntermediate"
              class="mr-1"
              color="primary"
              depressed
              small
              @click="handleSubmit(commitSubmissionEdit)"
            >
              <template v-if="editable">保存</template>
              <template v-else>提交建议</template>
            </v-btn>
            <v-btn class="mr-1" depressed small @click="cancelSubmissionUpdate">取消</v-btn>
            <v-spacer />
          </div>
          <div class="d-flex justify-end">
            <ReactionBlock :objectId="submission.uuid" objectType="submission" />
          </div>

          <!-- Comments -->
          <CommentBlock
            :commentSubmitIntermediate="commentSubmitIntermediate"
            :comments="comments"
            :show-title="true"
            :siteId="submission.site ? submission.site.uuid : undefined"
            :writable="commentWritable"
            commentLabel="评论"
            @submit-new-comment="submitNewSubmissionCommentBody"
          />

          <!-- Suggestions -->
          <v-expansion-panels v-if="submission" class="mt-2">
            <v-expansion-panel v-for="suggestion in submissionSuggestions" :key="suggestion.uuid">
              <v-expansion-panel-header
                :class="{
                  'grey--text': suggestion.status !== 'pending',
                  'primary--text': suggestion.uuid === submissionSuggestionUUID,
                }"
              >
                <span>
                  <UserLink :show-avatar="true" :user-preview="suggestion.author" /> 的建议编辑：
                  <template v-if="suggestion.status === 'pending'">
                    待处理（{{ $dayjs.utc(suggestion.created_at).local().fromNow() }}）
                  </template>
                  <template v-if="suggestion.status === 'accepted'">
                    已接受（{{ $dayjs.utc(suggestion.accepted_at).local().fromNow() }}）
                  </template>
                  <template v-if="suggestion.status === 'rejected'">
                    已拒绝（{{ $dayjs.utc(suggestion.rejected_at).local().fromNow() }}）
                  </template>
                  <template v-if="suggestion.status === 'retracted'">
                    已撤回（{{ $dayjs.utc(suggestion.retracted_at).local().fromNow() }}）
                  </template>
                </span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="suggestion.comment">
                  <span class="font-weight-bold">附言：</span>{{ suggestion.comment }}
                </div>
                <template v-if="suggestion.status === 'accepted' && suggestion.accepted_diff_base">
                  <div
                    v-if="
                      suggestion.accepted_diff_base.title !== suggestion.title && suggestion.title
                    "
                  >
                    <span class="font-weight-bold">标题改动：</span>
                    <Diff :s1="suggestion.accepted_diff_base.title" :s2="suggestion.title" />
                  </div>
                  <div
                    v-if="
                      suggestion.desc &&
                      (!suggestion.accepted_diff_base.desc ||
                        suggestion.accepted_diff_base.desc.source !== suggestion.desc.source)
                    "
                  >
                    <span class="font-weight-bold">描述改动：</span>
                    <Diff
                      :s1="
                        suggestion.accepted_diff_base.desc
                          ? suggestion.accepted_diff_base.desc.rendered_text
                          : ''
                      "
                      :s2="suggestion.desc.rendered_text"
                    />
                  </div>
                </template>
                <template v-else-if="suggestion.status !== 'accepted'">
                  <div v-if="submission.title !== suggestion.title && suggestion.title">
                    <span class="font-weight-bold">标题改动：</span>
                    <Diff :s1="submission.title" :s2="suggestion.title" />
                  </div>
                  <div
                    v-if="
                      suggestion.desc &&
                      (!submission.desc || submission.desc.source !== suggestion.desc.source)
                    "
                  >
                    <span class="font-weight-bold">描述改动：</span>
                    <Diff
                      :s1="submission.desc ? submission.desc.rendered_text : ''"
                      :s2="suggestion.desc.rendered_text"
                    />
                  </div>
                  <div v-if="suggestion.topics">
                    <!-- FIXME: the topics of stored accepted diff base is not processed properly -->
                    <span class="font-weight-bold">话题改动：</span>
                    <Diff
                      v-if="suggestion.topics"
                      :s1="topicNames(submission.topics)"
                      :s2="topicNames(suggestion.topics)"
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
                    <template v-if="userProfile.uuid === submission.author.uuid">
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
                    <template v-if="userProfile.uuid === submission.author.uuid">
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
              <v-chip-group v-if="previewedSuggestion.topics" class="px-5">
                <v-chip
                  v-for="topic in previewedSuggestion.topics"
                  :key="topic.uuid"
                  :to="'/topics/' + topic.uuid"
                  small
                >
                  {{ topic.name }}
                </v-chip>
              </v-chip-group>
              <v-card-title>{{ previewedSuggestion.title }}</v-card-title>
              <v-card-text>
                <Viewer v-if="previewedSuggestion.desc" :content="previewedSuggestion.desc" />
              </v-card-text>
            </v-card>
          </v-dialog>

          <div v-if="!userProfile" class="mt-2 text-center">登录后参与讨论</div>
          <div>
            <div class="text-center">
              <span
                class="grey--text text-caption"
                style="cursor: pointer"
                @click="showHelp = !showHelp"
              >
                帮助文档：什么是分享?
              </span>
            </div>
            <v-expand-transition>
              <div v-show="showHelp">
                <ul>
                  <li>
                    分享需要填写一个标题，并可以选择添加一个外部链接和细节描述。描述和标题请尽量与来源和客观信息保持一致，你的主观想法可以更多放在评论区。
                  </li>
                  <li>分享的内容要和圈子的内容主题要求一致。</li>
                  <li>
                    分享的核心是默认展开的评论区，在这里你可以不用像写答案一样长篇大论，而是添加一些简短的想法。
                  </li>
                  <li>你的分享动态会推送到你的关注者的时间线上。</li>
                  <li>你的分享有新评论时目前<b>不会推送通知给提交者</b>以减少噪音。</li>
                  <li>
                    每个圈子有自己的分享榜单，榜单的排序方式既考虑提交的时间，也考虑「赞」的数量。同时，每个分享下的评论也会按「赞」数排序。
                  </li>
                  <li>首页也有一个将你所加入的所有圈子的分享榜单聚合在一起的个性化分享榜单</li>
                </ul>
              </div>
            </v-expand-transition>
          </div>
        </ValidationObserver>
        <template v-if="relatedSubmissions && relatedSubmissions.length">
          <v-divider class="my-2" />
          <RotationList v-slot="{ item }" :items="relatedSubmissions" title="相关分享">
            <router-link :to="'/submissions/' + item.uuid" class="text-decoration-none">
              {{ item.title }}
            </router-link>
          </RotationList>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Answer from '@/components/Answer.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import ReactionBlock from '@/components/ReactionBlock.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';

import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { api } from '@/api';
import { readNarrowUI, readToken, readUserMode, readUserProfile } from '@/store/main/getters';
import {
  IComment,
  IRichText,
  ISubmission,
  ISubmissionArchive,
  ISubmissionSuggestion,
  ISubmissionUpvotes,
  ITopic,
  IUserSubmissionSubscription,
} from '@/interfaces';
import Viewer from '@/components/Viewer.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';
import { apiMe } from '@/api/me';
import MoreIcon from '@/components/icons/MoreIcon.vue';
import { Route, RouteRecord } from 'vue-router';
import { doNothing, isEqual, updateHead } from '@/common';
import { apiSearch } from '@/api/search';
import RotationList from '@/components/base/RotationList.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';
import Upvote from '@/components/Upvote.vue';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import Diff from '@/components/widgets/Diff.vue';

@Component({
  components: {
    Diff,
    DeleteIcon,
    DotsIcon,
    Upvote,
    UpvotedBtn,
    UpvoteBtn,
    ShareCardButton,
    RotationList,
    MoreIcon,
    Answer,
    SubmissionPreview,
    CommentBlock,
    UserLink,
    EditIcon,
    UpvoteIcon,
    LinkIcon,
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
export default class Submission extends Vue {
  private showHelp: boolean = false;
  private submission: ISubmission | null = null;
  private newSubmissionTitle: string = '';
  private newSubmissionUrl: string | undefined = undefined;
  private showSubmissionEditor: boolean = false;
  private newSubmissionTopicNames: string[] = [];
  private hintTopicNames: string[] = []; // TODO
  private commentWritable = false;
  private editable = false;
  private canHide = false;
  private showConfirmHideSubmissionDialog = false;
  private loadingProgress = 0;
  private loading = true;
  private isModerator = false;
  private commitSubmissionEditIntermediate = false;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;
  private showCancelUpvoteDialog: boolean = false;
  private upvoteIntermediate: boolean = false;
  private cancelUpvoteIntermediate = false;
  private upvotes: ISubmissionUpvotes | null = null;
  private archives: ISubmissionArchive[] = [];
  private historyDialog = false;
  private comments: IComment[] = [];
  private commentSubmitIntermediate = false;
  private submissionSubscription: IUserSubmissionSubscription | null = null;
  private relatedSubmissions: ISubmission[] | null = null;
  private submissionSuggestions: ISubmissionSuggestion[] = [];
  private newSuggestionCommment: string | null = null;
  private previewedSuggestion: ISubmissionSuggestion | null = null;
  private showSuggestionPreviewDialog = false;

  get suggestionEditable() {
    return !this.editable && this.userProfile;
  }

  get isUserMode() {
    return readUserMode(this.$store);
  }

  get id() {
    return this.$route.params.id;
  }

  get submissionSuggestionUUID() {
    return this.$route.params.submission_suggestion_id;
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get token() {
    return readToken(this.$store);
  }

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'submission');
    if (matched && !isEqual(to.params, from.params)) {
      this.loading = true;
      this.loadingProgress = 0;
      this.showHelp = false;
      this.showSubmissionEditor = false;
      this.commentWritable = false;
      this.editable = false;
      this.canHide = false;
      this.isModerator = false;
      this.upvotes = null;
      this.archives = [];
      this.comments = [];
      this.relatedSubmissions = [];
      this.submissionSuggestions = [];
      this.load();
    }
  }

  async mounted() {
    try {
      if (localStorage.getItem('new-submission')) {
        commitAddNotification(this.$store, {
          content: '点击「更多」编辑细节',
          color: 'info',
        });
        localStorage.removeItem('new-submission');
      }
    } catch (e) {}
    await this.load();
  }

  private async load() {
    try {
      const response = await apiSubmission.getSubmission(this.token, this.id);
      this.submission = response.data;
      updateHead(this.$route.path, this.submission!.title, this.submission?.desc?.rendered_text);
      if (this.token) {
        this.submissionSubscription = (
          await apiMe.getSubmissionSubscription(this.token, this.submission!.uuid)
        ).data;
        this.submissionSuggestions = (
          await apiSubmission.getSuggestions(this.token, this.submission!.uuid)
        ).data;
      }
    } catch (err) {
      commitAddNotification(this.$store, {
        content: '分享不存在，返回主页',
        color: 'error',
      });
      await this.$router.push('/');
    }

    await dispatchCaptureApiError(this.$store, async () => {
      if (this.submission) {
        this.comments = this.submission.comments;

        if (this.token) {
          apiSubmission.bumpViewsCounter(this.token, this.submission.uuid).then(doNothing);
        }
        this.upvotes = (
          await apiSubmission.getSubmissionUpvotes(this.token, this.submission.uuid)
        ).data;
        this.loadingProgress = 33;

        this.newSubmissionTitle = this.submission.title;
        this.newSubmissionUrl = this.submission.url;
        this.newSubmissionTopicNames = this.submission.topics.map((topic) => topic.name);
        if (this.userProfile) {
          if (this.userProfile.uuid === this.submission.author.uuid) {
            this.editable = true;
            this.canHide = true;
          }
          const mod = this.submission.site.moderator;
          if (mod) {
            this.isModerator = this.userProfile.uuid === mod.uuid;
          }
          if (this.isModerator) {
            this.canHide = true;
          }
          await dispatchCaptureApiError(this.$store, async () => {
            const submissionSite = this.submission!.site;

            if (this.userProfile) {
              const userSiteProfile = (
                await api.getUserSiteProfile(this.token, submissionSite.uuid, this.userProfile.uuid)
              ).data;
              if (userSiteProfile !== null || submissionSite.public_writable_comment) {
                this.commentWritable = true;
              }
            }
          });
        }
        this.loadingProgress = 100;
        this.loading = false;

        if (this.submission.keywords && this.userProfile) {
          this.relatedSubmissions = (
            await apiSearch.searchSubmissions(
              this.$store.state.main.token,
              this.submission.keywords.join(' ')
            )
          ).data;
          const i = this.relatedSubmissions?.findIndex((submission) => {
            return submission.uuid === this.submission!.uuid;
          });
          if (i >= 0) {
            this.relatedSubmissions.splice(i, 1);
          }
        }
      }
    });
  }

  private async submitNewSubmissionCommentBody({ body, body_text, editor, mentioned }) {
    await dispatchCaptureApiError(this.$store, async () => {
      this.commentSubmitIntermediate = true;
      if (this.submission) {
        const response = await apiComment.postComment(this.token, {
          site_uuid: this.submission?.site.uuid,
          submission_uuid: this.id,
          content: {
            source: body,
            rendered_text: body_text,
            editor,
          },
          mentioned,
        });
        const comment = response.data;
        this.comments.push(comment);
      }
      this.commentSubmitIntermediate = false;
    });
  }

  private async commitSubmissionEdit() {
    this.commitSubmissionEditIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      const descEditor = this.$refs.descEditor as SimpleEditor;
      if ((descEditor.content || this.newSubmissionTitle) && this.submission) {
        const responses = await Promise.all(
          this.newSubmissionTopicNames.map((name) => apiTopic.createTopic(this.token, { name }))
        );
        const topicsUUIDs = responses.map((r) => r.data.uuid);
        const desc: IRichText = {
          source: descEditor.content || '',
          rendered_text: descEditor.getTextContent() || undefined,
          editor: descEditor.editor,
        };
        const payload: any = {
          title: this.newSubmissionTitle,
          desc: desc,
          topic_uuids: topicsUUIDs,
        };
        if (this.editable) {
          this.submission = (
            await apiSubmission.updateSubmission(this.token, this.submission.uuid, payload)
          ).data;
        } else if (this.suggestionEditable) {
          payload.submission_uuid = this.submission.uuid;
          if (this.newSuggestionCommment) {
            payload.comment = this.newSuggestionCommment;
          }
          const submissionSuggestion = (await apiSubmission.createSuggestion(this.token, payload))
            .data;
          this.submissionSuggestions.splice(0, 0, submissionSuggestion);
        }
      }
      this.showSubmissionEditor = false;
      this.commitSubmissionEditIntermediate = false;
    });
  }

  private async upvote() {
    this.upvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.submission) {
        this.upvotes = (
          await apiSubmission.upvoteSubmission(this.token, this.submission.uuid)
        ).data;
        this.upvoteIntermediate = false;
      }
    });
  }

  private async cancelUpvote() {
    this.cancelUpvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.submission) {
        this.upvotes = (
          await apiSubmission.cancelUpvoteSubmission(this.token, this.submission.uuid)
        ).data;
        this.cancelUpvoteIntermediate = false;
        this.showCancelUpvoteDialog = false;
      }
    });
  }

  private async showHistoryDialog() {
    if (this.submission) {
      this.archives = (
        await apiSubmission.getSubmissionArchives(this.token, this.submission.uuid)
      ).data;
      this.archives.unshift({
        id: 0,
        title: this.submission.title,
        desc: this.submission.desc,
        created_at: this.submission.updated_at,
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

  private async confirmHideSubmission() {
    await dispatchCaptureApiError(this.$store, async () => {
      await apiSubmission.hideSubmission(this.$store.state.main.token, this.submission!.uuid);
      commitAddNotification(this.$store, {
        content: '已隐藏',
        color: 'info',
      });
      await this.$router.push(`/sites/${this.submission!.site.subdomain}`);
    });
  }

  private async cancelSubmissionUpdate() {
    this.showSubmissionEditor = false;
  }

  private async cancelSubscription() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.submission) {
        this.cancelSubscriptionIntermediate = true;
        const r = await apiMe.unsubscribeSubmission(this.token, this.submission.uuid);
        this.submissionSubscription = r.data;
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
      if (this.submission) {
        this.subscribeIntermediate = true;
        const r = await apiMe.subscribeSubmission(this.token, this.submission.uuid);
        this.submissionSubscription = r.data;
        this.subscribeIntermediate = false;
      }
    });
  }

  private async acceptSuggestion(suggestion: ISubmissionSuggestion) {
    await dispatchCaptureApiError(this.$store, async () => {
      await apiSubmission.updateSubmissionSuggestion(this.token, suggestion.uuid, {
        status: 'accepted',
      });
      this.$router.go(0);
    });
  }

  private async rejectSuggestion(suggestion: ISubmissionSuggestion) {
    await dispatchCaptureApiError(this.$store, async () => {
      const r = await apiSubmission.updateSubmissionSuggestion(this.token, suggestion.uuid, {
        status: 'rejected',
      });
      suggestion.status = r.data.status;
      suggestion.rejected_at = r.data.rejected_at;
    });
  }

  private async retractSuggestion(suggestion: ISubmissionSuggestion) {
    await dispatchCaptureApiError(this.$store, async () => {
      const r = await apiSubmission.updateSubmissionSuggestion(this.token, suggestion.uuid, {
        status: 'retracted',
      });
      suggestion.status = r.data.status;
      suggestion.retracted_at = r.data.retracted_at;
    });
  }

  private async revertRetractSuggestion(suggestion: ISubmissionSuggestion) {
    await dispatchCaptureApiError(this.$store, async () => {
      const r = await apiSubmission.updateSubmissionSuggestion(this.token, suggestion.uuid, {
        status: 'pending',
      });
      suggestion.status = r.data.status;
    });
  }

  topicNames(topics: ITopic[]) {
    return topics
      .map((topic) => topic.name)
      .sort()
      .join(', ');
  }

  getDiffBase(suggestion: ISubmissionSuggestion) {
    if (suggestion.status === 'accepted' && suggestion.accepted_diff_base) {
      return suggestion.accepted_diff_base;
    }
    return this.submission;
  }

  private previewSuggestion(suggestion: ISubmissionSuggestion) {
    this.previewedSuggestion = suggestion;
    this.showSuggestionPreviewDialog = true;
  }
}
</script>
