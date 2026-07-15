<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
    <v-row v-else justify="center">
      <v-col :class="{ 'col-8': isDesktop && !isNarrowFeedUI, 'fixed-narrow-col': isNarrowFeedUI }">
        <Form v-slot="{ handleSubmit }">
          <div class="d-flex justify-space-between">
            <UserLink :show-avatar="true" :userPreview="submission.author" />
            <SiteBtn :site="submission.site" class="elevation-0" />
          </div>

          <!-- Submission info/editor -->
          <div>
            <!-- Submission topics display/editor -->
            <v-chip-group v-if="!showSubmissionEditor">
              <TopicChip
                v-for="topic in submission.topics"
                :key="topic.uuid"
                :topic="topic"
                :more-margin="false"
              />
            </v-chip-group>
            <v-combobox
              v-if="showSubmissionEditor"
              v-model="newSubmissionTopicNames"
              :delimiters="[',', '，', '、']"
              :items="hintTopicNames"
              hide-selected
              label="话题"
              multiple
              small-chips
            />

            <!-- Submission title display/editor -->
            <div class="pt-1">
              <div v-if="!showSubmissionEditor" class="text-h5 mb-2">
                {{ submission.title }}
              </div>
              <v-textarea
                v-else
                v-model="newSubmissionTitle"
                label="标题"
                auto-grow
                density="compact"
                rows="1"
              />
            </div>

            <!-- Submission URL display -->
            <div v-if="submission.url">
              <AppIcon name="Link"  />
              源链接：
              <a :href="submission.url" class="text-decoration-none" target="_blank">
                {{ submission.url }}
              </a>
            </div>

            <!-- Submission description display/editor -->
            <Viewer v-if="!showSubmissionEditor && submission.desc" :content="submission.desc" />
            <div v-else-if="showSubmissionEditor">
              <SimpleEditor
                ref="descEditor"
                :editorProp="submission.desc ? submission.desc.editor : 'tiptap'"
                :initialValue="submission.desc ? submission.desc.source : ''"
                class="my-2"
                placeholder="描述（选填）"
              />
            </div>
            <div
              v-if="submission.contributors.length && !showSubmissionEditor"
              class="d-flex justify-end"
            >
              <span class="text-caption text-grey">
                编辑贡献者:
                <template v-for="(contributor, idx) in submission.contributors" :key="contributor.uuid">
                  <span v-if="idx">, </span>
                  <UserLink :show-avatar="false" :user-preview="contributor" />
                </template>
              </span>
            </div>

            <div class="d-flex">
              <v-spacer />
              <span class="text-grey caption">
                上次编辑：<RelativeTime :datetime="submission.updated_at" />
              </span>
            </div>

            <!-- Suggestion comment -->
            <div v-if="suggestionEditable && showSubmissionEditor">
              <v-text-field v-model="newSuggestionCommment" clearable label="附言（可选）" />
            </div>
          </div>

          <SubmissionHistoryDialog
            :visible="historyDialog"
            :archives="archives"
            @update:visible="historyDialog = $event"
          />

          <SubmissionActionBar
            v-if="!showSubmissionEditor"
            :upvotes="upvotes"
            :upvote-disabled="!userProfile || userProfile.uuid === submission.author.uuid"
            :editable="editable"
            :suggestion-editable="!!suggestionEditable"
            :share-link="`/submissions/${submission.uuid}`"
            :share-link-text="submission.title"
            :submission-subscription="submissionSubscription"
            :cancel-subscription-intermediate="cancelSubscriptionIntermediate"
            :subscribe-intermediate="subscribeIntermediate"
            @upvote="upvote"
            @cancel-upvote="cancelUpvote"
            @edit="showSubmissionEditor = true"
            @show-history="showHistoryDialog"
            @cancel-subscription="cancelSubscription"
            @subscribe="subscribe"
            @confirm-hide="confirmHideSubmission"
          >
            <template #share-card="{ shareQrCodeUrl }">
              <v-card-title>
                {{ submission.title }}
              </v-card-title>
              <v-card-text>
                <div class="pt-2 d-flex">
                  <div class="text--primary text-body-1">
                    <Viewer v-if="submission.desc" :content="submission.desc" />
                    <p>
                      <AppIcon name="Comments" class="mr-1" size="small" />
                      <span class="text-caption">
                        {{ recursiveCommentsCount(submission.comments) }}条评论
                      </span>
                    </p>
                  </div>
                  <v-spacer />
                  <div class="pa-1 text-center float-right">
                    <v-img v-if="shareQrCodeUrl" :src="shareQrCodeUrl" max-width="100" />
                    <span class="text-caption">查看原文</span>
                  </div>
                </div>
              </v-card-text>
            </template>
          </SubmissionActionBar>
          <div v-if="showSubmissionEditor" class="d-flex pt-2">
            <v-btn
              :disabled="commitSubmissionEditIntermediate"
              class="mr-1"
              color="primary"
              variant="flat"
              size="small"
              @click="handleSubmit(commitSubmissionEdit)"
            >
              <template v-if="editable">保存</template>
              <template v-else>提交建议</template>
            </v-btn>
            <v-btn class="mr-1" variant="tonal" size="small" @click="cancelSubmissionUpdate">取消</v-btn>
            <v-spacer />
          </div>

          <!-- Comments -->
          <CommentBlock
            :commentSubmitIntermediate="commentSubmitIntermediate"
            :comments="comments"
            :show-title="true"
            :siteId="submission.site ? submission.site.uuid : undefined"
            :writable="commentWritable"
            commentLabel="评论"
            @submit-new-comment="submitNewSubmissionCommentBody"
          />

          <!-- Suggestions -->
          <SubmissionSuggestions
            v-if="submission"
            :suggestions="submissionSuggestions"
            :submission="submission"
            :is-author="editable"
            :current-user-uuid="userProfile?.uuid"
            :highlight-uuid="submissionSuggestionUUID as string"
            @accept="acceptSuggestion"
            @reject="rejectSuggestion"
            @retract="retractSuggestion"
            @revert-retract="revertRetractSuggestion"
          />

          <div v-if="!userProfile" class="mt-2 text-center">登录后参与讨论</div>
          <div>
            <div class="text-center">
              <span
                class="text-grey text-caption cursor-pointer"
                @click="showHelp = !showHelp"
              >
                帮助文档：什么是分享?
              </span>
            </div>
            <v-expand-transition>
              <div v-show="showHelp">
                <ul>
                  <li>
                    分享需要填写一个标题，并可以选择添加一个外部链接和细节描述。描述和标题请尽量与来源和客观信息保持一致，你的主观想法可以更多放在评论区。
                  </li>
                  <li>分享的内容要和圈子的内容主题要求一致。</li>
                  <li>
                    分享的核心是默认展开的评论区，在这里你可以不用像写答案一样长篇大论，而是添加一些简短的想法。
                  </li>
                  <li>你的分享动态会推送到你的关注者的时间线上。</li>
                  <li>你的分享有新评论时目前<b>不会推送通知给提交者</b>以减少噪音。</li>
                  <li>
                    每个圈子有自己的分享榜单，榜单的排序方式既考虑提交的时间，也考虑「赞」的数量。同时，每个分享下的评论也会按「赞」数排序。
                  </li>
                  <li>首页也有一个将你所加入的所有圈子的分享榜单聚合在一起的个性化分享榜单</li>
                </ul>
              </div>
            </v-expand-transition>
          </div>
        </Form>
        <template v-if="relatedSubmissions && relatedSubmissions.length">
          <v-divider class="my-2" />
          <RotationList v-slot="{ item }" :items="relatedSubmissions" title="相关分享">
            <router-link :to="'/submissions/' + item.uuid" class="text-decoration-none">
              {{ item.title }}
            </router-link>
          </RotationList>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Form } from 'vee-validate';
