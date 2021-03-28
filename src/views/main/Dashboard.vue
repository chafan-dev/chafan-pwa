<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col :class="{ 'col-10': $vuetify.breakpoint.mdAndUp }" fluid>
        <div class="ma-3 d-flex">
          <span class="headline primary--text">{{ $t('Dashboard') }}</span>
          <v-spacer />
          <span class="text-caption grey--text">{{ $t('本页中的信息只有自己可见') }}</span>
        </div>

        <v-tabs :vertical="$vuetify.breakpoint.mdAndUp" v-model="currentTabItem" show-arrows>
          <v-tabs-slider />
          <v-tab v-for="item in tabItems" :key="item.code" :href="'#' + item.code">
            {{ $t(item.text) }}
          </v-tab>

          <v-tab-item value="settings">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('我的设置') }}</div>
              <v-spacer />
              <NewInviteLinkBtn />
              <!-- Extra div wrapper to align the buttons -->
              <div v-if="userProfile">
                <v-btn class="ml-2" depressed small :to="`/users/${userProfile.handle}`"
                  >{{ $t('个人资料') }}
                </v-btn>
              </div>
              <div v-if="userProfile">
                <v-btn class="ml-2" depressed small to="/security">{{ $t('Security') }}</v-btn>
              </div>
            </v-card-title>
            <div class="ma-3">
              <v-switch
                :label="$t('发送邮件提醒未读通知')"
                @change="onChangeEmailNotifications"
                v-model="enableEmailNotifications"
                :disabled="changingMySettings"
              />
              <v-select
                v-if="editorModeItems"
                :label="$t('默认编辑器模式')"
                :items="editorModeItems"
                item-text="text"
                item-value="value"
                v-model="selectedEditorMode"
                @change="onChangeEditorMode"
                :disabled="changingMySettings"
              />
              <div>
                <div class="d-flex">
                  <v-btn class="mr-2" depressed small @click="showExportDialog = true">{{
                    $t('导出')
                  }}</v-btn>
                  <v-btn class="mr-2" depressed small @click="showLabsDialog = true">{{
                    $t('Labs')
                  }}</v-btn>
                </div>

                <v-dialog v-model="showExportDialog" max-width="500px">
                  <v-card>
                    <v-card-title>
                      {{ $t('导出') }}
                    </v-card-title>
                    <v-card-text>
                      {{
                        $t(
                          'Chafan 支持用户的数据所有权和导出自由，所以你随时可以导出你拥有的数据和创作内容。目前自动导出尚未实现，请直接联系 takeout@cha.fan，我们将在一周内将你的数据快照发送到注册用的邮箱。'
                        )
                      }}
                    </v-card-text>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="showLabsDialog" max-width="500px">
                  <v-card>
                    <v-card-title>
                      {{ $t('Labs') }}
                    </v-card-title>
                    <v-card-text>
                      {{ $t('试验性功能：') }}
                      <div>
                        <v-switch
                          label="Tiptap 编辑器选项"
                          v-model="tiptapEditorOptionOn"
                          @change="updateLabs"
                        />
                      </div>
                      <v-progress-circular indeterminate v-if="changingMySettings" />
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </div>
            </div>
          </v-tab-item>

          <v-tab-item value="drafts">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('我的草稿') }}</div>
              <v-spacer />
            </v-card-title>
            <div v-if="myAnswerDrafts !== null && myArticleDrafts !== null">
              <Answer
                v-for="answer in myAnswerDrafts"
                :key="answer.uuid"
                class="ma-3"
                :draftMode="true"
                :answerPreview="answer"
                @delete-answer-draft="onDeleteAnswerDraft"
              />

              <ArticlePreview
                v-for="article in myArticleDrafts"
                :key="article.uuid"
                :articlePreview="article"
                class="ma-3"
              />
              <div
                class="text-center"
                v-if="myAnswerDrafts.length === 0 && myArticleDrafts.length === 0"
              >
                暂无草稿
              </div>
            </div>
            <v-progress-linear indeterminate v-else />
          </v-tab-item>

          <v-tab-item value="my_columns">
            <!-- Dialog for creating a new article column -->
            <v-dialog v-model="dialogNewArticleColumn" max-width="500px">
              <v-card>
                <v-card-title
                  ><span class="headline">{{ $t('创建新专栏') }}</span></v-card-title
                >
                <v-card-text>
                  <v-text-field v-model="newArticleColumn.name" :label="$t('专栏名称')" required />
                  <v-textarea v-model="newArticleColumn.description" :label="$t('专栏描述')" />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn
                    small
                    depressed
                    color="primary"
                    @click="commitNewArticleColumn"
                    :disabled="commitNewArticleColumnIntermediate"
                    >{{ $t('创建') }}</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('我的专栏') }}</div>
              <v-spacer />
              <v-btn small depressed color="primary" @click="dialogNewArticleColumn = true">{{
                $t('创建新专栏')
              }}</v-btn>
            </v-card-title>
            <div v-if="!articleColumnsIntermediate">
              <ArticleColumnCard
                v-for="articleColumn in myArticleColumns"
                :key="articleColumn.uuid"
                :articleColumn="articleColumn"
                class="ma-3"
                :compactMode="true"
              />
            </div>
            <v-progress-linear indeterminate v-else />
          </v-tab-item>

          <v-tab-item value="joined_channels">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('私信') }}</div>
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
                    :userPreview="
                      channel.private_with_user &&
                      channel.private_with_user.uuid !== userProfile.uuid
                        ? channel.private_with_user
                        : channel.admin
                    "
                    :showAvatar="true"
                    :clickable="false"
                  />
                </v-tab>
                <v-tab-item v-for="channel in myChannels" :key="channel.id">
                  <ChatWindow :channel="channel" />
                </v-tab-item>
              </v-tabs>
            </div>
            <v-progress-linear indeterminate v-else />
          </v-tab-item>

          <v-tab-item value="coins">
            <div class="d-flex ma-2">
              <div>
                <span class="subheading secondary--text text--lighten-3">{{ $t('硬币数量') }}</span
                >:
                <span class="title primary--text text--darken-2" v-if="userProfile">{{
                  userProfile.remaining_coins
                }}</span>
                <span class="title primary--text text--darken-2" v-else>-----</span>
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
                  <v-toolbar-title>{{ $t('Rewards') }}</v-toolbar-title>
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
              </template>
              <template v-slot:item.refunded_at="{ item }">
                <span v-if="item.refunded_at">{{
                  $dayjs.utc(item.refunded_at).local().fromNow()
                }}</span>
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
                  <a
                    class="text-decoration-none"
                    :href="'/questions/' + item.condition.content.question_uuid"
                    >{{ $t('Link') }}</a
                  >
                </span>
              </template>
              <template v-slot:item.action="{ item }">
                <v-btn
                  small
                  depressed
                  color="primary"
                  v-if="claimable(item)"
                  @click="claimReward(item)"
                >
                  {{ $t('Claim') }}
                </v-btn>
                <v-btn
                  small
                  depressed
                  color="primary"
                  v-if="refundable(item)"
                  @click="refundReward(item)"
                >
                  {{ $t('Refund') }}
                </v-btn>
              </template>
            </v-data-table>

            <!-- Coin payments -->
            <v-data-table
              :loading="coinPaymentsIntermediate"
              :headers="coinPaymentHeaders"
              :items="coinPayments"
              :items-per-page="10"
              class="elevation-1 ma-2"
            >
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>{{ $t('最近硬币交易记录') }}</v-toolbar-title>
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
                <Event :event="item.event" :type="'payment'" v-if="item.event" />
              </template>
            </v-data-table>
          </v-tab-item>

          <v-tab-item value="bookmarked_answers">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('收藏的答案') }}</div>
            </v-card-title>
            <DynamicItemList
              emptyItemsText="暂无"
              nullItemsText=""
              :loadItems="loadBookmarkedAnswers"
              v-slot="{ item }"
            >
              <Answer :answer-preview="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="subscribed_questions">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('关注的问题') }}</div>
            </v-card-title>
            <DynamicItemList
              emptyItemsText="暂无"
              nullItemsText=""
              :loadItems="loadSubscribedQuestions"
              v-slot="{ item }"
            >
              <QuestionPreview :question-preview="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="subscribed_submissions">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('收藏的分享') }}</div>
            </v-card-title>
            <DynamicItemList
              emptyItemsText="暂无"
              nullItemsText=""
              :loadItems="loadSubscribedSubmissions"
              v-slot="{ item }"
            >
              <SubmissionCard :submission="item" />
            </DynamicItemList>
          </v-tab-item>

          <v-tab-item value="bookmarked_articles">
            <v-card-title primary-title>
              <div class="headline primary--text">{{ $t('收藏的文章') }}</div>
            </v-card-title>
            <DynamicItemList
              emptyItemsText="暂无"
              nullItemsText=""
              :loadItems="loadBookmarkedArticles"
              v-slot="{ item }"
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
import { readUserProfile } from '@/store/main/getters';
import {
  editor_T,
  IAnswerPreview,
  IArticleColumn,
  IArticleColumnCreate,
  IArticlePreview,
  IChannel,
  ICoinPayment,
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

@Component({
  components: {
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
  get userProfile() {
    return readUserProfile(this.$store);
  }
  private coinPayments: ICoinPayment[] = [];
  private myChannels: IChannel[] = [];
  private myRewards: IReward[] = [];
  private myArticleColumns: IArticleColumn[] = [];

  private dialogNewArticleColumn: boolean = false;
  private newArticleColumn: IArticleColumnCreate = { name: '' };

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
    { text: this.$t('Action'), value: 'action' },
  ];

  private myAnswerDrafts: IAnswerPreview[] | null = null;
  private myArticleDrafts: IArticlePreview[] | null = null;

  private enableEmailNotifications = false;
  private changingMySettings = false;

  private selectedEditorMode: editor_T = 'wysiwyg';

  private editorModeItems: { text: string; value: string }[] | null = null;

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

        api.getMyArticleColumns(this.$store.state.main.token).then((r) => {
          this.myArticleColumns = r.data;
          this.articleColumnsIntermediate = false;
        });

        apiMe.getMyChannels(this.$store.state.main.token).then((r) => {
          this.myChannels = r.data;
          this.channelsIntermediate = false;
        });

        api.getRewards(this.$store.state.main.token).then((r) => {
          this.myRewards = r.data;
          this.rewardsIntermediate = false;
        });

        api2.getCoinPayments(this.$store.state.main.token).then((r) => {
          this.coinPayments = r.data;
          this.coinPaymentsIntermediate = false;
        });

        api.getAnswerDrafts(this.$store.state.main.token).then((r) => {
          this.myAnswerDrafts = r.data;
        });
        api.getArticleDrafts(this.$store.state.main.token).then((r) => {
          this.myArticleDrafts = r.data;
        });
      }
    });
  }

  private async loadSubscribedQuestions(skip: number, limit: number) {
    let items: (IQuestionPreview | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getSubscribedQuestions(this.$store.state.main.token, skip, limit)).data;
    });
    return items;
  }

  private async loadSubscribedSubmissions(skip: number, limit: number) {
    let items: (ISubmission | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getSubscribedSubmissions(this.$store.state.main.token, skip, limit))
        .data;
    });
    return items;
  }

  private async loadBookmarkedAnswers(skip: number, limit: number) {
    let items: (IAnswerPreview | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getAnswerBookmarks(this.$store.state.main.token, skip, limit)).data;
    });
    return items;
  }

  private async loadBookmarkedArticles(skip: number, limit: number) {
    let items: (IArticlePreview | null)[] | null = null;
    await dispatchCaptureApiError(this.$store, async () => {
      items = (await apiMe.getArticleBookmarks(this.$store.state.main.token, skip, limit)).data;
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
      const response = await apiArticle.createArticleColumn(
        this.$store.state.main.token,
        this.newArticleColumn
      );
      this.$router.push(`/article-columns/${response.data.uuid}`);
    });
  }

  private claimable(reward: IReward) {
    if (
      this.$dayjs.utc(reward.expired_at).isBefore(this.$dayjs.utc()) ||
      reward.claimed_at ||
      reward.refunded_at
    ) {
      return false;
    }
    if (this.userProfile) {
      return reward.receiver.uuid === this.userProfile.uuid;
    }
    return false;
  }

  private refundable(reward: IReward) {
    if (reward.claimed_at || reward.refunded_at) {
      return false;
    }
    if (this.userProfile) {
      return reward.giver.uuid === this.userProfile.uuid;
    }
    return false;
  }

  private async onChangeEmailNotifications() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.changingMySettings = true;
      const newProfile = (
        await apiMe.updateMe(this.$store.state.main.token, {
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
        await apiMe.updateMe(this.$store.state.main.token, {
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
      const newReward = (await api.claimReward(this.$store.state.main.token, reward.id)).data;
      this.myRewards.splice(idx, 0, newReward);
    });
  }

  private async refundReward(reward: IReward) {
    await dispatchCaptureApiError(this.$store, async () => {
      const idx = this.myRewards.indexOf(reward);
      this.myRewards.splice(idx, 1);
      const newReward = (await api.refundReward(this.$store.state.main.token, reward.id)).data;
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
}
</script>
