<template>
    <v-container :class="{'pa-1': !$vuetify.breakpoint.mdAndUp}" fluid>
        <v-overlay v-model="overlay" opacity="0.5" z-index="10">
            <v-card elevation="2" rounded v-show="showUserAgreement" color="white">
                <v-card-title class="primary--text">{{$t('使用前必读')}}</v-card-title>
                <div class="black--text ma-4">
                    请仔细阅读<a class="text-decoration-none" href="https://about.cha.fan/docs">本网站相关文档</a>。
                    如果你继续使用本网站，将视为同意「网站用户协议」并了解「社区行为守则」的内容。
                </div>
                <v-card-actions class="ma-2">
                    <v-spacer />
                    <v-btn color="primary" @click="continueUserAgreement">同意</v-btn>
                </v-card-actions>
            </v-card>
            <v-card color="white" elevation="2" rounded v-show="showFabHint">
                <v-card-title class="primary--text">{{$t('Try the explore button')}} ↘</v-card-title>
            </v-card>
        </v-overlay>
        <v-row justify="center" class="pa-3">
            <!-- Feed column -->
            <v-col :class="{'fixed-narrow-col': isNarrowFeedUI }" fluid>
                <div class="d-flex justify-space-between mb-3">
                  <NewContentActionBar />
                  <v-spacer />
                  <SharingIcon class="mr-2" @click="toggleSharing" v-if="!showSharing" />
                  <FeedIcon class="mr-2" @click="toggleSharing" v-else />

                  <UIStyleControllers />
                </div>

                <div v-if="showSharing">
                    <v-progress-linear v-if="loadingSubmissions" indeterminate />
                    <div :class="{ 'pl-3 pr-3': $vuetify.breakpoint.mdAndUp, 'pt-1': true, 'pb-1': true }"
                          v-for="submission in submissions" :key="submission.uuid">
                        <SubmissionCard class="ml-2 mr-2" :submission="submission" />
                    </div>
                </div>

                <div v-if="!showSharing && !loadingActivities">
                    <v-progress-linear v-if="loadingActivities" indeterminate />
                    <v-dialog max-width="600" v-model="showSubjectDialog">
                        <v-card class="pt-6">
                            <v-card-text>
                                <UserGrid :users="subjectsInDialog" />
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer />
                                <v-btn @click="showSubjectDialog = false">{{$t('隐藏')}}</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <div v-if="!userProfile">
                      {{$t('登录后浏览更多个性化内容！')}}
                      <ExploreSitesGrid class="mt-2" />
                    </div>

                    <v-sheet v-if="showExploreSites">
                      <div class="d-flex justify-space-between title">
                        {{$t('刚刚加入？')}}

                        <CloseIcon @click="onCloseExploreSites" />
                      </div>

                      <div>
                        1. {{$t('完善')}}<a class="text-decoration-none" href="/profile/edit" target="_blank">{{$t('个人页面')}}</a>{{$t('来告诉朋友们你是谁')}}<br />
                        2. {{$t('探索 Chafan 上的感兴趣的圈子和用户来生成自己的信息流：')}}
                      </div>
                      <ExploreSitesGrid class="mt-2" />
                    </v-sheet>

                    <v-card flat>
                      <div v-for="activity in activities" :key="activity.id">
                        <v-card class="my-4 c-card" elevation="1"
                                :class="{'px-3': $vuetify.breakpoint.mdAndUp, 'py-4': $vuetify.breakpoint.mdAndUp,
                                         'px-2': !$vuetify.breakpoint.mdAndUp, 'py-3': !$vuetify.breakpoint.mdAndUp }">
                          <!-- Row for top info -->
                          <v-row justify="space-between" no-gutters>
                            <!-- Column for subject and verb -->
                            <div v-if="activity.verb === 'follow_user'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("follows") }}
                            </div>
                            <div v-if="activity.verb === 'follow_user_combined'">
                              <UserLink :userPreview="activity.event.content.subjects[0]" />
                              <a class="text-decoration-none grey--text text--darken-2" @click="showSubjects(activity.event.content.subjects)">
                                {{ $t('等x人', { n: activity.event.content.subjects.length }) }}
                              </a>
                              {{ $t("follows") }}
                            </div>
                            <div v-if="activity.verb === 'follow_article_column'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("followed column") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_answer'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("upvotes answer") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_answer_combined'">
                              <UserLink :userPreview="activity.event.content.subjects[0]" />
                              <a class="text-decoration-none grey--text text--darken-2" @click="showSubjects(activity.event.content.subjects)">
                                {{ $t('等x人', { n: activity.event.content.subjects.length }) }}
                              </a>
                              {{ $t("upvoted answer") }}
                            </div>
                            <div v-else-if="activity.verb === 'comment_question'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("commented question") }}
                            </div>
                            <div v-else-if="activity.verb === 'comment_submission'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("commented submission") }}
                            </div>
                            <div v-else-if="activity.verb === 'comment_article'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("commented article") }}
                            </div>
                            <div v-else-if="activity.verb === 'comment_answer'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("commented answer") }}
                            </div>
                            <div v-else-if="activity.verb === 'reply_comment'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("replyed comment") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_question'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("found a good question") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_submission'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("upvoted submission") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_question_combined'">
                              <UserLink :userPreview="activity.event.content.subjects[0]" />
                              <a class="text-decoration-none grey--text text--darken-2" @click="showSubjects(activity.event.content.subjects)">
                                {{ $t('等x人', {n: activity.event.content.subjects.length}) }}
                              </a>
                              {{ $t("found a good question") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_submission_combined'">
                              <UserLink :userPreview="activity.event.content.subjects[0]" />
                              <a class="text-decoration-none grey--text text--darken-2" @click="showSubjects(activity.event.content.subjects)">
                                {{ $t('等x人', {n: activity.event.content.subjects.length}) }}
                              </a>
                              {{ $t("upvoted submission") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_article'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("upvoted article") }}
                            </div>
                            <div v-else-if="activity.verb === 'upvote_article_combined'">
                              <UserLink :userPreview="activity.event.content.subjects[0]" />
                              <a class="text-decoration-none grey--text text--darken-2" @click="showSubjects(activity.event.content.subjects)">
                                {{ $t('等x人', { n: activity.event.content.subjects.length}) }}
                              </a>
                              {{ $t("upvoted article") }}
                            </div>
                            <div v-else-if="activity.verb === 'create_article'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("created article") }}
                            </div>
                            <div v-else-if="activity.verb === 'answer_question'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("answered question") }}
                            </div>
                            <div v-else-if="activity.verb === 'create_question'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("creates question") }}
                            </div>
                            <div v-else-if="activity.verb === 'create_submission'">
                              <UserLink :userPreview="activity.event.content.subject" />
                              {{ $t("created submission") }}
                            </div>
                            <span class="text-caption grey--text mr-3">{{ $dayjs.utc(activity.created_at).local().fromNow() }}</span>
                          </v-row>
                          <!-- Row for content preview if any -->
                          <div>
                            <div v-if="activity.verb === 'follow_user' || activity.verb === 'follow_user_combined'">
                              <UserCard :embedded="true" :userPreview="activity.event.content.user" :compactMode="true" />
                            </div>
                            <div v-if="activity.verb === 'follow_article_column'">
                              <ArticleColumnCard :embedded="true" :compactMode="true" :articleColumn="activity.event.content.article_column" />
                            </div>
                            <div v-if="activity.verb === 'upvote_answer' || activity.verb === 'upvote_answer_combined'">
                              <Answer :embedded="true" :answerPreview="activity.event.content.answer" :showAuthor="true" />
                            </div>
                            <div v-if="activity.verb === 'upvote_question' || activity.verb === 'upvote_question_combined'">
                              <QuestionPreview :embedded="true" :questionPreview="activity.event.content.question" />
                            </div>
                            <div v-else-if="activity.verb === 'upvote_submission' || activity.verb === 'upvote_submission_combined'">
                              <SubmissionCard :embedded="true" :submission="activity.event.content.submission" />
                            </div>
                            <div v-else-if="activity.verb === 'comment_question'">
                              <CommentCard :comment="activity.event.content.comment" :questionPreview="activity.event.content.question" />
                            </div>
                            <div v-else-if="activity.verb === 'comment_submission'">
                              <CommentCard :comment="activity.event.content.comment" :submission="activity.event.content.submission" />
                            </div>
                            <div v-else-if="activity.verb === 'comment_article'">
                              <CommentCard :comment="activity.event.content.comment" :articlePreview="activity.event.content.article" />
                            </div>
                            <div v-else-if="activity.verb === 'comment_answer'">
                              <CommentCard :comment="activity.event.content.comment" :answerPreview="activity.event.content.answer" />
                            </div>
                            <div v-else-if="activity.verb === 'reply_comment'">
                              <CommentCard :comment="activity.event.content.reply" :parentComment="activity.event.content.parent_comment" />
                            </div>
                            <div v-else-if="activity.verb === 'upvote_article' || activity.verb === 'upvote_article_combined'">
                              <ArticlePreview :embedded="true" :articlePreview="activity.event.content.article" />
                            </div>
                            <div v-else-if="activity.verb === 'create_article'">
                              <ArticlePreview :embedded="true" :articlePreview="activity.event.content.article" />
                            </div>
                            <div v-else-if="activity.verb === 'answer_question'">
                              <Answer :embedded="true" :answerPreview="activity.event.content.answer" :showAuthor="false" />
                            </div>
                            <div v-else-if="activity.verb === 'create_question'">
                              <QuestionPreview :embedded="true" :questionPreview="activity.event.content.question" />
                            </div>
                            <div v-else-if="activity.verb === 'create_submission'">
                              <SubmissionCard :embedded="true" :submission="activity.event.content.submission" />
                            </div>
                          </div>
                        </v-card>
                      </div>
                    </v-card>

                    <div class="text-center">
                        <v-progress-circular indeterminate color="primary" v-if="preloadMoreActivitiesIntermediate" />
                        <span v-if="noMoreNewActivities">{{$t('No more new activities.')}}</span>
                    </div>
                </div>
            </v-col>

            <!-- Side column -->
            <v-col :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'" v-if="$vuetify.breakpoint.mdAndUp">
                <ExploreCard />
            </v-col>
            <v-bottom-sheet class="bottom-info-panel" v-else>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" fab fixed right bottom
                           class="fab" @click="onFabClicked" v-bind="attrs" v-on="on">
                        <ExploreIcon />
                    </v-btn>
                </template>
                <v-sheet class="pa-2">
                    <ExploreCard />
                </v-sheet>
            </v-bottom-sheet>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api } from '@/api';
import { combinedActivities } from '@/home';
import { IActivity, ISubmission, IUserPreview, IUserProfile } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import UserLink from '@/components/UserLink.vue';
import UserCard from '@/components/UserCard.vue';
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
import CommentCard from '@/components/CommentCard.vue';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import QuestionLink from '@/components/QuestionLink.vue';
import NewContentActionBar from '@/components/NewContentActionBar.vue';
import Answer from '@/components/Answer.vue';
import ExploreCard from '@/components/ExploreCard.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';
import ExploreIcon from '@/components/icons/ExploreIcon.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import SharingIcon from '@/components/icons/SharingIcon.vue';
import FeedIcon from '@/components/icons/FeedIcon.vue';
import QuestionPreview from '@/components/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import UserGrid from '@/components/UserGrid.vue';
import { readNarrowUI, readUserProfile } from '@/store/main/getters';
import { setAppLocale } from '@/utils';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { dispatchUpdateUserProfileQuiet } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import UIStyleControllers from '@/components/UIStyleControllers.vue';

@Component({
    components: {
        CreateQuestionForm, UIStyleControllers,
        UserLink, Answer, QuestionPreview, SiteBtn, ExploreCard, ArticlePreview,
        QuestionLink, ExploreIcon, UserCard, ArticleColumnCard, CommentCard,
        NewContentActionBar, SharingIcon,
        SubmissionCard, FeedIcon, UserGrid, ExploreSitesGrid, CloseIcon,
    },
})
export default class Home extends Vue {
    private activities: IActivity[] = [];
    private loadingActivities = true;
    private loadingSubmissions = false;
    private userProfile: IUserProfile | null = null;
    private overlay = false;
    private showFabHint = false;
    private showUserAgreement = false;
    private showExploreSites = false;
    private readonly loadingLimit = 12;
    private readonly YES_FLAG = 'user-agreement-yes';
    private readonly EXPLORE_SITES = 'closed-explore-sites-in-home';
    private showSharing = false;

    private noMoreNewActivities = false;
    private preloadMoreActivitiesIntermediate = false;

    private readonly FAB_FLAG = 'webfront-fab-clicked';

    private showSubjectDialog = false;

    private subjectsInDialog: IUserPreview[] = [];

    private submissions: ISubmission[] | null = null;

    get isNarrowFeedUI() {
      return readNarrowUI(this.$store);
    }

    private async mounted() {
        this.userProfile = readUserProfile(this.$store);
        if (this.userProfile && this.userProfile.locale_preference) {
            setAppLocale(this, this.userProfile.locale_preference);
            if (this.userProfile.flags && this.userProfile.flags.split(' ').includes(this.YES_FLAG)) {
                this.showUserAgreement = false;
            } else {
                this.showUserAgreement = true;
                this.overlay = true;
            }
        }
        if (this.userProfile) {
            await dispatchCaptureApiError(this.$store, async () => {
                const response = await api.getActivities(this.$store.state.main.token,  {
                    limit: this.loadingLimit,
                });
                this.activities = combinedActivities(response.data);
                if (this.userProfile!.flags && this.userProfile!.flags.split(' ').includes(this.EXPLORE_SITES)) {
                    this.showExploreSites = false;
                } else if (this.activities.length === 0) {
                    this.showExploreSites = true;
                }
                this.loadingActivities = false;
            });

            this.preloadMoreActivities();

            window.onscroll = () => {
                const bottomOfWindow = Math.max(
                    window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) +
                    window.innerHeight + 300 >= document.documentElement.offsetHeight;
                if (bottomOfWindow) {
                    this.preloadMoreActivities();
                }
            };
        } else {
            this.loadingActivities = false;
        }

        await dispatchCaptureApiError(this.$store, async () => {
            this.loadingSubmissions = true;
            this.submissions = (await apiSubmission.getForUser(this.$store.state.main.token)).data;
            this.loadingSubmissions = false;
        });
    }

    private async onCloseExploreSites() {
        this.showExploreSites = false;
        await this.addFlag(this.EXPLORE_SITES);
    }

    private async onFabClicked() {
        this.overlay = false;
        await this.addFlag(this.FAB_FLAG);
    }

    private async continueUserAgreement() {
        this.showUserAgreement = false;
        await this.addFlag(this.YES_FLAG);
        if (this.userProfile) {
            if (!this.$vuetify.breakpoint.mdAndUp) {
                if (this.userProfile.flags && this.userProfile.flags.split(' ').includes(this.FAB_FLAG)) {
                    this.overlay = false;
                } else {
                    this.showFabHint = true;
                }
            } else {
                this.overlay = false;
            }
        }
    }

    private async preloadMoreActivities() {
        if (this.activities.length !== 0) {
            this.preloadMoreActivitiesIntermediate = true;
            await dispatchCaptureApiError(this.$store, async () => {
                const response = await api.getActivities(this.$store.state.main.token,  {
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

    private async addFlag(flag: string) {
        let flags: string[] = [];
        if (this.userProfile) {
            if (this.userProfile.flags) {
                flags = this.userProfile.flags.split(' ');
            }
            if (!flags.includes(flag)) {
                flags.push(flag);
            }
            await dispatchUpdateUserProfileQuiet(this.$store, {
                flags: flags.join(' '),
            });
        }
    }
    private showSubjects(subjects: IUserPreview[]) {
        this.showSubjectDialog = true;
        this.subjectsInDialog = subjects;
    }
    private async toggleSharing() {
        this.showSharing = !this.showSharing;
    }
}
</script>

<style scoped>
.bottom-info-panel, .fab {
    z-index: 30;
}

.fixed-narrow-col {
    max-width: 800px;
    padding-left: 0;
    padding-right: 0;
}

.fixed-narrow-sidecol {
    max-width: 400px;
}

.c-card {
  box-shadow: 0 5px 10px -10px rgba(85,85,85,.08),
  0 10px 20px 0 rgba(85,85,85,.06),
  0 15px 30px 0 rgba(85,85,85,.03)
  !important;
}
</style>