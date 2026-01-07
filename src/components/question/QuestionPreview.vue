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
    <div v-if="shortDesc" class="grey--text text-body-2 mb-1">
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
        <span v-if="isDesktop" class="text-caption">
          {{ questionPreview.comments_count }}条评论
        </span>
        <span v-else class="text-caption">{{ questionPreview.comments_count }}</span>
      </div>
      <div class="align-self-center pl-2">
        <AnswerIcon class="mr-1" small />
        <span v-if="isDesktop" class="text-caption">
          {{ questionPreview.answers_count }}个回答
        </span>
        <span v-else class="text-caption">{{ questionPreview.answers_count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IQuestionPreview, IQuestionUpvotes } from '@/interfaces';
import { useAuth, useResponsive, useTheme } from '@/composables';

import AnswerIcon from '@/components/icons/AnswerIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import QuestionUpvotes from '@/components/question/QuestionUpvotes.vue';

const props = defineProps<{
  questionPreview: IQuestionPreview;
  upvotesPlaceholder?: IQuestionUpvotes;
  disabledPlaceholder?: boolean;
}>();

const { userProfile } = useAuth();
const { isDesktop } = useResponsive();
const { theme } = useTheme();

const shortDesc = computed(() => {
  let d = props.questionPreview.desc?.rendered_text;
  if (!d) {
    return null;
  }
  d = d.trim();
  if (d.length > 60) {
    return d.substring(0, 60) + '..';
  } else {
    return d;
  }
});

const disabled = computed(() => {
  if (props.disabledPlaceholder !== undefined) {
    return props.disabledPlaceholder;
  }
  return !userProfile.value || userProfile.value.uuid === props.questionPreview.author.uuid;
});
</script>
