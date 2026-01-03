<template>
  <div>
    <div class="d-flex">
      <UserLink :userPreview="comment.author" />
      <v-spacer />
      <span class="text-caption grey--text">{{ fromNow(comment.updated_at) }}</span>
    </div>

    <!-- Comment body -->
    <div v-if="!showUpdateEditor" class="ml-1">
      <Viewer v-if="!comment.is_deleted" :content="comment.content" />
      <div v-else class="grey--text">已删除</div>
    </div>

    <!-- New comment editor -->
    <v-expand-transition>
      <div v-show="showEditor" class="ml-4">
        <SimpleEditor
          ref="commentReplyEditor"
          :onMentionedHandles="onMentionedHandles"
          class="mt-2 mb-2"
          placeholder="回复"
        />
        <div class="d-flex">
          <span v-if="mentioned.length" class="grey--text caption">
            将通知用户：<v-chip v-for="handle in mentioned" :key="handle" small>{{
              handle
            }}</v-chip>
          </span>
          <v-spacer />
          <v-btn
            :disabled="submitIntermediate"
            class="mr-2"
            color="primary"
            depressed
            small
            @click="submitNewReplyBody"
          >
            发送回复
            <v-progress-circular v-show="submitIntermediate" :size="20" indeterminate />
          </v-btn>
          <v-btn depressed small @click="showEditor = false"> 取消</v-btn>
        </div>
      </div>
    </v-expand-transition>

    <!-- Update comment editor -->
    <div v-if="writable && !comment.is_deleted">
      <div v-if="showUpdateEditor">
        <SimpleEditor
          ref="commentUpdateEditor"
          :editor-prop="comment.content.editor"
          :initialValue="comment.content.source"
          :onMentionedHandles="onMentionedHandles"
          class="mt-2 mb-2"
        />
        <div class="d-flex">
          <span v-if="mentioned.length">
            将通知用户：<v-chip v-for="handle in mentioned" :key="handle" small>{{
              handle
            }}</v-chip>
          </span>
          <v-spacer />
          <v-btn
            :disabled="submitIntermediate"
            class="mr-2"
            color="primary"
            depressed
            small
            @click="submitUpdateCommentBody"
          >
            提交
            <v-progress-circular v-show="submitIntermediate" :size="20" indeterminate />
          </v-btn>
          <v-btn depressed small @click="showUpdateEditor = false"> 取消</v-btn>
        </div>
      </div>
    </div>

    <!-- Comment control -->
    <div class="d-flex mt-1 align-center" v-if="!showUpdateEditor && !showEditor">
      <!-- Part I -->
      <template v-if="upvotes && !comment.is_deleted">
        <UpvoteStat v-if="currentUserIsAuthor" :count="upvotes.count" class="mr-2" />
        <span v-else class="d-flex align-center mr-2" style="cursor: pointer" @click="toggleUpvote">
          <UpvotedIcon v-if="upvotes.upvoted" />
          <UpvoteIcon v-else />
          <span class="text-caption">{{ upvotes.count }}</span>
        </span>
      </template>

      <v-tooltip v-if="childComments && childComments.length > 0" bottom>
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
            class="pr-3"
            style="cursor: pointer"
            @click="childCommentsExpanded = !childCommentsExpanded"
          >
            <DebugSpan>{{ childCommentsExpanded }}</DebugSpan>
            <CommentsIcon :color="childCommentsExpanded ? undefined : 'primary'" />
            <span class="ml-1 text-caption">{{ recursiveCommentsCount(childComments) }}</span>
          </div>
        </template>
        <span>查看回复</span>
      </v-tooltip>

      <template v-if="!comment.is_deleted && !currentUserIsAuthor">
        <span
          v-if="writable && !showEditor"
          class="text-caption d-flex align-center"
          style="cursor: pointer"
          @click="showEditor = true"
        >
          <ReplyIcon /> 回复
        </span>
        <v-spacer />
      </template>

      <!-- Part II -->
      <template v-if="!comment.is_deleted && currentUserIsAuthor && !showUpdateEditor">
        <v-divider v-if="childComments && childComments.length > 0" class="mr-2" vertical />

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <EditIcon class="mr-2" @click="showUpdateEditor = true" />
            </div>
          </template>
          <span>编辑</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <BroadcastIcon
                :color="sharedToTimeline ? 'primary' : undefined"
                class="mr-2"
                @click="broadcastComment"
              />
            </div>
          </template>
          <span>转发给我的关注者</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <DeleteIcon class="mr-2" @click="showDeleteConfirm = true" />
            </div>
          </template>
          <span>删除</span>
        </v-tooltip>
        <v-dialog v-model="showDeleteConfirm" max-width="300">
          <v-card>
            <v-card-title primary-title>
              <div class="headline primary--text">确定删除？</div>
            </v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn color="warning" depressed small @click="deleteComment">确认</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </template>
    </div>

    <!-- Replies -->
    <v-expand-transition v-if="childComments">
      <div v-show="childCommentsExpanded">
        <v-list-item
          v-for="childComment in childComments"
          :key="childComment.uuid"
          class="reply-item"
        >
          <v-list-item-content class="comment-reply mb-3 pl-3">
            <Comment
              :comment="childComment"
              :depth="depth + 1"
              :siteId="siteId"
              :writable="writable"
            />
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-expand-transition>

    <div
      v-else-if="!writable && !comment.is_deleted && loggedIn"
      class="pl-2 text-caption grey--text"
    >
      仅圈子成员可以评论
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router/composables';
import UserLink from '@/components/UserLink.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import Viewer from '@/components/Viewer.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import BroadcastIcon from '@/components/icons/BroadcastIcon.vue';
import ReplyIcon from '@/components/icons/ReplyIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import { IComment, ICommentUpvotes } from '@/interfaces';
import { apiComment } from '@/api/comment';
import { rankComments } from '@/utils';
import { dispatchCaptureApiError } from '@/store/main/actions';
import UpvotedIcon from '@/components/icons/UpvotedIcon.vue';
import UpvoteStat from '@/components/widgets/UpvoteStat.vue';
import DebugSpan from '@/components/base/DebugSpan.vue';
import { useAuth, useDayjs, useNotification } from '@/composables';
import store from '@/store';

