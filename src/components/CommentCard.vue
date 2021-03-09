<template>
    <v-card class="pa-2" :class="{'c-card': !embedded }" :flat="embedded">
        <div class="d-flex mb-2">
          <SimpleViewer :body="comment.body" />
          <a class="ml-1" :href="comment.root_route + `/comments/${comment.uuid}`">
            <OpenInNewIcon />
          </a>
        </div>
        <QuestionPreview v-if="questionPreview" :questionPreview="questionPreview" />
        <Answer v-if="answerPreview" :answerPreview="answerPreview" />
        <ArticlePreview v-if="articlePreview" :articlePreview="articlePreview" />
        <CommentCard v-if="parentComment" :comment="parentComment" />
        <SubmissionCard v-if="submission" :submission="submission" />
    </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IAnswerPreview, IArticlePreview, IComment, IQuestionPreview, ISubmission } from '@/interfaces';

import SubmissionCard from '@/components/SubmissionCard.vue';
import QuestionPreview from '@/components/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import Answer from '@/components/Answer.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
import OpenInNewIcon from '@/components/icons/OpenInNewIcon.vue';

@Component({
    name: 'CommentCard',
    components: {
      QuestionPreview, ArticlePreview, Answer, OpenInNewIcon,
      SubmissionCard, SimpleViewer
    },
})
export default class CommentCard extends Vue {
    @Prop({default: true}) private readonly embedded!: false;
    @Prop() public readonly comment!: IComment;
    @Prop() public readonly submission: ISubmission | undefined;
    @Prop() public readonly questionPreview: IQuestionPreview | undefined;
    @Prop() public readonly articlePreview: IArticlePreview | undefined;
    @Prop() public readonly answerPreview: IAnswerPreview | undefined;
    @Prop() public readonly parentComment: IComment | undefined;
}
</script>

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85,85,85,.08),
  0 10px 20px 0 rgba(85,85,85,.06),
  0 15px 30px 0 rgba(85,85,85,.03)
  !important;
}
</style>