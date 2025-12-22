<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
    <v-row v-else class="mb-12" justify="center">
      <v-col
        :class="{
          'col-8': $vuetify.breakpoint.mdAndUp && !isNarrowFeedUI,
          'fixed-narrow-col': isNarrowFeedUI,
          'less-left-right-padding': !$vuetify.breakpoint.mdAndUp,
        }"
      >
        <v-tabs>
          <v-tab>问题</v-tab>
          <v-tab-item>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadQuestions"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <QuestionPreview :questionPreview="item" />
            </DynamicItemList>
          </v-tab-item>
        </v-tabs>
      </v-col>

      <v-col
        v-if="$vuetify.breakpoint.mdAndUp"
        :class="isNarrowFeedUI ? 'fixed-narrow-sidecol' : 'col-4'"
      >
        <TopicCard :topic="topic" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <div v-bind="attrs" v-on="on" class="bottom-btn">
            <InfoIcon />
            <span class="ml-1 grey--text">话题信息</span>
          </div>
        </template>
        <v-sheet class="pa-2">
          <TopicCard :topic="topic" />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { apiTopic } from '@/api/topic';
import { IQuestionPreview, ITopic } from '@/interfaces';
import QuestionLink from '@/components/question/QuestionLink.vue';
import TopicCard from '@/components/TopicCard.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Route, RouteRecord } from 'vue-router';
import { CVue, isEqual } from '@/common';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import DynamicItemList from '@/components/DynamicItemList.vue';
import { readNarrowUI } from '@/store/main/getters';

@Component({
  components: { DynamicItemList, QuestionPreview, QuestionLink, TopicCard, InfoIcon },
})
export default class Topic extends CVue {
  private topic: ITopic | null = null;
  private questions: IQuestionPreview[] = [];
  private loading = true;
  private loadingProgress = 0;

  get id() {
    return this.$route.params.id;
  }

  get isNarrowFeedUI() {
    return readNarrowUI(this.$store);
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'topic');
    if (matched && !isEqual(to.params, from.params)) {
      this.loading = true;
      this.loadingProgress = 0;
      this.questions = [];
      this.load();
    }
  }

  public async mounted() {
    await this.load();
  }

  private async load() {
    await dispatchCaptureApiError(this.$store, async () => {
      const response = await apiTopic.getTopic(this.id);
      this.loadingProgress = 33;
      if (response) {
        this.topic = response.data;
        this.loadingProgress = 100;
        this.loading = false;
      }
    });
  }

  private async loadQuestions(skip: number, limit: number) {
    // TODO: implement pagination
    if (skip > 0) {
      return [];
    }
    let items: IQuestionPreview[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.topic !== null) {
        items = (await apiTopic.getQuestionsOfTopic(this.token, this.topic.uuid)).data;
      }
    });
    return items;
  }
}
</script>
