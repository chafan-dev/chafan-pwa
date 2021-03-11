<template>
  <v-container>
    <v-row justify="center">
      <!-- Main panel -->
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <UserCard
          :userPreview="userPublic ? userPublic : userPublicForVisitor"
          :userPublic="userPublic ? userPublic : userPublicForVisitor"
          v-if="userPublic || userPublicForVisitor"
          class="mb-4 mx-7 pb-7"
        />
        <v-skeleton-loader type="card" v-else />

        <div v-if="loggedIn" class="mx-7">
          <v-tabs
            v-model="currentTabItem"
            show-arrows
            :align-with-title="$vuetify.breakpoint.mdAndUp"
            :fixed-tabs="$vuetify.breakpoint.mdAndUp"
          >
            <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
              {{ $t(item.text) }}
              <span v-if="item.tabExtraCount && userPublic" class="ml-1">
                ({{ item.tabExtraCount(userPublic) }})
              </span>
            </v-tab>

            <v-tab-item value="profile" class="pt-2">
              <template v-if="userPublic">
                <div
                  class="my-3"
                  v-if="
                    userPublic.homepage_url ||
                    userPublic.github_username ||
                    userPublic.twitter_username ||
                    userPublic.linkedin_url
                  "
                >
                  <span class="subheading secondary--text text--lighten-3"
                    >{{ $t('Links') }}:
                  </span>
                  <a
                    class="text-decoration-none"
                    v-if="userPublic.homepage_url"
                    :href="userPublic.homepage_url"
                    target="_blank"
                  >
                    <WebIcon /> {{ $t('个人主页') }}
                  </a>
                  <a
                    class="text-decoration-none"
                    v-if="userPublic.github_username"
                    :href="canonicalURLfromUsername(userPublic.github_username, 'github.com')"
                    target="_blank"
                  >
                    <GithubIcon /> Github
                  </a>
                  <a
                    class="text-decoration-none"
                    v-if="userPublic.twitter_username"
                    :href="canonicalURLfromUsername(userPublic.twitter_username, 'twitter.com')"
                    target="_blank"
                  >
                    <TwitterIcon /> Twitter
                  </a>
                  <a
                    class="text-decoration-none"
                    v-if="userPublic.linkedin_url"
                    :href="userPublic.linkedin_url"
                    target="_blank"
                  >
                    <LinkedinIcon /> Linkedin
                  </a>
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template v-if="userPublic">
                <div class="my-3" v-if="userPublic.residency_topics.length > 0">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('居住过的地方') }}
                  </div>
                  <div>
                    <v-chip-group :column="!$vuetify.breakpoint.mobile">
                      <v-chip
                        :to="'/topics/' + topic.uuid"
                        v-for="topic in userPublic.residency_topics"
                        :key="topic.uuid"
                        >{{ topic.name }}</v-chip
                      >
                    </v-chip-group>
                  </div>
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template v-if="userPublic">
                <div class="my-3" v-if="userPublic.profession_topic">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('所在行业') }}
                  </div>
                  <div class="title primary--text text--darken-2">
                    <v-chip :to="'/topics/' + userPublic.profession_topic.uuid">{{
                      userPublic.profession_topic.name
                    }}</v-chip>
                  </div>
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template v-if="eduExps">
                <div class="my-3" v-if="eduExps.length > 0">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('教育经历') }}
                  </div>
                  <div
                    class="title primary--text text--darken-2"
                    v-for="(eduExp, index) in eduExps"
                    :key="index"
                  >
                    <a class="text-decoration-none" :href="'/topics/' + eduExp.school_topic.uuid">
                      {{ eduExp.school_topic.name }}
                    </a>
                    ({{ $t(eduExp.level) }})
                  </div>
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template class="my-3" v-if="workExps">
                <div class="my-3" v-if="workExps.length > 0">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('工作经历') }}
                  </div>
                  <div
                    class="title primary--text text--darken-2"
                    v-for="(workExp, index) in workExps"
                    :key="index"
                  >
                    <a
                      class="text-decoration-none"
                      :href="'/topics/' + workExp.position_topic.uuid"
                    >
                      {{ workExp.position_topic.name }}
                    </a>
                    @
                    <a class="text-decoration-none" :href="'/topics/' + workExp.company_topic.uuid">
                      {{ workExp.company_topic.name }}
                    </a>
                  </div>
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template v-if="sites !== null">
                <div v-if="sites.length > 0">
                  <div
                    v-if="$vuetify.breakpoint.mdAndUp"
                    class="subheading secondary--text text--lighten-3"
                  >
                    {{ $t('Circles') }}:
                    <span>
                      <SiteBtn v-for="site in sites" :site="site" :key="site.uuid" />
                    </span>
                  </div>
                  <div v-else>
                    <span class="subheading secondary--text text--lighten-3 mr-2"
                      >{{ $t('Circles') }}:</span
                    >
                    <SiteBtn :site="site" v-for="site in sites" :key="site.uuid" />
                  </div>
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template v-if="userPublic">
                <div class="my-3" v-if="userPublic.subscribed_topics.length > 0">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('关注的话题') }}
                  </div>
                  <v-chip
                    small
                    class="mr-1 mb-1"
                    :to="'/topics/' + topic.uuid"
                    v-for="topic in userPublic.subscribed_topics"
                    :key="topic.uuid"
                    >{{ topic.name }}</v-chip
                  >
                </div>
              </template>
              <v-skeleton-loader type="text" v-else />

              <template v-if="userPublic">
                <div class="text-center mt-2" v-if="currentUserId === userPublic.uuid">
                  <v-btn to="/profile/edit" small color="primary">{{ $t('编辑个人页面') }}</v-btn>
                </div>
              </template>
              <div class="d-flex justify-center" v-else>
                <v-skeleton-loader type="button" />
              </div>
            </v-tab-item>

            <v-tab-item value="answers">
              <template v-if="authoredAnswers !== null">
                <p v-if="authoredAnswers.length === 0">{{ $t('暂无') }}</p>
                <Answer
                  v-for="answer in authoredAnswers"
                  :key="answer.uuid"
                  class="my-4"
                  :answerPreview="answer"
                /> </template
              ><v-skeleton-loader type="paragraph" v-else />
            </v-tab-item>

            <v-tab-item value="questions">
              <template v-if="askedQuestions !== null">
                <p v-if="askedQuestions.length === 0">{{ $t('暂无') }}</p>
                <QuestionPreview
                  :questionPreview="question"
                  class="my-4"
                  v-for="question in askedQuestions"
                  :key="question.uuid"
                /> </template
              ><v-skeleton-loader type="paragraph" v-else />
            </v-tab-item>

            <v-tab-item value="articles">
              <template v-if="articles !== null">
                <p v-if="articles.length === 0">{{ $t('暂无') }}</p>
                <ArticlePreview
                  :articlePreview="article"
                  class="my-4"
                  :key="article.uuid"
                  v-for="article in articles"
                /> </template
              ><v-skeleton-loader type="paragraph" v-else />
            </v-tab-item>

            <v-tab-item value="submissions">
              <template v-if="submissions !== null">
                <p v-if="submissions.length === 0">{{ $t('暂无') }}</p>
                <SubmissionCard
                  :submission="submission"
                  class="my-4"
                  v-for="submission in submissions"
                  :key="submission.uuid"
                /> </template
              ><v-skeleton-loader type="paragraph" v-else />
            </v-tab-item>

            <v-tab-item value="followers">
              <div v-if="followers !== null" class="my-4">
                <p v-if="followers.length === 0">{{ $t('暂无') }}</p>
                <UserGrid :users="followers" />
              </div>
              <v-skeleton-loader type="paragraph" v-else />
            </v-tab-item>

            <v-tab-item value="followed">
              <div v-if="followed !== null" class="my-4">
                <p v-if="followed.length === 0">{{ $t('暂无') }}</p>
                <UserGrid :users="followed" />
              </div>
              <v-skeleton-loader type="paragraph" v-else />
            </v-tab-item>
          </v-tabs>
        </div>
        <div class="ml-7 mr-7" v-else>
          <v-skeleton-loader type="paragraph" boilerplate />
          <div class="text-center">{{ $t('登录后查看更多') }}</div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api } from '@/api';
