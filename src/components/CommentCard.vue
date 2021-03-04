<template>
    <v-card :class="{'pa-3': $vuetify.breakpoint.mdAndUp, 'pa-2': $vuetify.breakpoint.smAndDown }">
        <div class="d-flex mb-2">
            {{ comment.body }}
            <a class="ml-2 text-decoration-none" :href="comment.root_route + `/comments/${comment.uuid}`">
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
import OpenInNewIcon from '@/components/icons/OpenInNewIcon.vue';

@Component({
    name: 'CommentCard',
    components: { QuestionPreview, ArticlePreview, Answer, OpenInNewIcon, SubmissionCard },
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