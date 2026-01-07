<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-10': $vuetify.breakpoint.mdAndUp }">
        <div class="ma-3 d-flex">
          <span class="headline primary--text">用户中心</span>
          <v-spacer />
          <span class="text-caption grey--text">本页中的信息只有自己可见</span>
        </div>

        <v-tabs v-model="currentTabItem" :vertical="$vuetify.breakpoint.mdAndUp" show-arrows>
          <v-tabs-slider />
          <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
            {{ item.text }}
          </v-tab>

          <v-tab-item value="settings">
            <v-card-title primary-title>
              <div class="headline primary--text">我的设置</div>
              <v-spacer />
              <NewInviteLinkBtn />
              <!-- Extra div wrapper to align the buttons -->
              <div v-if="userProfile">
                <v-btn :to="`/users/${userProfile.handle}`" class="ml-2" depressed small
                  >个人资料
                </v-btn>
              </div>
              <div v-if="userProfile">
                <v-btn class="ml-2" depressed small to="/security">安全中心</v-btn>
              </div>
            </v-card-title>
            <div class="ma-3">
              <v-switch
                v-model="enableEmailNotifications"
                :disabled="changingMySettings"
                label="发送邮件提醒未读通知"
                @change="onChangeEmailNotifications"
              />
              <v-select
                v-if="editorModeItems"
                v-model="selectedEditorMode"
                :disabled="changingMySettings"
                :items="editorModeItems"
                item-text="text"
                item-value="value"
                label="编辑器偏好"
                @change="onChangeEditorMode"
              />
              <v-select
                v-if="themeItems"
                v-model="selectedTheme"
                :disabled="changingMySettings"
                :items="themeItems"
                item-text="text"
                item-value="value"
                label="主题偏好"
                @change="onChangeTheme"
              />
              <div v-if="userProfile.feed_settings">
                <div v-if="userProfile.feed_settings.blocked_origins.length" class="pb-4">
                  <span
                    >动态中过滤的内容：
                    <v-chip
                      v-for="(origin, idx) in userProfile.feed_settings.blocked_origins"
                      :key="idx"
                      small
                    >
                      <template v-if="origin.origin_type === 'site'">
                        <SiteName :subdomain="origin.subdomain" />
                        <CloseIcon class="ml-1" @click="unblockOrigin(origin)" />
                      </template>
                    </v-chip>
                  </span>
                </div>
              </div>
              <div>
                <div class="d-flex">
                  <v-btn class="mr-2" depressed small @click="showExportDialog = true">导出</v-btn>
                  <v-btn class="mr-2" depressed small @click="showLabsDialog = true">实验室</v-btn>
                </div>

                <v-dialog v-model="showExportDialog" max-width="500px">
                  <v-card>
                    <v-card-title> 导出</v-card-title>
                    <v-card-text>
                      「茶饭」支持用户的数据所有权和导出自由，所以你随时可以导出你拥有的数据和创作内容。目前自动导出尚未实现，请直接联系
                      takeout@cha.fan，我们将在一周内将你的数据快照发送到注册用的邮箱。
                    </v-card-text>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="showLabsDialog" max-width="500px">
                  <v-card>
                    <v-card-title> 实验室</v-card-title>
                    <v-card-text>
                      <div>
                        <v-switch
                          v-model="tiptapEditorOptionOn"
                          label="Tiptap 编辑器选项"
                          @change="updateLabs"
                        />
                      </div>
                      <v-progress-circular v-if="changingMySettings" indeterminate />
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </div>
            </div>
          </v-tab-item>

          <v-tab-item value="drafts">
            <v-card-title primary-title>
              <div class="headline primary--text">我的草稿</div>
              <v-spacer />
            </v-card-title>
            <div v-if="myAnswerDrafts !== null && myArticleDrafts !== null">
              <BaseCard class="c-card ma-3" v-for="answer in myAnswerDrafts" :key="answer.uuid">
                <Answer
                  :answerPreview="answer"
                  :draftMode="true"
                  class="ma-3"
                  @delete-answer-draft="onDeleteAnswerDraft"
                />
              </BaseCard>
              <BaseCard class="c-card ma-3" v-for="article in myArticleDrafts" :key="article.uuid">
                <ArticlePreview :articlePreview="article" class="ma-3" />
              </BaseCard>
              <EmptyPlaceholder
                v-if="myAnswerDrafts.length === 0 && myArticleDrafts.length === 0"
              />
            </div>
            <v-progress-linear v-else indeterminate />
          </v-tab-item>

          <v-tab-item value="my_columns">
            <v-card-title primary-title>
              <div class="headline primary--text">我的专栏</div>
              <v-spacer />
              <CreateArticleColumn />
            </v-card-title>
            <div v-if="!articleColumnsIntermediate">
              <ArticleColumnCard
                v-for="articleColumn in myArticleColumns"
                :key="articleColumn.uuid"
                :articleColumn="articleColumn"
                :compactMode="true"
                class="ma-3"
              />
            </div>
            <v-progress-linear v-else indeterminate />
          </v-tab-item>

          <v-tab-item value="joined_channels">
            <v-card-title primary-title>
              <div class="headline primary--text">私信</div>
            </v-card-title>
            <div v-if="!channelsIntermediate">
              <EmptyPlaceholder v-if="myChannels.length === 0" />
              <v-tabs :vertical="isDesktop" v-else>
                <v-tabs-slider />
                <v-tab
                  v-for="channel in myChannels"
                  :key="channel.id"
                  class="justify-start"
                >
                  <UserLink
                    :clickable="false"
                    :showAvatar="true"
                    :userPreview="
                      channel.private_with_user &&
                      channel.private_with_user.uuid !== userProfile.uuid
                        ? channel.private_with_user
                        : channel.admin
                    "
                  />
                </v-tab>
                <v-tab-item v-for="channel in myChannels" :key="channel.id">
                  <ChatWindow :channel="channel" />
                </v-tab-item>
              </v-tabs>
            </div>
            <v-progress-linear v-else indeterminate />
          </v-tab-item>

          <v-tab-item value="coins">
            <div class="d-flex my-2 ml-4">
              <div>
                <span class="subheading secondary--text text--lighten-3">我的硬币</span>：
                <span v-if="userProfile" class="title primary--text">{{
                  userProfile.remaining_coins
                }}</span>
                <span v-else class="title primary--text text--darken-2">-----</span>
              </div>
            </div>

            <!-- Coin payments -->
            <v-data-table
              :headers="coinPaymentHeaders"
              :items="coinPayments"
              :items-per-page="10"
              :loading="coinPaymentsIntermediate"
              class="ma-2"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>最近交易</v-toolbar-title>
                </v-toolbar>
              </template>
              <template v-slot:item.created_at="{ item }">
                {{ $dayjs.utc(item.created_at).local().fromNow() }}
              </template>
              <template v-slot:item.type="{ item }">
                {{
                  item.payer.uuid === userProfile.uuid
                    ? '支出 → '
                    : item.payee.uuid === userProfile.uuid
                    ? '收入 ← '
                    : '未知'
                }}
                <UserLink
                  :userPreview="item.payer.uuid === userProfile.uuid ? item.payee : item.payer"
                ></UserLink>
              </template>
              <template v-slot:item.reference="{ item }">
                <Event v-if="item.event" :event="item.event" :type="'payment'" />
              </template>
            </v-data-table>

            <!-- Rewards -->
            <v-data-table
              :headers="rewardHeaders"
              :items="myRewards"
              :items-per-page="10"
              :loading="rewardsIntermediate"
              class="ma-2"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>奖励</v-toolbar-title>
                </v-toolbar>
              </template>
              <template v-slot:item.created_at="{ item }">
                <span v-if="item.created_at">{{
                  $dayjs.utc(item.created_at).local().fromNow()
                }}</span>
              </template>
              <template v-slot:item.expired_at="{ item }">
                <span v-if="item.expired_at">{{
                  $dayjs.utc(item.expired_at).local().fromNow()
                }}</span>
              </template>
              <template v-slot:item.claimed_at="{ item }">
                <span v-if="item.claimed_at">{{
                  $dayjs.utc(item.claimed_at).local().fromNow()
                }}</span>
                <span v-else>-</span>
              </template>
              <template v-slot:item.refunded_at="{ item }">
                <span v-if="item.refunded_at">{{
                  $dayjs.utc(item.refunded_at).local().fromNow()
                }}</span>
                <span v-else>-</span>
              </template>

              <template v-slot:item.type="{ item }">
                {{
                  item.giver.uuid === userProfile.uuid
                    ? '给予 → '
                    : item.receiver.uuid === userProfile.uuid
                    ? '收到 ← '
                    : '未知'
                }}
                <UserLink
                  :userPreview="item.giver.uuid === userProfile.uuid ? item.receiver : item.giver"
                />
              </template>
              <template v-slot:item.condition="{ item }">
                <span v-if="item.condition.content.condition_type === 'answered_question'">
                  回答问题：
                  <router-link
                    :to="'/questions/' + item.condition.content.question_uuid"
                    class="text-decoration-none"
                  >
                    超链接
                  </router-link>
                </span>
              </template>
              <template v-slot:item.action="{ item }">
                <span v-if="$dayjs.utc(item.expired_at).isBefore($dayjs.utc())"> 已过期 </span>
                <template v-else-if="item.giver.uuid === userProfile.uuid">
                  <span v-if="item.refunded_at"> 已撤回 </span>
                  <span v-if="item.claimed_at"> 已被领取 </span>
                </template>
                <template v-else>
                  <span v-if="item.claimed_at"> 已领取 </span>
                  <span v-else-if="item.refunded_at"> 已被取消 </span>
                  <v-btn v-else color="primary" depressed small @click="claimReward(item)">
                    领取
                  </v-btn>
                </template>
              </template>
            </v-data-table>
          </v-tab-item>

          <v-tab-item value="bookmarked_answers">
            <v-card-title primary-title>
              <div class="headline primary--text">收藏的答案</div>
            </v-card-title>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadBookmarkedAnswers"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <Answer :answer-preview="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="subscribed_questions">
            <v-card-title primary-title>
              <div class="headline primary--text">关注的问题</div>
            </v-card-title>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadSubscribedQuestions"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <QuestionPreview :question-preview="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="subscribed_submissions">
            <v-card-title primary-title>
              <div class="headline primary--text">收藏的分享</div>
            </v-card-title>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadSubscribedSubmissions"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <SubmissionPreview :submission="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="bookmarked_articles">
            <v-card-title primary-title>
              <div class="headline primary--text">收藏的文章</div>
            </v-card-title>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadBookmarkedArticles"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <ArticlePreview :article-preview="item" />
            </DynamicItemList>
          </v-tab-item>
        </v-tabs>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from '@/router';
