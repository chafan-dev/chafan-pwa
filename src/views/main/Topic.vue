<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress == 0"
    />
    <v-row class="mb-12" v-else>
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

      <v-col class="col-4" v-if="$vuetify.breakpoint.mdAndUp">
        <TopicCard :topic="topic" />
      </v-col>
      <v-bottom-sheet v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab fixed right bottom v-bind="attrs" v-on="on"><InfoIcon /></v-btn>
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
  public async mounted() {
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
