<template>
  <div>
    <div class="d-flex">
      <UserLink :userPreview="comment.author" />
      <v-spacer />
      <span class="text-caption grey--text">{{
        $dayjs.utc(comment.updated_at).local().fromNow()
      }}</span>
    </div>

    <!-- Comment body -->
    <div v-if="!showUpdateEditor" class="ml-1">
      <Viewer v-if="!isDeleted" :body="comment.body" :editor="comment.editor" />
      <div v-else class="grey--text">已删除</div>
    </div>

    <!-- Comment control -->
    <div class="d-flex mt-1 align-center">
      <!-- Part I -->
      <template v-if="enableUpvotes && upvotes && !isDeleted">
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
            <CommentsIcon :color="childCommentsExpanded ? undefined : 'primary'" />
            <span class="ml-1 text-caption">{{ childComments.length }}</span>
          </div>
        </template>
        <span>查看回复</span>
      </v-tooltip>

      <template v-if="!isDeleted && !currentUserIsAuthor">
        <span
          v-if="writable && !showEditor"
          class="text-caption d-flex align-center"
          style="cursor: pointer"
          @click="showEditor = true"
        >
          <ReplyIcon /> 回复
        </span>
        <v-spacer />
        <ReactionBlock :objectId="comment.uuid" objectType="comment" />
      </template>

      <!-- Part II -->
      <template v-if="!isDeleted && currentUserIsAuthor && !showUpdateEditor">
        <v-divider
          v-if="(childComments && childComments.length > 0) || enableUpvotes"
          class="mr-2"
          vertical
        />

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

    <!-- Editor -->
    <div v-if="writable && !isDeleted">
      <div v-if="showUpdateEditor">
        <SimpleEditor
          ref="commentUpdateEditor"
          :initialValue="comment.body"
          class="mt-2 mb-2"
          :editor-prop="comment.editor"
          :onMentionedHandles="onMentionedHandles"
        />
        <div class="d-flex">
          <span v-if="mentioned.length">
            将通知用户：<v-chip small v-for="handle in mentioned" :key="handle">{{
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
          <v-btn depressed small @click="showUpdateEditor = false"> 取消 </v-btn>
        </div>
      </div>

      <v-expand-transition>
        <div v-show="showEditor" class="ml-4">
          <SimpleEditor
            ref="commentReplyEditor"
            :onMentionedHandles="onMentionedHandles"
            :placeholder="$t('回复')"
            class="mt-2 mb-2"
          />
          <div class="d-flex">
            <span v-if="mentioned.length" class="grey--text caption">
              将通知用户：<v-chip small v-for="handle in mentioned" :key="handle">{{
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
            <v-btn depressed small @click="showEditor = false"> 取消 </v-btn>
          </div>
        </div>
      </v-expand-transition>
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
              :enableUpvotes="enableUpvotes"
              :siteId="siteId"
              :writable="writable"
            />
          </v-list-item-content>
        </v-list-item>
      </div>
    </v-expand-transition>

    <div v-else-if="!writable && !isDeleted && loggedIn" class="pl-2 text-caption grey--text">
      {{ $t('Only site member can reply') }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import UserLink from '@/components/UserLink.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import Viewer from '@/components/Viewer.vue';
import ReactionBlock from '@/components/ReactionBlock.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import BroadcastIcon from '@/components/icons/BroadcastIcon.vue';
import ReplyIcon from '@/components/icons/ReplyIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import UpvoteIcon from '@/components/icons/UpvoteIcon.vue';
import { IComment, ICommentUpvotes } from '@/interfaces';
import { api2 } from '@/api2';
import { apiComment } from '@/api/comment';
import { rankComments } from '@/utils';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { readIsLoggedIn, readToken, readUserProfile } from '@/store/main/getters';
import UpvotedIcon from '@/components/icons/UpvotedIcon.vue';
import UpvoteStat from '@/components/widgets/UpvoteStat.vue';

@Component({
  name: 'Comment',
  components: {
    UpvoteStat,
    UpvotedIcon,
    UserLink,
    ReactionBlock,
    EditIcon,
    CommentsIcon,
    SimpleEditor,
    ReplyIcon,
    BroadcastIcon,
    DeleteIcon,
    UpvoteIcon,
    Viewer,
  },
})
export default class Comment extends Vue {
  @Prop() private readonly comment!: IComment;
  @Prop() private readonly writable!: boolean;
  @Prop({ default: 0 }) private readonly depth!: number;
  @Prop() private readonly siteId: string | undefined;
  @Prop({ default: false }) private readonly enableUpvotes!: boolean;
  private showEditor: boolean = false;
  private showUpdateEditor: boolean = false;
  private childComments: IComment[] | null = null;
  private sharedToTimeline = false;
  private isDeleted = false;
  private childCommentsExpanded = false;
  private submitIntermediate = false;
  private showDeleteConfirm = false;
  private upvotes: ICommentUpvotes | null = null;
  private upvoteIntermediate: boolean = false;
  private cancelUpvoteIntermediate: boolean = false;
  private showCancelUpvoteDialog: boolean = false;

  private mentioned: string[] = [];

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get answerCommentId() {
    const acid = this.$route.params.acid;
    if (acid) {
      return acid;
    } else {
      return null;
    }
  }

  get articleCommentId() {
    const acid = this.$route.params.article_comment_id;
    if (acid) {
      return acid;
    } else {
      return null;
    }
  }

  get submissionCommentId() {
    const scid = this.$route.params.submission_comment_id;
    if (scid) {
      return scid;
    } else {
      return null;
    }
  }

  get questionCommentId() {
    const qcid = this.$route.params.qcid;
    if (qcid) {
      return qcid;
    } else {
      return null;
    }
  }

  get token() {
    return readToken(this.$store);
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get currentUserIsAuthor() {
    return this.userProfile?.uuid === this.comment.author.uuid;
  }

  private async mounted() {
    // FIX: make this more precise
    this.childCommentsExpanded =
      this.answerCommentId !== null ||
      this.articleCommentId !== null ||
      this.submissionCommentId !== null ||
      this.questionCommentId !== null ||
      this.depth >= 1;
    const comments = (await api2.getChildComments(this.token, this.comment.uuid)).data;
    if (this.enableUpvotes) {
      this.upvotes = {
        comment_uuid: this.comment.uuid,
        count: this.comment.upvotes_count,
        upvoted: this.comment.upvoted,
      };
      this.childComments = rankComments(this.$dayjs, comments);
    } else {
      this.childComments = comments;
    }
    this.sharedToTimeline = this.comment.shared_to_timeline;
    this.isDeleted = this.comment.is_deleted;
  }

  private async submitNewReplyBody() {
    const editor = this.$refs.commentReplyEditor as SimpleEditor;
    if (!editor.content) {
      commitAddNotification(this.$store, {
        content: this.$t("Comment can't be empty.").toString(),
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.submitIntermediate = true;
      const response = await apiComment.postComment(this.token, {
        site_uuid: this.siteId,
        parent_comment_uuid: this.comment.uuid,
        body: editor.content!,
        body_text: editor.getTextContent() || '',
        editor: editor.editor,
        mentioned: this.mentioned,
      });
      const comment = response.data;
      if (this.childComments === null) {
        this.childComments = [];
      }
      this.childComments.unshift(comment);
      editor.reset();
      this.childCommentsExpanded = true;
      this.showEditor = false;
      this.submitIntermediate = false;
    });
  }

  private async submitUpdateCommentBody() {
    const editor = this.$refs.commentUpdateEditor as SimpleEditor;
    if (!editor.content) {
      commitAddNotification(this.$store, {
        content: this.$t("Comment can't be empty.").toString(),
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.submitIntermediate = true;
      await apiComment.updateComment(this.token, this.comment.uuid, {
        body: editor.content!,
        body_text: editor.getTextContent() || '',
        mentioned: this.mentioned,
      });
      commitAddNotification(this.$store, {
        content: this.$t('评论更新成功').toString(),
        color: 'success',
      });
      this.showUpdateEditor = false;
      this.comment.body = editor.content!;
      this.submitIntermediate = false;
    });
  }

  private async broadcastComment() {
    if (this.comment.shared_to_timeline) {
      commitAddNotification(this.$store, {
        content: this.$t('已经转发过了').toString(),
        color: 'info',
      });
      return;
    }
    this.sharedToTimeline = (
      await apiComment.updateComment(this.token, this.comment.uuid, {
        shared_to_timeline: true,
      })
    ).data.shared_to_timeline;
  }

  private async deleteComment() {
    await apiComment.deleteComment(this.token, this.comment.uuid);
    commitAddNotification(this.$store, {
      content: this.$t('已删除').toString(),
      color: 'info',
    });
    this.showDeleteConfirm = false;
    this.isDeleted = true;
  }

  private async upvote() {
    this.upvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      this.upvotes = (await apiComment.upvote(this.token, this.comment.uuid)).data;
      this.upvoteIntermediate = false;
    });
  }

  private async cancelUpvote() {
    this.cancelUpvoteIntermediate = true;
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.comment) {
        this.upvotes = (await apiComment.cancelUpvote(this.token, this.comment.uuid)).data;
        this.cancelUpvoteIntermediate = false;
        this.showCancelUpvoteDialog = false;
      }
    });
  }

  private onMentionedHandles(handles: string[]) {
    console.log(handles);
    this.mentioned = handles;
  }

  private async toggleUpvote() {
    if (this.upvotes) {
      if (this.upvotes.upvoted) {
        await this.cancelUpvote();
      } else {
        await this.upvote();
      }
    }
  }
}
</script>
