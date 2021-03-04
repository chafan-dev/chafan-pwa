<template>
  <v-container>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row class="mb-12" justify="center" v-else>
        <v-col :class="{'col-6': $vuetify.breakpoint.mdAndUp }" fluid>
            <v-expansion-panels>
                <v-expansion-panel>
                    <v-expansion-panel-header>使用聊天功能的提示</v-expansion-panel-header>
                    <v-expansion-panel-content class="ma-4 pa-2">
                        Chafan 对聊天功能的支持有限，并且将长期保持有限的功能。如果你需要更多的聊天功能的话，
                        请使用其他专业的聊天工具沟通。Tips：如果你不想暴露个人信息的话，可以先使用 Discord 这个聊天工具（因为 Discord
                        是针对游戏玩家设计的，所以对真实用户信息的保护比熟人聊天类型的工具更好一些）。
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
            <ChatWindow :channel="channel" />
        </v-col>

        <v-col class="col-3" v-if="$vuetify.breakpoint.mdAndUp">
            <ChannelCard :channel="channel" />
        </v-col>
        <v-bottom-sheet v-else>
            <template v-slot:activator="{ on, attrs }">
                <v-btn fab fixed right bottom v-bind="attrs" v-on="on">
                    <ChannelIcon />
                </v-btn>
            </template>
            <v-sheet>
                <ChannelCard :channel="channel" />
            </v-sheet>
        </v-bottom-sheet>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api } from '@/api';
import { IChannel } from '@/interfaces';
import ChannelCard from '@/components/ChannelCard.vue';
import ChatWindow from '@/components/ChatWindow.vue';
import UserLink from '@/components/UserLink.vue';
import ChannelIcon from '@/components/icons/ChannelIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';

@Component({
    components: { UserLink, ChannelCard, ChannelIcon, ChatWindow },
})
export default class Channel extends Vue {
    get id() {
        return parseInt(this.$router.currentRoute.params.id, 10);
    }
    get currentUserId() {
        return this.$store.state.main.userProfile.uuid;
    }
    get token() { return this.$store.state.main.token; }
    private channel: IChannel | null = null;
    private loading = true;
    private async mounted() {
        await dispatchCaptureApiError(this.$store, async () => {
            this.channel = (await api.getChannel(this.token, this.id)).data;
            this.loading = false;
        });
    }
}
</script>
