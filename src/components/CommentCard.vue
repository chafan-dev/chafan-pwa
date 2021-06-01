<template>
  <div class="pa-2">
    <!-- Comment -->
    <div class="d-flex mb-2">
      <SimpleViewer :body="comment.body" :editor="comment.editor" />
      <router-link :to="comment.root_route + `/comments/${comment.uuid}`" class="ml-1">
        <OpenInNewIcon small />
      </router-link>
    </div>

    <!-- Commented Object Preview -->
    <div class="quote-card pl-2">
      <QuestionPreview v-if="questionPreview" :questionPreview="questionPreview" />
      <Answer v-if="answerPreview" :answerPreview="answerPreview" />
      <ArticlePreview v-if="articlePreview" :articlePreview="articlePreview" />
      <CommentCard v-if="parentComment" :comment="parentComment" />
      <SubmissionCard v-if="submission" :submission="submission" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  IAnswerPreview,
  IArticlePreview,
  IComment,
  IQuestionPreview,
  ISubmission,
} from '@/interfaces';

import SubmissionCard from '@/components/SubmissionCard.vue';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import Answer from '@/components/Answer.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
import OpenInNewIcon from '@/components/icons/OpenInNewIcon.vue';
import BaseCard from '@/components/base/BaseCard.vue';

@Component({
  name: 'CommentCard',
  components: {
    BaseCard,
    QuestionPreview,
    ArticlePreview,
    Answer,
    OpenInNewIcon,
    SubmissionCard,
    SimpleViewer,
  },
})
export default class CommentCard extends Vue {
  @Prop() public readonly comment!: IComment;
  @Prop() public readonly submission: ISubmission | undefined;
  @Prop() public readonly questionPreview: IQuestionPreview | undefined;
  @Prop() public readonly articlePreview: IArticlePreview | undefined;
  @Prop() public readonly answerPreview: IAnswerPreview | undefined;
  @Prop() public readonly parentComment: IComment | undefined;
}
</script>
