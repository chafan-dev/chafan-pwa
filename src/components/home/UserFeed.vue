<template>
  <div>
    <user-welcome
      class="mx-4"
      v-if="showExploreSites"
      v-on:on-close-explore-sites="onCloseExploreSites()"
    />
    <div class="mx-4 my-2 text-center" v-if="isRandomActivities">
      信息流预览（关注更多的人或加入更多圈子来定制自己的信息流）
    </div>
    <EmptyPlaceholder v-if="showEmptyPlaceholder" />

    <div>
      <v-expand-transition>
        <div v-show="loadingActivities" class="text-center">
          <v-progress-circular color="primary" indeterminate size="20" />
        </div>
      </v-expand-transition>

      <v-dialog v-model="usersDialog" max-width="600">
        <v-card class="pt-6">
          <v-card-text>
            <v-lazy>
              <UserGrid :users="usersInDialog" />
            </v-lazy>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn depressed primary small @click="usersDialog = false">隐藏</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div
        v-for="activity in combinedActivities.items"
        :key="activity.id"
        :class="theme.feed.activityCard.classes"
      >
        <DebugSpan>id={{ activity.id }}</DebugSpan>
        <!-- Row for top info -->
        <v-row justify="space-between" no-gutters>
          <!-- Column for subject and verb -->
          <div>
            <ActivitySubject :activity="activity" />
            <span :class="theme.feed.activityCard.verb.classes">
              {{ activity.verb | activityVerbCN }}
            </span>
          </div>
          <div>
            <span class="text-caption grey--text mr-1">{{ fromNow(activity.created_at) }}</span>
            <v-menu v-if="activity.origins && activity.origins.length" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <DotsIcon v-bind="attrs" v-on="on" small />
              </template>
              <v-list>
                <!-- block origin actions -->
                <template v-if="activity.origins">
                  <v-list-item
                    v-for="(origin, idx) in activity.origins"
                    :key="idx"
                    dense
                    @click="blockOrigin(origin)"
                  >
                    <v-list-item-icon>
                      <CloseIcon />
                    </v-list-item-icon>
                    <v-list-item-content class="text-caption">
                      <span
                        >减少
                        <template v-if="origin.origin_type === 'site'">
                          「<SiteName :subdomain="origin.subdomain" />」圈子
                        </template>
                        的推送
                      </span>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>
          </div>
        </v-row>

        <!-- Row for content preview if any -->
        <div>
          <div v-if="activity.verb === 'follow_user'">
            <template v-if="activity.event.content.users">
              <UserCard
                :compactMode="true"
                :infeed="true"
                :userPreview="activity.event.content.users[0]"
              />
              <a
                class="text-decoration-none"
                @click="showUsersDialog(activity.event.content.users)"
              >
                等{{ activity.event.content.users.length }}人
              </a>
            </template>
            <UserCard
              v-else
              :compactMode="true"
              :infeed="true"
              :userPreview="activity.event.content.user"
            />
          </div>

          <div v-if="activity.verb === 'follow_article_column'">
            <ArticleColumnCard
              :articleColumn="activity.event.content.article_column"
              :compactMode="true"
            />
          </div>

          <div v-if="activity.verb === 'upvote_answer'">
            <Answer :answerPreview="activity.event.content.answer" />
          </div>
          <div v-if="activity.verb === 'upvote_question'">
            <QuestionPreview :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'upvote_submission'">
            <SubmissionPreview :submission="activity.event.content.submission" />
          </div>
          <div v-else-if="activity.verb === 'comment_question'">
            <CommentCard
              :comment="activity.event.content.comment"
              :questionPreview="activity.event.content.question"
            />
          </div>
          <div v-else-if="activity.verb === 'comment_submission'">
            <CommentCard
              :comment="activity.event.content.comment"
              :submission="activity.event.content.submission"
            />
          </div>
          <div v-else-if="activity.verb === 'comment_article'">
            <CommentCard
              :articlePreview="activity.event.content.article"
              :comment="activity.event.content.comment"
            />
          </div>
          <div v-else-if="activity.verb === 'comment_answer'">
            <CommentCard
              :answerPreview="activity.event.content.answer"
              :comment="activity.event.content.comment"
            />
          </div>
          <div v-else-if="activity.verb === 'reply_comment'">
            <CommentCard
              :comment="activity.event.content.reply"
              :parentComment="activity.event.content.parent_comment"
            />
          </div>
          <div v-else-if="activity.verb === 'upvote_article'">
            <ArticlePreview :articlePreview="activity.event.content.article" />
          </div>
          <div v-else-if="activity.verb === 'create_article'">
            <ArticlePreview :articlePreview="activity.event.content.article" />
          </div>
          <div v-else-if="activity.verb === 'answer_question'">
            <Answer
              :answerPreview="activity.event.content.answer"
              :inAnswerQuestionFeedCard="true"
            />
          </div>
          <div v-else-if="activity.verb === 'create_question'">
            <QuestionPreview :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'create_submission'">
            <SubmissionPreview :submission="activity.event.content.submission" />
          </div>
        </div>
      </div>

      <div class="text-center mt-4">
        <v-progress-circular
          v-if="preloadMoreActivitiesIntermediate"
          color="primary"
          indeterminate
        />
        <span v-if="noMoreNewActivities">没有更多新动态了</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { dispatchAddFlag, dispatchCaptureApiError } from '@/store/main/actions';
