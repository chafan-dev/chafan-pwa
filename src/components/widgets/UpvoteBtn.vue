<template>
  <v-btn v-bind="$attrs" v-on="$listeners" small depressed class="slim-btn">
    <UpvoteIcon /> 赞 ({{ count }})
  </v-btn>
</template>
<script>
import UpvoteIcon from '@/components/icons/UpvoteIcon';
export default {
  components: { UpvoteIcon },
  props: ['count'],
};
</script>