import { apiPeople } from '@/api/people';

import {
  IAnswerPreview,
  IArticlePreview,
  IQuestionPreview,
  ISite,
  ISubmission,
  IUserEducationExperience,
  IUserPreview,
  IUserPublic,
  IUserPublicForVisitor,
  IUserWorkExperience,
} from '@/interfaces';
import QuestionPreview from '@/components/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import Answer from '@/components/Answer.vue';
import UserCard from '@/components/UserCard.vue';

import SiteBtn from '@/components/SiteBtn.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';
import UserLink from '@/components/UserLink.vue';
import UserGrid from '@/components/UserGrid.vue';

import TwitterIcon from '@/components/icons/TwitterIcon.vue';
import WebIcon from '@/components/icons/WebIcon.vue';
import GithubIcon from '@/components/icons/GithubIcon.vue';
import LinkedinIcon from '@/components/icons/LinkedinIcon.vue';

import { dispatchCaptureApiError } from '@/store/main/actions';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
  components: {
    QuestionPreview,
    Answer,
    UserCard,
    UserLink,
    SiteBtn,
    TwitterIcon,
    WebIcon,
    GithubIcon,
    UserGrid,
    LinkedinIcon,
    ArticlePreview,
    SubmissionCard,
  },
})
export default class User extends Vue {
  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get currentUserId() {
    return this.$store.state.main.userProfile.uuid;
  }

