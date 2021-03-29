<template>
  <span class="event-span body-2">
    <i18n :path="'verb.' + event.content.verb">
      <UserLink
        place="who"
        v-if="event.content.subject && event.content.subject.uuid != currentUserId"
        :userPreview="event.content.subject"
      />
      <span
        place="who"
        v-if="event.content.subject && event.content.subject.uuid == currentUserId"
        >{{ $t('I') }}</span
      >

      <UserLink
        place="user"
        v-if="event.content.user && event.content.user.uuid !== currentUserId"
        :userPreview="event.content.user"
      />
      <span
        place="user"
        v-else-if="event.content.user && event.content.user.uuid === currentUserId"
        >{{ $t('me') }}</span
      >

      <span place="invited_email" v-if="event.content.invited_email">{{
        event.content.invited_email
      }}</span>

      <a place="reward_coin_amount" v-if="event.content.reward" href="/dashboard?tab=coins">{{
        event.content.reward.coin_amount
      }}</a>

      <span place="comment" v-if="event.content.comment">
        <CommentPreview :comment="event.content.comment" />
      </span>

      <a
        place="article"
        v-if="event.content.article"
        :href="`/articles/${event.content.article.uuid}`"
        >{{ event.content.article.title }}</a
      >

      <a
        place="article_column"
        v-if="event.content.article_column"
        :href="`/article-columns/${event.content.article_column.uuid}`"
        >{{ event.content.article_column.name }}</a
      >

      <span place="message" v-if="event.content.message">
        <SimpleViewer :body="event.content.message" />
      </span>

      <span place="reply" v-if="event.content.reply">
        <CommentPreview :comment="event.content.reply" />
      </span>

      <span
        place="remark"
        v-if="event.content.payment_amount && event.content.verb === 'invited_user_activated'"
      >
        {{
          $t('verb.remark.invited_user_activated', {
            payment_amount: event.content.payment_amount,
          })
        }}
      </span>

      <span place="parent_comment" v-if="event.content.parent_comment">
        <CommentPreview :comment="event.content.parent_comment" />
      </span>

      <a
        place="question"
        v-if="event.content.question"
        :href="`/questions/${event.content.question.uuid}`"
        >{{ event.content.question.title }}</a
      >

      <a
        place="submission"
        v-if="event.content.submission"
        :href="`/submissions/${event.content.submission.uuid}`"
        >{{ event.content.submission.title }}</a
      >

      <a place="site" v-if="event.content.site" :href="`/sites/${event.content.site.subdomain}`">{{
        event.content.site.name
      }}</a>

      <a
        place="question"
        v-if="event.content.answer"
        :href="`/questions/${event.content.answer.question.uuid}`"
        >{{ event.content.answer.question.title }}</a
      >

      <a
        place="answer"
        v-if="event.content.answer"
        :href="`/questions/${event.content.answer.question.uuid}/answers/${event.content.answer.uuid}`"
        >{{ event.content.answer.body }}</a
      >

      <a
        place="channel_message"
        v-if="event.content.channel"
        :href="`/channels/${event.content.channel.id}`"
      >
        {{ $t('私信') }}
      </a>
    </i18n>
    ({{ $dayjs.utc(event.created_at).local().fromNow() }})
  </span>
</template>

<script lang="ts">
import { IEvent } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import UserLink from '@/components/UserLink.vue';
import CommentPreview from '@/components/CommentPreview.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
import { readUserProfile } from '@/store/main/getters';

@Component({
  components: { UserLink, CommentPreview, SimpleViewer },
})
export default class Event extends Vue {
  @Prop() public readonly event!: IEvent;

  get currentUserId() {
    return readUserProfile(this.$store)?.uuid;
  }
}
</script>

<style scoped>
.event-span a {
  text-decoration: none;
}
</style>
