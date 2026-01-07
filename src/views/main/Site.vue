<template>
  <v-container :class="{ 'pa-1': !isDesktop }" fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row class="pt-3 pb-10" justify="center" v-else>
      <v-col
        :class="{
          'col-8': isDesktop && !isNarrowFeedUI,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !isDesktop,
        }"
        class="mb-12"
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
              emptyItemsText="暂无问题"
            >
              <QuestionPreview :questionPreview="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="submissions">
            <DynamicItemList
              v-if="readable"
              v-slot="{ item }"
              :loadItems="loadSubmissions"
              emptyItemsText="暂无分享"
            >
              <SubmissionPreview :submission="item" />
            </DynamicItemList>
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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from '@/router';
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
import { isEqual, updateHead } from '@/common';
import { apiSite } from '@/api/site';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';
import { useAuth, useResponsive } from '@/composables';

const store = useStore();
const route = useRoute();
const router = useRouter();
const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();

const site = ref<ISite | null>(null);
const siteProfile = ref<IUserSiteProfile | null>(null);
const siteProfiles = ref<IUserSiteProfile[] | null>(null);
const showAskActionDialog = ref(false);
const enableQuestionEditor = ref(false);
const showSubmissionActionDialog = ref(false);
const enableSubmissionEditor = ref(false);
const loading = ref(true);
const tabItems = [
  {
    code: 'questions',
    text: '问题',
    tabExtraCount: (s: ISite) => s.questions_count,
  },
  {
    code: 'submissions',
    text: '分享',
    tabExtraCount: (s: ISite) => s.submissions_count,
  },
  {
    code: 'members',
    text: '成员列表',
    tabExtraCount: (s: ISite) => s.members_count,
  },
];

const isNarrowFeedUI = computed(() => readNarrowUI(store));

const readable = computed(() => {
  return site.value && (siteProfile.value !== null || site.value.public_readable);
});

const currentTabItem = computed({
  get() {
    return route.query.tab ? route.query.tab : 'questions';
  },
  set(tab) {
    if (tab !== 'questions') {
      router.replace({ query: { ...route.query, tab: tab as string } });
    } else {
      router.replace({ query: { ...route.query, tab: undefined } });
    }
  },
});

const subdomain = computed(() => route.params.subdomain as string);

// Watch for route changes (replaces beforeRouteUpdate)
watch(
  () => route.params.subdomain,
  (newSubdomain, oldSubdomain) => {
    if (newSubdomain !== oldSubdomain && route.name === 'site') {
      loading.value = true;
      site.value = null;
      siteProfile.value = null;
      siteProfiles.value = null;
      load();
    }
  }
);

onMounted(async () => {
  await load();
});

async function load() {
  await dispatchCaptureApiError(store, async () => {
    site.value = (await apiSite.getSite(subdomain.value)).data;
    updateHead(route.path, site.value.name, site.value?.description);

    if (userProfile.value) {
      siteProfile.value = (
        await api.getUserSiteProfile(token.value, site.value.uuid, userProfile.value.uuid)
      ).data;
    }

    if (siteProfile.value !== null || site.value.public_readable) {
      if (siteProfile.value) {
        siteProfiles.value = (await api.getSiteProfiles(token.value, site.value.uuid)).data.sort(
          (a, b) => {
            if (a.karma > b.karma) {
              return -1;
            }
            return 1;
          }
        );
      }
    }
    if (siteProfile.value !== null || site.value!.public_writable_question) {
      enableQuestionEditor.value = true;
    }
    if (siteProfile.value !== null || site.value!.public_writable_submission) {
      enableSubmissionEditor.value = true;
    }
    loading.value = false;
  });
}

async function loadQuestions(skip: number, limit: number) {
  let items: IQuestionPreview[] | null = null;
  if (siteProfile.value !== null || (site.value && site.value.public_readable)) {
    await dispatchCaptureApiError(store, async () => {
      if (site.value) {
        items = (await apiSite.getSiteQuestions(token.value, site.value.uuid, skip, limit)).data;
      }
    });
  }
  return items;
}

async function loadSubmissions(skip: number, limit: number) {
  let items: ISubmission[] | null = null;
  if (siteProfile.value !== null || (site.value && site.value.public_readable)) {
    await dispatchCaptureApiError(store, async () => {
      if (site.value) {
        items = (await apiSite.getSiteSubmissions(token.value, site.value.uuid, skip, limit)).data;
      }
    });
  }
  return items;
}
</script>
