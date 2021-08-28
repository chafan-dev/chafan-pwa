<template>
  <v-main>
    <v-container fill-height fluid>
      <div>
        <v-sheet outlined>
          <QuestionPreview
            :question-preview="mockData.exampleQuestionPreview"
            :upvotes-placeholder="mockData.exampleQuestionUpvotes"
            :disabled-placeholder="questionPreviewDisabled"
          />
        </v-sheet>
        <div class="d-flex">
          <v-switch label="upvoted" v-model="mockData.exampleQuestionUpvotes.upvoted" />
          <v-switch class="ml-4" label="disabled" v-model="questionPreviewDisabled" />
        </div>
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import * as mockData from '@/mock/data';

@Component({
  components: { QuestionPreview },
})
export default class Showcase extends Vue {
  private mockData = mockData;
  private questionPreviewDisabled = false;
}
</script>
