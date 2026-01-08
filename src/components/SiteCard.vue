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
            <span v-if="isDesktop" class="ml-1">设置</span>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import store from '@/store';
import { useRouter } from 'vue-router/composables';
import { api } from '@/api';
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
import { INSUFFICIENT_KARMA_TO_JOIN_SITE, MISSING_REQUIRED_SECONDARY_EMAIL } from '@/common';
import SiteBtn from '@/components/SiteBtn.vue';
import RefreshIcon from '@/components/icons/RefreshIcon.vue';
import RotationCard from '@/components/base/RotationCard.vue';
import { useAuth, useResponsive, useErrorHandling } from '@/composables';

const props = withDefaults(
  defineProps<{
    site: ISite;
    isMember?: boolean;
    compactMode?: boolean;
  }>(),
  {
    compactMode: true,
  }
);

const router = useRouter();
const { token } = useAuth();
const { isDesktop } = useResponsive();
const { commitErrMsg } = useErrorHandling();

const notMember = ref(true);
const siteApplied = ref(false);
const applyToJoinIntermediate = ref(false);
const loading = ref(true);
const showJoinConditionsDialog = ref(false);
const intermediate = ref(false);
const relatedSites = ref<ISite[]>([]);

onMounted(async () => {
  await dispatchCaptureApiError(store, async () => {
    if (props.site && props.site.moderator !== undefined && props.site.moderator.handle) {
      if (props.isMember === undefined) {
        const userProfile = readUserProfile(store);
        if (userProfile) {
          const siteProfile = (
            await api.getUserSiteProfile(token.value, props.site.uuid, userProfile.uuid)
          ).data;
          if (siteProfile) {
            notMember.value = false;
          }
        }
      } else if (props.isMember) {
        notMember.value = false;
      }

      if (notMember.value && token.value) {
        const r = await apiSite.getSiteApply(token.value, props.site.uuid);
        if (r) {
          siteApplied.value = r.data.applied_before;
        }
      }
    }
    loading.value = false;
    if (!props.compactMode) {
      relatedSites.value = (await apiSite.getRelatedSites(props.site.uuid)).data.filter(
        (s) => s.uuid !== props.site.uuid
      );
    }
  });
});

async function applyToJoin() {
  if (!token.value) {
    commitSetShowLoginPrompt(store, true);
    return;
  }
  await dispatchCaptureApiErrorWithErrorHandler(store, {
    action: async () => {
      if (props.site !== null && props.site.moderator && !props.isMember) {
        applyToJoinIntermediate.value = true;
        const response = await apiSite.applySite(token.value, props.site.uuid);
        if (response) {
          if (response.data.applied_before) {
            siteApplied.value = true;
          } else if (response.data.auto_approved) {
            notMember.value = false;
          }
        }
      }
      applyToJoinIntermediate.value = false;
    },
    errorFilter: (err: AxiosError) => {
      const matched = commitErrMsg(err);
      if (
        matched === INSUFFICIENT_KARMA_TO_JOIN_SITE ||
        matched === MISSING_REQUIRED_SECONDARY_EMAIL
      ) {
        showJoinConditionsDialog.value = true;
        applyToJoinIntermediate.value = false;
      }
      return matched !== null;
    },
  });
}

async function leaveSite() {
  await dispatchCaptureApiError(store, async () => {
    intermediate.value = true;
    await apiSite.leaveSite(token.value, props.site.uuid);
    intermediate.value = false;
    router.go(0);
  });
}
</script>
