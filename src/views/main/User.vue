<template>
  <v-container fluid>
    <v-row justify="center">
      <!-- Main panel -->
      <v-col class="max-w-1000">
        <UserProfileCard
          v-if="userPublic || userPublicForVisitor"
          :userPreview="userPublic ? userPublic : userPublicForVisitor"
          :userPublic="userPublic ? userPublic : userPublicForVisitor"
          class="mb-4"
        />
        <v-skeleton-loader v-else type="card" />

          <v-tabs v-model="currentTabItem" :fixed-tabs="isDesktop" show-arrows>
            <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
              {{ item.text }}
              <span v-if="item.tabExtraCount && userPublic" class="ml-1">
                ({{ item.tabExtraCount(userPublic) }})
              </span>
            </v-tab>

            <v-tab-item class="pt-2" value="recent">
              <UserFeed
                v-if="userPublic"
                :enable-show-explore-sites="false"
                :subject-user-uuid="userPublic.uuid"
                :user-profile="userProfile"
              />
            </v-tab-item>

            <v-tab-item class="pt-2" value="answers">
              <DynamicItemList
                v-slot="{ item }"
                :loadItems="loadAnswers"
                emptyItemsText="暂无回答"
                nullItemsText=""
              >
                <Answer :answerPreview="item" />
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item class="pt-2" value="questions">
              <DynamicItemList
                v-slot="{ item }"
                :loadItems="loadQuestions"
                emptyItemsText="暂无问题"
                nullItemsText=""
              >
                <QuestionPreview :questionPreview="item" />
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item class="pt-2" value="articles">
              <DynamicItemList
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
                v-slot="{ item }"
                :loadItems="loadSubmissions"
                emptyItemsText="暂无"
                nullItemsText=""
              >
                <SubmissionPreview :submission="item" />
              </DynamicItemList>
            </v-tab-item>
          </v-tabs>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from '@/router';
import { apiPeople } from '@/api/people';
import { info } from '@/logging';

import {
  IAnswerPreview,
  IArticlePreview,
  IQuestionPreview,
  ISubmission,
  IUserPublic,
  IUserPublicForVisitor,
} from '@/interfaces';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import Answer from '@/components/Answer.vue';
import UserProfileCard from '@/components/UserProfileCard.vue';

import SiteBtn from '@/components/SiteBtn.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import UserLink from '@/components/UserLink.vue';
import UserGrid from '@/components/UserGrid.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';

import { dispatchCaptureApiError } from '@/store/main/actions';
import RegisteredUserOnlyIcon from '@/components/icons/RegisteredUserOnlyIcon.vue';
import { isEqual, updateHead } from '@/common';
import UserFeed from '@/components/home/UserFeed.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import { useAuth, useResponsive } from '@/composables';

const store = useStore();
const route = useRoute();
const router = useRouter();
const { token, loggedIn, userProfile } = useAuth();
const { isDesktop } = useResponsive();

const tabItems = [
  {
    code: 'recent',
    text: '动态',
  },
  {
    code: 'answers',
    text: '回答',
    tabExtraCount: (userPublic: IUserPublic) => userPublic.answers_count,
  },
  {
    code: 'questions',
    text: '问题',
    tabExtraCount: (userPublic: IUserPublic) => userPublic.questions_count,
  },
  {
    code: 'articles',
    text: '文章',
    tabExtraCount: (userPublic: IUserPublic) => userPublic.articles_count,
  },
  {
    code: 'submissions',
    text: '分享',
    tabExtraCount: (userPublic: IUserPublic) => userPublic.submissions_count,
  },
];

const userPublic = ref<IUserPublic | null>(null);
const userPublicForVisitor = ref<IUserPublicForVisitor | null>(null);

const handle = computed(() => route.params.handle as string);

const currentTabItem = computed({
  get() {
    return route.query.tab ? route.query.tab : 'recent';
  },
  set(tab) {
    if (tab !== 'recent') {
      router.replace({ query: { ...route.query, tab: tab as string } });
    } else {
      router.replace({ query: { ...route.query, tab: undefined } });
    }
  },
});

// Watch for route changes (replaces beforeRouteUpdate)
watch(
  () => route.params.handle,
  (newHandle, oldHandle) => {
    if (newHandle !== oldHandle && route.name === 'user') {
      userPublic.value = null;
      userPublicForVisitor.value = null;
      load();
    }
  }
);

onMounted(async () => {
  await load();
});

async function load() {
  await dispatchCaptureApiError(store, async () => {
    if (loggedIn.value) {
      userPublic.value = (await apiPeople.getUserPublic(token.value, handle.value)).data;
      let title = userPublic.value!.full_name || userPublic.value!.handle;
      updateHead(route.path, title, userPublic.value!.personal_introduction);
    } else {
      userPublicForVisitor.value = (await apiPeople.getUserPublic(token.value, handle.value)).data;
    }
  });
}

async function getUserUuid() {
  while (true) {
    if (userPublic.value !== null) {
      return userPublic.value.uuid;
    }
    if (userPublicForVisitor.value !== null) {
      return userPublicForVisitor.value.uuid;
    }
    await load();
  }
  return 'should_not_reach_this_branch';
}

async function loadAnswers(skip: number, limit: number) {
  let items: IAnswerPreview[] | null = null;
  let uuid = await getUserUuid();
  if (uuid !== null) {
    info('load answers, uuid = ' + uuid + ' skip = ' + skip.toString());
    items = (await apiPeople.getAnswersByAuthor(token.value, uuid, skip, limit)).data;
    info('loadAnswers items length = ' + items.length.toString());
  }
  return items;
}

async function loadQuestions(skip: number, limit: number) {
  let items: IQuestionPreview[] | null = null;
  let uuid = await getUserUuid();
  if (uuid !== null) {
    info('load questions, uuid = ' + uuid + ' skip = ' + skip.toString());
    items = (await apiPeople.getQuestionsByAuthor(token.value, uuid, skip, limit)).data;
  }
  return items;
}

async function loadSubmissions(skip: number, limit: number) {
  let items: ISubmission[] | null = null;
  await dispatchCaptureApiError(store, async () => {
    if (userPublic.value !== null) {
      items = (
        await apiPeople.getSubmissionsByAuthor(token.value, userPublic.value.uuid, skip, limit)
      ).data;
    }
  });
  return items;
}

async function loadArticles(skip: number, limit: number) {
  info('load articles info called');
  let items: IArticlePreview[] | null = null;
  let uuid = await getUserUuid();
  if (uuid !== null) {
    info('load articles, uuid = ' + uuid + ' skip = ' + skip.toString());
    items = (await apiPeople.getArticlesByAuthor(token.value, uuid, skip, limit)).data;
  }
  return items;
}
</script>
