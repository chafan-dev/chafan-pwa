<template>
  <div class="pa-2">
    <div class="title" style="word-break: normal">
      <router-link :to="'/submissions/' + submission.uuid" class="text-decoration-none">
        {{ submission.title }}
      </router-link>
    </div>
    <div class="d-flex align-center">
      <router-link
        :to="'/submissions/' + submission.uuid"
        class="mr-4 d-flex align-center black--text text-caption text-decoration-none"
      >
        <UpvoteStat :count="submission.upvotes_count" />
      </router-link>
      <router-link
        :to="'/submissions/' + submission.uuid"
        class="d-flex align-center black--text text-caption text-decoration-none"
      >
        <CommentsIcon class="mr-1 mt-1" small />
        {{ submission.comments.length }}
      </router-link>
      <v-spacer />
      <div v-if="submission.url">
        <LinkIcon small />
        <a :href="submission.url" class="text-decoration-none text-caption" target="_blank">
          {{ shortUrl(submission.url) }}
        </a>
      </div>
    </div>
    <div
      v-if="submission.description_text && submission.description_text.trim()"
      class="grey--text subtitle-2"
    >
      {{ shortDesc }}
    </div>
  </div>
</template>

<script lang="ts">
import { ICommentUpvotes, ISubmission, ISubmissionUpvotes } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';
import BaseCard from '@/components/base/BaseCard.vue';
import UpvoteStat from '@/components/widgets/UpvoteStat.vue';
import { apiSubmission } from '@/api/submission';
import { readToken } from '@/store/main/getters';

@Component({
  components: { UpvoteStat, BaseCard, SiteBtn, LinkIcon, UpvoteIcon, CommentsIcon },
})
export default class SubmissionPreview extends Vue {
  @Prop() private readonly submission!: ISubmission;
  private upvotes: ISubmissionUpvotes | null = null;

  get shortDesc() {
    const d = this.submission.description_text!;
    if (d.length > 60) {
      return d.substring(0, 60) + '..';
    } else {
      return d;
    }
  }

  async mounted() {
    // this.upvotes = (
    //   await apiSubmission.getUpvotes(readToken(this.$store), this.submission.uuid)
    // ).data;
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
