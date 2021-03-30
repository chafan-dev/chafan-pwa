<template>
  <v-card :class="{ 'c-card': !embedded }" :flat="embedded" class="pa-2">
    <div class="d-flex mb-2">
      <SimpleViewer :body="comment.body" />
      <router-link :to="comment.root_route + `/comments/${comment.uuid}`" class="ml-1">
        <OpenInNewIcon />
      </router-link>
    </div>
    <QuestionPreview v-if="questionPreview" :questionPreview="questionPreview" />
    <Answer v-if="answerPreview" :answerPreview="answerPreview" />
    <ArticlePreview v-if="articlePreview" :articlePreview="articlePreview" />
    <CommentCard v-if="parentComment" :comment="parentComment" />
    <SubmissionCard v-if="submission" :submission="submission" />
  </v-card>
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

@Component({
  name: 'CommentCard',
  components: {
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
  @Prop({ default: true }) private readonly embedded!: false;
}
</script>

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
