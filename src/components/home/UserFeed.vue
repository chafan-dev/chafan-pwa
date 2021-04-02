<template>
  <div>
    <user-welcome v-if="showExploreSites" v-on:on-close-explore-sites="onCloseExploreSites()" />

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
            <v-btn primary small depressed @click="usersDialog = false">{{ $t('隐藏') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <BaseCard class="ma-4" v-for="activity in combinedActivities.items" :key="activity.id">
        <!-- Row for top info -->
        <v-row justify="space-between" no-gutters>
          <!-- Column for subject and verb -->
          <div v-if="activity.verb === 'follow_user'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            {{ $t('follows') }}
          </div>
          <div v-else-if="activity.verb === 'upvote_answer'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            {{ $t('upvotes answer') }}
          </div>
          <div v-else-if="activity.verb === 'upvote_question'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            {{ $t('found a good question') }}
          </div>
          <div v-else-if="activity.verb === 'upvote_submission'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            {{ $t('upvoted submission') }}
          </div>
          <div v-else-if="activity.verb === 'upvote_article'">
            <ActivitySubject :activity="activity" @show-users-dialog="showUsersDialog" />
            {{ $t('upvoted article') }}
          </div>

          <div v-else-if="activity.verb === 'follow_article_column'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('followed column') }}
          </div>
          <div v-else-if="activity.verb === 'comment_question'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('commented question') }}
          </div>
          <div v-else-if="activity.verb === 'comment_submission'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('commented submission') }}
          </div>
          <div v-else-if="activity.verb === 'comment_article'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('commented article') }}
          </div>
          <div v-else-if="activity.verb === 'comment_answer'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('commented answer') }}
          </div>
          <div v-else-if="activity.verb === 'reply_comment'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('replied comment') }}
          </div>
          <div v-else-if="activity.verb === 'create_article'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('created article') }}
          </div>
          <div v-else-if="activity.verb === 'answer_question'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('answered question') }}
          </div>
          <div v-else-if="activity.verb === 'create_question'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('creates question') }}
          </div>
          <div v-else-if="activity.verb === 'create_submission'">
            <UserLink :userPreview="activity.event.content.subject" />
            {{ $t('created submission') }}
          </div>
          <span class="text-caption grey--text mr-3">{{
            $dayjs.utc(activity.created_at).local().fromNow()
          }}</span>
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
                {{
                  $t('等x人', {
                    n: activity.event.content.users.length,
                  })
                }}
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
              :embedded="true"
            />
          </div>
          <div v-if="activity.verb === 'upvote_answer'">
            <Answer
              :answerPreview="activity.event.content.answer"
              :embedded="true"
              :showAuthor="true"
            />
          </div>
          <div v-if="activity.verb === 'upvote_question'">
            <QuestionPreview :embedded="true" :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'upvote_submission'">
            <SubmissionCard :embedded="true" :submission="activity.event.content.submission" />
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
            <ArticlePreview :articlePreview="activity.event.content.article" :embedded="true" />
          </div>
          <div v-else-if="activity.verb === 'create_article'">
            <ArticlePreview :articlePreview="activity.event.content.article" :embedded="true" />
          </div>
          <div v-else-if="activity.verb === 'answer_question'">
            <Answer
              :answerPreview="activity.event.content.answer"
              :embedded="true"
              :showAuthor="false"
            />
          </div>
          <div v-else-if="activity.verb === 'create_question'">
            <QuestionPreview :embedded="true" :questionPreview="activity.event.content.question" />
          </div>
          <div v-else-if="activity.verb === 'create_submission'">
            <SubmissionCard :embedded="true" :submission="activity.event.content.submission" />
          </div>
        </div>
      </BaseCard>

      <div class="text-center">
        <v-progress-circular
          v-if="preloadMoreActivitiesIntermediate"
          color="primary"
          indeterminate
        />
        <span v-if="noMoreNewActivities">{{ $t('No more new activities.') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { dispatchAddFlag, dispatchCaptureApiError } from '@/store/main/actions';
import { api } from '@/api';
import { CombinedActivities } from '@/CombinedActivities';
import { IActivity, IUserPreview, IUserProfile } from '@/interfaces';
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
import SharingIcon from '@/components/icons/SharingIcon.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';
import FeedIcon from '@/components/icons/FeedIcon.vue';
import UserGrid from '@/components/UserGrid.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import { EXPLORE_SITES } from '@/common';
import ActivitySubject from '@/components/ActivitySubject.vue';

@Component({
  components: {
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
    SharingIcon,
    SubmissionCard,
    FeedIcon,
    UserGrid,
    CloseIcon,
  },
})
export default class UserFeed extends Vue {
  @Prop() public readonly userProfile!: IUserProfile;

  private combinedActivities: CombinedActivities = new CombinedActivities();
  private loadingActivities = true;
  private readonly loadingLimit = 12;
  private noMoreNewActivities = false;
  private preloadMoreActivitiesIntermediate = false;
  private showExploreSites = false;
  private usersDialog = false;
  private usersInDialog: IUserPreview[] = [];

  private async loadActivities() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response = await api.getActivities(this.$store.state.main.token, {
        limit: this.loadingLimit,
      });
      for (const activity of response.data) {
        this.combinedActivities.add(activity, 'tail');
      }
      if (this.userProfile!.flag_list.includes(EXPLORE_SITES)) {
        this.showExploreSites = false;
      } else if (this.combinedActivities.items.length === 0) {
        this.showExploreSites = true;
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
        const response = await api.getActivities(this.$store.state.main.token, {
          limit: this.loadingLimit,
          before_activity_id: minActivityId,
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
        const response = await api.getActivities(this.$store.state.main.token, {
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
}
</script>
