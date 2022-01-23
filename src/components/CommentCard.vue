<template>
  <div class="pa-2">
    <!-- Comment -->
    <div class="d-flex mb-2">
      <Viewer v-if="!comment.is_deleted" :content="comment.content" />
      <div v-else class="grey--text">已删除</div>
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
      <SubmissionPreview v-if="submission" :submission="submission" />
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

import SubmissionPreview from '@/components/SubmissionPreview.vue';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import Answer from '@/components/Answer.vue';
import Viewer from '@/components/Viewer.vue';
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
    SubmissionPreview,
    Viewer,
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
