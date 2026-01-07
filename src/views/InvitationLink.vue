<template>
  <v-main>
    <v-container fill-height fluid>
      <v-layout align-center justify-center>
        <v-flex md6 sm8 xs12>
          <v-card v-if="invitationLink || errorMsg" class="elevation-12">
            <v-card-title v-if="invitationLink">
              <UserLink :userPreview="invitationLink.inviter" />
              <span class="ml-1"
                >邀请你加入
                <router-link class="text-decoration-none" target="_blank" to="/">{{
                  appName
                }}</router-link>
              </span>
              <span v-if="invitationLink.invited_to_site">
                「<router-link
                  :to="`/sites/${invitationLink.invited_to_site.subdomain}`"
                  class="text-decoration-none"
                  target="_blank"
                  >{{ invitationLink.invited_to_site.name }}</router-link
                >」圈子
              </span>
            </v-card-title>
            <v-card-title v-else-if="errorMsg">
              {{ errorMsg }}
            </v-card-title>
            <v-divider />
            <v-card-text v-if="invitationLink">
              <div class="title text-center black--text mb-1">
                邀请码：{{ invitationLink.uuid }}
              </div>
              <div class="text-center">
                <span class="mr-4"> 剩余可使用次数：{{ invitationLink.remaining_quota }} </span>
                <span>
                  失效日期：
                  {{ $dayjs.utc(invitationLink.expired_at).local().fromNow() }}
                </span>
              </div>
            </v-card-text>
            <v-card-actions v-if="invitationLink">
              <template v-if="invitationLink.valid">
                <span v-if="!loggedIn" class="grey--text"
                  >已注册？ 请<a class="text-decoration-none" href="/login">登录</a>后刷新本页面
                </span>
                <v-spacer />
                <template v-if="loggedIn">
                  <v-btn v-if="invitationLink.invited_to_site" color="primary" @click="joinSite">
                    加入
                  </v-btn>
                </template>
                <v-btn
                  v-else
                  depressed
                  :to="`/signup?invitation_link_uuid=${invitationLink.uuid}`"
                  color="primary"
                >
                  前往注册
                </v-btn>
              </template>
              <template v-else>
                <span
                  >该邀请码已失效，请联系站内用户重新生成或者前往
                  <a href="https://about.cha.fan/signup/" target="_blank"
                    >https://about.cha.fan/signup/</a
                  >
                  了解如何申请，谢谢！</span
                >
              </template>
            </v-card-actions>
          </v-card>
          <v-skeleton-loader v-else type="card" />
        </v-flex>
      </v-layout>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from '@/router';
import { appName } from '@/env';
import { IInvitationLink } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import { api } from '@/api';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { translateErrorMsgCN } from '@/common';
import { commitAddNotification } from '@/store/main/mutations';
import { useAuth } from '@/composables';

const store = useStore();
const route = useRoute();
const router = useRouter();
const { token, loggedIn } = useAuth();

const invitationLink = ref<IInvitationLink | null>(null);
const errorMsg = ref<string | null>(null);

const uuid = computed(() => route.params.uuid as string);

onMounted(async () => {
  await dispatchCaptureApiError(store, async () => {
    const response = await api.getInvitationLink(token.value, uuid.value);
    invitationLink.value = response.data;
    if (!invitationLink.value?.valid) {
      commitAddNotification(store, {
        content: translateErrorMsgCN('Invalid invitation link'),
        color: 'error',
      });
    }
  });
});

async function joinSite() {
  await dispatchCaptureApiError(store, async () => {
    await api.joinSiteWithInvitationLink(token.value, invitationLink.value!.uuid);
    const siteDomain = invitationLink.value!.invited_to_site!.subdomain;
    await router.push(`/sites/${siteDomain}`);
  });
}
</script>
