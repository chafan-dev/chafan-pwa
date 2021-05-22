<template>
  <v-btn v-bind="$attrs" v-on="$listeners" class="slim-btn" depressed small>
    <CommentsIcon class="mr-1" small />
    <template v-if="$vuetify.breakpoint.mdAndUp">
      评论 <span v-if="count">({{ count }})</span>
    </template>
    <template v-else>
      <span v-if="count">{{ count }}</span>
    </template>
  </v-btn>
</template>
<script>
import CommentsIcon from '@/components/icons/CommentsIcon';
export default {
  components: { CommentsIcon },
  props: ['count'],
};
</script>
