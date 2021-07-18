<template>
  <div>
    <user-welcome v-if="showExploreSites" v-on:on-close-explore-sites="onCloseExploreSites()" />
    <EmptyPlaceholder v-if="showEmptyPlaceholder" />

    <div>
      <v-expand-transition>
        <div v-show="loadingActivities" class="text-center">
          <v-progress-circular size="20" color="primary" indeterminate />
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
            <v-btn primary small depressed @click="usersDialog = false">隐藏</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <div class="ma-4 shadow-card" v-for="activity in combinedActivities.items" :key="activity.id">
        <!-- Row for top info -->
        <v-row justify="space-between" no-gutters>
          <!-- Column for subject and verb -->
          <div v-if="activity.verb === 'follow_user'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            关注了用户
          </div>
          <div v-else-if="activity.verb === 'upvote_answer'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            赞了回答
          </div>
          <div v-else-if="activity.verb === 'upvote_question'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            赞了问题
          </div>
          <div v-else-if="activity.verb === 'upvote_submission'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            赞了分享
          </div>
          <div v-else-if="activity.verb === 'upvote_article'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            赞了文章
          </div>

          <div v-else-if="activity.verb === 'follow_article_column'">
            <UserLink :userPreview="activity.event.content.subject" />
            关注了专栏
          </div>
          <div v-else-if="activity.verb === 'comment_question'">
            <UserLink :userPreview="activity.event.content.subject" />
            评论了问题
          </div>
          <div v-else-if="activity.verb === 'comment_submission'">
            <UserLink :userPreview="activity.event.content.subject" />
            评论了分享
          </div>
          <div v-else-if="activity.verb === 'comment_article'">
            <UserLink :userPreview="activity.event.content.subject" />
            评论了文章
          </div>
          <div v-else-if="activity.verb === 'comment_answer'">
            <UserLink :userPreview="activity.event.content.subject" />
            评论了回答
          </div>
          <div v-else-if="activity.verb === 'reply_comment'">
            <UserLink :userPreview="activity.event.content.subject" />
            回复了评论
          </div>
          <div v-else-if="activity.verb === 'create_article'">
            <UserLink :userPreview="activity.event.content.subject" />
            发表了文章
          </div>
          <div v-else-if="activity.verb === 'answer_question'">
            <UserLink :userPreview="activity.event.content.subject" />
            回答了问题
          </div>
          <div v-else-if="activity.verb === 'create_question'">
            <UserLink :userPreview="activity.event.content.subject" />
            提了一个问题
          </div>
          <div v-else-if="activity.verb === 'create_submission'">
            <UserLink :userPreview="activity.event.content.subject" />
            添加了分享
          </div>
          <div>
            <span class="text-caption grey--text mr-1">{{
              $dayjs.utc(activity.created_at).local().fromNow()
            }}</span>
            <v-menu offset-y v-if="activity.origins && activity.origins.length">
              <template v-slot:activator="{ on, attrs }">
                <DotsIcon small v-bind="attrs" v-on="on" />
              </template>
              <v-list>
                <!-- block origin actions -->
                <template v-if="activity.origins">
                  <v-list-item
                    v-for="(origin, idx) in activity.origins"
                    dense
                    :key="idx"
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
                :embedded="true"
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
              :embedded="true"
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
            <Answer :answerPreview="activity.event.content.answer" :showAuthor="true" />
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
            <Answer :answerPreview="activity.event.content.answer" :showAuthor="false" />
          </div>
          <div v-else-if="activity.verb === 'create_question'">
            <QuestionPreview :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'create_submission'">
            <SubmissionPreview :submission="activity.event.content.submission" />
          </div>
        </div>
      </div>

      <div class="text-center">
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { dispatchAddFlag, dispatchCaptureApiError } from '@/store/main/actions';
import { CombinedActivities } from '@/CombinedActivities';
import { IActivity, IOrigin, IUserPreview, IUserProfile } from '@/interfaces';
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
import { EXPLORE_SITES } from '@/common';
import ActivitySubject from '@/components/ActivitySubject.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import { apiActivity } from '@/api/activity';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import SiteName from '@/components/SiteName.vue';
import { readToken } from '@/store/main/getters';
import { commitAddNotification } from '@/store/main/mutations';

@Component({
  components: {
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
})
export default class UserFeed extends Vue {
  @Prop() public readonly userProfile!: IUserProfile;
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

  private async loadActivities() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response = await apiActivity.getActivities(this.token, {
        limit: this.loadingLimit,
        subjectUserUUID: this.subjectUserUuid,
      });
      for (const activity of response.data) {
        this.combinedActivities.add(activity, 'tail');
      }
      if (this.enableShowExploreSites) {
        if (this.userProfile!.flag_list.includes(EXPLORE_SITES)) {
          this.showExploreSites = false;
        } else if (this.combinedActivities.items.length === 0) {
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
        const response = await apiActivity.getActivities(this.token, {
          limit: this.loadingLimit,
          before_activity_id: minActivityId,
          subjectUserUUID: this.subjectUserUuid,
        });
        if (response.data.length === 0) {
          this.noMoreNewActivities = true;
        } else {
          for (const activity of response.data) {
            this.combinedActivities.add(activity, 'tail');
          }
        }
      });
    }
    this.preloadMoreActivitiesIntermediate = false;
  }

  public async loadNewActivities() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.loadingActivities = true;
      let before_activity_id: number | undefined = undefined;
      const newActivities: IActivity[] = [];
      let fetching = true;
      while (fetching) {
        const response = await apiActivity.getActivities(this.token, {
          limit: this.loadingLimit,
          before_activity_id: before_activity_id,
        });
        const activities: IActivity[] = response.data;
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

  private showUsersDialog(users: IUserPreview[]) {
    this.usersInDialog = users;
    this.usersDialog = true;
  }

  get token() {
    return readToken(this.$store);
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
