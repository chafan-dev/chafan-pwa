<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-10': $vuetify.breakpoint.mdAndUp }" fluid>
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
                label="默认编辑器模式"
                item-text="text"
                item-value="value"
                @change="onChangeEditorMode"
              />
              <div v-if="userProfile.feed_settings">
                <div v-if="userProfile.feed_settings.blocked_origins.length" class="pb-4">
                  <span
                    >动态中过滤的内容：
                    <v-chip
                      small
                      v-for="(origin, idx) in userProfile.feed_settings.blocked_origins"
                      :key="idx"
                    >
                      <template v-if="origin.origin_type === 'site'">
                        <SiteName :subdomain="origin.subdomain" />
                        <CloseIcon @click="unblockOrigin(origin)" class="ml-1" />
                      </template>
                    </v-chip>
                  </span>
                </div>
              </div>
              <div>
                <div class="d-flex">
                  <v-btn class="mr-2" depressed small @click="showExportDialog = true">导出 </v-btn>
                  <v-btn class="mr-2" depressed small @click="showLabsDialog = true">实验室 </v-btn>
                </div>

                <v-dialog v-model="showExportDialog" max-width="500px">
                  <v-card>
                    <v-card-title> 导出 </v-card-title>
                    <v-card-text>
                      「茶饭」支持用户的数据所有权和导出自由，所以你随时可以导出你拥有的数据和创作内容。目前自动导出尚未实现，请直接联系
                      takeout@cha.fan，我们将在一周内将你的数据快照发送到注册用的邮箱。
                    </v-card-text>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="showLabsDialog" max-width="500px">
                  <v-card>
                    <v-card-title> 实验室 </v-card-title>
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
              <Answer
                v-for="answer in myAnswerDrafts"
                :key="answer.uuid"
                :answerPreview="answer"
                :draftMode="true"
                class="ma-3"
                @delete-answer-draft="onDeleteAnswerDraft"
              />

              <ArticlePreview
                v-for="article in myArticleDrafts"
                :key="article.uuid"
                :articlePreview="article"
                class="ma-3"
              />
              <EmptyPlaceholder
                v-if="myAnswerDrafts.length === 0 && myArticleDrafts.length === 0"
              />
            </div>
            <v-progress-linear v-else indeterminate />
          </v-tab-item>

          <v-tab-item value="my_columns">
            <!-- Dialog for creating a new article column -->
            <v-dialog v-model="dialogNewArticleColumn" max-width="500px">
              <v-card>
                <v-card-title><span class="headline">创建新专栏</span></v-card-title>
                <v-card-text>
                  <v-text-field v-model="newArticleColumn.name" label="专栏名称" required />
                  <v-textarea v-model="newArticleColumn.description" label="专栏描述" />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    :disabled="commitNewArticleColumnIntermediate"
                    color="primary"
                    depressed
                    small
                    @click="commitNewArticleColumn"
                    >创建
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-card-title primary-title>
              <div class="headline primary--text">我的专栏</div>
              <v-spacer />
              <v-btn color="primary" depressed small @click="dialogNewArticleColumn = true"
                >创建新专栏
              </v-btn>
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
              <v-tabs :vertical="$vuetify.breakpoint.mdAndUp">
                <v-tabs-slider />
                <v-tab
                  v-for="channel in myChannels"
                  :key="channel.id"
                  style="justify-content: left"
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
            <div class="d-flex ma-2">
              <div>
                <span class="subheading secondary--text text--lighten-3">硬币</span>：
                <span v-if="userProfile" class="title primary--text text--darken-2">{{
                  userProfile.remaining_coins
                }}</span>
                <span v-else class="title primary--text text--darken-2">-----</span>
              </div>
            </div>

            <!-- Rewards -->
            <v-data-table
              :headers="rewardHeaders"
              :items="myRewards"
              :items-per-page="10"
              :loading="rewardsIntermediate"
              class="elevation-1 ma-2"
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
                    ? $t('Give') + ' → '
                    : item.receiver.uuid === userProfile.uuid
                    ? $t('Receive') + ' ← '
                    : $t('Unknown')
                }}
                <UserLink
                  :userPreview="item.giver.uuid === userProfile.uuid ? item.receiver : item.giver"
                />
              </template>
              <template v-slot:item.condition="{ item }">
                <span v-if="item.condition.content.condition_type === 'answered_question'">
                  {{ $t('回答问题') }}:
                  <router-link
                    :to="'/questions/' + item.condition.content.question_uuid"
                    class="text-decoration-none"
                    >{{ $t('Link') }}</router-link
                  >
                </span>
              </template>
              <template v-slot:item.action="{ item }">
                <template v-if="item.giver.uuid === userProfile.uuid">
                  <span v-if="item.refunded_at"> 已撤回 </span>
                  <span v-else-if="item.claimed_at"> 已被领取 </span>
                </template>
                <template v-else>
                  <span v-if="$dayjs.utc(item.expired_at).isBefore($dayjs.utc())"> 已过期 </span>
                  <span v-else-if="item.claimed_at"> 已领取 </span>
                  <span v-else-if="item.refunded_at"> 已被取消 </span>
                  <v-btn v-else color="primary" depressed small @click="claimReward(item)">
                    领取
                  </v-btn>
                </template>
              </template>
            </v-data-table>

            <!-- Coin payments -->
            <v-data-table
              :headers="coinPaymentHeaders"
              :items="coinPayments"
              :items-per-page="10"
              :loading="coinPaymentsIntermediate"
              class="elevation-1 ma-2"
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
                    ? $t('Expense') + ' → '
                    : item.payee.uuid === userProfile.uuid
                    ? $t('Income') + ' ← '
                    : $t('Unknown')
                }}
                <UserLink
                  :userPreview="item.payer.uuid === userProfile.uuid ? item.payee : item.payer"
                ></UserLink>
              </template>
              <template v-slot:item.reference="{ item }">
                <Event v-if="item.event" :event="item.event" :type="'payment'" />
              </template>
            </v-data-table>
          </v-tab-item>

          <v-tab-item value="bookmarked_answers">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('收藏的答案') }}</div>
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
              <div class="headline primary--text">{{ $t('收藏的分享') }}</div>
            </v-card-title>
            <DynamicItemList
              v-slot="{ item }"
              :loadItems="loadSubscribedSubmissions"
              emptyItemsText="暂无"
              nullItemsText=""
            >
              <SubmissionCard :submission="item" />
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { readToken, readUserProfile } from '@/store/main/getters';
import {
  editor_T,
  IAnswerPreview,
  IArticleColumn,
  IArticleColumnCreate,
  IArticlePreview,
  IChannel,
  ICoinPayment,
  IOrigin,
  IQuestionPreview,
  IReward,
  ISubmission,
} from '@/interfaces';
import { api } from '@/api';
import { api2 } from '@/api2';
import { apiArticle } from '@/api/article';
import { commitAddNotification, commitSetUserProfile } from '@/store/main/mutations';
import QuestionPreview from '@/components/question/QuestionPreview.vue';
import ArticlePreview from '@/components/ArticlePreview.vue';
import ChatWindow from '@/components/ChatWindow.vue';
import Answer from '@/components/Answer.vue';
import SubmissionCard from '@/components/SubmissionCard.vue';
import ArticleColumnCard from '@/components/ArticleColumnCard.vue';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import InfoIcon from '@/components/icons/InfoIcon.vue';
import Event from '@/components/Event.vue';
import { dispatchAddFlag, dispatchCaptureApiError, dispatchRemoveFlag } from '@/store/main/actions';
import { apiMe } from '@/api/me';
import NewInviteLinkBtn from '@/components/NewInviteLinkBtn.vue';
import { LABS_TIPTAP_EDITOR_OPTION } from '@/common';
import DynamicItemList from '@/components/DynamicItemList.vue';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import SiteName from '@/components/SiteName.vue';
import { apiActivity } from '@/api/activity';

