<template>
  <v-container :class="{ 'pa-1': !this.isDesktop }" fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row class="pt-3 pb-10" justify="center" v-else>
      <v-col
        :class="{
          'col-8': isDesktop,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !isDesktop,
        }"
        class="mb-12 mx-4"
        fluid
      >
        <div class="d-flex mb-2" v-if="site">
          <div v-if="enableQuestionEditor">
            <v-btn
              class="primary darken-2 mr-1"
              depressed
              small
              @click="showAskActionDialog = true"
            >
              提问
            </v-btn>
            <v-dialog v-model="showAskActionDialog" max-width="500">
              <CreateQuestionForm :site="site" :showTitle="true" />
            </v-dialog>
          </div>
          <div v-if="enableSubmissionEditor">
            <v-btn class="mr-1" depressed small @click="showSubmissionActionDialog = true"
              >新分享</v-btn
            >
            <v-dialog v-model="showSubmissionActionDialog" max-width="500">
              <CreateSubmissionForm :site="site" :showTitle="true" />
            </v-dialog>
          </div>
        </div>
        <v-tabs
          v-model="currentTabItem"
          :align-with-title="isDesktop"
          :fixed-tabs="isDesktop"
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
            <div v-else-if="userProfile" class="my-4 text-center">仅圈子成员可以查看该内容</div>
            <div v-else class="my-4 text-center">登录后查看更多</div>
          </v-tab-item>

          <v-tab-item value="submissions">
            <DynamicItemList
              v-if="readable"
              v-slot="{ item }"
              :loadItems="loadSubmissions"
              emptyItemsText="No submissions for now"
            >
              <SubmissionPreview :submission="item" />
            </DynamicItemList>
            <div v-else-if="loggedIn" class="my-4 text-center">仅圈子成员可以查看该内容</div>
            <div v-else class="my-4 text-center">登录后查看更多</div>
          </v-tab-item>

          <v-tab-item value="members">
            <div v-if="siteProfiles !== null" class="pa-4">
              <v-lazy v-for="profile in siteProfiles" :key="profile.owner.uuid">
                <UserCard
                  class="my-2"
                  :compactMode="true"
                  :siteKarmas="profile.karma"
                  :userPreview="profile.owner"
                />
              </v-lazy>
            </div>
            <div v-else class="my-4 text-center">仅圈子成员可以查看该内容</div>
          </v-tab-item>
        </v-tabs>
      </v-col>

      <v-col v-if="isDesktop" :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'">
        <SiteCard :compactMode="false" :isMember="siteProfile !== null" :site="site" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="bottom-btn">
            <InfoIcon />
            <span class="ml-1 grey--text">圈子信息</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <SiteCard :compactMode="false" :isMember="siteProfile !== null" :site="site" />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { api } from '@/api';
import { IQuestionPreview, ISite, ISubmission, IUserSiteProfile } from '@/interfaces';

import SiteCard from '@/components/SiteCard.vue';
import UserCard from '@/components/UserCard.vue';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';

import InfoIcon from '@/components/icons/InfoIcon.vue';

import { readNarrowUI } from '@/store/main/getters';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Route, RouteRecord } from 'vue-router';
import { CVue, isEqual, updateHead } from '@/common';
import { apiSite } from '@/api/site';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';

@Component({
  components: {
    CreateSubmissionForm,
    CreateQuestionForm,
    QuestionPreview,
    SiteCard,
    UserCard,
    InfoIcon,
    SubmissionPreview,
    DynamicItemList,
  },
})
export default class Site extends CVue {
  private readonly memberCols = this.$vuetify.breakpoint.mdAndUp ? 2 : 1;
  private site: ISite | null = null;
  private siteProfile: IUserSiteProfile | null = null;
  private siteProfiles: IUserSiteProfile[] | null = null;
  private showAskActionDialog = false;
  private enableQuestionEditor = false;
  private showSubmissionActionDialog = false;
  private enableSubmissionEditor = false;
  private loading = true;
  private tabItems = [
    {
      code: 'questions',
      text: '问题',
      tabExtraCount: (site: ISite) => site.questions_count,
    },
    {
      code: 'submissions',
      text: '分享',
      tabExtraCount: (site: ISite) => site.submissions_count,
    },
    {
      code: 'members',
      text: '成员列表',
      tabExtraCount: (site: ISite) => site.members_count,
    },
  ];

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
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

  get subdomain() {
    return this.$route.params.subdomain;
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'site');
    if (matched && !isEqual(to.params, from.params)) {
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
      this.site = (await apiSite.getSite(this.subdomain)).data;
      updateHead(this.$route.path, this.site.name, this.site?.description);

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
        this.enableQuestionEditor = true;
      }
      if (this.siteProfile !== null || this.site!.public_writable_submission) {
        this.enableSubmissionEditor = true;
      }
      this.loading = false;
    });
  }

  private async loadQuestions(skip: number, limit: number) {
    let items: IQuestionPreview[] | null = null;
    if (this.siteProfile !== null || (this.site && this.site.public_readable)) {
      await dispatchCaptureApiError(this.$store, async () => {
        if (this.site) {
          items = (await apiSite.getSiteQuestions(this.token, this.site.uuid, skip, limit)).data;
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
          items = (await apiSite.getSiteSubmissions(this.token, this.site.uuid, skip, limit)).data;
        }
      });
    }
    return items;
  }
}
</script>
