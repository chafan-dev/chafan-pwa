<template>
  <div v-if="loading">
    <v-progress-linear indeterminate />
  </div>
  <div v-else>
    <span v-if="channel && channel.private_with_user" class="title">
      和<UserLink :user-preview="channel.private_with_user" />的聊天记录
    </span>
    <div v-if="messages.length === 0">
      <EmptyPlaceholder />
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
            <span v-else>我</span>:
            {{ message.body }}
            <span class="ml-2 float-right text-caption grey--text">
              {{ $dayjs.utc(message.created_at).local().fromNow() }}
            </span>
          </v-card>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <div class="mt-2">
      <v-textarea
        v-model="messageCreate.body"
        :disabled="sendMsgIntermediate"
        label="新消息"
        outlined
        hide-details
      />
      <div class="d-flex py-2">
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
import UserLink from '@/components/UserLink.vue';
import Viewer from '@/components/Viewer.vue';
import ChannelIcon from '@/components/icons/ChannelIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { readToken, readUserProfile } from '@/store/main/getters';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';

@Component({
  components: { EmptyPlaceholder, UserLink, ChannelIcon, Viewer },
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
