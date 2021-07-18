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
import { IComment, ICommentUpvotes } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import Avatar from '@/components/Avatar.vue';
import { apiComment } from '@/api/comment';
import { readToken } from '@/store/main/getters';

@Component({
  components: { Avatar },
})
export default class CommentPreview extends Vue {
  @Prop() public readonly comment!: IComment;
  private upvotes: ICommentUpvotes | null = null;

  async mounted() {
    // this.upvotes = (await apiComment.getUpvotes(readToken(this.$store), this.comment.uuid)).data;
  }

  get shortComment() {
    return this.comment.body_text!.length > 20
      ? this.comment.body_text!.substring(0, 20) + '...'
      : this.comment.body_text!;
  }
}
</script>