import {
  editor_T,
  IAnswerPreview,
  IArticleColumn,
  IArticlePreview,
  IChannel,
  ICoinPayment,
  IOrigin,
  IQuestionPreview,
  IReward,
  ISubmission,
  ThemeType,
} from '@/interfaces';
import { api } from '@/api';
import { api2 } from '@/api2';
import {
  commitAddNotification,
  commitSetTheme,
  commitSetUserProfile,
} from '@/store/main/mutations';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import ChatWindow from '@/components/ChatWindow.vue';
import Answer from '@/components/Answer.vue';
import SubmissionPreview from '@/components/SubmissionPreview.vue';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import Event from '@/components/Event.vue';
import { dispatchAddFlag, dispatchCaptureApiError, dispatchRemoveFlag } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import NewInviteLinkBtn from '@/components/NewInviteLinkBtn.vue';
import { LABS_TIPTAP_EDITOR_OPTION, themeLocalStorageKey } from '@/common';
import DynamicItemList from '@/components/DynamicItemList.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import SiteName from '@/components/SiteName.vue';
import { apiActivity } from '@/api/activity';
import { getLocalValue, setLocalValue } from '@/utils';
import CreateArticleColumn from '@/views/main/CreateArticleColumn.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import { useAuth, useResponsive } from '@/composables';

