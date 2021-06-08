<template>
  <div v-if="loading">
    <v-progress-linear indeterminate />
  </div>
  <div v-else>
    <div v-if="messages.length === 0">
      {{ $t('暂无历史消息') }}
    </div>
    <v-list-item v-for="message in messages" :key="message.id">
      <v-list-item-content>
        <v-list-item-title>
          <v-card
            class="blue-grey lighten-5 pa-2"
            min-width="40%"
            v-bind:class="[message.author.uuid === userProfile.uuid ? 'float-right' : 'float-left']"
          >
            <UserLink
              v-if="message.author.uuid !== userProfile.uuid"
              :userPreview="message.author"
            />
            <span v-else>{{ $t('我') }}</span
            >:
            <SimpleViewer :body="message.body" />
            <span class="ml-2 float-right text-caption grey--text">
              {{ $dayjs.utc(message.created_at).local().fromNow() }}
            </span>
          </v-card>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <div class="ma-4">
      <v-textarea
        v-model="messageCreate.body"
        :disabled="sendMsgIntermediate"
        :label="$t('新消息')"
        outlined
      />
      <div class="d-flex">
        <v-spacer />
        <v-btn
          small
          depressed
          :disabled="sendMsgIntermediate"
          color="primary"
          @click="commitNewMessage"
        >
          发送
          <v-progress-circular v-show="sendMsgIntermediate" indeterminate size="20" />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { api } from '@/api';
import { IChannel, IMessage, IMessageCreate } from '@/interfaces';
import ChannelCard from '@/components/ChannelCard.vue';
import UserLink from '@/components/UserLink.vue';
import SimpleViewer from '@/components/SimpleViewer.vue';
import ChannelIcon from '@/components/icons/ChannelIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { readToken, readUserProfile } from '@/store/main/getters';

@Component({
  components: { UserLink, ChannelCard, ChannelIcon, SimpleViewer },
})
export default class ChatWindow extends Vue {
  @Prop() public readonly channel!: IChannel;
  private messages: IMessage[] = [];
  private messageCreate: IMessageCreate = {
    channel_id: this.channel.id,
    body: '',
  };
  private loading = true;
  private sendMsgIntermediate = false;

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get token() {
    return readToken(this.$store);
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.messages = (await api.getChannelMessages(this.token, this.channel.id)).data;
      this.loading = false;
    });
  }

  private async commitNewMessage() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.sendMsgIntermediate = true;
      const response = await api.createMessage(this.token, this.messageCreate);
      this.messages.push(response.data);
      this.messageCreate.body = '';
      this.sendMsgIntermediate = false;
    });
  }
}
</script>
