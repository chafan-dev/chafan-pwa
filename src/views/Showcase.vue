<template>
  <v-main>
    <v-container fill-height fluid>
      <v-row justify="center">
        <v-col :class="{ 'col-8': $vuetify.breakpoint.mdAndUp }" fluid>
          <v-card>
            <v-card-text>
              <ContribGraphs />
            </v-card-text>
          </v-card>
          <v-divider class="my-4" />
          <v-card>
            <v-card-text>
              <Answer
                v-if="answerExample === 0"
                :key="answerExample"
                :answer-preview="mockData.exampleAnswerPreview"
                :answer-prop="mockData.exampleAnswer"
                :show-author="true"
                :load-full="true"
                :answer-upvotes-prop="mockData.exampleAnswerUpvotes"
                :answer-prop-delay-milli-seconds-for-test="1000"
              />
              <Answer
                v-if="answerExample === 1"
                :key="answerExample"
                :answer-preview="mockData.exampleAnswerPreview2"
                :answer-prop="mockData.exampleAnswer2"
                :show-author="true"
                :answer-upvotes-prop="mockData.exampleAnswerUpvotes"
              />
            </v-card-text>
            <v-card-actions>
              <v-card-actions>
                <v-select label="answer example" :items="[0, 1]" v-model="answerExample" />
              </v-card-actions>
            </v-card-actions>
          </v-card>
          <v-divider class="my-4" />
          <v-card>
            <v-card-text>
              <v-sheet outlined>
                <QuestionPreview
                  :question-preview="mockData.exampleQuestionPreview"
                  :upvotes-placeholder="mockData.exampleQuestionUpvotes"
                  :disabled-placeholder="questionPreviewDisabled"
                />
              </v-sheet>
            </v-card-text>
            <v-card-actions>
              <v-switch label="upvoted" v-model="mockData.exampleQuestionUpvotes.upvoted" />
              <v-switch class="ml-4" label="disabled" v-model="questionPreviewDisabled" />
            </v-card-actions>
          </v-card>
          <v-divider class="my-4" />
          <v-card>
            <v-card-text>
              <v-sheet outlined>
                <UserGrid :users="mockData.randomUserPreviews" />
              </v-sheet>
            </v-card-text>
          </v-card>
          <v-divider class="my-4" />
          <v-row>
            <v-col>
              <ExampleSubmissionPreview />
            </v-col>
            <v-col>
              <RotationCard v-slot="{ item }" :items="mockData.sites" title="相关站点">
                <SiteCard :is-member="true" :compact-mode="true" :site="item" />
              </RotationCard>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import * as mockData from '@/mock/data';
import UserGrid from '@/components/UserGrid.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import ExampleSubmissionPreview from '@/views/showcase/ExampleSubmissionPreview.vue';
import RotationCard from '@/components/base/RotationCard.vue';
import SiteCard from '@/components/SiteCard.vue';
import Answer from '@/components/Answer.vue';
import ContribGraph from '@/components/widgets/ContribGraph.vue';
import ContribGraphs from '@/components/widgets/ContribGraphs.vue';

@Component({
  components: {
    ContribGraphs,
    ContribGraph,
    Answer,
    SiteCard,
    RotationCard,
    ExampleSubmissionPreview,
    SubmissionPreview,
    UserGrid,
    QuestionPreview,
  },
})
export default class Showcase extends Vue {
  private mockData = mockData;
  private questionPreviewDisabled = false;

  private answerExample: number = 0;
}
</script>