const store = useStore();
const route = useRoute();
const router = useRouter();
const { token, userProfile } = useAuth();
const { isDesktop } = useResponsive();

const coinPayments = ref<ICoinPayment[]>([]);
const myChannels = ref<IChannel[]>([]);
const myRewards = ref<IReward[]>([]);
const myArticleColumns = ref<IArticleColumn[]>([]);
const channelsIntermediate = ref(true);
const rewardsIntermediate = ref(true);
const articleColumnsIntermediate = ref(true);
const coinPaymentsIntermediate = ref(true);
const showExportDialog = ref(false);
const showLabsDialog = ref(false);
const tiptapEditorOptionOn = ref(false);
const tabItems = [
  { text: '我的设置', code: 'settings' },
  { text: '我的草稿', code: 'drafts' },
  { text: '我的专栏', code: 'my_columns' },
  { text: '私信', code: 'joined_channels' },
  { text: '硬币', code: 'coins' },
  { text: '收藏的答案', code: 'bookmarked_answers' },
  { text: '关注的问题', code: 'subscribed_questions' },
  { text: '收藏的分享', code: 'subscribed_submissions' },
  { text: '收藏的文章', code: 'bookmarked_articles' },
];
const coinPaymentHeaders = [
  { text: '创建于', value: 'created_at' },
  { text: '数量', value: 'amount' },
  { text: '类型', value: 'type' },
  { text: '参考', value: 'reference' },
];
const rewardHeaders = [
  { text: '创建于', value: 'created_at' },
  { text: '退回于', value: 'refunded_at' },
  { text: '过期于', value: 'expired_at' },
  { text: '找回于', value: 'claimed_at' },
  { text: '硬币数量', value: 'coin_amount' },
  { text: '类型', value: 'type' },
  { text: '条件', value: 'condition' },
  { text: '', value: 'action' },
];
const myAnswerDrafts = ref<IAnswerPreview[] | null>(null);
const myArticleDrafts = ref<IArticlePreview[] | null>(null);
const enableEmailNotifications = ref(false);
const changingMySettings = ref(false);
const selectedEditorMode = ref<editor_T>('wysiwyg');
const selectedTheme = ref<ThemeType>('default');
const editorModeItems = ref<{ text: string; value: string }[] | null>(null);
const themeItems = ref<{ text: string; value: string }[] | null>(null);

