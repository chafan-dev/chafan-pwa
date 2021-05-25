<template>
  <v-btn v-bind="$attrs" v-on="$listeners" small depressed class="slim-btn">
    <UpvoteIcon /> 赞 ({{ count }})
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
