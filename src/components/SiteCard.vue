<template>
    <div v-if="site">
        <div class="headline primary--text">{{site.name}}</div>
        <div v-if="site !== null">
            <div v-if="site.description">
                <SimpleViewer :body="site.description" />
            </div>
            <template v-if="!compactMode">
                <div v-if="site.topics.length > 0">
                    <b>{{$t('话题：')}}</b>
                    <v-chip-group>
                        <v-chip :to="'/topics/' + topic.uuid" v-for="topic in site.topics" :key="topic.uuid">
                            {{ topic.name }}
                        </v-chip>
                    </v-chip-group>
                </div>
                <div v-if="site.permission_type">
                    <b>{{$t('类型：')}}</b>
                    {{$t('site.permission_type.' + site.permission_type)}}
                </div>
                <div>
                    <b>{{$t('管理员：')}}</b>
                    <UserLink :userPreview="site.moderator" />
                </div>
            </template>

            <SiteJoinConditions :site="site" />

            <div class="mt-2" v-if="notMember">
                <v-skeleton-loader type="button" v-if="loading" />
                <template v-else>
                    <v-btn small depressed v-if="siteApplied" disabled>{{$t('申请审核中')}}</v-btn>
                    <v-btn small depressed color="primary" v-else :disabled="applyToJoinIntermediate"
                           @click="applyToJoin">{{$t('加入')}}</v-btn>
                </template>
            </div>
        </div>

        <div class="d-flex mt-1 mb-1" v-if="!notMember">
            <Invite :site="site" />
            <NewInviteLinkBtn :site="site" class="ml-2" />
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn small depressed v-bind="attrs" v-on="on" class="ml-2">
                        <SettingsIcon small /><span class="ml-1" v-if="!$vuetify.breakpoint.mobile">{{$t('设置')}}</span>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="leaveSite" :disabled="intermediate">
                        <v-list-item-icon>
                            <DoorIcon />
                        </v-list-item-icon>
                        <v-list-item-content>{{$t('离开')}}</v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </div>

        <v-tabs  v-if="showSubmissionEditor || showSubmissionEditor">
            <v-tab v-if="showQuestionEditor">{{$t('提问')}}</v-tab>
            <v-tab v-if="showSubmissionEditor">{{$t('分享')}}</v-tab>
            <v-tabs-slider />

            <v-tab-item v-if="showQuestionEditor">
                <CreateQuestionForm class="ma-1" :site="site" />
            </v-tab-item>

            <v-tab-item v-if="showSubmissionEditor">
                <CreateSubmissionForm class="ma-1" :site="site" />
            </v-tab-item>
        </v-tabs>

        <v-dialog v-model="showJoinConditionsDialog" max-width="400">
            <v-card>
                <v-card-title>
                    {{ $t('申请加入圈子的条件') }}
                </v-card-title>
                <v-card-text>
                    <SiteJoinConditions :site="site" :showHint="true" />
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { api } from '@/api';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ISite } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import CreateSubmissionForm from '@/components/CreateSubmissionForm.vue';
import CreateQuestionForm from '@/components/CreateQuestionForm.vue';
import Invite from '@/components/Invite.vue';
import NewInviteLinkBtn from '@/components/NewInviteLinkBtn.vue';
import SiteJoinConditions from '@/components/SiteJoinConditions.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
import { dispatchCaptureApiError, dispatchCaptureApiErrorWithErrorHandler } from '@/store/main/actions';
import { readUserProfile } from '@/store/main/getters';
import { commitAddNotification, commitSetShowLoginPrompt } from '@/store/main/mutations';
import { AxiosError } from 'axios';

import DoorIcon from '@/components/icons/DoorIcon.vue';
import SettingsIcon from '@/components/icons/SettingsIcon.vue';

@Component({
    components: {
        UserLink, Invite, CreateSubmissionForm, CreateQuestionForm,
        SiteJoinConditions, NewInviteLinkBtn, DoorIcon, SettingsIcon, SimpleViewer,
    },
})
export default class SiteCard extends Vue {

    get token() { return this.$store.state.main.token; }
    @Prop() private readonly site!: ISite;
    @Prop() private readonly isMember: boolean | undefined;
    @Prop() private readonly showQuestionEditor!: boolean;
    @Prop() private readonly showSubmissionEditor!: boolean;
    @Prop({default: true}) private readonly compactMode!: boolean;

    private notMember = true;
    private siteApplied = false;
    private applyToJoinIntermediate = false;
    private loading = true;
    private showJoinConditionsDialog = false;

    private intermediate = false;

    private async mounted() {
        await dispatchCaptureApiError(this.$store, async () => {
            if (this.site && this.site.moderator !== undefined && this.site.moderator.handle) {
                if (this.isMember === undefined) {
                    const userProfile = readUserProfile(this.$store);
                    if (userProfile) {
                        const siteProfile = (await api.getUserSiteProfile(
                            this.token, this.site.uuid, userProfile.uuid)).data;
                        if (siteProfile) {
                            this.notMember = false;
                        }
                    }
                } else if (this.isMember) {
                    this.notMember = false;
                }

                if (this.notMember && this.token) {
                    const r = await api.getSiteApply(this.token, this.site.uuid);
                    if (r) {
                        this.siteApplied = r.data.msg === 'applied';
                    }
                }
            }
            this.loading = false;
        });
    }

    private async applyToJoin() {
        if (!this.token) {
            commitSetShowLoginPrompt(this.$store, true);
            return;
        }
        await dispatchCaptureApiErrorWithErrorHandler(this.$store, {
            action: async () => {
                    if (this.site != null && this.site.moderator && !this.isMember) {
                        this.applyToJoinIntermediate = true;
                        const response = await api.applySite(this.token, this.site.uuid);
                        if (response) {
                            if (response.data.msg === 'applied') {
                                this.siteApplied = true;
                            } else if (response.data.msg == 'joined') {
                                this.notMember = false;
                            }
                        }
                    }
                    this.applyToJoinIntermediate = false;
                },
            errorFilter: (err: AxiosError) => {
                if (err.response && (err.response.data.detail === 'Insuffient karma for joining site.' ||
                                     err.response.data.detail === 'No verified email.')) {
                    commitAddNotification(this.$store, {
                        content: this.$t(err.response.data.detail).toString(),
                        color: 'error',
                    });
                    this.showJoinConditionsDialog = true;
                    this.applyToJoinIntermediate = false;
                    return true;
                }
                return false;
            },
        });
    }
    private async leaveSite() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.intermediate = true;
            await api.leaveSite(this.token, this.site.uuid);
            this.intermediate = false;
            this.$router.go(0);
        });
    }
}
</script>
