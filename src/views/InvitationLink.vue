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
              <div class="title text-center black--text mb-1">{{ $t('邀请码') }}: {{ uuid }}</div>
              <div class="text-center">
                <span class="mr-4"
                  >{{ $t('剩余可使用次数') }}: {{ invitationLink.remaining_quota }}</span
                >
                <span
                  >{{ $t('失效日期') }}:
                  {{ $dayjs.utc(invitationLink.expired_at).local().fromNow() }}</span
                >
              </div>
            </v-card-text>
            <v-card-actions v-if="invitationLink">
              <span v-if="!loggedIn" class="grey--text"
                >已注册？ 请<a class="text-decoration-none" href="/login">登录</a>后刷新本页面
              </span>
              <v-spacer />
              <template v-if="loggedIn">
                <v-btn v-if="invitationLink.invited_to_site" color="primary" @click="joinSite">
                  {{ $t('加入') }}
                </v-btn>
              </template>
              <v-btn v-else :to="`/signup?invitation_link_uuid=${uuid}`" color="primary">
                {{ $t('前往注册') }}
              </v-btn>
            </v-card-actions>
          </v-card>
          <v-skeleton-loader v-else type="card" />
        </v-flex>
      </v-layout>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { appName } from '@/env';
import { IInvitationLink } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import { api } from '@/api';
import {
  dispatchCaptureApiError,
  dispatchCaptureApiErrorWithErrorHandler,
} from '@/store/main/actions';
import { AxiosError } from 'axios';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
  components: { UserLink },
})
export default class InvitationLink extends Vue {
  private appName = appName;
  private invitationLink: IInvitationLink | null = null;
  private errorMsg: string | null = null;

  get uuid() {
    return this.$route.params.uuid;
  }

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get token() {
    return this.$store.state.main.token;
  }

  private async mounted() {
    await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
      action: async () => {
        this.invitationLink = (await api.getInvitationLink(this.uuid)).data;
      },
      errorFilter: (err: AxiosError) => {
        if (err.response && err.response.data.detail === 'Invalid invitation link') {
          this.errorMsg = this.$t(
            '邀请码已过期/用完，请联系站内用户重新生成或者前往 https://about.cha.fan/signup/ 申请，谢谢！'
          ).toString();
          return true;
        }
        return false;
      },
    });
  }

  private async joinSite() {
    await dispatchCaptureApiError(this.$store, async () => {
      await api.joinSiteWithInvitationLink(this.token, this.invitationLink!.uuid);
      this.$router.push(`/sites/${this.invitationLink!.invited_to_site!.subdomain}`);
    });
  }
}
</script>