import { CombinedActivities } from '@/CombinedActivities';
import { IActivity, IOrigin, IUserPreview } from '@/interfaces';
import UserLogoutWelcome from '@/components/home/UserLogoutWelcome.vue';
import UserWelcome from '@/components/home/UserWelcome.vue';
import UserAgreement from '@/components/home/UserAgreement.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import UIStyleControllers from '@/components/UIStyleControllers.vue';
import UserLink from '@/components/UserLink.vue';
import Answer from '@/components/Answer.vue';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import HomeSideCard from '@/components/HomeSideCard.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import QuestionLink from '@/components/question/QuestionLink.vue';
import HomeFabIcon from '@/components/icons/HomeFabIcon.vue';
import UserCard from '@/components/UserCard.vue';
import ExploreIcon from '@/components/icons/ExploreIcon.vue';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import CommentCard from '@/components/CommentCard.vue';
import NewContentActionBar from '@/components/NewContentActionBar.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import FeedIcon from '@/components/icons/FeedIcon.vue';
import UserGrid from '@/components/UserGrid.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { CVue, EXPLORE_SITES } from '@/common';
import ActivitySubject from '@/components/ActivitySubject.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import { apiActivity } from '@/api/activity';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import SiteName from '@/components/SiteName.vue';
import { commitAddNotification } from '@/store/main/mutations';
import DebugSpan from '@/components/base/DebugSpan.vue';

@Component({
  components: {
    DebugSpan,
    SiteName,
    DotsIcon,
    EmptyPlaceholder,
    ActivitySubject,
    UserFeed,
    UserLogoutWelcome,
    UserWelcome,
    UserAgreement,
    BaseCard,
    CreateQuestionForm,
    UIStyleControllers,
    UserLink,
    Answer,
    QuestionPreview,
    SiteBtn,
    HomeSideCard,
    ArticlePreview,
    QuestionLink,
    HomeFabIcon,
    UserCard,
    ExploreIcon,
    ArticleColumnCard,
    CommentCard,
    NewContentActionBar,
    SubmissionPreview,
    FeedIcon,
    UserGrid,
    CloseIcon,
  },
  filters: {
    activityVerbCN(value) {
      switch (value) {
        case 'follow_user':
          return '关注了用户';
        case 'upvote_answer':
          return '赞了回答';
        case 'upvote_question':
          return '赞了问题';
        case 'upvote_submission':
          return '赞了分享';
        case 'upvote_article':
          return '赞了文章';
        case 'follow_article_column':
          return '关注了专栏';
        case 'comment_question':
          return '评论了问题';
        case 'comment_submission':
          return '评论了分享';
        case 'comment_article':
          return '评论了文章';
        case 'comment_answer':
          return '评论了回答';
        case 'reply_comment':
          return '回复了评论';
        case 'create_article':
          return '发表了文章';
        case 'answer_question':
          return '回答了问题';
        case 'create_question':
          return '提了一个问题';
        case 'create_submission':
          return '添加了分享';
        default:
          return value;
      }
    },
  },
})
export default class UserFeed extends CVue {
  @Prop({ default: true }) public readonly enableShowExploreSites!: boolean;
  @Prop() public readonly subjectUserUuid: number | undefined;

