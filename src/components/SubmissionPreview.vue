<template>
  <div :class="theme.feed.submissionPreview.classes">
    <div class="title" style="word-break: normal">
      <router-link
        :class="theme.feed.submissionPreview.link.classes"
        :to="'/submissions/' + submission.uuid"
      >
        {{ submission.title }}
      </router-link>
    </div>
    <div v-if="shortDesc" class="grey--text text-body-2">
      {{ shortDesc }}
    </div>
    <div :class="theme.feed.submissionPreview.stats.classes">
      <v-lazy>
        <SubmissionUpvotes
          :disabled="disabled"
          :uuid="submission.uuid"
          :upvotes-placeholder="upvotesPlaceholder"
        />
      </v-lazy>
      <div class="align-self-center pl-2">
        <router-link
          :to="'/submissions/' + submission.uuid"
          class="d-flex align-center black--text text-caption text-decoration-none"
        >
          <CommentsIcon class="mr-1 mt-1" small />
          {{ recursiveCommentsCount(submission.comments) }}
        </router-link>
      </div>
      <v-spacer />
      <div v-if="submission.url">
        <LinkIcon small />
        <a :href="submission.url" class="text-decoration-none text-caption" target="_blank">
          {{ shortUrl(submission.url) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ISubmission, ISubmissionUpvotes } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import { Component, Prop } from 'vue-property-decorator';
import BaseCard from '@/components/base/BaseCard.vue';
import UpvoteStat from '@/components/widgets/UpvoteStat.vue';
import { CVue } from '@/common';
import SubmissionUpvotes from '@/components/submission/SubmissionUpvotes.vue';

@Component({
  components: {
    SubmissionUpvotes,
    UpvoteStat,
    BaseCard,
    SiteBtn,
    LinkIcon,
    UpvoteIcon,
    CommentsIcon,
  },
})
export default class SubmissionPreview extends CVue {
  @Prop() private readonly submission!: ISubmission;
  @Prop() public readonly upvotesPlaceholder: ISubmissionUpvotes | undefined;
  @Prop() public readonly disabledPlaceholder: boolean | undefined;

  get shortDesc() {
    if (!this.submission.desc || !this.submission.desc.rendered_text) {
      return null;
    }
    const d = this.submission.desc.rendered_text.trim();
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
    return !this.userProfile || this.userProfile.uuid === this.submission.author.uuid;
  }

  private shortUrl(d: string) {
    if (this.$vuetify.breakpoint.mdAndUp) {
      if (d.length > 40) {
        return d.substring(0, 40) + '..';
      } else {
        return d;
      }
    } else {
      const url = new URL(d);
      return url.protocol + '//' + url.host;
    }
  }
}
</script>
