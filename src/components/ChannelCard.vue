<template>
    <div class="ma-3 pa-3">
        <div class="headline primary--text">
            <!-- FIXME: deprecate this -->
            {{$t('私信')}}
            <MessageTextLockIcon class="ml-1" small />
            <!-- {{ channel.name }} -->
        </div>
        <div v-if="members">
            {{$t('Members:')}}
            <ul>
                <li v-for="member in members" :key="member.uuid">
                    <UserLink :userPreview="member" v-if="member.uuid !== currentUserId" />
                    <span v-else>{{$t('我')}}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
import { api } from '@/api';
import { IChannel, IUserPreview } from '@/interfaces';
import { Component, Vue, Prop } from 'vue-property-decorator';
import MessageTextLockIcon from '@/components/icons/MessageTextLockIcon.vue';
import UserLink from '@/components/UserLink.vue';
import UserSearch from '@/components/UserSearch.vue';
import { commitAddNotification } from '@/store/main/mutations';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
    components: { UserLink, UserSearch, MessageTextLockIcon },
})
export default class ChannelCard extends Vue {
    @Prop() private readonly channel!: IChannel;
    private members: IUserPreview[] = [];
    private newMemberUUID: string | null = null;
    private myToken: string | null = null;

    get currentUserId() {
        return this.$store.state.main.userProfile.uuid;
    }
    get token() { return this.$store.state.main.token; }
    private async mounted() {
        this.myToken = this.$store.state.main.token;
        this.members = [this.channel.admin];
        if (this.channel.private_with_user) {
            // FIXME: deprecate
            this.members.push(this.channel.private_with_user);
        }
    }
    private async commitNewMember() {
        if (this.newMemberUUID === this.currentUserId) {
            commitAddNotification(this.$store, {
                content: this.$t('You can\'t add yourself.').toString(),
                color: 'error',
            });
        } else {
            await dispatchCaptureApiError(this.$store, async () => {
                if (this.newMemberUUID !== null) {
                    const response = await api.addUserToChannel(this.token, this.channel.id, this.newMemberUUID);
                    this.members.push(response.data);
                }
            });
        }
    }
}
</script>

