<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-tabs v-else>
      <v-tabs-slider />
      <v-tab>成员管理</v-tab>
      <v-tab>圈子设置</v-tab>
      <v-tab>圈子运营</v-tab>
      <v-spacer />
      <v-autocomplete
        v-model="selectedSiteUUID"
        :items="moderatedSites"
        label="圈子"
        class="mt-2"
        clearable
        dense
        item-text="name"
        item-value="uuid"
        outlined
        @change="onSiteSelected"
      />

      <!-- Applications -->
      <v-tab-item>
        <v-data-table :headers="applicationHeaders" :items="applications" item-key="id">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>待处理申请</v-toolbar-title>
            </v-toolbar>
          </template>

          <template v-slot:item.applicant="{ item }">
            <UserLink :userPreview="item.applicant" />
          </template>

          <template v-slot:item.applied_site="{ item }">
            {{ item.applied_site.name }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn color="primary" depressed small @click="approveApplication(item)">Approve</v-btn>
          </template>
        </v-data-table>
      </v-tab-item>

      <!-- Config -->
      <v-tab-item>
        <template v-if="selectedSite !== null">
          <v-card class="ma-3">
            <v-card-title>基本信息</v-card-title>
            <v-card-text>
              <div>
                <span class="black--text mr-1">链接：</span>
                <SiteBtn :site="selectedSite" />
              </div>
              <div>
                <span class="black--text mr-1">类型：</span>
                {{ $t('site.permission_type.' + selectedSite.permission_type) }}
              </div>
            </v-card-text>
          </v-card>

          <v-card class="ma-3">
            <v-card-title>更新配置</v-card-title>
            <v-card-text>
              <div>
                <template v-if="!showSiteConfigEditor">
                  <span class="black--text mr-1">名字：</span>
                  <span>{{ selectedSite.name }}</span>
                </template>
                <v-text-field v-else v-model="siteConfigUpdate.name" label="名字" />
              </div>

              <div>
                <template v-if="!showSiteConfigEditor">
                  <span v-if="!showSiteConfigEditor" class="black--text mr-1">描述：</span>
                  <span>{{ selectedSite.description }}</span>
                </template>
                <v-text-field
                  v-else
                  v-model="siteConfigUpdate.description"
                  label="描述"
                  clearable
                />
              </div>

              <div>
                <v-select
                  v-if="showSiteConfigEditor"
                  v-model="siteConfigUpdate.category_topic_uuid"
                  :items="categoryTopics"
                  label="类别"
                  item-text="name"
                  item-value="uuid"
                />
                <template v-else-if="selectedSite.category_topic">
                  <span v-if="!showSiteConfigEditor" class="black--text mr-1">类别：</span>
                  <span>{{ selectedSite.category_topic.name }}</span>
                </template>
              </div>

              <div>
                <v-chip-group v-if="!showSiteConfigEditor">
                  <span class="black--text mr-1">话题：</span>
                  <v-chip
                    v-for="topic in siteTopics"
                    :key="topic.uuid"
                    :to="'/topics/' + topic.uuid"
                    small
                  >
                    {{ topic.name }}
                  </v-chip>
                </v-chip-group>

                <v-combobox
                  v-if="showSiteConfigEditor"
                  v-model="newSiteTopicNames"
                  :delimiters="[',', '，', '、']"
                  label="话题"
                  hide-selected
                  multiple
                  small-chips
                />
              </div>

              <div v-if="showSiteConfigEditor">
                <span class="black--text mr-1">加入申请处理方式：</span>
                <v-radio-group v-model="autoApproval">
                  <v-radio :value="true" label="自动审核" />
                  <v-radio :value="false" label="人工审核" />
                </v-radio-group>
              </div>
              <div v-else>
                <span class="black--text mr-1">加入申请处理方式：</span>
                <span v-if="selectedSite.auto_approval">自动审核</span>
                <span v-else>人工审核</span>
              </div>

              <div>
                <span v-if="autoApproval" class="black--text mr-1">
                  自动通过应满足的所有条件：
                </span>
                <span v-else class="black--text mr-1"> 提交申请给人工审核前应满足的所有条件 </span>
                <div class="ma-2">
                  <v-text-field
                    v-if="showSiteConfigEditor"
                    v-model="siteConfigUpdate.min_karma_for_application"
                    clearable
                    label="最低 karma"
                    type="number"
                  />
                  <v-text-field
                    v-else
                    :value="
                      selectedSite.min_karma_for_application
                        ? selectedSite.min_karma_for_application
                        : 'any'
                    "
                    disabled
                    label="最低 karma"
                  />

                  <v-combobox
                    v-if="showSiteConfigEditor"
                    v-model="emailSuffixes"
                    :delimiters="[',', '，', '、']"
                    clearable
                    label="邮件地址后缀（例子，'@qq.com'），输入后 ENTER 确认"
                    multiple
                    small-chips
                  />
                  <v-text-field
                    v-else
                    :value="
                      selectedSite.email_domain_suffix_for_application
                        ? selectedSite.email_domain_suffix_for_application
                        : 'any'
                    "
                    disabled
                    label="邮件地址后缀"
                  />
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                v-show="!showSiteConfigEditor"
                class="mr-2"
                color="primary"
                depressed
                small
                @click="showSiteConfigEditor = true"
                >编辑
              </v-btn>
              <v-btn
                v-show="showSiteConfigEditor"
                class="mr-2"
                color="primary"
                depressed
                small
                @click="commitSiteConfig"
                >提交
              </v-btn>
              <v-btn
                v-show="showSiteConfigEditor"
                class="mr-2"
                depressed
                small
                @click="showSiteConfigEditor = false"
                >取消
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card class="ma-3">
            <v-card-title>转移管理权限</v-card-title>
            <v-card-text>
              转移给：
              <UserSearch v-model="transferToNewAdminUUID" />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="warning" depressed small @click="submitTransferToNewAdmin"
                >确认（不可撤销）
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card class="ma-3">
            <v-dialog v-model="showNewWebhookDialog" max-width="600">
              <v-card>
                <v-card-title>添加新 Webhook</v-card-title>
                <v-card-text>
                  <v-text-field
                    label="Callback URL 地址"
                    v-model="webhookCreate.callback_url"
                    placeholder="https://..."
                  />
                  <v-text-field label="Secret" v-model="webhookCreate.secret" />
                  <v-textarea label="Event Spec JSON" v-model="webhookCreateEventSpecJson" />
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn small depressed @click="resetNewWebhook">取消</v-btn>
                  <v-btn small depressed color="primary" @click="addNewWebhook">添加</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-card-title>
              Webhook 配置 (beta)
              <v-spacer />
              <v-btn color="primary" depressed small @click="showNewWebhookDialog = true"
                >添加新 Webhook</v-btn
              >
            </v-card-title>
            <v-card-text>
              <v-data-table :headers="webhookHeaders" :items="webhooks" item-key="id">
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>所有 Webhooks</v-toolbar-title>
                  </v-toolbar>
                </template>

                <template v-slot:item.site="{ item }">
                  {{ item.site.name }}
                </template>

                <template v-slot:item.event_spec="{ item }">
                  {{ item.event_spec }}
                </template>

                <template v-slot:item.update_action="{ item }">
                  <v-btn depressed small @click="disableWebhook(item)">禁用</v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </template>
        <div v-else class="mt-2 text-center">请选择一个圈子</div>
      </v-tab-item>

      <!-- Operation -->
      <v-tab-item>
        <v-card class="ma-2">
          <v-card-title> 广播通知 </v-card-title>
          <v-card-text v-if="selectedSite !== null">
            请先将广播的内容提交到「分享」板块，然后将其链接粘贴至下方发送给圈子「{{
              selectedSite.name
            }}}」的成员。
            <v-text-field v-model="broadcastSubmissionLink" label="「分享」链接" />
          </v-card-text>
          <v-card-text v-else>请选择一个圈子</v-card-text>
          <v-card-actions v-if="selectedSite !== null">
            <v-spacer />
            <v-btn color="primary" @click="submitNewSubmissionBroadcast">发送</v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IApplication, ISite, ISiteUpdate, ITopic, IWebhook, IWebhookCreate } from '@/interfaces';
