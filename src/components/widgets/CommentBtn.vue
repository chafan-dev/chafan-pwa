<template>
  <v-btn v-bind="$attrs" v-on="$listeners" class="slim-btn" depressed small>
    <CommentsIcon class="mr-1" small />
    评论 <span v-if="count">({{ count }})</span>
  </v-btn>
</template>
<script>
import CommentsIcon from '@/components/icons/CommentsIcon';
export default {
  components: { CommentsIcon },
  props: ['count'],
};
</script>
