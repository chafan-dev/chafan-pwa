<template>
  <v-container fluid>
    <v-progress-linear
      v-if="loading"
      v-model="loadingProgress"
      :indeterminate="loadingProgress === 0"
    />
    <v-row v-else justify="center">
      <v-col :class="{ 'col-8': isDesktop && !isNarrowFeedUI, 'fixed-narrow-col': isNarrowFeedUI }">
        <ValidationObserver v-slot="{ handleSubmit }">
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
                dense
                rows="1"
              />
            </div>

            <!-- Submission URL display -->
            <div v-if="submission.url">
              <LinkIcon />
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
              <span class="text-caption grey--text">
                编辑贡献者:
                <template v-for="(contributor, idx) in submission.contributors">
                  <span v-if="idx" :key="idx">, </span>
                  <UserLink :key="idx" :show-avatar="false" :user-preview="contributor" />
                </template>
              </span>
            </div>

            <div class="d-flex">
              <v-spacer />
              <span class="grey--text caption">上次编辑：{{ fromNow(submission.updated_at) }}</span>
            </div>

            <!-- Suggestion comment -->
            <div v-if="suggestionEditable && showSubmissionEditor">
              <v-text-field v-model="newSuggestionCommment" clearable label="附言（可选）" />
            </div>
          </div>

          <v-dialog v-model="historyDialog" max-width="900">
            <v-card>
              <v-card-title primary-title>
                <div class="headline primary--text">分享历史</div>
                <v-spacer />
                <span class="text-caption grey--text">点击展开</span>
              </v-card-title>
              <v-expansion-panels>
                <v-expansion-panel v-for="archive in archives" :key="archive.id">
                  <v-expansion-panel-header>
                    {{ fromNow(archive.created_at) }}
                    <v-spacer />
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div class="headline primary--text">
                      {{ archive.title }}
                    </div>
                    <Viewer v-if="archive.desc" :content="archive.desc" />
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card>
          </v-dialog>

          <div v-if="!showSubmissionEditor" class="d-flex py-2">
            <Upvote
              class="mr-1"
              v-if="upvotes"
              :disabled="!userProfile || userProfile.uuid === submission.author.uuid"
              :on-cancel-vote="cancelUpvote"
              :on-vote="upvote"
              :upvoted="upvotes.upvoted"
              :upvotes-count="upvotes.count"
            />

            <v-btn
              v-if="editable"
              @click="showSubmissionEditor = true"
              class="slim-btn mr-1"
              depressed
              small
            >
              <EditIcon />
              <span v-if="$vuetify.breakpoint.mdAndUp" class="ml-1">编辑</span>
            </v-btn>

            <ShareCardButton
              v-slot="{ shareQrCodeUrl }"
              :link="`/submissions/${submission.uuid}`"
              :link-text="submission.title"
              class="text-decoration-none mr-1"
            >
              <v-card-title>
                {{ submission.title }}
              </v-card-title>
              <v-card-text>
                <div class="pt-2 d-flex">
                  <div class="text--primary text-body-1">
                    <Viewer v-if="submission.desc" :content="submission.desc" />
                    <p>
                      <CommentsIcon class="mr-1" small />
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
            </ShareCardButton>

            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" class="slim-btn" depressed small>
                  <DotsIcon small />
                  <span v-if="isDesktop" class="ml-1">更多</span>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item v-if="suggestionEditable" @click="showSubmissionEditor = true">
                  <EditIcon class="mr-1" />
                  提交编辑建议
                </v-list-item>

                <v-list-item dense @click="showHistoryDialog">
                  <HistoryIcon class="mr-1" />
                  查看编辑历史
                </v-list-item>

                <template v-if="submissionSubscription">
                  <v-list-item
                    v-if="submissionSubscription.subscribed_by_me"
                    :disabled="cancelSubscriptionIntermediate"
                    dense
                    @click="cancelSubscription"
                  >
                    <BookmarkedIcon class="mr-1" />
                    取消收藏
                  </v-list-item>
                  <v-list-item v-else :disabled="subscribeIntermediate" dense @click="subscribe">
                    <ToBookmarkIcon class="mr-1" />
                    收藏
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>

            <v-dialog v-model="showConfirmHideSubmissionDialog" max-width="600">
              <v-card>
                <v-card-title primary-title>
                  <div class="headline primary--text">确认隐藏分享？</div>
                </v-card-title>
                <v-card-text>隐藏后分享将对所有用户不可见。</v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn color="warning" depressed mr-1 small @click="confirmHideSubmission">
                    确认隐藏
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
          <div v-if="showSubmissionEditor" class="d-flex pt-2">
            <v-btn
              :disabled="commitSubmissionEditIntermediate"
              class="mr-1"
              color="primary"
              depressed
              small
              @click="handleSubmit(commitSubmissionEdit)"
            >
              <template v-if="editable">保存</template>
              <template v-else>提交建议</template>
            </v-btn>
            <v-btn class="mr-1" depressed small @click="cancelSubmissionUpdate">取消</v-btn>
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
          <v-expansion-panels v-if="submission" class="mt-2">
            <v-expansion-panel v-for="suggestion in submissionSuggestions" :key="suggestion.uuid">
              <v-expansion-panel-header
                :class="{
                  'grey--text': suggestion.status !== 'pending',
                  'primary--text': suggestion.uuid === submissionSuggestionUUID,
                }"
              >
                <span>
                  <UserLink :show-avatar="true" :user-preview="suggestion.author" /> 的建议编辑：
                  <template v-if="suggestion.status === 'pending'">
                    待处理（{{ fromNow(suggestion.created_at) }}）
                  </template>
                  <template v-if="suggestion.status === 'accepted'">
                    已接受（{{ fromNow(suggestion.accepted_at) }}）
                  </template>
                  <template v-if="suggestion.status === 'rejected'">
                    已拒绝（{{ fromNow(suggestion.rejected_at) }}）
                  </template>
                  <template v-if="suggestion.status === 'retracted'">
                    已撤回（{{ fromNow(suggestion.retracted_at) }}）
                  </template>
                </span>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div v-if="suggestion.comment">
                  <span class="font-weight-bold">附言：</span>{{ suggestion.comment }}
                </div>
                <template v-if="suggestion.status === 'accepted' && suggestion.accepted_diff_base">
                  <div
                    v-if="
                      suggestion.accepted_diff_base.title !== suggestion.title && suggestion.title
                    "
                  >
                    <span class="font-weight-bold">标题改动：</span>
                    <DiffView :s1="suggestion.accepted_diff_base.title" :s2="suggestion.title" />
                  </div>
                  <div
                    v-if="
                      suggestion.desc &&
                      (!suggestion.accepted_diff_base.desc ||
                        suggestion.accepted_diff_base.desc.source !== suggestion.desc.source)
                    "
                  >
                    <span class="font-weight-bold">描述改动：</span>
                    <DiffView
                      :s1="
                        suggestion.accepted_diff_base.desc
                          ? suggestion.accepted_diff_base.desc.rendered_text
                          : ''
                      "
                      :s2="suggestion.desc.rendered_text"
                    />
                  </div>
                </template>
                <template v-else-if="suggestion.status !== 'accepted'">
                  <div v-if="submission.title !== suggestion.title && suggestion.title">
                    <span class="font-weight-bold">标题改动：</span>
                    <DiffView :s1="submission.title" :s2="suggestion.title" />
                  </div>
                  <div
                    v-if="
                      suggestion.desc &&
                      (!submission.desc || submission.desc.source !== suggestion.desc.source)
                    "
                  >
                    <span class="font-weight-bold">描述改动：</span>
                    <DiffView
                      :s1="submission.desc ? submission.desc.rendered_text : ''"
                      :s2="suggestion.desc.rendered_text"
                    />
                  </div>
                  <div v-if="suggestion.topics">
                    <!-- FIXME: the topics of stored accepted diff base is not processed properly -->
                    <span class="font-weight-bold">话题改动：</span>
                    <DiffView
                      v-if="suggestion.topics"
                      :s1="topicNames(submission.topics)"
                      :s2="topicNames(suggestion.topics)"
                    />
                  </div>
                </template>
                <div class="d-flex justify-end mt-1">
                  <template v-if="suggestion.status === 'pending'">
                    <v-btn class="mr-2" outlined small @click="previewSuggestion(suggestion)">
                      预览
                    </v-btn>
                    <v-btn
                      v-if="userProfile.uuid === suggestion.author.uuid"
                      outlined
                      small
                      @click="retractSuggestion(suggestion)"
                    >
                      撤回
                    </v-btn>
                    <template v-if="userProfile.uuid === submission.author.uuid">
                      <v-btn
                        class="mr-2"
                        color="green"
                        outlined
                        small
                        @click="acceptSuggestion(suggestion)"
                      >
                        接受
                      </v-btn>
                      <v-btn color="warning" outlined small @click="rejectSuggestion(suggestion)">
                        拒绝
                      </v-btn>
                    </template>
                  </template>
                  <template v-if="suggestion.status === 'rejected'">
                    <v-btn
                      v-if="userProfile.uuid === suggestion.author.uuid"
                      outlined
                      small
                      @click="retractSuggestion(suggestion)"
                    >
                      撤回
                    </v-btn>
                    <template v-if="userProfile.uuid === submission.author.uuid">
                      <v-btn
                        class="mr-2"
                        color="green"
                        outlined
                        small
                        @click="acceptSuggestion(suggestion)"
                      >
                        接受
                      </v-btn>
                    </template>
                  </template>
                  <template v-if="suggestion.status === 'retracted'">
                    <v-btn
                      v-if="userProfile.uuid === suggestion.author.uuid"
                      outlined
                      small
                      @click="revertRetractSuggestion(suggestion)"
                    >
                      取消撤回
                    </v-btn>
                  </template>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-dialog v-model="showSuggestionPreviewDialog">
            <v-card v-if="previewedSuggestion" :key="previewedSuggestion.uuid">
              <v-chip-group v-if="previewedSuggestion.topics" class="px-5">
                <v-chip
                  v-for="topic in previewedSuggestion.topics"
                  :key="topic.uuid"
                  :to="'/topics/' + topic.uuid"
                  small
                >
                  {{ topic.name }}
                </v-chip>
              </v-chip-group>
              <v-card-title>{{ previewedSuggestion.title }}</v-card-title>
              <v-card-text>
                <Viewer v-if="previewedSuggestion.desc" :content="previewedSuggestion.desc" />
              </v-card-text>
            </v-card>
          </v-dialog>

          <div v-if="!userProfile" class="mt-2 text-center">登录后参与讨论</div>
          <div>
            <div class="text-center">
              <span
                class="grey--text text-caption cursor-pointer"
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
        </ValidationObserver>
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
import store from '@/store';
import { useRoute, useRouter } from 'vue-router/composables';

