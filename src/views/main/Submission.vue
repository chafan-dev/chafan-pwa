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
          <!-- Submission info/editor -->
          <div>
            <!-- Submission topics display/editor -->
            <v-chip-group v-if="!showSubmissionEditor">
              <v-chip
                v-for="topic in submission.topics"
                :key="topic.uuid"
                :to="'/topics/' + topic.uuid"
              >
                {{ topic.name }}
              </v-chip>
            </v-chip-group>
            <v-combobox
              v-if="showSubmissionEditor"
              v-model="newSubmissionTopicNames"
              :delimiters="[',', '，', '、']"
              :items="hintTopicNames"
              :label="$t('Topics')"
              hide-selected
              multiple
              small-chips
            />

            <!-- Submission title display/editor -->
            <div>
              <div v-if="!showSubmissionEditor" class="text-h5 mb-2">
                {{ submission.title }}
              </div>
              <v-textarea
                v-else
                v-model="newSubmissionTitle"
                :label="$t('Title')"
                auto-grow
                dense
                rows="1"
              />
            </div>

            <!-- Submission URL display -->
            <div v-if="submission.url">
              <LinkIcon />
              {{ $t('源链接') }}:
              <a :href="submission.url" class="text-decoration-none" target="_blank">
                {{ submission.url }}
              </a>
            </div>

            <!-- Submission description display/editor -->
            <SimpleViewer
              v-if="!showSubmissionEditor && submission.description"
              :body="submission.description"
              :editor="submission.description_editor"
            />
            <div v-else-if="showSubmissionEditor">
              <SimpleEditor
                ref="descEditor"
                :editorProp="submission.description_editor"
                :initialValue="submission.description"
                :placeholder="$t('描述（选填）')"
                class="mb-2"
              />
            </div>
          </div>

          <!-- Submission control -->
          <v-row justify="space-between">
            <v-col v-if="!showSubmissionEditor" class="ml-1 mr-1 d-flex less-left-right-padding">
              <v-dialog v-model="showCancelUpvoteDialog" max-width="300">
                <v-card>
                  <v-card-title primary-title>
                    <div class="headline primary--text">确定取消赞？</div>
                  </v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn depressed small @click="showCancelUpvoteDialog = false"
                      >{{ $t('No') }}
                    </v-btn>
                    <v-btn
                      :disabled="cancelUpvoteIntermediate"
                      color="warning"
                      depressed
                      small
                      @click="cancelUpvote"
                      >{{ $t('Yes') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <span v-if="upvotes !== null" class="mr-1">
                <UpvotedBtn
                  v-if="upvotes.upvoted"
                  :count="upvotes.count"
                  @click="showCancelUpvoteDialog = true"
                />
                <UpvoteBtn
                  v-else
                  :count="upvotes.count"
                  :disabled="
                    !userProfile ||
                    userProfile.uuid === submission.author.uuid ||
                    upvoteIntermediate
                  "
                  @click="upvote"
                />
              </span>
              <v-btn
                v-show="editable"
                :color="showUpdateDetailsButton ? 'primary' : undefined"
                class="slim-btn"
                depressed
                small
                @click="showSubmissionEditor = true"
              >
                <EditIcon />
                <span v-if="showUpdateDetailsButton">{{ $t('添加细节') }}</span>
                <span v-else>{{ $t('编辑分享') }}</span>
              </v-btn>

              <BookmarkedIcon
                v-if="submissionSubscription && submissionSubscription.subscribed_by_me"
                :disabled="cancelSubscriptionIntermediate"
                class="ml-1"
                @click="cancelSubscription"
              />
              <ToBookmarkIcon
                v-else
                :disabled="subscribeIntermediate"
                class="ml-1"
                @click="subscribe"
              />

              <ShareCardButton
                v-slot="{ shareQrCodeUrl }"
                :link="`/submissions/${submission.uuid}`"
                :link-text="submission.title"
                class="text-decoration-none"
              >
                <v-card-title>
                  {{ submission.title }}
                </v-card-title>
                <v-card-text>
                  <div class="pt-2 d-flex">
                    <div class="text--primary text-body-1">
                      <p v-if="submission.description" style="overflow-wrap: anywhere">
                        {{ submission.description_text }}
                      </p>
                      <p>
                        <CommentsIcon class="mr-1" small />
                        <span class="text-caption">
                          {{ $t('n条评论', { n: submission.comments.length }) }}
                        </span>
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
            </v-col>
            <v-col
              v-if="!showSubmissionEditor"
              align-self="center"
              class="d-flex less-left-right-padding"
            >
              <v-spacer />
              <SiteBtn :site="submission.site" class="elevation-0" />
              <HistoryIcon v-if="editable" @click="showHistoryDialog" />
            </v-col>
            <v-col v-if="showSubmissionEditor" class="d-flex">
              <v-btn
                v-show="editable"
                :disabled="commitSubmissionEditIntermediate"
                class="mr-1"
                color="primary"
                depressed
                small
                @click="handleSubmit(commitSubmissionEdit)"
                >{{ $t('更新分享') }}
              </v-btn>
              <v-btn
                v-show="editable"
                class="mr-1"
                color="warning"
                depressed
                small
                @click="cancelSubmissionUpdate"
                >{{ $t('取消更新') }}
              </v-btn>
              <v-spacer />

              <v-btn
                v-if="showSubmissionEditor & canHide"
                class="ml-2"
                color="warning"
                depressed
                small
                @click="showConfirmHideSubmissionDialog = true"
              >
                {{ $t('隐藏分享') }}
              </v-btn>
              <v-dialog v-model="showConfirmHideSubmissionDialog" max-width="600">
                <v-card>
                  <v-card-title primary-title>
                    <div class="headline primary--text">
                      {{ $t('确认隐藏分享？') }}
                    </div>
                  </v-card-title>
                  <v-card-text> 隐藏后分享将对所有用户不可见。</v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="warning" mr-1 small @click="confirmHideSubmission"
                      >{{ $t('确认隐藏') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-dialog v-model="historyDialog" max-width="900">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">{{ $t('分享历史') }}</div>
                  <v-spacer />
                  <span class="text-caption grey--text">{{ $t('点击展开') }}</span>
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
                      <SimpleViewer :body="archive.description" />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card>
            </v-dialog>
          </v-row>

          <div class="d-flex justify-end">
            <span class="mr-1">{{ $t('Submitted by') }}</span>
            <UserLink :userPreview="submission.author" />
            <v-spacer />
            <ReactionBlock :objectId="submission.uuid" objectType="submission" />
          </div>

          <!-- Comments -->
          <CommentBlock
            :commentSubmitIntermediate="commentSubmitIntermediate"
            :comments="comments"
            :enableUpvotes="true"
            :siteId="submission.site ? submission.site.uuid : undefined"
            :writable="commentWritable"
            commentLabel="评论"
            @submit-new-comment="submitNewSubmissionCommentBody"
          />

          <div v-if="!userProfile" class="mt-2 text-center">{{ $t('登录后参与讨论') }}</div>
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
        <template v-if="relatedSubmissions">
          <v-divider class="my-2" />
          <RotationList v-slot="{ item }" :items="relatedSubmissions" :title="$t('相关分享')">
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
import SubmissionCard from '@/components/SubmissionCard.vue';
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
  ISubmission,
  ISubmissionUpvotes,
  ISubmissionArchive,
  IComment,
  IUserSubmissionSubscription,
} from '@/interfaces';
import { rankComments } from '@/utils';
import SimpleViewer from '@/components/SimpleViewer.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';
import { apiMe } from '@/api/me';
import MoreIcon from '@/components/icons/MoreIcon.vue';
import { Route, RouteRecord } from 'vue-router';
import { isEqual, updateHead } from '@/common';
import { apiSearch } from '@/api/search';
import RotationList from '@/components/base/RotationList.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import UpvoteBtn from '@/components/widgets/UpvoteBtn.vue';
import UpvotedBtn from '@/components/widgets/UpvotedBtn.vue';

@Component({
  components: {
    UpvotedBtn,
    UpvoteBtn,
    ShareCardButton,
    RotationList,
    MoreIcon,
    Answer,
    SubmissionCard,
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
    SimpleViewer,
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
  private showUpdateDetailsButton = false;

  get isUserMode() {
    return readUserMode(this.$store);
  }

  get id() {
    return this.$route.params.id;
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
      this.showUpdateDetailsButton = false;
      this.load();
    }
  }

  private async mounted() {
    try {
      if (localStorage.getItem('new-submission')) {
        this.showUpdateDetailsButton = true;
        localStorage.removeItem('new-submission');
      }
    } catch (e) {}
    await this.load();
  }

  private async load() {
    try {
      const response = await apiSubmission.getSubmission(this.token, this.id);
      this.submission = response.data;
      updateHead(this.$route.path, this.submission?.title, this.submission?.description_text);
      if (this.token) {
        this.submissionSubscription = (
          await apiMe.getSubmissionSubscription(this.token, this.submission!.uuid)
        ).data;
      }
    } catch (err) {
      commitAddNotification(this.$store, {
        content: this.$t('分享不存在，返回主页').toString(),
        color: 'error',
      });
      this.$router.push('/');
    }

    await dispatchCaptureApiError(this.$store, async () => {
      if (this.submission) {
        this.comments = rankComments(this.$dayjs, this.submission.comments);

        if (this.token) {
          apiSubmission.bumpViewsCounter(this.token, this.submission.uuid);
        }
        this.upvotes = {
          submission_uuid: this.submission.uuid,
          count: this.submission.upvotes_count,
          upvoted: this.submission.upvoted,
        };

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
          body,
          body_text,
          editor,
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
      if (descEditor.content && this.submission) {
        const responses = await Promise.all(
          this.newSubmissionTopicNames.map((name) => apiTopic.createTopic(this.token, { name }))
        );
        const topicsUUIDs = responses.map((r) => r.data.uuid);
        const response = await apiSubmission.updateSubmission(this.token, this.submission.uuid, {
          title: this.newSubmissionTitle,
          description: descEditor.content,
          description_text: descEditor.getTextContent() || undefined,
          description_editor: descEditor.editor,
          topic_uuids: topicsUUIDs,
        });
        if (response) {
          this.submission = response.data;
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
        description: this.submission.description,
        created_at: this.submission.updated_at,
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

  private async confirmHideSubmission() {
    await dispatchCaptureApiError(this.$store, async () => {
      await apiSubmission.hideSubmission(this.$store.state.main.token, this.submission!.uuid);
      commitAddNotification(this.$store, {
        content: this.$t('已隐藏').toString(),
        color: 'info',
      });
      this.$router.push(`/sites/${this.submission!.site.subdomain}`);
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
}
</script>

<style scoped>
.less-left-right-padding {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

.fixed-narrow-col {
  max-width: 800px;
}
</style>
