<template>
  <v-btn v-bind="$attrs" v-on="$listeners" small depressed class="slim-btn">
    <UpvotedBtnIcon /> 已赞 ({{ count }})
  </v-btn>
</template>
<script>
import UpvotedBtnIcon from '@/components/icons/UpvotedIcon';
export default {
  components: { UpvotedBtnIcon },
  props: ['count'],
};
</script>