  get handle() {
    return this.$router.currentRoute.params.handle;
  }

  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : 'profile';
  }

  set currentTabItem(tab) {
    if (tab !== 'profile') {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }

  private userPublic: IUserPublic | null = null;
  private userPublicForVisitor: IUserPublicForVisitor | null = null;

  private askedQuestions: IQuestionPreview[] | null = null;
  private submissions: ISubmission[] | null = null;
  private articles: IArticlePreview[] | null = null;
  private authoredAnswers: IAnswerPreview[] | null = null;
  private followers: IUserPreview[] | null = null;
  private followed: IUserPreview[] | null = null;

  private tabItems = [
    {
      code: 'profile',
      text: 'Profile',
      render: this.renderProfileTab,
    },
    {
      code: 'answers',
      text: 'Answers',
      render: this.renderAnswers,
      tabExtraCount: (userPublic: IUserPublic) => userPublic.answers_count,
    },
    {
      code: 'questions',
      text: 'Questions',
      render: this.renderAskedQuestions,
      tabExtraCount: (userPublic: IUserPublic) => userPublic.questions_count,
    },
    {
      code: 'articles',
      text: 'Articles',
      render: this.renderArticles,
      tabExtraCount: (userPublic: IUserPublic) => userPublic.articles_count,
    },
    {
      code: 'submissions',
      text: 'Sharings',
      render: this.renderSubmissions,
      tabExtraCount: (userPublic: IUserPublic) => userPublic.submissions_count,
    },
    {
      code: 'followers',
      text: 'Followers',
      render: this.renderFollowers,
    },
    {
      code: 'followed',
      text: 'Followed',
      render: this.renderFollowed,
    },
  ];

  private eduExps: IUserEducationExperience[] | null = null;
  private workExps: IUserWorkExperience[] | null = null;
  private sites: ISite[] | null = null;

  public async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.loggedIn) {
        this.userPublic = (await apiPeople.getUserPublic(this.token, this.handle)).data;
        const currentItem = this.tabItems.find((item) => item.code === this.currentTabItem);
        if (currentItem) {
          await currentItem.render(this.userPublic);
        }
        await Promise.all(
          this.tabItems.map(async (item) => {
            if (item.code !== this.currentTabItem && this.userPublic) {
              await item.render(this.userPublic);
            }
          })
        );
      } else {
        this.userPublicForVisitor = (await apiPeople.getUserPublic(this.token, this.handle)).data;
      }
    });
  }

  private canonicalURLfromUsername(username: string, domain: string) {
    if (username.startsWith(domain)) {
      return 'https://' + username;
    } else if (username.includes(domain)) {
      return username;
    } else {
      return 'https://' + domain + '/' + username;
    }
  }

  get token() {
    return this.$store.state.main.token;
  }

  private async renderAnswers(userPublic: IUserPublic) {
    this.authoredAnswers = (await apiPeople.getAnswersByAuthor(this.token, userPublic.uuid)).data;
  }

  private async renderAskedQuestions(userPublic: IUserPublic) {
    this.askedQuestions = (await apiPeople.getQuestionsByAuthor(this.token, userPublic.uuid)).data;
  }

  private async renderSubmissions(userPublic: IUserPublic) {
    this.submissions = (await apiPeople.getSubmissionsByAuthor(this.token, userPublic.uuid)).data;
  }

  private async renderArticles(userPublic: IUserPublic) {
    this.articles = (await apiPeople.getArticlesByAuthor(this.token, userPublic.uuid)).data;
  }
  private async renderFollowers(userPublic: IUserPublic) {
    this.followers = (await apiPeople.getUserFollowers(this.token, userPublic.uuid)).data;
  }
  private async renderFollowed(userPublic: IUserPublic) {
    this.followed = (await apiPeople.getUserFollowed(this.token, userPublic.uuid)).data;
  }

  private async renderProfileTab(userPublic: IUserPublic) {
    this.eduExps = (await apiPeople.getUserEducationExperiences(this.token, userPublic.uuid)).data;
    this.workExps = (await apiPeople.getUserWorkExperiences(this.token, userPublic.uuid)).data;
    const responses = await Promise.all(
      userPublic.profiles.map((p) => api.getSite(this.token, p.site.subdomain))
    );
    this.sites = responses.map((r) => r.data);
  }
}
</script>
