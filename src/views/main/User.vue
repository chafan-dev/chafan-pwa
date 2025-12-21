<template>
  <v-container fluid>
    <v-row justify="center">
      <!-- Main panel -->
      <v-col style="max-width: 1000px">
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

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { apiPeople } from '@/api/people';
import  { info }  from '@/logging'


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
import { Route, RouteRecord } from 'vue-router';
import { CVue, isEqual, updateHead } from '@/common';
import UserFeed from '@/components/home/UserFeed.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';

@Component({
  components: {
    EmptyPlaceholder,
    UserFeed,
    RegisteredUserOnlyIcon,
    QuestionPreview,
    Answer,
    UserProfileCard,
    UserLink,
    SiteBtn,
    UserGrid,
    ArticlePreview,
    SubmissionPreview,
    DynamicItemList,
  },
})
export default class User extends CVue {
  private tabItems = [
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
  private userPublic: IUserPublic | null = null;
  private userPublicForVisitor: IUserPublicForVisitor | null = null;

  get handle() {
    return this.$route.params.handle;
  }

  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : 'recent';
  }

  set currentTabItem(tab) {
    if (tab !== 'recent') {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }
  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'user');
    if (matched && !isEqual(to.params, from.params)) {
      this.userPublic = null;
      this.userPublicForVisitor = null;
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
        let title = this.userPublic!.full_name || this.userPublic!.handle;
        updateHead(this.$route.path, title, this.userPublic!.personal_introduction);
      } else {
        this.userPublicForVisitor = (await apiPeople.getUserPublic(this.token, this.handle)).data;
      }
    });
  }

  private async getUserUuid() {
    while (true) {
        if (this.userPublic !== null) {
            return this.userPublic.uuid;
        }
        if (this.userPublicForVisitor !== null) {
            return this.userPublicForVisitor.uuid;
        }
        await this.load();
    }
    return "should_not_reach_this_branch";
  }
  private async loadAnswers(skip: number, limit: number) {
    let items: IAnswerPreview[] | null = null;
    let uuid = await this.getUserUuid();
    if (uuid !== null) {
        info("load answers, uuid = " + uuid + " skip = " + skip.toString());
        items = (await apiPeople.getAnswersByAuthor(this.token, uuid, skip, limit))
          .data;
        info("loadAnswers items length = " + items.length.toString());
    }
    return items;
  }

  private async loadQuestions(skip: number, limit: number) {
    let items: IQuestionPreview[] | null = null;
    let uuid = await this.getUserUuid();
    if (uuid !== null) {
        info("load questions, uuid = " + uuid + " skip = " + skip.toString());
        items = (await apiPeople.getQuestionsByAuthor(this.token, uuid, skip, limit))
          .data;
    }
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
    info("load articles info called");
    let items: IArticlePreview[] | null = null;
    let uuid = await this.getUserUuid();
    if (uuid !== null) {
        info("load articles, uuid = " + uuid + " skip = " + skip.toString());
        items = (await apiPeople.getArticlesByAuthor(this.token, uuid, skip, limit))
          .data;
    }
    return items;
  }
}
</script>
