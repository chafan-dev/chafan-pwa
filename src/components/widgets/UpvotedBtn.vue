<template>
  <v-btn v-bind="$attrs" v-on="$listeners" small depressed class="slim-btn">
    <UpvotedBtnIcon />
    <template v-if="$vuetify.breakpoint.mdAndUp"> 已赞 ({{ count }}) </template>
    <template v-else>
      {{ count }}
    </template>
  </v-btn>
</template>
<script>
import UpvotedBtnIcon from '@/components/icons/UpvotedIcon';
export default {
  components: { UpvotedBtnIcon },
  props: ['count'],
};
</script>
