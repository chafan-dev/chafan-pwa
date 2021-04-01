<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress == 0"
    />
    <v-row v-else class="mb-12">
      <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
        <v-card class="ma-3 pa-3">
          <v-card-title primary-title>
            <div class="headline primary--text">{{ $t('Questions') }}</div>
          </v-card-title>
          <ul>
            <li v-for="question in questions" :key="question.uuid">
              <QuestionLink :questionPreview="question"></QuestionLink>
            </li>
          </ul>
        </v-card>
      </v-col>

      <v-col v-if="$vuetify.breakpoint.mdAndUp" class="col-4">
        <TopicCard :topic="topic" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" bottom fab fixed right>
            <InfoIcon />
          </v-btn>
        </template>
        <v-sheet class="pa-2">
          <TopicCard :topic="topic" />
        </v-sheet>
      </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { apiTopic } from '@/api/topic';
import { IQuestionPreview, ITopic } from '@/interfaces';
import QuestionLink from '@/components/question/QuestionLink.vue';
import TopicCard from '@/components/TopicCard.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Route, RouteRecord } from 'vue-router';
import { isEqual } from '@/common';

@Component({
  components: { QuestionLink, TopicCard, InfoIcon },
})
export default class Topic extends Vue {
  private topic: ITopic | null = null;
  private questions: IQuestionPreview[] = [];
  private loading = true;
  private loadingProgress = 0;

  get id() {
    return this.$route.params.id;
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
      const response = await apiTopic.getTopic(this.$store.state.main.token, this.id);
      this.loadingProgress = 33;
      if (response) {
        this.topic = response.data;
        const response2 = await apiTopic.getQuestionsOfTopic(
          this.$store.state.main.token,
          this.topic.uuid
        );
        this.loadingProgress = 66;
        if (response2) {
          this.questions = response2.data;
        }
        this.loadingProgress = 100;
        this.loading = false;
      }
    });
  }
}
</script>
