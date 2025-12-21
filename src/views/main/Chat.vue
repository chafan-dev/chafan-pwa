<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate />
    <v-row v-else class="mb-12" justify="center">
      <v-col :class="{ 'col-6': $vuetify.breakpoint.mdAndUp }">
        <ChatWindow :channel="channel" />
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