@Component({
  components: {
    SiteName,
    CloseIcon,
    EmptyPlaceholder,
    DynamicItemList,
    QuestionPreview,
    Answer,
    ArticleColumnCard,
    SubmissionCard,
    SiteBtn,
    ArticlePreview,
    UserLink,
    Event,
    InfoIcon,
    NewInviteLinkBtn,
    ChatWindow,
  },
})
export default class Dashboard extends Vue {
  private coinPayments: ICoinPayment[] = [];
  private myChannels: IChannel[] = [];
  private myRewards: IReward[] = [];
  private myArticleColumns: IArticleColumn[] = [];
  private dialogNewArticleColumn: boolean = false;
  private newArticleColumn: IArticleColumnCreate = { name: '' };
  private channelsIntermediate = true;
  private rewardsIntermediate = true;
  private articleColumnsIntermediate = true;
  private coinPaymentsIntermediate = true;
  private commitNewArticleColumnIntermediate = false;
  private showExportDialog = false;
  private showLabsDialog = false;
  private tiptapEditorOptionOn = false;
  private tabItems = [
    {
      text: '我的设置',
      code: 'settings',
    },
    {
      text: '我的草稿',
      code: 'drafts',
    },
    {
      text: '我的专栏',
      code: 'my_columns',
    },
    {
      text: '私信',
      code: 'joined_channels',
    },
    {
      text: '硬币',
      code: 'coins',
    },
    {
      text: '收藏的答案',
      code: 'bookmarked_answers',
    },
    {
      text: '关注的问题',
      code: 'subscribed_questions',
    },
    {
      text: '收藏的分享',
      code: 'subscribed_submissions',
    },
    {
      text: '收藏的文章',
      code: 'bookmarked_articles',
    },
  ];
  private readonly coinPaymentHeaders = [
    { text: this.$t('Created at'), value: 'created_at' },
    { text: this.$t('Amount'), value: 'amount' },
    { text: this.$t('Type'), value: 'type' },
    { text: this.$t('Reference'), value: 'reference' },
  ];
  private readonly rewardHeaders = [
    { text: this.$t('Created at'), value: 'created_at' },
    { text: this.$t('Refunded at'), value: 'refunded_at' },
    { text: this.$t('Expired at'), value: 'expired_at' },
    { text: this.$t('Claimed at'), value: 'claimed_at' },
    { text: this.$t('Coin amount'), value: 'coin_amount' },
    { text: this.$t('Type'), value: 'type' },
    { text: this.$t('Condition'), value: 'condition' },
    { text: '', value: 'action' },
  ];
  private myAnswerDrafts: IAnswerPreview[] | null = null;
  private myArticleDrafts: IArticlePreview[] | null = null;
  private enableEmailNotifications = false;
  private changingMySettings = false;
  private selectedEditorMode: editor_T = 'wysiwyg';
  private editorModeItems: { text: string; value: string }[] | null = null;

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get currentTabItem() {
    return this.$route.query.tab ? this.$route.query.tab : 'settings';
  }

