<template>
  <v-btn v-bind="$attrs" v-on="$listeners" small depressed class="slim-btn">
    <UpvoteIcon />
    <template v-if="$vuetify.breakpoint.mdAndUp">赞 ({{ count }})</template>
    <template v-else>{{ count }}</template>
  </v-btn>
</template>
<script>
import UpvoteIcon from '@/components/icons/UpvoteIcon';
import { Vue, Component } from 'vue-property-decorator';

@Component({
  components: { UpvoteIcon },
  props: ['count'],
})
export default class UpvoteBtn extends Vue {}
</script>
