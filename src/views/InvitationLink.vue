<template>
    <v-main>
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md6>
                    <v-card class="elevation-12" v-if="invitationLink || errorMsg">
                        <v-card-title v-if="invitationLink">
                            <UserLink :userPreview="invitationLink.inviter" />
                            <span class="ml-1">邀请你加入
                                <a class="text-decoration-none" href="/" target="_blank">{{appName}}</a>
                            </span>
                            <span v-if="invitationLink.invited_to_site">
                                「<a class="text-decoration-none" :href="`/sites/${invitationLink.invited_to_site.subdomain}`"
                                     target="_blank">{{invitationLink.invited_to_site.name}}</a>」圈子
                            </span>
                        </v-card-title>
                        <v-card-title v-else-if="errorMsg">
                            {{ errorMsg }}
                        </v-card-title>
                        <v-divider />
                        <v-card-text v-if="invitationLink">
                            <div class="title text-center black--text mb-1">
                                {{$t('邀请码')}}: {{ uuid }}
                            </div>
                            <div class="text-center">
                                <span class="mr-4">{{ $t('剩余可使用次数') }}: {{ invitationLink.remaining_quota }}</span>
                                <span>{{ $t('失效日期') }}: {{ $dayjs.utc(invitationLink.expired_at).local().fromNow() }}</span>
                            </div>
                        </v-card-text>
                        <v-card-actions v-if="invitationLink">
                            <span class="grey--text" v-if="!loggedIn">已注册？
                                请<a class="text-decoration-none" href="/login">登录</a>后刷新本页面
                            </span>
                            <v-spacer />
                            <template v-if="loggedIn">
                                <v-btn color="primary" @click="joinSite" v-if="invitationLink.invited_to_site">
                                    {{$t('加入')}}
                                </v-btn>
                            </template>
                            <v-btn color="primary" :to="`/signup?invitation_link_uuid=${uuid}`" v-else>
                                {{$t('前往注册')}}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                    <v-skeleton-loader type="card" v-else />
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
import { dispatchCaptureApiError, dispatchCaptureApiErrorWithErrorHandler } from '@/store/main/actions';
import { AxiosError } from 'axios';
import { readIsLoggedIn } from '@/store/main/getters';

@Component({
    components: { UserLink },
})
export default class InvitationLink extends Vue {
    get uuid() {
        return this.$router.currentRoute.params.uuid;
    }
    get loggedIn() {
        return readIsLoggedIn(this.$store);
    }

    private appName = appName;
    private invitationLink: IInvitationLink | null = null;
    private errorMsg: string | null = null;

    private async mounted() {
        await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
            action: async () => {
                this.invitationLink = (await api.getInvitationLink(this.uuid)).data;
            },
            errorFilter: (err: AxiosError) => {
                if (err.response && err.response.data.detail === 'Invalid invitation link') {
                    this.errorMsg = this.$t('邀请码已失效').toString();
                    return true;
                }
                return false;
            },
        });
    }

    get token() { return this.$store.state.main.token; }

    private async joinSite() {
        await dispatchCaptureApiError(this.$store, async () => {
            await api.joinSiteWithInvitationLink(this.token, this.invitationLink!.uuid);
            this.$router.push(`/sites/${this.invitationLink!.invited_to_site!.subdomain}`);
        });
    }
}
</script>