import { readToken } from '@/store/main/getters';
import { api } from '@/api';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import UserSearch from '@/components/UserSearch.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiTopic } from '@/api/topic';
import { commitAddNotification } from '@/store/main/mutations';
import { apiSite } from '@/api/site';
import { deepCopy } from '@/utils';
import { apiWebhook } from '@/api/webhook';
import { apiMe } from '@/api/me';

const defaultWebhookCreate: IWebhookCreate = {
  site_uuid: '',
  event_spec: {
    content: { event_type: 'site_event' },
  },
  secret: '',
  callback_url: '',
};

@Component({
  components: { UserLink, UserSearch, EditIcon, SiteBtn },
})
export default class Moderation extends Vue {
  private applicationHeaders = [
    {
      text: '申请者',
      sortable: true,
      value: 'applicant',
      align: 'left',
    },
    { text: '圈子', value: 'applied_site', sortable: false },
    { text: '动作', value: 'actions', sortable: false },
  ];

  private webhookHeaders = [
    { text: '圈子', value: 'site', sortable: false },
    { text: 'Event', value: 'event_spec', sortable: false },
    { text: '启用', value: 'enabled', sortable: true },
    { text: 'Secret', value: 'secret', sortable: false },
    { text: 'Callback URL', value: 'callback_url', sortable: false },
    { text: '更新', value: 'update_action', sortable: false },
  ];