import { useDisplay } from 'vuetify';
import { useRoute, useRouter } from 'vue-router';

import SiteBtn from '@/components/SiteBtn.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';
import SubmissionActionBar from '@/components/submission/SubmissionActionBar.vue';

import SimpleEditor from '@/components/SimpleEditor.vue';
import { api } from '@/api';
import {
  IComment,
  INewCommentInternal,
  IRichText,
  ISubmission,
  ISubmissionArchive,
  ISubmissionSuggestion,
  ISubmissionUpvotes,
  ITopic,
  IUserSubmissionSubscription,
} from '@/interfaces';
import Viewer from '@/components/Viewer.vue';
import { apiSubmission } from '@/api/submission';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';
import { apiMe } from '@/api/me';
import { doNothing, isEqual, updateHead } from '@/common';
import { apiSearch } from '@/api/search';
import RotationList from '@/components/base/RotationList.vue';
import TopicChip from '@/components/widgets/TopicChip.vue';
import SubmissionHistoryDialog from '@/components/submission/SubmissionHistoryDialog.vue';
import SubmissionSuggestions from '@/components/submission/SubmissionSuggestions.vue';
import RelativeTime from '@/components/RelativeTime.vue';
import { useAuth, useResponsive, useErrorHandling } from '@/composables';
import { useMainStore } from '@/stores/main';
import { useUiStore } from '@/stores/ui';
import AppIcon from '@/components/icons/AppIcon.vue';
import { useNotificationStore } from '@/stores/notifications';
const store = useMainStore();
const ui = useUiStore();
const display = useDisplay();

