<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row v-else justify="center">
      <v-col
        :class="{
          'col-8': $vuetify.breakpoint.mdAndUp,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !$vuetify.breakpoint.mdAndUp,
        }"
        class="mb-12"
        fluid
      >
        <v-tabs
          v-model="currentTabItem"
          :align-with-title="$vuetify.breakpoint.mdAndUp"
          :fixed-tabs="$vuetify.breakpoint.mdAndUp"
          show-arrows
        >
          <v-tabs-slider />
          <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
            {{ item.text }}
            <span v-if="item.tabExtraCount && site" class="ml-1">
              ({{ item.tabExtraCount(site) }})
            </span>
          </v-tab>

          <v-tab-item value="questions">
            <DynamicItemList
              v-if="readable"
              v-slot="{ item }"
              :loadItems="loadQuestions"
              emptyItemsText="No questions for now"
            >
              <QuestionPreview :questionPreview="item" />
            </DynamicItemList>
            <div v-else-if="userProfile" class="my-4 text-center">
              {{ $t('Only site members can view its content.') }}
            </div>
            <div v-else class="my-4 text-center">
              {{ $t('登录后查看更多') }}
            </div>
          </v-tab-item>

          <v-tab-item value="submissions">
            <DynamicItemList
              v-if="readable"
              v-slot="{ item }"
              :loadItems="loadSubmissions"
              emptyItemsText="No submissions for now"
            >
              <SubmissionCard :submission="item" />
            </DynamicItemList>
            <div v-else-if="userProfile" class="my-4 text-center">
              {{ $t('Only site members can view its content.') }}
            </div>
            <div v-else class="my-4 text-center">
              {{ $t('登录后查看更多') }}
            </div>
          </v-tab-item>

          <v-tab-item value="members">
            <div v-if="siteProfiles !== null" class="my-4">
              <template v-for="i in Math.floor((this.siteProfiles.length - 1) / memberCols) + 1">
                <v-row :key="i">
                  <template v-for="j in memberCols">
                    <v-col :key="(i - 1) * memberCols + (j - 1)">
                      <UserCard
                        v-if="(i - 1) * memberCols + (j - 1) < siteProfiles.length"
                        :compactMode="true"
                        :siteKarmas="siteProfiles[(i - 1) * memberCols + (j - 1)].karma"
                        :userPreview="siteProfiles[(i - 1) * memberCols + (j - 1)].owner"
                      />
                    </v-col>
                  </template>
                </v-row>
              </template>
            </div>
            <div v-else class="my-4 text-center">
              {{ $t('Only site members can view its content.') }}
            </div>
          </v-tab-item>
        </v-tabs>
      </v-col>

      <v-col
        v-if="$vuetify.breakpoint.mdAndUp"
        :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'"
      >
        <SiteCard
          :compactMode="false"
          :isMember="siteProfile !== null"
          :showQuestionEditor="showQuestionEditor"
          :showSubmissionEditor="showSubmissionEditor"
          :site="site"
        />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" bottom fab fixed right>
            <InfoIcon />
          </v-btn>
        </template>
        <v-sheet class="pa-2">
          <SiteCard
            :compactMode="false"
            :isMember="siteProfile !== null"
            :showQuestionEditor="showQuestionEditor"
            :showSubmissionEditor="showSubmissionEditor"
            :site="site"
          />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api } from '@/api';
import { IQuestionPreview, ISite, ISubmission, IUserSiteProfile } from '@/interfaces';

import SiteCard from '@/components/SiteCard.vue';
import UserCard from '@/components/UserCard.vue';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';

import InfoIcon from '@/components/icons/InfoIcon.vue';

import { readNarrowUI, readToken, readUserProfile } from '@/store/main/getters';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Route, RouteRecord } from 'vue-router';
import * as _ from 'lodash';

@Component({
  components: {
    QuestionPreview,
    SiteCard,
    UserCard,
    InfoIcon,
    SubmissionCard,
    DynamicItemList,
  },
})
export default class Site extends Vue {
  private readonly memberCols = this.$vuetify.breakpoint.mdAndUp ? 2 : 1;
  private site: ISite | null = null;
  private siteProfile: IUserSiteProfile | null = null;
  private siteProfiles: IUserSiteProfile[] | null = null;
  private showQuestionEditor = false;
  private showSubmissionEditor = false;
  private loading = true;
  private tabItems = [
    {
      code: 'questions',
      text: this.$t('Questions'),
      tabExtraCount: (site: ISite) => site.questions_count,
    },
    {
      code: 'submissions',
      text: this.$t('Sharings'),
      tabExtraCount: (site: ISite) => site.submissions_count,
    },
    {
      code: 'members',
      text: this.$t('Members'),
      tabExtraCount: (site: ISite) => site.members_count,
    },
  ];

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get readable() {
    return this.site && (this.siteProfile !== null || this.site.public_readable);
  }

  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : 'questions';
  }

  set currentTabItem(tab) {
    if (tab !== 'questions') {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }

  get token() {
    return readToken(this.$store);
  }

  get subdomain() {
    return this.$route.params.subdomain;
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'site');
    if (matched && !_.isEqual(to.params, from.params)) {
      this.loading = true;
      this.site = null;
      this.siteProfile = null;
      this.siteProfiles = null;
      this.load();
    }
  }

  public async mounted() {
    await this.load();
  }

  private async load() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.site = (await api.getSite(this.token, this.subdomain)).data;

      if (this.userProfile) {
        this.siteProfile = (
          await api.getUserSiteProfile(this.token, this.site.uuid, this.userProfile.uuid)
        ).data;
      }

      if (this.siteProfile !== null || this.site.public_readable) {
        if (this.siteProfile) {
          this.siteProfiles = (await api.getSiteProfiles(this.token, this.site.uuid)).data.sort(
            (a, b) => {
              if (a.karma > b.karma) {
                return -1;
              }
              return 1;
            }
          );
        }
      }
      if (this.siteProfile !== null || this.site!.public_writable_question) {
        this.showQuestionEditor = true;
      }
      if (this.siteProfile !== null || this.site!.public_writable_submission) {
        this.showSubmissionEditor = true;
      }
      this.loading = false;
    });
  }

  private async loadQuestions(skip: number, limit: number) {
    let items: IQuestionPreview[] | null = null;
    if (this.siteProfile !== null || (this.site && this.site.public_readable)) {
      await dispatchCaptureApiError(this.$store, async () => {
        if (this.site) {
          items = (await api.getSiteQuestions(this.token, this.site.uuid, skip, limit)).data;
        }
      });
    }
    return items;
  }

  private async loadSubmissions(skip: number, limit: number) {
    let items: ISubmission[] | null = null;
    if (this.siteProfile !== null || (this.site && this.site.public_readable)) {
      await dispatchCaptureApiError(this.$store, async () => {
        if (this.site) {
          items = (await api.getSiteSubmissions(this.token, this.site.uuid, skip, limit)).data;
        }
      });
    }
    return items;
  }
}
</script>

<style scoped>
.less-left-right-padding {
  padding-left: 6px !important;
  padding-right: 6px !important;
}

/* FIXME: Potential code duplication with Home.vue */
.fixed-narrow-col {
  max-width: 800px;
  padding-left: 0;
  padding-right: 0;
}

.fixed-narrow-sidecol {
  max-width: 400px;
}
</style>
