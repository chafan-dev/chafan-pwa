<template>
  <div v-if="comments.length > 0 || loggedIn" class="mt-3">
    <v-divider v-if="comments.length" />
    <span v-if="showTitle" class="pt-1 pl-1 grey--text"
      >共{{ recursiveCommentsCount(comments) }}条评论</span
    >
    <v-list-item v-for="comment in comments" :key="comment.uuid" class="comment-item">
      <v-list-item-content>
        <Comment :comment="comment" :siteId="siteId" :writable="writable" />
      </v-list-item-content>
    </v-list-item>
    <div v-if="writable" class="pb-1">
      <SimpleEditor
        ref="simpleEditor"
        :onMentionedHandles="onMentionedHandles"
        class="mb-1"
        placeholder="评论"
      />
      <div class="d-flex pt-1">
        <span v-if="mentioned.length" class="grey--text caption">
          将通知用户：<v-chip v-for="handle in mentioned" :key="handle" small>{{ handle }}</v-chip>
        </span>
        <v-spacer />
        <v-btn
          :disabled="commentSubmitIntermediate"
          color="primary"
          depressed
          small
          @click="submitNewComment"
        >
          提交评论
          <v-progress-circular v-show="commentSubmitIntermediate" :size="20" indeterminate />
        </v-btn>
      </div>
    </div>
    <div v-else-if="loggedIn" class="text-caption grey--text pl-2">仅圈子成员可评论</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UserLink from '@/components/UserLink.vue';
import Comment from '@/components/Comment.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import { IComment, INewCommentInternal } from '@/interfaces';
import { rankComments } from '@/utils';
import { useAuth, useDayjs, useNotification } from '@/composables';

const props = withDefaults(
  defineProps<{
    comments: IComment[];
    writable: boolean;
    siteId?: number;
    commentLabel: string;
    showTitle?: boolean;
    commentSubmitIntermediate?: boolean;
  }>(),
  {
    showTitle: false,
    commentSubmitIntermediate: false,
  }
);

const emit = defineEmits<{
  (e: 'submit-new-comment', payload: INewCommentInternal | undefined): void;
}>();

const { loggedIn } = useAuth();
const { dayjs } = useDayjs();
const { notifyError } = useNotification();

const mentioned = ref<string[]>([]);
const rankedComments = ref<IComment[]>([]);
const simpleEditor = ref<InstanceType<typeof SimpleEditor> | null>(null);

onMounted(() => {
  rankedComments.value = rankComments(dayjs, props.comments);
});

function recursiveCommentsCount(comments: IComment[]): number {
  return (
    comments.length +
    comments.reduce(
      (sum, comment) => sum + recursiveCommentsCount(comment.child_comments),
      0
    )
  );
}

function submitNewComment(): INewCommentInternal | undefined {
  const editor = simpleEditor.value;
  if (!editor) return;

  const content = editor.getContent();
  if (!content || content.length === 0) {
    notifyError('评论不能为空');
    return;
  }
  const commentCopy = `${content}`;
  const commentText = editor.getTextContent();
  editor.reset();
  const result = {
    body: commentCopy,
    body_text: commentText,
    editor: editor.editor,
    mentioned: mentioned.value,
  };
  emit('submit-new-comment', result);
  return result;
}

function onMentionedHandles(handles: string[]) {
  mentioned.value = handles;
}
</script>
