<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
    <v-row justify="center" v-else>
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
                :to="'/topics/' + topic.uuid"
                v-for="topic in submission.topics"
                :key="topic.uuid"
              >
                {{ topic.name }}
              </v-chip>
            </v-chip-group>
            <v-combobox
              hide-selected
              multiple
              small-chips
              :label="$t('Topics')"
              :items="hintTopicNames"
              :delimiters="[',', '，', '、']"
              v-if="showSubmissionEditor"
              v-model="newSubmissionTopicNames"
            />

            <!-- Submission title display/editor -->
            <div>
              <div class="text-h5 mb-2" v-if="!showSubmissionEditor">
                {{ submission.title }}
              </div>
              <v-textarea
                auto-grow
                dense
                rows="1"
                :label="$t('Title')"
                v-model="newSubmissionTitle"
                v-else
              />
            </div>

            <!-- Submission URL display -->
            <div v-if="submission.url">
              <LinkIcon /> {{ $t('源链接') }}:
              <a class="text-decoration-none" :href="submission.url" target="_blank">
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
                :placeholder="$t('Description')"
                ref="descEditor"
                :initialValue="submission.description"
                class="mb-2"
              />
            </div>
          </div>

          <!-- Submission control -->
          <v-row justify="space-between">
            <v-col class="ml-1 mr-1 d-flex less-left-right-padding" v-if="!showSubmissionEditor">
              <v-dialog max-width="300" v-model="showCancelUpvoteDialog">
                <v-card>
                  <v-card-title primary-title>
                    <div class="headline primary--text">
                      {{ $t('确定取消赞？') }}
                    </div>
                  </v-card-title>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn small depressed @click="showCancelUpvoteDialog = false">{{
                      $t('No')
                    }}</v-btn>
                    <v-btn
                      small
                      depressed
                      color="warning"
                      @click="cancelUpvote"
                      :disabled="cancelUpvoteIntermediate"
                      >{{ $t('Yes') }}</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-btn
                small
                depressed
                @click="showCancelUpvoteDialog = true"
                class="mr-1"
                color="primary lighten-2"
                v-if="upvotes && upvotes.upvoted"
              >
                <UpvoteIcon />
                <span v-if="$vuetify.breakpoint.mdAndUp">{{ $t('赞') }}</span>
                ({{ upvotes.count }})
              </v-btn>
              <v-btn
                small
                depressed
                class="mr-1"
                color="primary"
                @click="upvote"
                v-else-if="upvotes"
                :disabled="
                  !userProfile || userProfile.uuid === submission.author.uuid || upvoteIntermediate
                "
              >
                <UpvoteIcon />
                <span v-if="$vuetify.breakpoint.mdAndUp">{{ $t('赞') }}</span>
                ({{ upvotes.count }})
              </v-btn>

              <BookmarkedIcon
                class="mr-1"
                @click="cancelSubscription"
                :disabled="cancelSubscriptionIntermediate"
                v-if="submissionSubscription && submissionSubscription.subscribed_by_me"
              />
              <ToBookmarkIcon
                class="mr-1"
                @click="subscribe"
                v-else
                :disabled="subscribeIntermediate"
              />

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on" align-self="center" class="d-flex">
                    <EditIcon @click="showSubmissionEditor = true" v-show="editable" />
                  </div>
                </template>
                <span>{{ $t('编辑分享') }}</span>
              </v-tooltip>
            </v-col>
            <v-col
              v-if="!showSubmissionEditor"
              class="d-flex less-left-right-padding"
              align-self="center"
            >
              <v-spacer />
              <SiteBtn :site="submission.site" class="elevation-0" />
              <HistoryIcon @click="showHistoryDialog" v-if="editable" />
            </v-col>
            <v-col v-if="showSubmissionEditor" class="d-flex">
              <v-btn
                small
                depressed
                class="mr-1"
                @click="handleSubmit(commitSubmissionEdit)"
                color="primary"
                v-show="editable"
                :disabled="commitSubmissionEditIntermediate"
                >{{ $t('更新分享') }}</v-btn
              >
              <v-btn
                small
                depressed
                class="mr-1"
                @click="cancelSubmissionUpdate"
                color="warning"
                v-show="editable"
                >{{ $t('取消更新') }}</v-btn
              >
              <v-spacer />

              <v-btn
                small
                depressed
                v-if="showSubmissionEditor & canHide"
                color="warning"
                class="ml-2"
                @click="showConfirmHideSubmissionDialog = true"
              >
                {{ $t('隐藏分享') }}
              </v-btn>
              <v-dialog max-width="600" v-model="showConfirmHideSubmissionDialog">
                <v-card>
                  <v-card-title primary-title>
                    <div class="headline primary--text">
                      {{ $t('确认隐藏分享？') }}
                    </div>
                  </v-card-title>
                  <v-card-text> 隐藏后分享将对所有用户不可见。 </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn small mr-1 color="warning" @click="confirmHideSubmission">{{
                      $t('确认隐藏')
                    }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-dialog max-width="900" v-model="historyDialog">
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
            <ReactionBlock objectType="submission" :objectId="submission.uuid" />
          </div>

          <!-- Comments -->
          <CommentBlock
            :siteId="submission.site ? submission.site.uuid : undefined"
            commentLabel="评论"
            :commentSubmitIntermediate="commentSubmitIntermediate"
            :comments="comments"
            :writable="commentWritable"
            :enableUpvotes="true"
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
import { readNarrowUI, readUserMode, readUserProfile } from '@/store/main/getters';
import {
  ISubmission,
  ISite,
  IUserSiteProfile,
  ISubmissionUpvotes,
  IUserProfile,
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

@Component({
  components: {
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
  get isUserMode() {
    return readUserMode(this.$store);
  }
  get id() {
    return this.$router.currentRoute.params.id;
  }

  get token() {
    return this.$store.state.main.token;
  }
  private showHelp: boolean = false;
  private submission: ISubmission | null = null;
  private newSubmissionTitle: string = '';
  private newSubmissionUrl: string | undefined = undefined;
  private showSubmissionEditor: boolean = false;
  private submissionSite: ISite | null = null;
  private userSiteProfile: IUserSiteProfile | null = null;
  private newSubmissionTopicNames: string[] = [];
  private hintTopicNames: string[] = []; // TODO
  private commentWritable = false;
  private editable = false;
  private canHide = false;
  private showConfirmHideSubmissionDialog = false;

  private loadingProgress = 0;
  private loading = true;

  private isModerator = false;
  private userProfile: IUserProfile | null = null;

  private commitSubmissionEditIntermediate = false;
  private cancelSubscriptionIntermediate = false;
  private subscribeIntermediate = false;

  private showMoveSubmissionDialog = false;

  private handlingNewEdit = false;

  private showCancelUpvoteDialog: boolean = false;
  private upvoteIntermediate: boolean = false;
  private cancelUpvoteIntermediate = false;
  private upvotes: ISubmissionUpvotes | null = null;

  private archives: ISubmissionArchive[] = [];
  private historyDialog = false;

  private siteProfiles: IUserSiteProfile[] = [];
  private newSubmissionSite: ISite | null = null;
  private currentUserAnswerUUID: string | null = null;
  private comments: IComment[] = [];

  private commentSubmitIntermediate = false;

  private async mounted() {
    try {
      if (localStorage.getItem('new-submission')) {
        this.showSubmissionEditor = true;
        localStorage.removeItem('new-submission');
      }
    } catch (e) {}

    try {
      const response = await apiSubmission.getSubmission(this.token, this.id);
      this.submission = response.data;
      if (!this.$route.query.title) {
        this.$router.replace({
          query: { ...this.$route.query, title: this.submission.title },
        });
      }
      this.submissionSubscription = (
        await apiMe.getSubmissionSubscription(this.token, this.submission!.uuid)
      ).data;
      document.title = this.submission.title;
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

        document.title = this.submission.title;

        this.loadingProgress = 33;

        this.newSubmissionTitle = this.submission.title;
        this.newSubmissionUrl = this.submission.url;
        this.newSubmissionTopicNames = this.submission.topics.map((topic) => topic.name);
        this.userProfile = readUserProfile(this.$store);
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
            this.submissionSite = (
              await api.getSite(this.token, this.submission!.site.subdomain)
            ).data;
            this.loadingProgress = 66;

            if (this.userProfile) {
              this.userSiteProfile = (
                await api.getUserSiteProfile(
                  this.token,
                  this.submissionSite.uuid,
                  this.userProfile.uuid
                )
              ).data;
              if (this.userSiteProfile !== null || this.submissionSite.public_writable_comment) {
                this.commentWritable = true;
              }
            }
          });
        }
        this.loadingProgress = 100;
        this.loading = false;
      }
    });
  }
  private async submitNewSubmissionCommentBody({ body, editor }) {
    await dispatchCaptureApiError(this.$store, async () => {
      this.commentSubmitIntermediate = true;
      if (this.submission) {
        const response = await apiComment.postComment(this.token, {
          site_uuid: this.submission?.site.uuid,
          submission_uuid: this.id,
          body,
          editor,
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
          description_text: descEditor.getTextContent(),
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

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
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
    this.$router.push(this.$router.currentRoute.path);
    this.showSubmissionEditor = false;
  }

  private submissionSubscription: IUserSubmissionSubscription | null = null;

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
.small-padding-col {
  padding-top: 0 !important;
}

.less-left-right-padding {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

.fixed-narrow-col {
  max-width: 800px;
}
</style>
