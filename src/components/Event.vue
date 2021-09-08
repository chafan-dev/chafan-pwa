<template>
  <span class="event-span body-2" @click="onClick">
    <i18n :path="'verb.' + event.content.verb">
      <UserLink
        v-if="event.content.subject && event.content.subject.uuid !== currentUserId"
        :enable-popup="false"
        :userPreview="event.content.subject"
        place="who"
      />
      <span v-if="event.content.subject && event.content.subject.uuid === currentUserId" place="who"
        >我</span
      >

      <UserLink
        v-if="event.content.user && event.content.user.uuid !== currentUserId"
        :enable-popup="false"
        :userPreview="event.content.user"
        place="user"
      />
      <span v-else-if="event.content.user && event.content.user.uuid === currentUserId" place="user"
        >我</span
      >

      <span v-if="event.content.invited_email" place="invited_email">{{
        event.content.invited_email
      }}</span>

      <a v-if="event.content.reward" href="/dashboard?tab=coins" place="reward_coin_amount">{{
        event.content.reward.coin_amount
      }}</a>

      <span v-if="event.content.comment" place="comment">
        <CommentPreview :comment="event.content.comment" />
      </span>

      <router-link
        v-if="event.content.article"
        :to="`/articles/${event.content.article.uuid}`"
        place="article"
        >{{ event.content.article.title }}</router-link
      >

      <router-link
        v-if="event.content.article_column"
        :to="`/article-columns/${event.content.article_column.uuid}`"
        place="article_column"
        >{{ event.content.article_column.name }}</router-link
      >

      <span v-if="event.content.message" place="message">
        {{ event.content.message }}
      </span>

      <span v-if="event.content.reply" place="reply">
        <CommentPreview :comment="event.content.reply" />
      </span>

      <span
        v-if="event.content.payment_amount && event.content.verb === 'invited_user_activated'"
        place="remark"
      >
        ，你已经收到 {{ event.content.payment_amount }} 硬币奖励
      </span>

      <span v-if="event.content.parent_comment" place="parent_comment">
        <CommentPreview :comment="event.content.parent_comment" />
      </span>

      <router-link
        v-if="event.content.question"
        :to="`/questions/${event.content.question.uuid}`"
        place="question"
        >{{ event.content.question.title }}</router-link
      >

      <router-link
        v-if="event.content.submission"
        :to="`/submissions/${event.content.submission.uuid}`"
        place="submission"
        >{{ event.content.submission.title }}</router-link
      >

      <router-link
        v-if="event.content.submission_suggestion"
        :to="`/submissions/${event.content.submission_suggestion.submission.uuid}/suggestions/${event.content.submission_suggestion.uuid}`"
        place="submission_suggestion"
        >{{ event.content.submission_suggestion.title }}</router-link
      >

      <router-link
        v-if="event.content.site"
        :to="`/sites/${event.content.site.subdomain}`"
        place="site"
        >{{ event.content.site.name }}</router-link
      >

      <router-link
        v-if="event.content.answer"
        :to="`/questions/${event.content.answer.question.uuid}`"
        place="question"
        >{{ event.content.answer.question.title }}</router-link
      >

      <router-link
        v-if="event.content.answer"
        :to="`/questions/${event.content.answer.question.uuid}/answers/${event.content.answer.uuid}`"
        place="answer"
        >{{ event.content.answer.body }}</router-link
      >

      <router-link
        v-if="event.content.channel"
        :to="`/channels/${event.content.channel.id}`"
        place="channel_message"
      >
        私信
      </router-link>
    </i18n>
    ({{ $dayjs.utc(event.created_at).local().fromNow() }})
  </span>
</template>

<script lang="ts">
import { IEvent } from '@/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import UserLink from '@/components/UserLink.vue';
import CommentPreview from '@/components/CommentPreview.vue';
import Viewer from '@/components/Viewer.vue';
import { readUserProfile } from '@/store/main/getters';

@Component({
  components: { UserLink, CommentPreview, Viewer },
})
export default class Event extends Vue {
  @Prop() public readonly event!: IEvent;
  @Prop() public readonly onClickHandler: (() => void) | undefined;
  @Prop({ default: true }) public readonly enableUserLinkPopup!: boolean;

  get currentUserId() {
    return readUserProfile(this.$store)?.uuid;
  }

  private onClick() {
    if (this.onClickHandler) {
      this.onClickHandler();
    }
  }
}
</script>
