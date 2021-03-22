<template>
  <div v-if="comments.length > 0 || loggedIn" class="mt-4">
    <v-divider class="mb-4" />
    <v-list-item v-for="comment in comments" :key="comment.uuid" class="comment-item">
      <v-list-item-content>
        <Comment
          :comment="comment"
          :writable="writable"
          :siteId="siteId"
          :enableUpvotes="enableUpvotes"
        />
      </v-list-item-content>
    </v-list-item>
    <div v-if="writable">
      <SimpleEditor ref="simpleEditor" class="mb-1" :placeholder="$t('评论')" />
      <div class="d-flex">
        <v-spacer />
        <v-btn
          small
          depressed
          @click="submitNewComment"
          color="primary"
          :disabled="commentSubmitIntermediate"
        >
          {{ $t('提交评论') }}
          <v-progress-circular :size="20" v-show="commentSubmitIntermediate" indeterminate />
        </v-btn>
      </div>
    </div>
    <div class="text-caption grey--text pl-2" v-else-if="loggedIn">
      {{ $t('Only site member can comment') }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import UserLink from '@/components/UserLink.vue';
import Comment from '@/components/Comment.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import { IComment } from '@/interfaces';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
  components: { UserLink, Comment, SimpleEditor },
})
export default class CommentBlock extends Vue {
  @Prop() public readonly comments!: IComment[];
  @Prop() public readonly writable!: boolean;
  @Prop() public readonly siteId: number | undefined;
  @Prop() public readonly commentLabel!: string;
  @Prop({ default: false }) public commentSubmitIntermediate!: boolean;
  @Prop({ default: false }) public readonly enableUpvotes!: boolean;

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  @Emit('submit-new-comment')
  public submitNewComment() {
    const editor = this.$refs.simpleEditor as SimpleEditor;
    if (!editor.content || editor.content.length === 0) {
      commitAddNotification(this.$store, {
        content: this.$t("Comment can't be empty.").toString(),
        color: 'error',
      });
      return;
    }
    const commentCopy = `${editor.content}`;
    editor.reset();
    return {
      body: commentCopy,
      editor: editor.editor,
    };
  }
}
</script>

<style scoped>
.comment-item {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>