  set currentTabItem(tab) {
    if (tab !== 'settings') {
      this.$router.replace({ query: { ...this.$route.query, tab } });
    } else {
      this.$router.replace({ query: { ...this.$route.query, tab: undefined } });
    }
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.userProfile) {
        this.tiptapEditorOptionOn = this.userProfile.flag_list.includes(LABS_TIPTAP_EDITOR_OPTION);

        const editorModeItems = [
          {
            text: this.$t('wysiwyg').toString(),
            value: 'wysiwyg',
          },
          {
            text: this.$t('markdown_realtime_rendering').toString(),
            value: 'markdown_realtime_rendering',
          },
          {
            text: this.$t('markdown_splitview').toString(),
            value: 'markdown_splitview',
          },
        ];
        if (this.tiptapEditorOptionOn) {
          editorModeItems.push({
            text: this.$t('tiptap').toString(),
            value: 'tiptap',
          });
        }
        this.editorModeItems = editorModeItems;
        this.selectedEditorMode = this.userProfile.default_editor_mode;

        this.enableEmailNotifications = this.userProfile.enable_deliver_unread_notifications;

        api.getMyArticleColumns(this.token).then((r) => {
          this.myArticleColumns = r.data;
          this.articleColumnsIntermediate = false;
        });

        apiMe.getMyChannels(this.token).then((r) => {
          this.myChannels = r.data;
          this.channelsIntermediate = false;
        });

        api.getRewards(this.token).then((r) => {
          this.myRewards = r.data;
          this.rewardsIntermediate = false;
        });

        api2.getCoinPayments(this.token).then((r) => {
          this.coinPayments = r.data;
          this.coinPaymentsIntermediate = false;
        });

        api.getAnswerDrafts(this.token).then((r) => {
          this.myAnswerDrafts = r.data;
        });
        api.getArticleDrafts(this.token).then((r) => {
          this.myArticleDrafts = r.data;
        });
      }
    });
  }

  private async loadSubscribedQuestions(skip: number, limit: number) {
    let items: (IQuestionPreview | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getSubscribedQuestions(this.token, skip, limit)).data;
    });
    return items;
  }

  private async loadSubscribedSubmissions(skip: number, limit: number) {
    let items: (ISubmission | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getSubscribedSubmissions(this.token, skip, limit)).data;
    });
    return items;
  }

  private async loadBookmarkedAnswers(skip: number, limit: number) {
    let items: (IAnswerPreview | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getAnswerBookmarks(this.token, skip, limit)).data;
    });
    return items;
  }

  private async loadBookmarkedArticles(skip: number, limit: number) {
    let items: (IArticlePreview | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getArticleBookmarks(this.token, skip, limit)).data;
    });
    return items;
  }

  private async commitNewArticleColumn() {
    if (this.newArticleColumn.name.length === 0) {
      commitAddNotification(this.$store, {
        content: this.$t("Article column name can't be empty.").toString(),
        color: 'error',
      });
      return;
    }
    await dispatchCaptureApiError(this.$store, async () => {
      this.commitNewArticleColumnIntermediate = true;
      const response = await apiArticle.createArticleColumn(this.token, this.newArticleColumn);
      await this.$router.push(`/article-columns/${response.data.uuid}`);
    });
  }

  private async onChangeEmailNotifications() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.changingMySettings = true;
      const newProfile = (
        await apiMe.updateMe(this.token, {
          enable_deliver_unread_notifications: this.enableEmailNotifications,
        })
      ).data;
      commitSetUserProfile(this.$store, newProfile);
      this.changingMySettings = false;
      commitAddNotification(this.$store, {
        content: this.$t('Saved.').toString(),
        color: 'info',
      });
    });
  }

  private async onChangeEditorMode() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.changingMySettings = true;
      const newProfile = (
        await apiMe.updateMe(this.token, {
          default_editor_mode: this.selectedEditorMode,
        })
      ).data;
      commitSetUserProfile(this.$store, newProfile);
      this.changingMySettings = false;
      commitAddNotification(this.$store, {
        content: this.$t('Saved.').toString(),
        color: 'info',
      });
    });
  }

  private async claimReward(reward: IReward) {
    await dispatchCaptureApiError(this.$store, async () => {
      const idx = this.myRewards.indexOf(reward);
      this.myRewards.splice(idx, 1);
      const newReward = (await api.claimReward(this.token, reward.id)).data;
      this.myRewards.splice(idx, 0, newReward);
    });
  }

  private onDeleteAnswerDraft(uuid: string) {
    if (this.myAnswerDrafts) {
      let idx = this.myAnswerDrafts.findIndex((answer) => answer.uuid === uuid);
      if (idx !== -1) {
        this.myAnswerDrafts.splice(idx, 1);
      }
    }
  }

  private async updateLabs() {
    this.changingMySettings = true;
    if (this.tiptapEditorOptionOn) {
      await dispatchAddFlag(this.$store, LABS_TIPTAP_EDITOR_OPTION);
    } else {
      await dispatchRemoveFlag(this.$store, LABS_TIPTAP_EDITOR_OPTION);
    }
    this.changingMySettings = false;
    this.$router.go(0);
  }

  get token() {
    return readToken(this.$store);
  }

  private async unblockOrigin(origin: IOrigin) {
    await apiActivity.updateOrigins(this.token, { action: 'remove', origin });
    await commitAddNotification(this.$store, {
      color: 'info',
      content: '过滤规则更新成功，稍后自动生效',
    });
    await this.$router.go(0);
  }
}
</script>
