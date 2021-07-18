<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row v-else class="mb-12" justify="center">
      <v-col :class="{ 'col-6': $vuetify.breakpoint.mdAndUp }" fluid>
        <ChatWindow :channel="channel" />
        <v-expansion-panels class="mt-4">
          <v-expansion-panel>
            <v-expansion-panel-header>关于聊天功能的提示</v-expansion-panel-header>
            <v-expansion-panel-content>
              「茶饭」对聊天功能的支持有限，并且将长期保持有限的功能。如果你需要更多的聊天功能的话，
              请使用其他专业的聊天工具沟通。Tips：如果你不想暴露个人信息的话，可以先使用 Discord
              这个聊天工具（因为 Discord
              是针对游戏玩家设计的，所以对真实用户信息的保护比熟人聊天类型的工具更好一些）。
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { api } from '@/api';
import { IChannel } from '@/interfaces';
import ChatWindow from '@/components/ChatWindow.vue';
import UserLink from '@/components/UserLink.vue';
import ChannelIcon from '@/components/icons/ChannelIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { Route, RouteRecord } from 'vue-router';
import { isEqual } from '@/common';

@Component({
  components: { UserLink, ChannelIcon, ChatWindow },
})
export default class Chat extends Vue {
  private channel: IChannel | null = null;
  private loading = true;

  get id() {
    return parseInt(this.$route.params.id, 10);
  }

  get currentUserId() {
    return this.$store.state.main.userProfile.uuid;
  }

  get token() {
    return this.$store.state.main.token;
  }

  beforeRouteUpdate(to: Route, from: Route, next: () => void) {
    next();
    const matched = from.matched.find((record: RouteRecord) => record.name === 'channel');
    if (matched && !isEqual(to.params, from.params)) {
      this.loading = true;
      this.load();
    }
  }

  private async mounted() {
    await this.load();
  }

  private async load() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.channel = (await api.getChannel(this.token, this.id)).data;
      this.loading = false;
    });
  }
}
</script>
