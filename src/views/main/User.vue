<template>
  <v-container fluid>
    <v-row justify="center">
      <!-- Main panel -->
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <UserCard
          v-if="userPublic || userPublicForVisitor"
          :userPreview="userPublic ? userPublic : userPublicForVisitor"
          :userPublic="userPublic ? userPublic : userPublicForVisitor"
          class="mb-4 mx-7 pb-7"
        />
        <v-skeleton-loader v-else type="card" />

        <div v-if="loggedIn" class="mx-7">
          <v-tabs
            v-model="currentTabItem"
            :align-with-title="$vuetify.breakpoint.mdAndUp"
            :fixed-tabs="$vuetify.breakpoint.mdAndUp"
            show-arrows
          >
            <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
              {{ $t(item.text) }}
              <span v-if="item.tabExtraCount && userPublic" class="ml-1">
                ({{ item.tabExtraCount(userPublic) }})
              </span>
            </v-tab>

            <v-tab-item class="pt-2" value="profile">
              <template v-if="userPublic">
                <div
                  v-if="
                    userPublic.homepage_url ||
                    userPublic.github_username ||
                    userPublic.twitter_username ||
                    userPublic.linkedin_url
                  "
                  class="my-3"
                >
                  <span class="subheading secondary--text text--lighten-3"
                    >{{ $t('Links') }}:
                  </span>
                  <a
                    v-if="userPublic.homepage_url"
                    :href="userPublic.homepage_url"
                    class="text-decoration-none"
                    target="_blank"
                  >
                    <WebIcon />
                    {{ $t('个人主页') }}
                  </a>
                  <a
                    v-if="userPublic.github_username"
                    :href="canonicalURLfromUsername(userPublic.github_username, 'github.com')"
                    class="text-decoration-none"
                    target="_blank"
                  >
                    <GithubIcon />
                    Github
                  </a>
                  <a
                    v-if="userPublic.twitter_username"
                    :href="canonicalURLfromUsername(userPublic.twitter_username, 'twitter.com')"
                    class="text-decoration-none"
                    target="_blank"
                  >
                    <TwitterIcon />
                    Twitter
                  </a>
                  <a
                    v-if="userPublic.linkedin_url"
                    :href="userPublic.linkedin_url"
                    class="text-decoration-none"
                    target="_blank"
                  >
                    <LinkedinIcon />
                    Linkedin
                  </a>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="userPublic">
                <div v-if="userPublic.residency_topics.length > 0" class="my-3">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('居住过的地方') }}
                  </div>
                  <div>
                    <v-chip-group :column="!$vuetify.breakpoint.mobile">
                      <v-chip
                        v-for="topic in userPublic.residency_topics"
                        :key="topic.uuid"
                        :to="'/topics/' + topic.uuid"
                        >{{ topic.name }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="userPublic">
                <div v-if="userPublic.profession_topic" class="my-3">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('所在行业') }}
                  </div>
                  <div class="title primary--text text--darken-2">
                    <v-chip :to="'/topics/' + userPublic.profession_topic.uuid"
                      >{{ userPublic.profession_topic.name }}
                    </v-chip>
                  </div>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="eduExps">
                <div v-if="eduExps.length > 0" class="my-3">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('教育经历') }}
                  </div>
                  <div
                    v-for="(eduExp, index) in eduExps"
                    :key="index"
                    class="title primary--text text--darken-2"
                  >
                    <router-link
                      :to="'/topics/' + eduExp.school_topic.uuid"
                      class="text-decoration-none"
                    >
                      {{ eduExp.school_topic.name }}
                    </router-link>
                    ({{ $t(eduExp.level) }})
                  </div>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="workExps" class="my-3">
                <div v-if="workExps.length > 0" class="my-3">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('工作经历') }}
                  </div>
                  <div
                    v-for="(workExp, index) in workExps"
                    :key="index"
                    class="title primary--text text--darken-2"
                  >
                    <router-link
                      :to="'/topics/' + workExp.position_topic.uuid"
                      class="text-decoration-none"
                    >
                      {{ workExp.position_topic.name }}
                    </router-link>
                    @
                    <router-link
                      :to="'/topics/' + workExp.company_topic.uuid"
                      class="text-decoration-none"
                    >
                      {{ workExp.company_topic.name }}
                    </router-link>
                  </div>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="sites !== null">
                <div v-if="sites.length > 0">
                  <div
                    v-if="$vuetify.breakpoint.mdAndUp"
                    class="subheading secondary--text text--lighten-3"
                  >
                    {{ $t('Circles') }}:
                    <span>
                      <SiteBtn v-for="site in sites" :key="site.uuid" :site="site" />
                    </span>
                  </div>
                  <div v-else>
                    <span class="subheading secondary--text text--lighten-3 mr-2"
                      >{{ $t('Circles') }}:</span
                    >
                    <SiteBtn v-for="site in sites" :key="site.uuid" :site="site" />
                  </div>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="userPublic">
                <div v-if="userPublic.subscribed_topics.length > 0" class="my-3">
                  <div class="subheading secondary--text text--lighten-3">
                    {{ $t('关注的话题') }}
                  </div>
                  <v-chip
                    v-for="topic in userPublic.subscribed_topics"
                    :key="topic.uuid"
                    :to="'/topics/' + topic.uuid"
                    class="mr-1 mb-1"
                    small
                    >{{ topic.name }}
                  </v-chip>
                </div>
              </template>
              <v-skeleton-loader v-else type="text" />

              <template v-if="userPublic">
                <div v-if="currentUserId === userPublic.uuid" class="text-center mt-2">
                  <v-btn color="primary" small to="/profile/edit">{{ $t('编辑个人页面') }}</v-btn>
                </div>
              </template>
              <div v-else class="d-flex justify-center">
                <v-skeleton-loader type="button" />
              </div>
            </v-tab-item>

            <v-tab-item class="pt-2" value="answers">
              <DynamicItemList
                v-if="userPublic"
                v-slot="{ item }"
                :loadItems="loadAnswers"
                emptyItemsText="暂无"
                nullItemsText=""
              >
                <Answer :answerPreview="item" />
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item class="pt-2" value="questions">
              <DynamicItemList
                v-if="userPublic"
                v-slot="{ item }"
                :loadItems="loadQuestions"
                emptyItemsText="暂无"
                nullItemsText=""
              >
                <QuestionPreview :questionPreview="item" />
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item class="pt-2" value="articles">
              <DynamicItemList
                v-if="userPublic"
                v-slot="{ item }"
                :loadItems="loadArticles"
                emptyItemsText="暂无"
                nullItemsText=""
              >
                <ArticlePreview :articlePreview="item" />
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item class="pt-2" value="submissions">
              <DynamicItemList
                v-if="userPublic"
                v-slot="{ item }"
                :loadItems="loadSubmissions"
                emptyItemsText="暂无"
                nullItemsText=""
              >
                <SubmissionCard :submission="item" />
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item value="followers">
              <div v-if="followers !== null" class="my-4">
                <p v-if="followers.length === 0">{{ $t('暂无') }}</p>
                <UserGrid :users="followers" />
              </div>
              <v-skeleton-loader v-else type="paragraph" />
            </v-tab-item>

            <v-tab-item value="followed">
              <div v-if="followed !== null" class="my-4">
                <p v-if="followed.length === 0">{{ $t('暂无') }}</p>
                <UserGrid :users="followed" />
              </div>
              <v-skeleton-loader v-else type="paragraph" />
            </v-tab-item>
          </v-tabs>
        </div>
        <div v-else class="ml-7 mr-7">
          <div class="text-center">
            <RegisteredUserOnlyIcon class="mr-2" />
            <span>{{ $t('登录后查看更多') }}</span>
          </div>
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
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import Answer from '@/components/Answer.vue';
import UserCard from '@/components/UserCard.vue';

