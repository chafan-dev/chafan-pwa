<template>
  <span class="event-span text-body-2" @click="onClick">
    <Interpolate :template="verbTemplate">
      <template #who>
        <span v-if="event.content.subject && event.content.subject.uuid === currentUserId">我</span>
        <UserLink
          v-else-if="event.content.subject"
          :enable-popup="false"
          :userPreview="event.content.subject"
        />
      </template>

      <template #user>
        <span v-if="event.content.user && event.content.user.uuid === currentUserId">我</span>
        <UserLink
          v-else-if="event.content.user"
          :enable-popup="false"
          :userPreview="event.content.user"
        />
      </template>

      <template #invited_email>
        <span v-if="event.content.invited_email">{{ event.content.invited_email }}</span>
      </template>

      <template #reward_coin_amount>
        <a v-if="event.content.reward" href="/dashboard?tab=coins">{{
          event.content.reward.coin_amount
        }}</a>
      </template>

      <template #comment>
        <CommentPreview v-if="event.content.comment" :comment="event.content.comment" />
      </template>

      <template #article>
        <router-link v-if="event.content.article" :to="`/articles/${event.content.article.uuid}`">{{
          event.content.article.title
        }}</router-link>
      </template>

      <template #article_column>
        <router-link
          v-if="event.content.article_column"
          :to="`/article-columns/${event.content.article_column.uuid}`"
          >{{ event.content.article_column.name }}</router-link
        >
      </template>

      <template #message>
        <span v-if="event.content.message">{{ event.content.message }}</span>
      </template>

      <template #reply>
        <CommentPreview v-if="event.content.reply" :comment="event.content.reply" />
      </template>

      <template #remark>
        <span v-if="event.content.payment_amount && event.content.verb === 'invited_user_activated'">
          ，你已经收到 {{ event.content.payment_amount }} 硬币奖励
        </span>
      </template>

      <template #parent_comment>
        <CommentPreview
          v-if="event.content.parent_comment"
          :comment="event.content.parent_comment"
        />
      </template>

      <!-- `question` is either the event's own question or the one its answer belongs to. -->
      <template #question>
        <router-link
          v-if="event.content.question"
          :to="`/questions/${event.content.question.uuid}`"
          >{{ event.content.question.title }}</router-link
        >
        <router-link
          v-else-if="event.content.answer"
          :to="`/questions/${event.content.answer.question.uuid}`"
          >{{ event.content.answer.question.title }}</router-link
        >
      </template>

      <template #submission>
        <router-link
          v-if="event.content.submission"
          :to="`/submissions/${event.content.submission.uuid}`"
          >{{ event.content.submission.title }}</router-link
        >
      </template>

      <template #submission_suggestion>
        <router-link
          v-if="event.content.submission_suggestion"
          :to="`/submissions/${event.content.submission_suggestion.submission.uuid}/suggestions/${event.content.submission_suggestion.uuid}`"
          >{{ event.content.submission_suggestion.title }}</router-link
        >
      </template>

      <template #answer_suggest_edit>
        <router-link
          v-if="event.content.answer_suggest_edit"
          :to="`/questions/${event.content.answer_suggest_edit.answer.question.uuid}/answers/${event.content.answer_suggest_edit.answer.uuid}/suggestions/${event.content.answer_suggest_edit.uuid}`"
          >{{ event.content.answer_suggest_edit.answer.question.title }}</router-link
        >
      </template>

      <template #site>
        <router-link v-if="event.content.site" :to="`/sites/${event.content.site.subdomain}`">{{
          event.content.site.name
        }}</router-link>
      </template>

      <template #answer>
        <router-link
          v-if="event.content.answer"
          :to="`/questions/${event.content.answer.question.uuid}/answers/${event.content.answer.uuid}`"
          >{{ event.content.answer.body }}</router-link
        >
      </template>

      <template #channel_message>
        <router-link v-if="event.content.channel" :to="`/channels/${event.content.channel.id}`">
          私信
        </router-link>
      </template>
    </Interpolate>
    (<RelativeTime :datetime="event.created_at" />)
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IEvent } from '@/interfaces';
import { eventVerbCN } from '@/i18n';
import Interpolate from '@/components/Interpolate.vue';
import UserLink from '@/components/UserLink.vue';
import CommentPreview from '@/components/CommentPreview.vue';
import RelativeTime from '@/components/RelativeTime.vue';
import { useAuth } from '@/composables';

const props = withDefaults(
  defineProps<{
    event: IEvent;
    onClickHandler?: () => void;
    enableUserLinkPopup?: boolean;
  }>(),
  {
    enableUserLinkPopup: true,
  }
);

const { currentUserId } = useAuth();

// Fall back to the raw verb so an unknown event still shows something.
const verbTemplate = computed(
  () => eventVerbCN[props.event.content.verb] ?? props.event.content.verb
);

function onClick() {
  if (props.onClickHandler) {
    props.onClickHandler();
  }
}
</script>
