<template>
  <div v-if="comments.length > 0 || loggedIn" class="mt-4">
    <v-divider class="mb-4" />
    <v-list-item v-for="comment in comments" :key="comment.uuid" class="comment-item">
      <v-list-item-content>
        <Comment
          :comment="comment"
          :enableUpvotes="enableUpvotes"
          :siteId="siteId"
          :writable="writable"
        />
      </v-list-item-content>
    </v-list-item>
    <div v-if="writable">
      <SimpleEditor
        ref="simpleEditor"
        :onMentionedHandles="onMentionedHandles"
        :placeholder="$t('评论')"
        class="mb-1"
      />
      <div class="d-flex">
        <span v-if="mentioned.length" class="grey--text caption"
          >将通知用户：{{ mentioned.join(', ') }}</span
        >
        <v-spacer />
        <v-btn
          :disabled="commentSubmitIntermediate"
          color="primary"
          depressed
          small
          @click="submitNewComment"
        >
          {{ $t('提交评论') }}
          <v-progress-circular v-show="commentSubmitIntermediate" :size="20" indeterminate />
        </v-btn>
      </div>
    </div>
    <div v-else-if="loggedIn" class="text-caption grey--text pl-2">
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

  private mentioned: string[] = [];

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
    const commentText = editor.getTextContent();
    editor.reset();
    return {
      body: commentCopy,
      body_text: commentText,
      editor: editor.editor,
      mentioned: this.mentioned,
    };
  }

  private onMentionedHandles(handles: string[]) {
    this.mentioned = handles;
  }
}
</script>