  private siteTopics: ITopic[] = [];
  private showNewWebhookDialog: boolean = false;

  private newSiteTopicNames: string[] = [];
  private showSiteConfigEditor: boolean = false;
  private selectedSiteUUID: string | null = null;
  private selectedSite: ISite | null = null;
  private autoApproval = false;
  private emailSuffixes: string[] = [];

  private applications: IApplication[] = [];
  private allApplications: Map<string, IApplication[]> = new Map();

  private siteConfigUpdate: ISiteUpdate = {};

  private webhooks: IWebhook[] = [];

  private broadcastSubmissionLink = '';
  private transferToNewAdminUUID: string | null = null;
  private loading = true;
  private moderatedSites: ISite[] | null = null;

  get token() {
    return readToken(this.$store);
  }

  private categoryTopics: ITopic[] | null = null;

  private async mounted() {
    this.moderatedSites = (await apiMe.getModeratedSites(this.token)).data;
    if (this.moderatedSites) {
      const siteApps = await Promise.all(
        this.moderatedSites.map(async (site: ISite) => {
          return {
            site,
            applications: (await api.getPendingApplications(this.token, site.uuid)).data,
          };
        })
      );
      for (const siteAppsEntry of siteApps) {
        this.allApplications.set(siteAppsEntry.site.uuid, siteAppsEntry.applications);
      }
    }
    if (this.$route.query.siteUUID) {
      this.selectedSiteUUID = this.$route.query.siteUUID.toString();
    }
    await this.onSiteSelected();
    this.categoryTopics = (await api.getCategoryTopics()).data;
    this.loading = false;
  }

  private resetSiteConfig(site: ISite) {
    this.siteConfigUpdate = {};
    const keys = [
      'name',
      'description',
      'auto_approval',
      'min_karma_for_application',
      'email_domain_suffix_for_application',
    ];

    for (const key of keys) {
      if (site[key] !== undefined) {
        this.siteConfigUpdate[key] = site[key];
      }
    }
    if (site.category_topic) {
      this.siteConfigUpdate.category_topic_uuid = site.category_topic.uuid;
    }
    this.siteTopics = site.topics;
    this.webhookCreate.site_uuid = site.uuid;
    apiSite.getWebhooks(this.token, site.uuid).then((r) => {
      this.webhooks = r.data;
    });
    this.autoApproval = site.auto_approval;
    this.newSiteTopicNames = site.topics.map((s) => s.name);
    if (site.email_domain_suffix_for_application) {
      this.emailSuffixes = site.email_domain_suffix_for_application.split(',');
    }
  }