import SiteBtn from '@/components/SiteBtn.vue';
import CommentBlock from '@/components/CommentBlock.vue';
import UserLink from '@/components/UserLink.vue';

import BookmarkedIcon from '@/components/icons/BookmarkedIcon.vue';
import ToBookmarkIcon from '@/components/icons/ToBookmarkIcon.vue';
import HistoryIcon from '@/components/icons/HistoryIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import CommentsIcon from '@/components/icons/CommentsIcon.vue';
import SimpleEditor from '@/components/SimpleEditor.vue';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { api } from '@/api';
import { readNarrowUI } from '@/store/main/getters';
import {
  IComment,
  IRichText,
  ISubmission,
  ISubmissionArchive,
  ISubmissionSuggestion,
  ISubmissionUpvotes,
  ITopic,
  IUserSubmissionSubscription,
} from '@/interfaces';
import Viewer from '@/components/Viewer.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiSubmission } from '@/api/submission';
import { apiTopic } from '@/api/topic';
import { apiComment } from '@/api/comment';
import { apiMe } from '@/api/me';
import { doNothing, isEqual, updateHead } from '@/common';
import { apiSearch } from '@/api/search';
import RotationList from '@/components/base/RotationList.vue';
import ShareCardButton from '@/components/ShareCardButton.vue';
import Upvote from '@/components/Upvote.vue';
import DotsIcon from '@/components/icons/DotsIcon.vue';
import DiffView from '@/components/widgets/DiffView.vue';
import TopicChip from '@/components/widgets/TopicChip.vue';
import { useAuth, useResponsive, useDayjs, useErrorHandling } from '@/composables';

