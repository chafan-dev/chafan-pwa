<template>
  <div>
    <v-progress-linear v-if="loadingActivities" indeterminate />
    <div v-else>
      <v-dialog v-model="showSubjectDialog" max-width="600">
        <v-card class="pt-6">
          <v-card-text>
            <UserGrid :users="subjectsInDialog" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showSubjectDialog = false">{{ $t('隐藏') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <user-welcome v-if="showExploreSites" v-on:on-close-explore-sites="onCloseExploreSites()" />

      <v-card flat v-touch="{ down: () => onSwipeDown() }">
        <div v-for="activity in activities" :key="activity.id">
          <v-card
            :class="{
              'px-3': $vuetify.breakpoint.mdAndUp,
              'py-4': $vuetify.breakpoint.mdAndUp,
              'px-2': !$vuetify.breakpoint.mdAndUp,
              'py-3': !$vuetify.breakpoint.mdAndUp,
            }"
            class="my-4 c-card"
            elevation="1"
          >
            <!-- Row for top info -->
            <v-row justify="space-between" no-gutters>
              <!-- Column for subject and verb -->
              <div v-if="activity.verb === 'follow_user'">
                <UserLink :userPreview="activity.event.content.subject" />
                {{ $t('follows') }}
              </div>
              <div v-if="activity.verb === 'follow_user_combined'">
                <UserLink :userPreview="activity.event.content.subjects[0]" />
                <a
                  class="text-decoration-none grey--text text--darken-2"
                  @click="showSubjects(activity.event.content.subjects)"
                >
                  {{
                    $t('等x人', {
                      n: activity.event.content.subjects.length,
                    })
                  }}
                </a>
                {{ $t('follows') }}
              </div>
              <div v-if="activity.verb === 'follow_article_column'">
                <UserLink :userPreview="activity.event.content.subject" />
                {{ $t('followed column') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_answer'">
                <UserLink :userPreview="activity.event.content.subject" />
                {{ $t('upvotes answer') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_answer_combined'">
                <UserLink :userPreview="activity.event.content.subjects[0]" />
                <a
                  class="text-decoration-none grey--text text--darken-2"
                  @click="showSubjects(activity.event.content.subjects)"
                >
                  {{
                    $t('等x人', {
                      n: activity.event.content.subjects.length,
                    })
                  }}
                </a>
                {{ $t('upvoted answer') }}
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
                {{ $t('replyed comment') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_question'">
                <UserLink :userPreview="activity.event.content.subject" />
                {{ $t('found a good question') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_submission'">
                <UserLink :userPreview="activity.event.content.subject" />
                {{ $t('upvoted submission') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_question_combined'">
                <UserLink :userPreview="activity.event.content.subjects[0]" />
                <a
                  class="text-decoration-none grey--text text--darken-2"
                  @click="showSubjects(activity.event.content.subjects)"
                >
                  {{
                    $t('等x人', {
                      n: activity.event.content.subjects.length,
                    })
                  }}
                </a>
                {{ $t('found a good question') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_submission_combined'">
                <UserLink :userPreview="activity.event.content.subjects[0]" />
                <a
                  class="text-decoration-none grey--text text--darken-2"
                  @click="showSubjects(activity.event.content.subjects)"
                >
                  {{
                    $t('等x人', {
                      n: activity.event.content.subjects.length,
                    })
                  }}
                </a>
                {{ $t('upvoted submission') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_article'">
                <UserLink :userPreview="activity.event.content.subject" />
                {{ $t('upvoted article') }}
              </div>
              <div v-else-if="activity.verb === 'upvote_article_combined'">
                <UserLink :userPreview="activity.event.content.subjects[0]" />
                <a
                  class="text-decoration-none grey--text text--darken-2"
                  @click="showSubjects(activity.event.content.subjects)"
                >
                  {{
                    $t('等x人', {
                      n: activity.event.content.subjects.length,
                    })
                  }}
                </a>
                {{ $t('upvoted article') }}
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
              <div
                v-if="activity.verb === 'follow_user' || activity.verb === 'follow_user_combined'"
              >
                <UserCard
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
              <div
                v-if="
                  activity.verb === 'upvote_answer' || activity.verb === 'upvote_answer_combined'
                "
              >
                <Answer
                  :answerPreview="activity.event.content.answer"
                  :embedded="true"
                  :showAuthor="true"
                />
              </div>
              <div
                v-if="
                  activity.verb === 'upvote_question' ||
                  activity.verb === 'upvote_question_combined'
                "
              >
                <QuestionPreview
                  :embedded="true"
                  :questionPreview="activity.event.content.question"
                />
              </div>
              <div
                v-else-if="
                  activity.verb === 'upvote_submission' ||
                  activity.verb === 'upvote_submission_combined'
                "
              >
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
              <div
                v-else-if="
                  activity.verb === 'upvote_article' || activity.verb === 'upvote_article_combined'
                "
              >
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
                <QuestionPreview
                  :embedded="true"
                  :questionPreview="activity.event.content.question"
                />
              </div>
              <div v-else-if="activity.verb === 'create_submission'">
                <SubmissionCard :embedded="true" :submission="activity.event.content.submission" />
              </div>
            </div>
          </v-card>
        </div>
      </v-card>

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
import { combinedActivities } from '@/home';
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

@Component({
  components: {
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

  private activities: IActivity[] = [];
  private loadingActivities = true;
  private readonly loadingLimit = 12;
  private noMoreNewActivities = false;
  private preloadMoreActivitiesIntermediate = false;
  private showSubjectDialog = false;
  private subjectsInDialog: IUserPreview[] = [];
  private showExploreSites = false;

  private async loadActivities() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response = await api.getActivities(this.$store.state.main.token, {
        limit: this.loadingLimit,
      });
      this.activities = combinedActivities(response.data);
      if (this.userProfile!.flag_list.includes(EXPLORE_SITES)) {
        this.showExploreSites = false;
      } else if (this.activities.length === 0) {
        this.showExploreSites = true;
      }
      this.loadingActivities = false;
    });

    this.preloadMoreActivities();
  }

  private async mounted() {
    await this.loadActivities();

    window.onscroll = () => {
      const bottomOfWindow =
        Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
          window.innerHeight +
          300 >=
        document.documentElement.offsetHeight;
      if (bottomOfWindow) {
        this.preloadMoreActivities();
      }
    };
  }

  private async onCloseExploreSites() {
    this.showExploreSites = false;
    await dispatchAddFlag(this.$store, EXPLORE_SITES);
  }

  private showSubjects(subjects: IUserPreview[]) {
    this.showSubjectDialog = true;
    this.subjectsInDialog = subjects;
  }

  private async preloadMoreActivities() {
    if (this.activities.length !== 0) {
      this.preloadMoreActivitiesIntermediate = true;
      await dispatchCaptureApiError(this.$store, async () => {
        const response = await api.getActivities(this.$store.state.main.token, {
          limit: this.loadingLimit,
          before_activity_id: this.activities[this.activities.length - 1].id,
        });
        if (response.data.length === 0) {
          this.noMoreNewActivities = true;
        } else {
          this.activities.push(...combinedActivities(response.data));
        }
        this.preloadMoreActivitiesIntermediate = false;
      });
    }
  }

  private async onSwipeDown() {
    this.loadingActivities = true;
    this.noMoreNewActivities = false;
    await this.loadActivities();
  }
}
</script>

<style scoped>
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
