<template>
  <span>
    <router-link
      v-if="comment.root_route"
      :to="comment.root_route + `/comments/${comment.uuid}`"
      class="text-decoration-none"
    >
      {{ shortComment }}
    </router-link>
    <span v-else>
      {{ shortComment }}
    </span>
  </span>
</template>

<script lang="ts">
import { IComment } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import Avatar from '@/components/Avatar.vue';

@Component({
  components: { Avatar },
})
export default class CommentPreview extends Vue {
  @Prop() public readonly comment!: IComment;

  get shortComment() {
    return this.comment.body.length > 20
      ? this.comment.body.substring(0, 20) + '...'
      : this.comment.body;
  }
}
</script>