import SiteBtn from '@/components/SiteBtn.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';
import UserLink from '@/components/UserLink.vue';
import UserGrid from '@/components/UserGrid.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';

import TwitterIcon from '@/components/icons/TwitterIcon.vue';
import WebIcon from '@/components/icons/WebIcon.vue';
import GithubIcon from '@/components/icons/GithubIcon.vue';
import LinkedinIcon from '@/components/icons/LinkedinIcon.vue';

import { dispatchCaptureApiError } from '@/store/main/actions';
import { readIsLoggedIn, readToken, readUserProfile } from '@/store/main/getters';
import RegisteredUserOnlyIcon from '@/components/icons/RegisteredUserOnlyIcon.vue';
import { Route, RouteRecord } from 'vue-router';
import { isEqual } from '@/common';

@Component({
  components: {
    RegisteredUserOnlyIcon,
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
    DynamicItemList,
  },
})
export default class User extends Vue {
  private tabItems = [
    {
      code: 'profile',
      text: 'Profile',
      render: this.renderProfileTab,
    },
    {
      code: 'answers',
      text: 'Answers',
      tabExtraCount: (userPublic: IUserPublic) => userPublic.answers_count,
    },
    {
      code: 'questions',
      text: 'Questions',
      tabExtraCount: (userPublic: IUserPublic) => userPublic.questions_count,
    },
    {
      code: 'articles',
      text: 'Articles',
      tabExtraCount: (userPublic: IUserPublic) => userPublic.articles_count,
    },
    {
      code: 'submissions',
      text: 'Sharings',
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
  private userPublic: IUserPublic | null = null;
  private userPublicForVisitor: IUserPublicForVisitor | null = null;
  private followers: IUserPreview[] | null = null;
  private followed: IUserPreview[] | null = null;
  private eduExps: IUserEducationExperience[] | null = null;
  private workExps: IUserWorkExperience[] | null = null;
  private sites: ISite[] | null = null;

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get currentUserId() {
    return readUserProfile(this.$store)?.uuid;
  }

  get handle() {
    return this.$route.params.handle;
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

  get token() {
    return readToken(this.$store);
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'user');
    if (matched && !isEqual(to.params, from.params)) {
      this.userPublic = null;
      this.userPublicForVisitor = null;
      this.followers = null;
      this.followed = null;
      this.eduExps = null;
      this.workExps = null;
      this.sites = null;
      this.load();
    }
  }

  public async mounted() {
    await this.load();
  }

  private async load() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.loggedIn) {
        this.userPublic = (await apiPeople.getUserPublic(this.token, this.handle)).data;
        const currentItem = this.tabItems.find((item) => item.code === this.currentTabItem);
        if (currentItem && currentItem.render) {
          await currentItem.render(this.userPublic);
        }
        await Promise.all(
          this.tabItems.map(async (item) => {
            if (item.code !== this.currentTabItem && this.userPublic) {
              if (item.render) {
                await item.render(this.userPublic);
              }
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

  private async loadAnswers(skip: number, limit: number) {
    let items: IAnswerPreview[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.userPublic !== null) {
        items = (await apiPeople.getAnswersByAuthor(this.token, this.userPublic.uuid, skip, limit))
          .data;
      }
    });
    return items;
  }

  private async loadQuestions(skip: number, limit: number) {
    let items: IQuestionPreview[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.userPublic !== null) {
        items = (
          await apiPeople.getQuestionsByAuthor(this.token, this.userPublic.uuid, skip, limit)
        ).data;
      }
    });
    return items;
  }

  private async loadSubmissions(skip: number, limit: number) {
    let items: ISubmission[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.userPublic !== null) {
        items = (
          await apiPeople.getSubmissionsByAuthor(this.token, this.userPublic.uuid, skip, limit)
        ).data;
      }
    });
    return items;
  }

  private async loadArticles(skip: number, limit: number) {
    let items: IArticlePreview[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.userPublic !== null) {
        items = (await apiPeople.getArticlesByAuthor(this.token, this.userPublic.uuid, skip, limit))
          .data;
      }
    });
    return items;
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