const route = useRoute();
const router = useRouter();
const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();
const { recursiveCommentsCount } = useErrorHandling();

const showHelp = ref(false);
const submission = ref<ISubmission | null>(null);
const newSubmissionTitle = ref('');
const newSubmissionUrl = ref<string | undefined>(undefined);
const showSubmissionEditor = ref(false);
const newSubmissionTopicNames = ref<string[]>([]);
const hintTopicNames = ref<string[]>([]); // TODO
const commentWritable = ref(false);
const editable = ref(false);
const showConfirmHideSubmissionDialog = ref(false);
const loadingProgress = ref(0);
const loading = ref(true);

const commitSubmissionEditIntermediate = ref(false);
const cancelSubscriptionIntermediate = ref(false);
const subscribeIntermediate = ref(false);
const showCancelUpvoteDialog = ref(false);
const upvoteIntermediate = ref(false);
const cancelUpvoteIntermediate = ref(false);
const upvotes = ref<ISubmissionUpvotes | null>(null);
const archives = ref<ISubmissionArchive[]>([]);
const historyDialog = ref(false);
const comments = ref<IComment[]>([]);
const commentSubmitIntermediate = ref(false);
const submissionSubscription = ref<IUserSubmissionSubscription | null>(null);
const relatedSubmissions = ref<ISubmission[] | null>(null);
const submissionSuggestions = ref<ISubmissionSuggestion[]>([]);
const newSuggestionCommment = ref<string | null>(null);
const descEditor = ref<any>(null);

const suggestionEditable = computed(() => !editable.value && userProfile.value);

const id = computed(() => route.params.id);

const submissionSuggestionUUID = computed(() => route.params.submission_suggestion_id);

const isNarrowFeedUI = computed(() => ui.narrowUI);

// Watch for route changes (replacing beforeRouteUpdate)
watch(
  () => route.params,
  (newParams, oldParams) => {
    if (route.name === 'submission' && !isEqual(newParams, oldParams)) {
      loading.value = true;
      loadingProgress.value = 0;
      showHelp.value = false;
      showSubmissionEditor.value = false;
      commentWritable.value = false;
      editable.value = false;
      upvotes.value = null;
      archives.value = [];
      comments.value = [];
      relatedSubmissions.value = [];
      submissionSuggestions.value = [];
      load();
    }
  }
);