  private combinedActivities: CombinedActivities = new CombinedActivities();
  private loadingActivities = true;
  private readonly loadingLimit = 12;
  private noMoreNewActivities = false;
  private preloadMoreActivitiesIntermediate = false;
  private showExploreSites = false;
  private showEmptyPlaceholder = false;
  private usersDialog = false;
  private usersInDialog: IUserPreview[] = [];
  private isRandomActivities = false;

  public async loadNewActivities() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.loadingActivities = true;
      let before_activity_id: number | undefined = undefined;
      const newActivities: IActivity[] = [];
      let fetching = true;
      while (fetching) {
        const response = await apiActivity.getFeedSequence(this.token, {
          limit: this.loadingLimit,
          before_activity_id: before_activity_id,
          random: this.isRandomActivities,
        });
        this.isRandomActivities = response.data.random;
        const activities: IActivity[] = response.data.activities;
        if (activities.length === 0) {
          break;
        }
        for (const activity of activities) {
          if (
            this.combinedActivities.maxActivityId &&
            activity.id <= this.combinedActivities.maxActivityId
          ) {
            fetching = false;
            break;
          }
          newActivities.push(activity);
        }
        before_activity_id = activities[activities.length - 1]!.id;
      }
      for (const activity of newActivities) {
        this.combinedActivities.add(activity, 'head');
      }
      this.loadingActivities = false;
    });
  }

  private async loadActivities() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response = await apiActivity.getFeedSequence(this.token, {
        limit: this.loadingLimit,
        subjectUserUUID: this.subjectUserUuid,
      });
      this.isRandomActivities = response.data.random;
      for (const activity of response.data.activities) {
        this.combinedActivities.add(activity, 'tail');
      }
      if (this.enableShowExploreSites) {
        if (this.userProfile!.flag_list.includes(EXPLORE_SITES)) {
          this.showExploreSites = false;
        } else if (this.combinedActivities.items.length === 0 || this.isRandomActivities) {
          this.showExploreSites = true;
        }
      }
      if (!this.showExploreSites && this.combinedActivities.items.length === 0) {
        this.showEmptyPlaceholder = true;
      }
      this.loadingActivities = false;
    });

    this.preloadMoreActivities();
    window.onscroll = () => {
      this.preloadMoreActivities();
    };
  }

  private async mounted() {
    await this.loadActivities();
  }

  private async onCloseExploreSites() {
    this.showExploreSites = false;
    await dispatchAddFlag(this.$store, EXPLORE_SITES);
  }

  private async preloadMoreActivities() {
    if (this.preloadMoreActivitiesIntermediate) {
      return;
    }
    this.preloadMoreActivitiesIntermediate = true;
    const bottomOfWindow =
      Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
        window.innerHeight >=
      document.documentElement.offsetHeight;
    if (!bottomOfWindow || this.noMoreNewActivities) {
      this.preloadMoreActivitiesIntermediate = false;
      return;
    }
    const minActivityId = this.combinedActivities.minActivityId;
    if (minActivityId !== null) {
      await dispatchCaptureApiError(this.$store, async () => {
        const response = await apiActivity.getFeedSequence(this.token, {
          random: this.isRandomActivities,
          limit: this.loadingLimit,
          before_activity_id: minActivityId,
          subjectUserUUID: this.subjectUserUuid,
        });
        const activities = response.data.activities;
        if (activities.length === 0) {
          this.noMoreNewActivities = true;
        } else {
          for (const activity of activities) {
            this.combinedActivities.add(activity, 'tail');
          }
        }
      });
    }
    this.preloadMoreActivitiesIntermediate = false;
  }

  private showUsersDialog(users: IUserPreview[]) {
    this.usersInDialog = users;
    this.usersDialog = true;
  }

  private async blockOrigin(origin: IOrigin) {
    await apiActivity.updateOrigins(this.token, { action: 'add', origin });
    await commitAddNotification(this.$store, {
      color: 'info',
      content: '过滤规则更新成功，稍后自动生效',
    });
    await this.$router.go(0);
  }
}
</script>
