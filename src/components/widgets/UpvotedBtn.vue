<template>
  <v-btn v-bind="$attrs" v-on="$listeners" class="slim-btn" depressed small>
    <UpvotedBtnIcon />
    <template v-if="$vuetify.breakpoint.mdAndUp"> 已赞 ({{ count }})</template>
    <template v-else>
      {{ count }}
    </template>
  </v-btn>
</template>
<script>
import UpvotedBtnIcon from '@/components/icons/UpvotedIcon';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: { UpvotedBtnIcon },
  props: ['count'],
})
export default class UpvotedBtn extends Vue {}
</script>
