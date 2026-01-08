<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-else>
      <v-autocomplete
        v-model="selectedSiteUUID"
        :items="moderatedSites"
        class="mt-2"
        clearable
        dense
        item-text="name"
        item-value="uuid"
        label="圈子"
        outlined
        @change="onSiteSelected"
        hide-details
      />
      <v-tabs show-arrows>
        <v-tabs-slider />
        <v-tab>成员管理</v-tab>
        <v-tab>圈子设置</v-tab>
        <v-tab>圈子运营</v-tab>

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
              <v-btn color="primary" depressed small @click="approveApplication(item)"
                >Approve</v-btn
              >
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
                  {{ selectedSite.permission_type === 'public' ? '公开' : '私有' }}
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
                    clearable
                    label="描述"
                  />
                </div>

                <div>
                  <v-select
                    v-if="showSiteConfigEditor"
                    v-model="siteConfigUpdate.category_topic_uuid"
                    :items="categoryTopics"
                    item-text="name"
                    item-value="uuid"
                    label="类别"
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
                    hide-selected
                    label="话题"
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
                  <span v-else class="black--text mr-1">
                    提交申请给人工审核前应满足的所有条件
                  </span>
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
                      v-model="webhookCreate.callback_url"
                      label="Callback URL 地址"
                      placeholder="https://..."
                    />
                    <v-text-field v-model="webhookCreate.secret" label="Secret" />
                    <v-textarea v-model="webhookCreateEventSpecJson" label="Event Spec JSON" />
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn depressed small @click="resetNewWebhook">取消</v-btn>
                    <v-btn color="primary" depressed small @click="addNewWebhook">添加</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-card-title>
                Webhook 配置 (beta)
                <v-spacer />
                <v-btn color="primary" depressed small @click="showNewWebhookDialog = true"
                  >添加新 Webhook
                </v-btn>
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
            <v-card-title> 广播通知</v-card-title>
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
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import store from '@/store';
import { useRoute, useRouter } from '@/router';
import { IApplication, ISite, ISiteUpdate, ITopic, IWebhook, IWebhookCreate } from '@/interfaces';
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
import { useAuth } from '@/composables';

const defaultWebhookCreate: IWebhookCreate = {
  site_uuid: '',
  event_spec: {
    content: { event_type: 'site_event' },
  },
  secret: '',
  callback_url: '',
};

const route = useRoute();
const router = useRouter();
const { token } = useAuth();

const applicationHeaders = [
  {
    text: '申请者',
    sortable: true,
    value: 'applicant',
    align: 'left',
  },
  { text: '圈子', value: 'applied_site', sortable: false },
  { text: '动作', value: 'actions', sortable: false },
];

const webhookHeaders = [
  { text: '圈子', value: 'site', sortable: false },
  { text: 'Event', value: 'event_spec', sortable: false },
  { text: '启用', value: 'enabled', sortable: true },
  { text: 'Secret', value: 'secret', sortable: false },
  { text: 'Callback URL', value: 'callback_url', sortable: false },
  { text: '更新', value: 'update_action', sortable: false },
];

const siteTopics = ref<ITopic[]>([]);
const showNewWebhookDialog = ref(false);

const newSiteTopicNames = ref<string[]>([]);
const showSiteConfigEditor = ref(false);
const selectedSiteUUID = ref<string | null>(null);
const selectedSite = ref<ISite | null>(null);
const autoApproval = ref(false);
const emailSuffixes = ref<string[]>([]);

const applications = ref<IApplication[]>([]);
const allApplications = reactive<Map<string, IApplication[]>>(new Map());

const siteConfigUpdate = ref<ISiteUpdate>({});

const webhooks = ref<IWebhook[]>([]);

const broadcastSubmissionLink = ref('');
const transferToNewAdminUUID = ref<string | null>(null);
const loading = ref(true);
const moderatedSites = ref<ISite[] | null>(null);
const categoryTopics = ref<ITopic[] | null>(null);
const webhookCreate = ref<IWebhookCreate>(deepCopy(defaultWebhookCreate));
const webhookCreateEventSpecJson = ref('');

onMounted(async () => {
  moderatedSites.value = (await apiMe.getModeratedSites(token.value)).data;
  if (moderatedSites.value) {
    const allApps = (await api.getPendingApplications(token.value)).data;
    for (const application of allApps) {
      const siteId = application.applied_site.uuid;
      if (!allApplications.has(siteId)) {
        allApplications.set(siteId, []);
      }
      allApplications.get(siteId)!.push(application);
    }
  }
  if (route.query.siteUUID) {
    selectedSiteUUID.value = route.query.siteUUID.toString();
  }
  await onSiteSelected();
  categoryTopics.value = (await api.getCategoryTopics()).data;
  loading.value = false;
});