const currentTabItem = computed({
  get() {
    return route.query.tab ? route.query.tab : 'settings';
  },
  set(tab) {
    if (tab !== 'settings') {
      router.replace({ query: { ...route.query, tab: tab as string } });
    } else {
      router.replace({ query: { ...route.query, tab: undefined } });
    }
  },
});

onMounted(async () => {
  const theme = getLocalValue(themeLocalStorageKey) as ThemeType;
  if (theme) {
    selectedTheme.value = theme;
  }
  await dispatchCaptureApiError(store, async () => {
    if (userProfile.value) {
      tiptapEditorOptionOn.value = userProfile.value.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION);

      const editorItems = [
        { text: '所见即所得', value: 'wysiwyg' },
        { text: 'Markdown（实时渲染）', value: 'markdown_realtime_rendering' },
        { text: 'Markdown（分屏渲染）', value: 'markdown_splitview' },
      ];
      if (tiptapEditorOptionOn.value) {
        editorItems.push({ text: 'Tiptap 编辑器', value: 'tiptap' });
      }
      editorModeItems.value = editorItems;

      themeItems.value = [
        { text: '默认主题', value: 'default' },
        { text: '蓝色主题（开发中）', value: 'blue' },
      ];

      selectedEditorMode.value = userProfile.value.default_editor_mode;
      enableEmailNotifications.value = userProfile.value.enable_deliver_unread_notifications;

      api.getMyArticleColumns(token.value).then((r) => {
        myArticleColumns.value = r.data;
        articleColumnsIntermediate.value = false;
      });

      apiMe.getMyChannels(token.value).then((r) => {
        myChannels.value = r.data;
        channelsIntermediate.value = false;
      });

      api.getRewards(token.value).then((r) => {
        myRewards.value = r.data;
        rewardsIntermediate.value = false;
      });

      api2.getCoinPayments(token.value).then((r) => {
        coinPayments.value = r.data;
        coinPaymentsIntermediate.value = false;
      });

      api.getAnswerDrafts(token.value).then((r) => {
        myAnswerDrafts.value = r.data;
      });
      api.getArticleDrafts(token.value).then((r) => {
        myArticleDrafts.value = r.data;
      });
    }
  });
});

