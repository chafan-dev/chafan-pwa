<template>
  <v-container fluid>
    <v-row fluid justify="center">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }">
        <div class="mb-1">
          <div class="headline primary--text mb-3">探索</div>
          <v-tabs v-model="currentTabItem">
            <v-tab href="#featured-answers"> 精选回答 </v-tab>
            <v-tab href="#questions"> 发现问题 </v-tab>
            <v-tab href="#sites"> 所有圈子 </v-tab>
            <v-tab href="#users"> 关注更多用户 </v-tab>

            <v-tab-item class="mt-2" eager value="featured-answers">
              <DynamicItemList
                v-slot="{ item }"
                :loadItems="loadFeaturedAnswers"
                emptyItemsText="暂无精选问题"
              >
                <BaseCard class="c-card">
                  <Answer :answer-preview="item" />
                </BaseCard>
              </DynamicItemList>
            </v-tab-item>

            <v-tab-item class="mt-2" eager value="questions">
              <div v-if="interestingQuestions !== null" class="pb-2">
                <QuestionPreview
                  v-for="questionPreview in interestingQuestions"
                  :key="questionPreview.uuid"
                  :questionPreview="questionPreview"
                />
              </div>
              <v-skeleton-loader v-else type="paragraph" />
              <p class="mt-2 text-center">不定期更新</p>
            </v-tab-item>
            <v-tab-item class="mt-2" eager value="sites">
              <ExploreSitesGrid />
            </v-tab-item>
            <v-tab-item class="mt-2" eager value="users">
              <div v-if="interestingUsers !== null">
                <UserGrid :users="interestingUsers" />
              </div>
              <v-skeleton-loader v-else type="paragraph" />
              <p class="mt-2 text-center">不定期更新</p>
            </v-tab-item>
          </v-tabs>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { apiDiscovery } from '@/api/discovery';
import ExploreSitesGrid from '@/components/ExploreSitesGrid.vue';
import { Component } from 'vue-property-decorator';
import { IAnswerPreview, IQuestionPreview, IUserPreview } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import UserGrid from '@/components/UserGrid.vue';
import { CVue } from '@/common';
import DynamicItemList from '@/components/DynamicItemList.vue';
import Answer from '@/components/Answer.vue';
import BaseCard from '@/components/base/BaseCard.vue';

const defaultTab = 'featured-answers';

@Component({
  components: { BaseCard, Answer, DynamicItemList, UserGrid, QuestionPreview, ExploreSitesGrid },
})
export default class Explore extends CVue {
  private interestingQuestions: IQuestionPreview[] | null = null;
  private interestingUsers: IUserPreview[] | null = null;
  private featuredAnswers: IAnswerPreview[] | null = null;

  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : defaultTab;
  }

  set currentTabItem(tab) {
    if (tab !== defaultTab) {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.interestingQuestions = (await apiDiscovery.getInterestingQuestions(this.token)).data;
      this.interestingUsers = (await apiDiscovery.getInterestingUsers(this.token)).data;
    });
  }

  private async loadFeaturedAnswers(skip: number, limit: number) {
    return (await apiDiscovery.getFeaturedAnswers(this.token, skip, limit)).data;
  }
}
</script>
