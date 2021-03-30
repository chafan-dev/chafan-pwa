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

      <router-link
        place="article"
        v-if="event.content.article"
        :to="`/articles/${event.content.article.uuid}`"
        >{{ event.content.article.title }}</router-link
      >

      <router-link
        place="article_column"
        v-if="event.content.article_column"
        :to="`/article-columns/${event.content.article_column.uuid}`"
        >{{ event.content.article_column.name }}</router-link
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

      <router-link
        place="question"
        v-if="event.content.question"
        :to="`/questions/${event.content.question.uuid}`"
        >{{ event.content.question.title }}</router-link
      >

      <router-link
        place="submission"
        v-if="event.content.submission"
        :to="`/submissions/${event.content.submission.uuid}`"
        >{{ event.content.submission.title }}</router-link
      >

      <router-link
        place="site"
        v-if="event.content.site"
        :to="`/sites/${event.content.site.subdomain}`"
        >{{ event.content.site.name }}</router-link
      >

      <router-link
        place="question"
        v-if="event.content.answer"
        :to="`/questions/${event.content.answer.question.uuid}`"
        >{{ event.content.answer.question.title }}</router-link
      >

      <router-link
        place="answer"
        v-if="event.content.answer"
        :to="`/questions/${event.content.answer.question.uuid}/answers/${event.content.answer.uuid}`"
        >{{ event.content.answer.body }}</router-link
      >

      <router-link
        place="channel_message"
        v-if="event.content.channel"
        :to="`/channels/${event.content.channel.id}`"
      >
        {{ $t('私信') }}
      </router-link>
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
