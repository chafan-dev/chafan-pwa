<template>
  <v-main>
    <v-container fill-height fluid>
      <QuestionPreview
        :question-preview="exampleQuestionPreview"
        :upvotes-placeholder="upvotesPlaceholder"
      />
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import { IQuestionPreview, IQuestionUpvotes } from '@/interfaces';
import { exampleQuestionPreview, exampleQuestionUpvotes } from '@/mock/data';

@Component({
  components: { QuestionPreview },
})
export default class Showcase extends Vue {
  private exampleQuestionPreview: IQuestionPreview = exampleQuestionPreview;
  private upvotesPlaceholder: IQuestionUpvotes = exampleQuestionUpvotes;
}
</script>
