<template>
  <div v-if="loading">
    <v-progress-linear indeterminate />
  </div>
  <div v-else>
    <div v-if="channel && channel.private_with_user">
      <template v-if="channel.feedback_subject">
        <h1 class="title">关于反馈</h1>
        <v-card flat outlined class="pa-2 my-1">
          <Feedback :feedback="channel.feedback_subject" />
        </v-card>
      </template>
      <template v-if="channel.site_creation_subject">
        <h1 class="title">关于创建圈子申请</h1>
        <v-card flat outlined class="pa-2 my-1">
          <SiteCreation :site_creation="channel.site_creation_subject" />
        </v-card>
      </template>
      <span class="title" v-else>
        和<UserLink
          :user-preview="
            channel.admin.uuid === currentUserId ? channel.private_with_user : channel.admin
          "
        />的聊天记录
      </span>
    </div>
    <div v-if="messages.length === 0">
      <EmptyPlaceholder />
    </div>
    <div v-else class="d-flex flex-column my-2">
      <div v-for="message in messages" :key="message.id">
        <v-sheet
          flat
          class="blue-grey lighten-5 pa-2 mb-2"
          min-width="40%"
          max-width="60%"
          v-bind:class="[message.author.uuid === userProfile.uuid ? 'float-right' : 'float-left']"
        >
          <UserLink v-if="message.author.uuid !== userProfile.uuid" :userPreview="message.author" />
          <span v-else>我</span>:
          <Viewer :content="plainTextContent(message.body)" />
          <span class="ml-2 float-right text-caption grey--text">
            {{ $dayjs.utc(message.created_at).local().fromNow() }}
          </span>
        </v-sheet>
      </div>
    </div>
    <div class="mt-2">
      <v-textarea
        v-model="messageCreate.body"
        :disabled="sendMsgIntermediate"
        hide-details
        label="新消息"
        outlined
      />
      <div class="d-flex py-2">
        <HelpIcon @click="showTips = true" />
        <v-spacer />
        <v-btn
          :disabled="sendMsgIntermediate"
          color="primary"
          depressed
          small
          @click="commitNewMessage"
        >
          发送
          <v-progress-circular v-show="sendMsgIntermediate" indeterminate size="20" />
        </v-btn>
      </div>
    </div>
    <v-dialog v-model="showTips" max-width="600">
      <v-card>
        <v-card-title>
          关于聊天功能的提示
          <v-spacer />
          <CloseIcon @click="showTips = false" />
        </v-card-title>
        <v-card-text>
          「茶饭」对聊天功能的支持有限，并且将长期保持有限的功能。如果你需要更多的聊天功能的话，
          请使用其他专业的聊天工具沟通。Tips：如果你不想暴露个人信息的话，可以先使用 Discord
          这个聊天工具（因为 Discord
          是针对游戏玩家设计的，所以对真实用户信息的保护比熟人聊天类型的工具更好一些）。
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { api } from '@/api';
import { IChannel, IMessage, IMessageCreate, IRichText } from '@/interfaces';
import UserLink from '@/components/UserLink.vue';
import Viewer from '@/components/Viewer.vue';
import ChannelIcon from '@/components/icons/ChannelIcon.vue';
import { dispatchCaptureApiError } from '@/store/main/actions';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
import { CVue } from '@/common';
import Feedback from '@/views/main/dashboard/Feedback.vue';
import CloseIcon from '@/components/icons/CloseIcon.vue';
import HelpIcon from '@/components/icons/HelpIcon.vue';
import SiteCreation from '@/views/main/dashboard/SiteCreation.vue';

@Component({
  components: {
    SiteCreation,
    HelpIcon,
    CloseIcon,
    Feedback,
    EmptyPlaceholder,
    UserLink,
    ChannelIcon,
    Viewer,
  },
})
export default class ChatWindow extends CVue {
  @Prop() public readonly channel!: IChannel;
  private messages: IMessage[] = [];
  private messageCreate: IMessageCreate = {
    channel_id: this.channel.id,
    body: '',
  };
  private loading = true;
  private sendMsgIntermediate = false;
  private showTips = false;

  private plainTextContent(text: string): IRichText {
    return {
      source: text,
      editor: 'markdown',
      rendered_text: text,
    };
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
