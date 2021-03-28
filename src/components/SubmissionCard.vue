<template>
  <v-card class="pa-2" :class="{ 'c-card': !embedded }" :flat="embedded">
    <div class="title" style="word-break: normal">
      <a class="text-decoration-none" :href="'/submissions/' + submission.uuid">
        {{ submission.title }}
      </a>
    </div>
    <div class="d-flex align-center">
      <a
        class="mr-4 d-flex align-center black--text text-caption text-decoration-none"
        :href="'/submissions/' + submission.uuid"
      >
        <UpvoteIcon :color="submission.upvoted ? 'primary' : undefined" small />
        {{ submission.upvotes_count }}
      </a>
      <a
        class="d-flex align-center black--text text-caption text-decoration-none"
        :href="'/submissions/' + submission.uuid"
      >
        <CommentsIcon small class="mr-1 mt-1" />
        {{ submission.comments.length }}
      </a>
      <v-spacer />
      <div v-if="submission.url">
        <LinkIcon small />
        <a class="text-decoration-none text-caption" :href="submission.url" target="_blank">
          {{ shortUrl(submission.url) }}
        </a>
      </div>
    </div>
    <div
      class="grey--text subtitle-2"
      v-if="submission.description_text && submission.description_text.trim()"
    >
      {{ shortDesc }}
    </div>
  </v-card>
</template>

<script lang="ts">
import { ISubmission } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  components: { SiteBtn, LinkIcon, UpvoteIcon, CommentsIcon },
})
export default class submission extends Vue {
  @Prop({ default: false }) private readonly embedded!: false;
  @Prop() private readonly submission!: ISubmission;

  get shortDesc() {
    const d = this.submission.description_text!;
    if (d.length > 60) {
      return d.substring(0, 60) + '..';
    } else {
      return d;
    }
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

<style scoped>
/* FIXME: code duplicate: Home.vue */
.c-card {
  box-shadow: 0 5px 10px -10px rgba(85, 85, 85, 0.08), 0 10px 20px 0 rgba(85, 85, 85, 0.06),
    0 15px 30px 0 rgba(85, 85, 85, 0.03) !important;
}
</style>
