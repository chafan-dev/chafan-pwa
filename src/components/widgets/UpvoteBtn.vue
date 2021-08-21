<template>
  <v-btn v-bind="$attrs" v-on="$listeners" class="slim-btn" depressed small>
    <UpvoteIcon />
    <template v-if="$vuetify.breakpoint.mdAndUp">赞 ({{ count }})</template>
    <template v-else>{{ count }}</template>
  </v-btn>
</template>
<script>
import UpvoteIcon from '@/components/icons/UpvoteIcon';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: { UpvoteIcon },
  props: ['count'],
})
export default class UpvoteBtn extends Vue {}
</script>
