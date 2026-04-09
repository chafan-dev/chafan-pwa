<template>
  <div :class="theme.feed.submissionPreview.classes">
    <div class="text-h6 word-break-normal">
      <router-link
        :class="theme.feed.submissionPreview.link.classes"
        :to="'/submissions/' + submission.uuid"
      >
        {{ submission.title }}
      </router-link>
    </div>
    <div v-if="shortDesc" class="text-grey text-body-2">
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
          class="d-flex align-center text-black text-caption text-decoration-none"
        >
          <AppIcon name="Comments" class="mr-1 mt-1" size="small"  />
          {{ recursiveCommentsCount(submission.comments) }}
        </router-link>
      </div>
      <v-spacer />
      <div v-if="submission.url">
        <AppIcon name="Link" size="small"  />
        <a :href="submission.url" class="text-decoration-none text-caption" target="_blank">
          {{ shortUrl(submission.url) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ISubmission, ISubmissionUpvotes, IComment } from '@/interfaces';
import SiteBtn from '@/components/SiteBtn.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import UpvoteStat from '@/components/widgets/UpvoteStat.vue';
import SubmissionUpvotes from '@/components/submission/SubmissionUpvotes.vue';
import { useAuth, useTheme, useResponsive } from '@/composables';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps<{
  submission: ISubmission;
  upvotesPlaceholder?: ISubmissionUpvotes;
  disabledPlaceholder?: boolean;
}>();

const { userProfile } = useAuth();
const { theme } = useTheme();
const { isDesktop } = useResponsive();

const shortDesc = computed(() => {
  if (!props.submission.desc || !props.submission.desc.rendered_text) {
    return null;
  }
  const d = props.submission.desc.rendered_text.trim();
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
  return !userProfile.value || userProfile.value.uuid === props.submission.author.uuid;
});

function shortUrl(d: string) {
  if (isDesktop.value) {
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

function recursiveCommentsCount(comments: IComment[]): number {
  return (
    comments.length +
    comments.reduce(
      (sum, comment) => sum + recursiveCommentsCount(comment.child_comments),
      0
    )
  );
}
</script>