function resetSiteConfig(site: ISite) {
  siteConfigUpdate.value = {};
  const keys = [
    'name',
    'description',
    'auto_approval',
    'min_karma_for_application',
    'email_domain_suffix_for_application',
  ];

  for (const key of keys) {
    if (site[key] !== undefined) {
      siteConfigUpdate.value[key] = site[key];
    }
  }
  if (site.category_topic) {
    siteConfigUpdate.value.category_topic_uuid = site.category_topic.uuid;
  }
  siteTopics.value = site.topics;
  webhookCreate.value.site_uuid = site.uuid;
  apiSite.getWebhooks(token.value, site.uuid).then((r) => {
    webhooks.value = r.data;
  });
  autoApproval.value = site.auto_approval;
  newSiteTopicNames.value = site.topics.map((s) => s.name);
  if (site.email_domain_suffix_for_application) {
    emailSuffixes.value = site.email_domain_suffix_for_application.split(',');
  }
}

async function onSiteSelected() {
  await dispatchCaptureApiError(store, async () => {
    if (moderatedSites.value) {
      if (selectedSiteUUID.value !== null) {
        selectedSite.value = moderatedSites.value.filter(
          (site) => site.uuid === selectedSiteUUID.value
        )[0];
        const siteUUID = selectedSiteUUID.value;
        if (route.query.siteUUID !== siteUUID) {
          router.replace({ query: { ...route.query, siteUUID } });
        }
        resetSiteConfig(selectedSite.value);
        applications.value = allApplications.get(selectedSiteUUID.value) || [];
      } else {
        selectedSite.value = null;
        applications.value = Array.from(allApplications.values()).flatMap((a) => a);
      }
    }
  });
}

async function commitSiteConfig() {
  await dispatchCaptureApiError(store, async () => {
    if (selectedSite.value) {
      const responses = await Promise.all(
        newSiteTopicNames.value.map((name) =>
          apiTopic.createTopic(store.state.main.token, { name })
        )
      );
      const topicsIds = responses.map((r) => r.data.uuid);
      siteConfigUpdate.value.topic_uuids = topicsIds;
      siteConfigUpdate.value.auto_approval = autoApproval.value;
      if (emailSuffixes.value) {
        siteConfigUpdate.value.email_domain_suffix_for_application = emailSuffixes.value.join(',');
      }
      const response = await apiSite.updateSiteConfig(
        token.value,
        selectedSite.value.uuid,
        siteConfigUpdate.value
      );
      if (response) {
        selectedSite.value = response.data;
        resetSiteConfig(selectedSite.value!);
        showSiteConfigEditor.value = false;
      }
    }
  });
}

async function approveApplication(application: IApplication) {
  await dispatchCaptureApiError(store, async () => {
    const updatedApplication = (await api.approveApplication(token.value, application.id)).data;
    if (updatedApplication.pending) {
      commitAddNotification(store, {
        color: 'error',
        content: 'Failed to approve',
      });
      return;
    }
    applications.value.splice(applications.value.indexOf(application), 1);
  });
}

async function submitNewSubmissionBroadcast() {
  await dispatchCaptureApiError(store, async () => {
    if (!selectedSite.value) {
      commitAddNotification(store, {
        color: 'error',
        content: 'Site is not selected',
      });
      return;
    }
    let submissionUUID = '';
    try {
      const url = new URL(broadcastSubmissionLink.value);
      const segments = url.pathname.split('/');
      if (segments[0] === '' && segments[1] === 'submissions' && segments[2]) {
        submissionUUID = segments[2];
      } else {
        throw new Error('Invalid sharing link');
      }
    } catch (e: any) {
      commitAddNotification(store, { color: 'error', content: e });
      return;
    }
    await api.createTask(token.value, {
      task_type: 'site_broadcast',
      submission_uuid: submissionUUID,
      to_members_of_site_uuid: selectedSite.value!.uuid,
    });
    commitAddNotification(store, {
      color: 'success',
      content: '通知创建成功，即将发送',
    });
    broadcastSubmissionLink.value = '';
  });
}

async function submitTransferToNewAdmin() {
  if (selectedSite.value && transferToNewAdminUUID.value) {
    await apiSite.updateSiteConfig(token.value, selectedSite.value.uuid, {
      moderator_uuid: transferToNewAdminUUID.value,
    });
    await router.push('/');
  }
}

async function disableWebhook(webhook: IWebhook) {
  webhook.enabled = (
    (
      await apiWebhook.update(token.value, webhook.id, {
        enabled: false,
      })
    ).data as IWebhook
  ).enabled;
}

function resetNewWebhook() {
  webhookCreate.value = deepCopy(defaultWebhookCreate);
  showNewWebhookDialog.value = false;
}

async function addNewWebhook() {
  webhookCreate.value.event_spec = JSON.parse(webhookCreateEventSpecJson.value);
  const webhook = (await apiWebhook.create(token.value, webhookCreate.value)).data;
  webhooks.value.push(webhook);
  webhookCreate.value = deepCopy(defaultWebhookCreate);
  showNewWebhookDialog.value = false;
}
</script>
