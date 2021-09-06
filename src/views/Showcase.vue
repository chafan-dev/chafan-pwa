<template>
  <v-main>
    <v-container fill-height fluid>
      <div>
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
        <ExampleSubmissionPreview />
        <v-divider class="my-4" />
        <RotationCard v-slot="{ item }" :items="mockData.sites" title="相关站点">
          <SiteCard :is-member="true" :compact-mode="true" :site="item" />
        </RotationCard>
      </div>
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

@Component({
  components: {
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
}
</script>