defineOptions({
  name: 'Comment',
});

const props = withDefaults(
  defineProps<{
    comment: IComment;
    writable: boolean;
    depth?: number;
    siteId?: string;
  }>(),
  {
    depth: 0,
  }
);

const route = useRoute();
const { token, userProfile, loggedIn } = useAuth();
const { dayjs, fromNow } = useDayjs();
const { notifyError, notifySuccess, notifyInfo } = useNotification();

const showEditor = ref(false);
const showUpdateEditor = ref(false);
const childComments = ref<IComment[] | null>(null);
const sharedToTimeline = ref(false);
const childCommentsExpanded = ref(true);
const submitIntermediate = ref(false);
const showDeleteConfirm = ref(false);
const upvotes = ref<ICommentUpvotes | null>(null);
const upvoteIntermediate = ref(false);
const cancelUpvoteIntermediate = ref(false);
const showCancelUpvoteDialog = ref(false);
const mentioned = ref<string[]>([]);

const commentReplyEditor = ref<InstanceType<typeof SimpleEditor> | null>(null);
const commentUpdateEditor = ref<InstanceType<typeof SimpleEditor> | null>(null);

const answerCommentId = computed(() => {
  const acid = route.params.acid;
  return acid || null;
});

const articleCommentId = computed(() => {
  const acid = route.params.article_comment_id;
  return acid || null;
});

const submissionCommentId = computed(() => {
  const scid = route.params.submission_comment_id;
  return scid || null;
});

const questionCommentId = computed(() => {
  const qcid = route.params.qcid;
  return qcid || null;
});

const currentUserIsAuthor = computed(() => {
  return userProfile.value?.uuid === props.comment.author.uuid;
});

onMounted(() => {
  upvotes.value = {
    comment_uuid: props.comment.uuid,
    count: props.comment.upvotes_count,
    upvoted: props.comment.upvoted,
  };
  childComments.value = rankComments(dayjs, props.comment.child_comments);
  sharedToTimeline.value = props.comment.shared_to_timeline;
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

async function submitNewReplyBody() {
  const editor = commentReplyEditor.value;
  if (!editor?.getContent()) {
    notifyError('评论内容不能为空');
    return;
  }
  await dispatchCaptureApiError(store, async () => {
    submitIntermediate.value = true;
    const response = await apiComment.postComment(token.value, {
      site_uuid: props.siteId,
      parent_comment_uuid: props.comment.uuid,
      content: {
        source: editor!.getContent()!,
        rendered_text: editor!.getTextContent() || '',
        editor: editor!.editor,
      },
      mentioned: mentioned.value,
    });
    const comment = response.data;
    if (childComments.value === null) {
      childComments.value = [];
    }
    childComments.value.unshift(comment);
    editor!.reset();
    childCommentsExpanded.value = true;
    showEditor.value = false;
    submitIntermediate.value = false;
  });
}

async function submitUpdateCommentBody() {
  const editor = commentUpdateEditor.value;
  if (!editor?.getContent()) {
    notifyError('评论内容不能为空');
    return;
  }
  await dispatchCaptureApiError(store, async () => {
    submitIntermediate.value = true;
    await apiComment.updateComment(token.value, props.comment.uuid, {
      content: {
        source: editor!.getContent()!,
        rendered_text: editor!.getTextContent() || '',
        editor: editor!.editor,
      },
      mentioned: mentioned.value,
    });
    notifySuccess('评论更新成功');
    showUpdateEditor.value = false;
    props.comment.content.source = editor!.getContent()!;
    submitIntermediate.value = false;
  });
}

async function broadcastComment() {
  if (props.comment.shared_to_timeline) {
    notifyInfo('已经转发过了');
    return;
  }
  sharedToTimeline.value = (
    await apiComment.updateComment(token.value, props.comment.uuid, {
      shared_to_timeline: true,
    })
  ).data.shared_to_timeline;
}

async function deleteComment() {
  await apiComment.deleteComment(token.value, props.comment.uuid);
  notifyInfo('已删除');
  showDeleteConfirm.value = false;
  props.comment.is_deleted = true;
}

async function upvote() {
  upvoteIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    upvotes.value = (await apiComment.upvote(token.value, props.comment.uuid)).data;
    upvoteIntermediate.value = false;
  });
}

async function cancelUpvote() {
  cancelUpvoteIntermediate.value = true;
  await dispatchCaptureApiError(store, async () => {
    if (props.comment) {
      upvotes.value = (await apiComment.cancelUpvote(token.value, props.comment.uuid)).data;
      cancelUpvoteIntermediate.value = false;
      showCancelUpvoteDialog.value = false;
    }
  });
}

function onMentionedHandles(handles: string[]) {
  console.log(handles);
  mentioned.value = handles;
}

async function toggleUpvote() {
  if (upvotes.value) {
    if (upvotes.value.upvoted) {
      await cancelUpvote();
    } else {
      await upvote();
    }
  }
}
</script>
