<template>
  <div class="pa-2">
    <div class="title" style="word-break: normal">
      <router-link :to="'/questions/' + questionPreview.uuid" class="text-decoration-none">
        {{ questionPreview.title }}
      </router-link>
    </div>
    <div
      v-if="questionPreview.description_text && questionPreview.description_text.trim()"
      class="grey--text subtitle-2"
    >
      {{ shortDesc }}
    </div>
    <div class="d-flex">
      <v-lazy>
        <QuestionUpvotes
          :class="{
            'mr-2': $vuetify.breakpoint.mobile,
            'mr-6': !$vuetify.breakpoint.mobile,
          }"
          :uuid="questionPreview.uuid"
          :disabled="!userProfile || userProfile.uuid === questionPreview.author.uuid"
        />
      </v-lazy>
      <div
        :class="{
          'mr-2': $vuetify.breakpoint.mobile,
          'mr-6': !$vuetify.breakpoint.mobile,
        }"
      >
        <CommentsIcon class="mr-1" small />
        <span v-if="!$vuetify.breakpoint.mobile" class="text-caption">
          {{ questionPreview.comments_count }}条评论
        </span>
        <span v-else class="text-caption">{{ questionPreview.comments_count }}</span>
      </div>
      <div>
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
import { IQuestionPreview } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import { readUserProfile } from '@/store/main/getters';
import QuestionUpvotes from '@/components/question/QuestionUpvotes.vue';

@Component({
  components: { QuestionUpvotes, BaseCard, SiteBtn, AnswerIcon, CommentsIcon },
})
export default class QuestionPreview extends Vue {
  @Prop() public readonly questionPreview!: IQuestionPreview;

  get shortDesc() {
    const d = this.questionPreview.description_text!;
    if (d.length > 60) {
      return d.substring(0, 60) + '..';
    } else {
      return d;
    }
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }
}
</script>