  private async onSiteSelected() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.moderatedSites) {
        if (this.selectedSiteUUID !== null) {
          this.selectedSite = this.moderatedSites.filter(
            (site) => site.uuid === this.selectedSiteUUID
          )[0];
          const siteUUID = this.selectedSiteUUID;
          if (this.$route.query.siteUUID !== siteUUID) {
            this.$router.replace({ query: { ...this.$route.query, siteUUID } });
          }
          this.resetSiteConfig(this.selectedSite);
          this.applications = this.allApplications.get(this.selectedSiteUUID)!;
        } else {
          this.selectedSite = null;
          this.applications = Array.from(this.allApplications.values()).flatMap((a) => a);
        }
      }
    });
  }

  private async commitSiteConfig() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.selectedSite) {
        const responses = await Promise.all(
          this.newSiteTopicNames.map((name) =>
            apiTopic.createTopic(this.$store.state.main.token, { name })
          )
        );
        const topicsIds = responses.map((r) => r.data.uuid);
        this.siteConfigUpdate.topic_uuids = topicsIds;
        this.siteConfigUpdate.auto_approval = this.autoApproval;
        if (this.emailSuffixes) {
          this.siteConfigUpdate.email_domain_suffix_for_application = this.emailSuffixes.join(',');
        }
        const response = await apiSite.updateSiteConfig(
          this.token,
          this.selectedSite.uuid,
          this.siteConfigUpdate
        );
        if (response) {
          this.selectedSite = response.data;
          this.resetSiteConfig(this.selectedSite!);
          this.showSiteConfigEditor = false;
        }
      }
    });
  }

  private async approveApplication(application: IApplication) {
    await dispatchCaptureApiError(this.$store, async () => {
      const updatedApplication = (await api.approveApplication(this.token, application.id)).data;
      if (updatedApplication.pending) {
        commitAddNotification(this.$store, {
          color: 'error',
          content: 'Failed to approve',
        });
        return;
      }
      this.applications.splice(this.applications.indexOf(application), 1);
    });
  }

  private async submitNewSubmissionBroadcast() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (!this.selectedSite) {
        commitAddNotification(this.$store, {
          color: 'error',
          content: 'Site is not selected',
        });
        return;
      }
      let submissionUUID = '';
      try {
        const url = new URL(this.broadcastSubmissionLink);
        const segments = url.pathname.split('/');
        if (segments[0] === '' && segments[1] === 'submissions' && segments[2]) {
          submissionUUID = segments[2];
        } else {
          throw new Error('Invalid sharing link');
        }
      } catch (e) {
        commitAddNotification(this.$store, { color: 'error', content: e });
        return;
      }
      await api.createTask(this.token, {
        task_type: 'site_broadcast',
        submission_uuid: submissionUUID,
        to_members_of_site_uuid: this.selectedSite!.uuid,
      });
      commitAddNotification(this.$store, {
        color: 'success',
        content: '通知创建成功，即将发送',
      });
      this.broadcastSubmissionLink = '';
    });
  }

  private async submitTransferToNewAdmin() {
    if (this.selectedSite && this.transferToNewAdminUUID) {
      await apiSite.updateSiteConfig(this.token, this.selectedSite.uuid, {
        moderator_uuid: this.transferToNewAdminUUID,
      });
      await this.$router.push('/');
    }
  }

  private webhookEventTypeItems = [
    {
      value: 'site_event',
      text: '圈子事件',
    },
  ];

  private webhookCreate: IWebhookCreate = deepCopy(defaultWebhookCreate);

  /*
{
  "content": {
    "event_type": "site_event",
    "new_question": true,
    "new_answer": true,
    "new_submission": true
  }
}
   */
  private webhookCreateEventSpecJson: string = '';

  private async disableWebhook(webhook: IWebhook) {
    webhook.enabled = ((
      await apiWebhook.update(this.token, webhook.id, {
        enabled: false,
      })
    ).data as IWebhook).enabled;
  }

  private resetNewWebhook() {
    this.webhookCreate = deepCopy(defaultWebhookCreate);
    this.showNewWebhookDialog = false;
  }

  private async addNewWebhook() {
    this.webhookCreate.event_spec = JSON.parse(this.webhookCreateEventSpecJson);
    const webhook = (await apiWebhook.create(this.token, this.webhookCreate)).data;
    this.webhooks.push(webhook);
    this.webhookCreate = deepCopy(defaultWebhookCreate);
    this.showNewWebhookDialog = false;
  }
}
</script>
