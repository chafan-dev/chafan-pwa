<template>
  <v-container v-if="moderatedSites" fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-tabs>
      <v-tabs-slider />
      <v-tab>{{ $t('Memberships') }}</v-tab>
      <v-tab>{{ $t('Settings') }}</v-tab>
      <v-tab>{{ $t('运营') }}</v-tab>
      <v-spacer />
      <v-autocomplete
        :items="moderatedSites"
        v-model="selectedSiteUUID"
        clearable
        outlined
        class="mt-2"
        dense
        :label="$t('Circle')"
        item-text="name"
        item-value="uuid"
        @change="onSiteSelected"
      />

      <!-- Applications -->
      <v-tab-item>
        <v-data-table :headers="applicationHeaders" item-key="id" :items="applications">
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Pending applications</v-toolbar-title>
            </v-toolbar>
          </template>

          <template v-slot:item.applicant="{ item }">
            <UserLink :userPreview="item.applicant" />
          </template>

          <template v-slot:item.applied_site="{ item }">
            {{ item.applied_site.name }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn small depressed @click="approveApplication(item)" color="primary">Approve</v-btn>
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
                <span class="black--text mr-1">{{ $t('Link') }}:</span>
                <SiteBtn :site="selectedSite" />
              </div>
              <div>
                <span class="black--text mr-1">{{ $t('类型：') }}</span>
                {{ $t('site.permission_type.' + selectedSite.permission_type) }}
              </div>
            </v-card-text>
          </v-card>

          <v-card class="ma-3">
            <v-card-title>更新配置</v-card-title>
            <v-card-text>
              <div>
                <template v-if="!showSiteConfigEditor">
                  <span class="black--text mr-1">Name:</span>
                  <span>{{ selectedSite.name }}</span>
                </template>
                <v-text-field v-model="siteConfigUpdate.name" label="Name" v-else />
              </div>

              <div>
                <template v-if="!showSiteConfigEditor">
                  <span class="black--text mr-1" v-if="!showSiteConfigEditor">Description:</span>
                  <span>{{ selectedSite.description }}</span>
                </template>
                <v-text-field v-model="siteConfigUpdate.description" label="Description" v-else />
              </div>

              <div>
                <v-chip-group v-if="!showSiteConfigEditor">
                  <span class="black--text mr-1">Topics:</span>
                  <v-chip
                    small
                    :to="'/topics/' + topic.uuid"
                    v-for="topic in siteTopics"
                    :key="topic.uuid"
                  >
                    {{ topic.name }}
                  </v-chip>
                </v-chip-group>

                <v-combobox
                  hide-selected
                  multiple
                  small-chips
                  :label="$t('Topics')"
                  :delimiters="[',', '，', '、']"
                  v-if="showSiteConfigEditor"
                  v-model="newSiteTopicNames"
                />
              </div>

              <div v-if="showSiteConfigEditor">
                <span class="black--text mr-1">{{ $t('加入申请处理方式：') }}</span>
                <v-radio-group v-model="autoApproval">
                  <v-radio label="自动审核" :value="true" />
                  <v-radio label="人工审核" :value="false" />
                </v-radio-group>
              </div>
              <div v-else>
                <span class="black--text mr-1">{{ $t('加入申请处理方式：') }}</span>
                <span v-if="selectedSite.auto_approval">{{ $t('自动审核') }}</span>
                <span v-else>{{ $t('人工审核') }}</span>
              </div>

              <div>
                <span class="black--text mr-1" v-if="autoApproval">{{
                  $t('自动通过应满足的所有条件：')
                }}</span>
                <span class="black--text mr-1" v-else>{{
                  $t('提交申请给人工审核前应满足的所有条件：')
                }}</span>
                <div class="ma-2">
                  <v-text-field
                    label="Min karma"
                    v-if="showSiteConfigEditor"
                    type="number"
                    clearable
                    v-model="siteConfigUpdate.min_karma_for_application"
                  />
                  <v-text-field
                    label="Min karma"
                    v-else
                    disabled
                    :value="
                      selectedSite.min_karma_for_application
                        ? selectedSite.min_karma_for_application
                        : 'any'
                    "
                  />

                  <v-combobox
                    multiple
                    small-chips
                    :delimiters="[',', '，', '、']"
                    label="Email domain suffixes (e.g. '@harvard.edu'), ENTER to confirm each one"
                    v-if="showSiteConfigEditor"
                    clearable
                    v-model="emailSuffixes"
                  />
                  <v-text-field
                    label="Email domain suffixes (e.g. '@harvard.edu')"
                    v-else
                    disabled
                    :value="
                      selectedSite.email_domain_suffix_for_application
                        ? selectedSite.email_domain_suffix_for_application
                        : 'any'
                    "
                  />
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                small
                depressed
                class="mr-2"
                @click="showSiteConfigEditor = true"
                color="primary"
                v-show="!showSiteConfigEditor"
                >Edit</v-btn
              >
              <v-btn
                small
                depressed
                class="mr-2"
                @click="commitSiteConfig"
                color="primary"
                v-show="showSiteConfigEditor"
                >{{ $t('提交') }}</v-btn
              >
              <v-btn
                small
                depressed
                class="mr-2"
                @click="showSiteConfigEditor = false"
                v-show="showSiteConfigEditor"
                >{{ $t('Cancel') }}</v-btn
              >
            </v-card-actions>
          </v-card>

          <v-card class="ma-3">
            <v-card-title>转移管理权限</v-card-title>
            <v-card-text>
              转移给：<UserSearch :token="myToken" v-model="transferToNewAdminUUID" />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn small depressed color="warning" @click="submitTransferToNewAdmin"
                >确认（不可撤销）</v-btn
              >
            </v-card-actions>
          </v-card>
        </template>
        <div class="mt-2 text-center" v-else>Please select a circle.</div>
      </v-tab-item>

      <!-- Operation -->
      <v-tab-item>
        <v-card class="ma-2">
          <v-card-title>
            {{ $t('广播通知') }}
          </v-card-title>
          <v-card-text v-if="selectedSite !== null">
            {{
              $t(
                '请先将广播的内容提交到「分享」板块，然后将其链接粘贴至下方发送给圈子「{circle}」的成员。',
                { circle: selectedSite.name }
              )
            }}
            <v-text-field v-model="broadcastSubmissionLink" label="「分享」链接" />
          </v-card-text>
          <v-card-text v-else> Please select a circle. </v-card-text>
          <v-card-actions v-if="selectedSite !== null">
            <v-spacer />
            <v-btn color="primary" @click="submitNewSubmissionBroadcast">{{ $t('Send') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { IApplication, ISite, ISiteUpdate, ITopic } from '@/interfaces';
import { readModeratedSites } from '@/store/main/getters';
import { api } from '@/api';
import UserLink from '@/components/UserLink.vue';
import SiteBtn from '@/components/SiteBtn.vue';
import UserSearch from '@/components/UserSearch.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { apiTopic } from '@/api/topic';
import { commitAddNotification } from '@/store/main/mutations';

@Component({
  components: { UserLink, UserSearch, EditIcon, SiteBtn },
})
export default class Moderation extends Vue {
  private applicationHeaders = [
    {
      text: 'Applicant',
      sortable: true,
      value: 'applicant',
      align: 'left',
    },
    { text: '圈子', value: 'applied_site', sortable: false },
    { text: 'Actions', value: 'actions', sortable: false },
  ];

  private siteTopics: ITopic[] = [];

  private newSiteTopicNames: string[] = [];
  private moderatedSites: ISite[] | null = [];
  private showSiteConfigEditor: boolean = false;
  private selectedSiteUUID: string | null = null;
  private selectedSite: ISite | null = null;
  private autoApproval = false;
  private emailSuffixes: string[] = [];

  private applications: IApplication[] = [];
  private allApplications: Map<string, IApplication[]> = new Map();

  private siteConfigUpdate: ISiteUpdate = {};

  private broadcastSubmissionLink = '';
  private myToken: string | null = null;
  private transferToNewAdminUUID: string | null = null;

  get token() {
    return this.$store.state.main.token;
  }

  private loading = true;
  private async mounted() {
    this.moderatedSites = readModeratedSites(this.$store);
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
    this.onSiteSelected();
    this.myToken = this.$store.state.main.token;
    this.loading = false;
  }

  private resetSiteConfig(site: ISite) {
    this.siteConfigUpdate = {};
    for (const key in site) {
      if (site[key] !== undefined) {
        this.siteConfigUpdate[key] = site[key];
      }
    }
    this.siteTopics = site.topics;
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
        const response = await api.updateSiteConfig(
          this.token,
          this.selectedSite.uuid,
          this.siteConfigUpdate
        );
        if (response) {
          this.selectedSite = response.data;
          this.resetSiteConfig(this.selectedSite);
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
      await api.updateSiteConfig(this.token, this.selectedSite.uuid, {
        moderator_uuid: this.transferToNewAdminUUID,
      });
      this.$router.go(0);
    }
  }
}
</script>