const route = useRoute();
const router = useRouter();
const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();
const { dayjs } = useDayjs();
const { recursiveCommentsCount } = useErrorHandling();

function fromNow(date: string) {
  return dayjs(date).fromNow();
}

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
const previewedSuggestion = ref<ISubmissionSuggestion | null>(null);
const showSuggestionPreviewDialog = ref(false);
const descEditor = ref<any>(null);

const suggestionEditable = computed(() => !editable.value && userProfile.value);

const id = computed(() => route.params.id);

const submissionSuggestionUUID = computed(() => route.params.submission_suggestion_id);

const isNarrowFeedUI = computed(() => readNarrowUI(store));

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
      commitAddNotification(store, {
        content: '点击「更多」编辑细节',
        color: 'info',
      });
      localStorage.removeItem('new-submission');
    }
  } catch (e) {}
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
    commitAddNotification(store, {
      content: '分享不存在，返回主页',
      color: 'error',
    });
    await router.push('/');
  }

  await dispatchCaptureApiError(store, async () => {
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
        await dispatchCaptureApiError(store, async () => {
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
            store.state.main.token,
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

async function submitNewSubmissionCommentBody({ body, body_text, editor, mentioned }: any) {
  await dispatchCaptureApiError(store, async () => {
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
  await dispatchCaptureApiError(store, async () => {
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
  await dispatchCaptureApiError(store, async () => {
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
  await dispatchCaptureApiError(store, async () => {
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
      commitAddNotification(store, {
        content: '尚无历史存档',
        color: 'info',
      });
    }
  }
}

async function confirmHideSubmission() {
  await dispatchCaptureApiError(store, async () => {
    await apiSubmission.hideSubmission(store.state.main.token, submission.value!.uuid);
    commitAddNotification(store, {
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
  await dispatchCaptureApiError(store, async () => {
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
    commitSetShowLoginPrompt(store, true);
    return;
  }
  await dispatchCaptureApiError(store, async () => {
    if (submission.value) {
      subscribeIntermediate.value = true;
      const r = await apiMe.subscribeSubmission(token.value, submission.value.uuid);
      submissionSubscription.value = r.data;
      subscribeIntermediate.value = false;
    }
  });
}

async function acceptSuggestion(suggestion: ISubmissionSuggestion) {
  await dispatchCaptureApiError(store, async () => {
    await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'accepted',
    });
    router.go(0);
  });
}

async function rejectSuggestion(suggestion: ISubmissionSuggestion) {
  await dispatchCaptureApiError(store, async () => {
    const r = await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'rejected',
    });
    suggestion.status = r.data.status;
    suggestion.rejected_at = r.data.rejected_at;
  });
}

async function retractSuggestion(suggestion: ISubmissionSuggestion) {
  await dispatchCaptureApiError(store, async () => {
    const r = await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'retracted',
    });
    suggestion.status = r.data.status;
    suggestion.retracted_at = r.data.retracted_at;
  });
}

async function revertRetractSuggestion(suggestion: ISubmissionSuggestion) {
  await dispatchCaptureApiError(store, async () => {
    const r = await apiSubmission.updateSubmissionSuggestion(token.value, suggestion.uuid, {
      status: 'pending',
    });
    suggestion.status = r.data.status;
  });
}

function topicNames(topics: ITopic[]) {
  return topics
    .map((topic) => topic.name)
    .sort()
    .join(', ');
}

function getDiffBase(suggestion: ISubmissionSuggestion) {
  if (suggestion.status === 'accepted' && suggestion.accepted_diff_base) {
    return suggestion.accepted_diff_base;
  }
  return submission.value;
}

function previewSuggestion(suggestion: ISubmissionSuggestion) {
  previewedSuggestion.value = suggestion;
  showSuggestionPreviewDialog.value = true;
}
</script>
