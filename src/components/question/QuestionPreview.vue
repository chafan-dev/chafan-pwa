<template>
  <div :class="theme.feed.questionPreview.classes">
    <div class="title" style="word-break: normal">
      <router-link
        :class="theme.feed.questionPreview.link.classes"
        :to="'/questions/' + questionPreview.uuid"
      >
        {{ questionPreview.title }}
      </router-link>
    </div>
    <div v-if="shortDesc" class="grey--text subtitle-2">
      {{ shortDesc }}
    </div>

    <div :class="theme.feed.questionPreview.stats.classes">
      <v-lazy>
        <QuestionUpvotes
          :disabled="disabled"
          :uuid="questionPreview.uuid"
          :upvotes-placeholder="
            questionPreview.upvotes ? questionPreview.upvotes : upvotesPlaceholder
          "
        />
      </v-lazy>
      <div class="align-self-center pl-2">
        <CommentsIcon class="mr-1" small />
        <span v-if="!$vuetify.breakpoint.mobile" class="text-caption">
          {{ questionPreview.comments_count }}条评论
        </span>
        <span v-else class="text-caption">{{ questionPreview.comments_count }}</span>
      </div>
      <div class="align-self-center pl-2">
        <AnswerIcon class="mr-1" small />
        <span v-if="!$vuetify.breakpoint.mobile" class="text-caption">
          {{ questionPreview.answers_count }}个回答
        </span>
        <span v-else class="text-caption">{{ questionPreview.answers_count }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IQuestionPreview, IQuestionUpvotes } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { Component, Prop } from 'vue-property-decorator';

import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import QuestionUpvotes from '@/components/question/QuestionUpvotes.vue';
import { CVue } from '@/common';

@Component({
  components: { QuestionUpvotes, BaseCard, SiteBtn, AnswerIcon, CommentsIcon },
})
export default class QuestionPreview extends CVue {
  @Prop() public readonly questionPreview!: IQuestionPreview;
  @Prop() public readonly upvotesPlaceholder: IQuestionUpvotes | undefined;
  @Prop() public readonly disabledPlaceholder: boolean | undefined;

  get shortDesc() {
    let d = this.questionPreview.desc?.rendered_text;
    if (!d) {
      return null;
    }
    d = d.trim();
    if (d.length > 60) {
      return d.substring(0, 60) + '..';
    } else {
      return d;
    }
  }

  get disabled() {
    if (this.disabledPlaceholder !== undefined) {
      return this.disabledPlaceholder;
    }
    return !this.userProfile || this.userProfile.uuid === this.questionPreview.author.uuid;
  }
}
</script>
