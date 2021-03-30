<template>
  <v-card :class="{ 'c-card': !embedded }" :flat="embedded" class="pa-2">
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
      <div
        :class="{
          'mr-2': $vuetify.breakpoint.mobile,
          'mr-6': !$vuetify.breakpoint.mobile,
        }"
      >
        <CommentsIcon class="mr-1" small />
        <span v-if="!$vuetify.breakpoint.mobile" class="text-caption">
          {{ $t('n条评论', { n: questionPreview.comments_count }) }}</span
        >
        <span v-else class="text-caption">{{ questionPreview.comments_count }}</span>
      </div>
      <div>
        <AnswerIcon class="mr-1" small />
        <span v-if="!$vuetify.breakpoint.mobile" class="text-caption">
          {{ $t('n个回答', { n: questionPreview.answers_count }) }}</span
        >
        <span v-else class="text-caption">{{ questionPreview.answers_count }}</span>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { IQuestionPreview } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';

import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';

@Component({
  components: { SiteBtn, AnswerIcon, CommentsIcon },
})
export default class QuestionPreview extends Vue {
  @Prop() public readonly questionPreview!: IQuestionPreview;
  @Prop({ default: false }) private readonly embedded!: false;

  get shortDesc() {
    const d = this.questionPreview.description_text!;
    if (d.length > 60) {
      return d.substring(0, 60) + '..';
    } else {
      return d;
    }
  }
}
</script>

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
