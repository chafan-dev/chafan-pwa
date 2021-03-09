<template>
    <div>
        <v-btn small depressed @click="showDialog = true" color="primary">{{$t('添加站内用户')}}</v-btn>
        <v-dialog v-model="showDialog" max-width="500px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{$t('添加站内用户')}}</span>
                </v-card-title>
                <v-card-text>
                    <UserSearch :token="myToken" v-model="friendId" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn small depressed @click="submitInviteFriends" :disabled="intermediate" color="primary">
                        {{$t('确认添加')}}
                        <v-progress-circular size="20" v-if="intermediate" indeterminate />
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { api2 } from '@/api2';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { commitAddNotification } from '@/store/main/mutations';
import UserSearch from '@/components/UserSearch.vue';
import AccountIcon from '@/components/icons/AccountIcon.vue';
import SiteIcon from '@/components/icons/SiteIcon.vue';
import ShieldCheckIcon from '@/components/icons/ShieldCheckIcon.vue';
import { ISite, IUserInvite } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
    components: { UserSearch, AccountIcon, ShieldCheckIcon, SiteIcon },
})
export default class Invite extends Vue {
    @Prop() public readonly site!: ISite;

    private friendId: string | null = null;
    private showDialog = false;
    private intermediate = false;
    private myToken: string | null = null;

    private async mounted() {
        this.myToken = this.$store.state.main.token;
    }

    private async submitInviteFriends() {
        this.intermediate = true;
        await dispatchCaptureApiError(this.$store, async () => {
            const payload: IUserInvite = { site_uuid: this.site.uuid};
            if (!this.friendId) {
                commitAddNotification(this.$store, {
                    content: this.$t('用户不能为空').toString(),
                    color: 'error',
                });
                return;
            }
            payload.user_uuid = this.friendId;
            const response = await api2.inviteUser(this.$store.state.main.token, payload);
            if (response) {
                commitAddNotification(this.$store, {
                    content: this.$t(response.data.msg).toString(),
                    color: 'success',
                });
                this.intermediate = false;
                this.showDialog = false;
                setTimeout(() => {
                    this.friendId = null;
                }, 100);
            }
        });
    }
}
</script>