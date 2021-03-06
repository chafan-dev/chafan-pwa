<template>
    <div>
        <div class="d-flex">
            <UserLink :userPreview="comment.author" />
            <v-spacer />
            <span class="text-caption grey--text">{{ $dayjs.utc(comment.updated_at).local().fromNow() }}</span>
        </div>

        <!-- Comment body -->
        <template v-if="!showUpdateEditor">
            <SimpleViewer v-if="!isDeleted" :body="comment.body" />
            <div v-else>
                <div class="grey--text">{{ $t('Deleted.') }}</div>
            </div>
        </template>

        <!-- Comment control -->
        <div class="d-flex mt-1 align-center">
            <template v-if="!isDeleted && currentUserIsAuthor && !showUpdateEditor">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div v-bind="attrs" v-on="on">
                            <EditIcon @click="showUpdateEditor = true" class="mr-2" />
                        </div>
                    </template>
                    <span>{{ $t('编辑') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div v-bind="attrs" v-on="on">
                            <BroadcastIcon :color="sharedToTimeline ? 'primary': undefined "
                                            @click="broadcastComment" class="mr-2" />
                        </div>
                    </template>
                    <span>{{ $t('转发给我的关注者') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <div v-bind="attrs" v-on="on">
                            <DeleteIcon @click="showDeleteConfirm = true" class="mr-2" />
                        </div>
                    </template>
                    <span>{{ $t('删除') }}</span>
                </v-tooltip>
                <v-dialog max-width="300" v-model="showDeleteConfirm">
                    <v-card>
                        <v-card-title primary-title>
                            <div class="headline primary--text">{{$t('确定删除？')}}</div>
                        </v-card-title>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="warning" @click="deleteComment">{{$t('Yes')}}</v-btn>
                    </v-card-actions>
                    </v-card>
                </v-dialog>
            </template>

            <v-tooltip bottom v-if="childComments && childComments.length > 0">
                <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on" class="pr-3" style="cursor: pointer"
                            @click="childCommentsExpanded = !childCommentsExpanded">
                        <CommentsIcon :color="childCommentsExpanded ? undefined : 'primary'" />
                        <span class="ml-1 text-caption">{{ childComments.length }}</span>
                    </div>
                </template>
                <span>{{$t('查看回复')}}</span>
            </v-tooltip>

            <template v-if="enableUpvotes && upvotes && !isDeleted && !showEditor">
                <span v-if="currentUserIsAuthor">
                    <UpvoteIcon /> {{ upvotes.count }}
                </span>
                <span v-else @click="toggleUpvote" style="cursor: pointer"
                      class="text-caption d-flex align-center mr-2">
                    <UpvoteIcon :color="upvotes.upvoted ? 'primary' : undefined" /> {{ upvotes.count }}
                </span>
            </template>

            <template v-if="!isDeleted && !currentUserIsAuthor && !showEditor">
                <span @click="showEditor = true" style="cursor: pointer" v-if="writable"
                        class="text-caption d-flex align-center">
                    <ReplyIcon /> {{$t('回复')}}
                </span>
                <v-spacer />
                <ReactionBlock objectType="comment" :objectId="comment.uuid" />
            </template>
        </div>

        <!-- Editor -->
        <div v-if="writable && !isDeleted">
            <div v-if="showUpdateEditor">
                <SimpleEditor class="mt-2 mb-2" ref="commentUpdateEditor" :initialValue="comment.body" />
                <div class="d-flex">
                    <v-spacer />
                    <v-btn small class="mr-2"
                           color="primary" @click="submitUpdateCommentBody" :disabled="submitIntermediate">
                        {{ $t('提交') }}
                        <v-progress-circular :size="20" v-show="submitIntermediate" indeterminate />
                    </v-btn>
                    <v-btn small @click="showUpdateEditor = false">
                        {{ $t('Cancel') }}
                    </v-btn>
                </div>
            </div>

            <div v-if="showEditor">
                <SimpleEditor class="mt-2 mb-2" ref="commentReplyEditor" :placeholder="$t('回复')" />
                <div class="d-flex">
                    <v-spacer />
                    <v-btn small class="mr-2"
                            color="primary" @click="submitNewReplyBody" :disabled="submitIntermediate">
                        {{ $t('发送回复') }}
                        <v-progress-circular :size="20" v-show="submitIntermediate" indeterminate />
                    </v-btn>
                    <v-btn small @click="showEditor = false">
                        {{ $t('Cancel') }}
                    </v-btn>
                </div>
            </div>
        </div>

        <!-- Replies -->
        <v-expand-transition v-if="childComments">
            <div v-show="childCommentsExpanded">
                <v-list-item v-for="childComment in childComments" :key="childComment.uuid" class="reply-item">
                    <v-list-item-content class="comment-reply mb-3 pl-3">
                        <Comment :depth="depth + 1" :comment="childComment" :writable="writable" :siteId="siteId" />
                    </v-list-item-content>
                </v-list-item>
            </div>
        </v-expand-transition>

        <div class="pl-2 text-caption grey--text" v-else-if="!writable && !isDeleted && loggedIn">
            {{ $t('Only site member can reply') }}
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import UserLink from '@/components/UserLink.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
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
import { readIsLoggedIn, readUserProfile } from '@/store/main/getters';

@Component({
    name: 'Comment',
    components: {
        UserLink, ReactionBlock, EditIcon, CommentsIcon, SimpleEditor,
        ReplyIcon, BroadcastIcon, DeleteIcon, UpvoteIcon, SimpleViewer,
    },
})
export default class Comment extends Vue {

    get loggedIn() {
        return readIsLoggedIn(this.$store);
    }

    get answerCommentId() {
        const acid = this.$router.currentRoute.params.acid;
        if (acid) {
            return acid;
        } else {
            return null;
        }
    }
    get articleCommentId() {
        const acid = this.$router.currentRoute.params.article_comment_id;
        if (acid) {
            return acid;
        } else {
            return null;
        }
    }
    get submissionCommentId() {
        const scid = this.$router.currentRoute.params.submission_comment_id;
        if (scid) {
            return scid;
        } else {
            return null;
        }
    }
    get questionCommentId() {
        const qcid = this.$router.currentRoute.params.qcid;
        if (qcid) {
            return qcid;
        } else {
            return null;
        }
    }

    get token() { return this.$store.state.main.token; }
    @Prop() private readonly comment!: IComment;
    @Prop() private readonly writable!: boolean;
    @Prop({default: 0}) private readonly depth!: number;
    @Prop() private readonly siteId: string | undefined;
    @Prop({default: false}) private readonly enableUpvotes!: boolean;

    private showEditor: boolean = false;
    private showUpdateEditor: boolean = false;
    private childComments: IComment[] | null = null;
    private currentUserIsAuthor = false;
    private sharedToTimeline = false;
    private isDeleted = false;
    private childCommentsExpanded = false;

    private submitIntermediate = false;

    private showDeleteConfirm = false;

    private upvotes: ICommentUpvotes | null = null;
    private upvoteIntermediate: boolean = false;
    private cancelUpvoteIntermediate: boolean = false;
    private showCancelUpvoteDialog: boolean = false;

    private async mounted() {
        // FIX: make this more precise
        this.childCommentsExpanded = this.answerCommentId !== null || this.articleCommentId !== null ||
                                     this.submissionCommentId !== null || this.questionCommentId !== null ||
                                     this.depth >= 1;
        this.upvotes = {
            comment_uuid: this.comment.uuid,
            count: this.comment.upvotes_count,
            upvoted: this.comment.upvoted,
        };
        const comments = (await api2.getChildComments(this.token, this.comment.uuid)).data;
        if (this.enableUpvotes) {
            this.childComments = rankComments(this.$dayjs, comments);
        } else {
            this.childComments = comments;
        }
        this.sharedToTimeline = this.comment.shared_to_timeline;
        this.isDeleted = this.comment.is_deleted;

        const userProfile = readUserProfile(this.$store);
        if (userProfile) {
            this.currentUserIsAuthor = userProfile.uuid === this.comment.author.uuid;
        }
    }
    private async submitNewReplyBody() {
        const editor = this.$refs.commentReplyEditor as SimpleEditor;
        if (editor.content.length === 0) {
            commitAddNotification(this.$store, {
                content: this.$t('Comment can\'t be empty.').toString(),
                color: 'error',
            });
            return;
        }
        await dispatchCaptureApiError(this.$store, async () => {
            this.submitIntermediate = true;
            const response = await apiComment.postComment(this.token, {
                site_uuid: this.siteId,
                parent_comment_uuid: this.comment.uuid,
                body: editor.content,
            });
            const comment = response.data;
            if (this.childComments === null) {
                this.childComments = [];
            }
            this.childComments.unshift(comment);
            editor.content = '';
            this.childCommentsExpanded = true;
            this.showEditor = false;
            this.submitIntermediate = false;
        });
    }

    private async submitUpdateCommentBody() {
        const editor = this.$refs.commentUpdateEditor as SimpleEditor;
        if (editor.content.length === 0) {
            commitAddNotification(this.$store, {
                content: this.$t('Comment can\'t be empty.').toString(),
                color: 'error',
            });
            return;
        }
        await dispatchCaptureApiError(this.$store, async () => {
            this.submitIntermediate = true;
            await apiComment.updateComment(this.token, this.comment.uuid, {
                body: editor.content,
            });
            commitAddNotification(this.$store, {
                content: this.$t('评论更新成功').toString(),
                color: 'success',
            });
            this.showUpdateEditor = false;
            this.comment.body = editor.content;
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
        this.sharedToTimeline = (await apiComment.updateComment(this.token, this.comment.uuid, {
            shared_to_timeline: true,
        })).data.shared_to_timeline;
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

<style scoped>
.comment-reply {
    border-left: 2px solid lightgrey;
    border-radius: 0 0 0 10px;
}

.reply-item {
    padding-right: 0;
    word-break: break-all;
}

.slim-btn {
    padding: 0 0 !important;
}
</style>