<template>
  <div v-if="site">
    <div class="primary--text" :class="{ headline: !compactMode, title: compactMode }">
      <a :href="`/sites/${site.subdomain}`" target="_blank" class="text-decoration-none">{{
        site.name
      }}</a>
    </div>
    <div v-if="site !== null">
      <div v-if="site.description" class="site-desc">
        {{ site.description }}
      </div>
      <template v-if="!compactMode">
        <div v-if="site.topics.length > 0">
          <b>话题：</b>
          <v-chip-group>
            <v-chip v-for="topic in site.topics" :key="topic.uuid" :to="'/topics/' + topic.uuid">
              {{ topic.name }}
            </v-chip>
          </v-chip-group>
        </div>
        <div v-if="site.permission_type">
          <b>类型：</b>
          {{ site.permission_type === 'public' ? '公开' : '私有' }}
        </div>
        <div>
          <b>管理员：</b>
          <UserLink :userPreview="site.moderator" />
        </div>
      </template>

      <SiteJoinConditions :site="site" />

      <div v-if="notMember" class="mt-2">
        <v-skeleton-loader v-if="loading" type="button" />
        <template v-else>
          <v-btn v-if="siteApplied" depressed disabled small>申请审核中</v-btn>
          <v-btn
            v-else
            :disabled="applyToJoinIntermediate"
            color="primary"
            depressed
            small
            @click="applyToJoin"
          >
            加入
          </v-btn>
        </template>
      </div>
    </div>

    <div v-if="!notMember" class="d-flex mt-1 mb-1">
      <Invite :site="site" />
      <NewInviteLinkBtn :site="site" class="ml-2" />
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" class="ml-2" depressed small>
            <SettingsIcon small />
            <span v-if="!$vuetify.breakpoint.mobile" class="ml-1">设置</span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :disabled="intermediate" @click="leaveSite">
            <v-list-item-icon>
              <DoorIcon />
            </v-list-item-icon>
            <v-list-item-content>离开</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <v-tabs v-if="showQuestionEditor || showSubmissionEditor">
      <v-tab v-if="showQuestionEditor">提问</v-tab>
      <v-tab v-if="showSubmissionEditor">分享</v-tab>
      <v-tabs-slider />

      <v-tab-item v-if="showQuestionEditor">
        <CreateQuestionForm :site="site" class="ma-1" />
      </v-tab-item>

      <v-tab-item v-if="showSubmissionEditor">
        <CreateSubmissionForm :site="site" class="ma-1" />
      </v-tab-item>
    </v-tabs>

    <div v-if="relatedSites.length > 0 && !compactMode">
      <v-divider class="my-2" />
      <RotationCard v-slot="{ item }" :items="relatedSites" title="相关站点">
        <SiteCard :compact-mode="true" :site="item" />
      </RotationCard>
    </div>

    <v-dialog v-model="showJoinConditionsDialog" max-width="400">
      <v-card>
        <v-card-title> 申请加入圈子的条件</v-card-title>
        <v-card-text>
          <SiteJoinConditions :showHint="true" :site="site" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { api } from '@/api';
import { Component, Prop } from 'vue-property-decorator';
import { ISite } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import Invite from '@/components/Invite.vue';
import NewInviteLinkBtn from '@/components/NewInviteLinkBtn.vue';
import SiteJoinConditions from '@/components/SiteJoinConditions.vue';
import Viewer from '@/components/Viewer.vue';
import {
  dispatchCaptureApiError,
  dispatchCaptureApiErrorWithErrorHandler,
} from '@/store/main/actions';
import { readUserProfile } from '@/store/main/getters';
import { commitSetShowLoginPrompt } from '@/store/main/mutations';
import { AxiosError } from 'axios';

import DoorIcon from '@/components/icons/DoorIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';
import { apiSite } from '@/api/site';
import { CVue } from '@/common';
import SiteBtn from '@/components/SiteBtn.vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';
import RotationCard from '@/components/base/RotationCard.vue';

@Component({
  name: 'SiteCard',
  components: {
    RotationCard,
    RefreshIcon,
    SiteBtn,
    UserLink,
    Invite,
    CreateSubmissionForm,
    CreateQuestionForm,
    SiteJoinConditions,
    NewInviteLinkBtn,
    DoorIcon,
    SettingsIcon,
    Viewer,
  },
})
export default class SiteCard extends CVue {
  @Prop() private readonly site!: ISite;
  @Prop() private readonly isMember: boolean | undefined;
  @Prop() private readonly showQuestionEditor!: boolean;
  @Prop() private readonly showSubmissionEditor!: boolean;
  @Prop({ default: true }) private readonly compactMode!: boolean;
  private notMember = true;
  private siteApplied = false;
  private applyToJoinIntermediate = false;
  private loading = true;
  private showJoinConditionsDialog = false;
  private intermediate = false;
  private relatedSites: ISite[] = [];

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      if (this.site && this.site.moderator !== undefined && this.site.moderator.handle) {
        if (this.isMember === undefined) {
          const userProfile = readUserProfile(this.$store);
          if (userProfile) {
            const siteProfile = (
              await api.getUserSiteProfile(this.token, this.site.uuid, userProfile.uuid)
            ).data;
            if (siteProfile) {
              this.notMember = false;
            }
          }
        } else if (this.isMember) {
          this.notMember = false;
        }

        if (this.notMember && this.token) {
          const r = await apiSite.getSiteApply(this.token, this.site.uuid);
          if (r) {
            this.siteApplied = r.data.applied_before;
          }
        }
      }
      this.loading = false;
      if (!this.compactMode) {
        this.relatedSites = (await apiSite.getRelatedSites(this.site.uuid)).data.filter(
          (s) => s.uuid !== this.site.uuid
        );
      }
    });
  }

  private async applyToJoin() {
    if (!this.token) {
      commitSetShowLoginPrompt(this.$store, true);
      return;
    }
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        if (this.site !== null && this.site.moderator && !this.isMember) {
          this.applyToJoinIntermediate = true;
          const response = await apiSite.applySite(this.token, this.site.uuid);
          if (response) {
            if (response.data.applied_before) {
              this.siteApplied = true;
            } else if (response.data.auto_approved) {
              this.notMember = false;
            }
          }
        }
        this.applyToJoinIntermediate = false;
      },
      errorFilter: (err: AxiosError) => {
        const matched = this.commitErrMsg(err);
        if (matched) {
          this.showJoinConditionsDialog = true;
          this.applyToJoinIntermediate = false;
        }
        return matched;
      },
    });
  }

  private async leaveSite() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.intermediate = true;
      await apiSite.leaveSite(this.token, this.site.uuid);
      this.intermediate = false;
      this.$router.go(0);
    });
  }
}
</script>