onMounted(async () => {
  try {
    if (localStorage.getItem('new-submission')) {
      useNotificationStore().push({
        content: '点击「更多」编辑细节',
        color: 'info',
      });
      localStorage.removeItem('new-submission');
    }
  } catch (e) { console.warn('localStorage is not available', e); }
  await load();
});

async function load() {
  try {
    const response = await apiSubmission.getSubmission(token.value, id.value);
    submission.value = response.data;
    updateHead(route.path, submission.value!.title, submission.value?.desc?.rendered_text);
    if (token.value) {
      submissionSubscription.value = (
        await apiMe.getSubmissionSubscription(token.value, submission.value!.uuid)
      ).data;
      submissionSuggestions.value = (
        await apiSubmission.getSuggestions(token.value, submission.value!.uuid)
      ).data;
    }
  } catch (err) {
    useNotificationStore().push({
      content: '分享不存在，返回主页',
      color: 'error',
    });
    await router.push('/');
  }

  await store.captureApiError(async () => {
    if (submission.value) {
      comments.value = submission.value.comments;

      if (token.value) {
        apiSubmission.bumpViewsCounter(token.value, submission.value.uuid).then(doNothing);
      }
      upvotes.value = (
        await apiSubmission.getSubmissionUpvotes(token.value, submission.value.uuid)
      ).data;
      loadingProgress.value = 33;

      newSubmissionTitle.value = submission.value.title;
      newSubmissionUrl.value = submission.value.url;
      newSubmissionTopicNames.value = submission.value.topics.map((topic) => topic.name);
      if (userProfile.value) {
        if (userProfile.value.uuid === submission.value.author.uuid) {
          editable.value = true;
        }
        await store.captureApiError(async () => {
          const submissionSite = submission.value!.site;

          if (userProfile.value) {
            const userSiteProfile = (
              await api.getUserSiteProfile(token.value, submissionSite.uuid, userProfile.value.uuid)
            ).data;
            if (userSiteProfile !== null || submissionSite.public_writable_comment) {
              commentWritable.value = true;
            }
          }
        });
      }
      loadingProgress.value = 100;
      loading.value = false;

      if (submission.value.keywords && userProfile.value) {
        relatedSubmissions.value = (
          await apiSearch.searchSubmissions(
            token.value,
            submission.value.keywords.join(' ')
          )
        ).data;
        const i = relatedSubmissions.value?.findIndex((s) => {
          return s.uuid === submission.value!.uuid;
        });
        if (i >= 0) {
          relatedSubmissions.value.splice(i, 1);
        }
      }
    }
  });
}

async function submitNewSubmissionCommentBody({ body, body_text, editor, mentioned }: INewCommentInternal) {
  await store.captureApiError(async () => {
    commentSubmitIntermediate.value = true;
    if (submission.value) {
      const response = await apiComment.postComment(token.value, {
        site_uuid: submission.value?.site.uuid,
        submission_uuid: id.value,
        content: {
          source: body,
          rendered_text: body_text,
          editor,
        },
        mentioned,
      });
      const comment = response.data;
      comments.value.push(comment);
    }
    commentSubmitIntermediate.value = false;
  });
}

async function commitSubmissionEdit() {
  commitSubmissionEditIntermediate.value = true;
  await store.captureApiError(async () => {
    const descEditorRef = descEditor.value as any;
    if ((descEditorRef.getContent() || newSubmissionTitle.value) && submission.value) {
      const responses = await Promise.all(
        newSubmissionTopicNames.value.map((name) => apiTopic.createTopic(token.value, { name }))
      );
      const topicsUUIDs = responses.map((r) => r.data.uuid);
      const desc: IRichText = {
        source: descEditorRef.getContent() || '',
        rendered_text: descEditorRef.getTextContent() || undefined,
        editor: descEditorRef.editor,
      };
      const payload: any = {
        title: newSubmissionTitle.value,
        desc: desc,
        topic_uuids: topicsUUIDs,
      };
      if (editable.value) {
        submission.value = (
          await apiSubmission.updateSubmission(token.value, submission.value.uuid, payload)
        ).data;
      } else if (suggestionEditable.value) {
        payload.submission_uuid = submission.value.uuid;
        if (newSuggestionCommment.value) {
          payload.comment = newSuggestionCommment.value;
        }
        const submissionSuggestion = (await apiSubmission.createSuggestion(token.value, payload))
          .data;
        submissionSuggestions.value.splice(0, 0, submissionSuggestion);
      }
    }
    showSubmissionEditor.value = false;
    commitSubmissionEditIntermediate.value = false;
  });
}