async function loadSubscribedQuestions(skip: number, limit: number) {
  let items: (IQuestionPreview | null)[] | null = null;
  await dispatchCaptureApiError(store, async () => {
    items = (await apiMe.getSubscribedQuestions(token.value, skip, limit)).data;
  });
  return items;
}

async function loadSubscribedSubmissions(skip: number, limit: number) {
  let items: (ISubmission | null)[] | null = null;
  await dispatchCaptureApiError(store, async () => {
    items = (await apiMe.getSubscribedSubmissions(token.value, skip, limit)).data;
  });
  return items;
}

async function loadBookmarkedAnswers(skip: number, limit: number) {
  let items: (IAnswerPreview | null)[] | null = null;
  await dispatchCaptureApiError(store, async () => {
    items = (await apiMe.getAnswerBookmarks(token.value, skip, limit)).data;
  });
  return items;
}

async function loadBookmarkedArticles(skip: number, limit: number) {
  let items: (IArticlePreview | null)[] | null = null;
  await dispatchCaptureApiError(store, async () => {
    items = (await apiMe.getArticleBookmarks(token.value, skip, limit)).data;
  });
  return items;
}

async function onChangeEmailNotifications() {
  await dispatchCaptureApiError(store, async () => {
    changingMySettings.value = true;
    const newProfile = (
      await apiMe.updateMe(token.value, {
        enable_deliver_unread_notifications: enableEmailNotifications.value,
      })
    ).data;
    commitSetUserProfile(store, newProfile);
    changingMySettings.value = false;
    commitAddNotification(store, { content: '已保存', color: 'info' });
  });
}

async function onChangeEditorMode() {
  await dispatchCaptureApiError(store, async () => {
    changingMySettings.value = true;
    const newProfile = (
      await apiMe.updateMe(token.value, {
        default_editor_mode: selectedEditorMode.value,
      })
    ).data;
    commitSetUserProfile(store, newProfile);
    changingMySettings.value = false;
    commitAddNotification(store, { content: '已保存', color: 'info' });
  });
}

async function onChangeTheme() {
  await dispatchCaptureApiError(store, async () => {
    changingMySettings.value = true;
    commitSetTheme(store, selectedTheme.value);
    setLocalValue(themeLocalStorageKey, selectedTheme.value);
    changingMySettings.value = false;
    commitAddNotification(store, { content: '已保存', color: 'info' });
  });
}

async function claimReward(reward: IReward) {
  await dispatchCaptureApiError(store, async () => {
    const idx = myRewards.value.indexOf(reward);
    myRewards.value.splice(idx, 1);
    const newReward = (await api.claimReward(token.value, reward.id)).data;
    myRewards.value.splice(idx, 0, newReward);
  });
}

function onDeleteAnswerDraft(uuid: string) {
  if (myAnswerDrafts.value) {
    let idx = myAnswerDrafts.value.findIndex((answer) => answer.uuid === uuid);
    if (idx !== -1) {
      myAnswerDrafts.value.splice(idx, 1);
    }
  }
}

async function updateLabs() {
  changingMySettings.value = true;
  if (tiptapEditorOptionOn.value) {
    await dispatchAddFlag(store, LABS_TIPTAP_EDITOR_OPTION);
  } else {
    await dispatchRemoveFlag(store, LABS_TIPTAP_EDITOR_OPTION);
  }
  changingMySettings.value = false;
  router.go(0);
}

async function unblockOrigin(origin: IOrigin) {
  await apiActivity.updateOrigins(token.value, { action: 'remove', origin });
  await commitAddNotification(store, {
    color: 'info',
    content: '过滤规则更新成功，稍后自动生效',
  });
  await router.go(0);
}
</script>