async function upvote() {
  upvoteIntermediate.value = true;
  await store.captureApiError(async () => {
    if (submission.value) {
      upvotes.value = (
        await apiSubmission.upvoteSubmission(token.value, submission.value.uuid)
      ).data;
      upvoteIntermediate.value = false;
    }
  });
}

async function cancelUpvote() {
  cancelUpvoteIntermediate.value = true;
  await store.captureApiError(async () => {
    if (submission.value) {
      upvotes.value = (
        await apiSubmission.cancelUpvoteSubmission(token.value, submission.value.uuid)
      ).data;
      cancelUpvoteIntermediate.value = false;
      showCancelUpvoteDialog.value = false;
    }
  });
}

async function showHistoryDialog() {
  if (submission.value) {
    archives.value = (
      await apiSubmission.getSubmissionArchives(token.value, submission.value.uuid)
    ).data;
    archives.value.unshift({
      id: 0,
      title: submission.value.title,
      desc: submission.value.desc,
      created_at: submission.value.updated_at,
    });
    if (archives.value.length > 0) {
      historyDialog.value = true;
    } else {
      useNotificationStore().push({
        content: '尚无历史存档',
        color: 'info',
      });
    }
  }
}

async function confirmHideSubmission() {
  await store.captureApiError(async () => {
    await apiSubmission.hideSubmission(token.value, submission.value!.uuid);
    useNotificationStore().push({
      content: '已隐藏',
      color: 'info',
    });
    await router.push(`/sites/${submission.value!.site.subdomain}`);
  });
}

async function cancelSubmissionUpdate() {
  showSubmissionEditor.value = false;
}

async function cancelSubscription() {
  await store.captureApiError(async () => {
    if (submission.value) {
      cancelSubscriptionIntermediate.value = true;
      const r = await apiMe.unsubscribeSubmission(token.value, submission.value.uuid);
      submissionSubscription.value = r.data;
      cancelSubscriptionIntermediate.value = false;
    }
  });
}

async function subscribe() {
  if (!userProfile.value) {
    ui.showLoginPrompt = true;
    return;
  }
  await store.captureApiError(async () => {
    if (submission.value) {
      subscribeIntermediate.value = true;
      const r = await apiMe.subscribeSubmission(token.value, submission.value.uuid);
      submissionSubscription.value = r.data;
      subscribeIntermediate.value = false;
    }
  });
}

async function acceptSuggestion(suggestion: ISubmissionSuggestion) {
  await store.captureApiError(async () => {
    await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'accepted',
    });
    router.go(0);
  });
}

async function rejectSuggestion(suggestion: ISubmissionSuggestion) {
  await store.captureApiError(async () => {
    const r = await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'rejected',
    });
    suggestion.status = r.data.status;
    suggestion.rejected_at = r.data.rejected_at;
  });
}

async function retractSuggestion(suggestion: ISubmissionSuggestion) {
  await store.captureApiError(async () => {
    const r = await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'retracted',
    });
    suggestion.status = r.data.status;
    suggestion.retracted_at = r.data.retracted_at;
  });
}

async function revertRetractSuggestion(suggestion: ISubmissionSuggestion) {
  await store.captureApiError(async () => {
    const r = await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'pending',
    });
    suggestion.status = r.data.status;
  });
}

</script>
