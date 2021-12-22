<template>
  <div>
    <div class="d-flex">
      <span><b>编号</b>：#{{ feedback.id }}</span>
    </div>
    <div>
      <span><b>创建于</b>: {{ $dayjs.utc(feedback.created_at).local().fromNow() }}</span>
    </div>
    <div><b>描述</b>：#{{ feedback.description }}</div>
    <div><b>状态</b>：{{ statusCN[feedback.status] }}</div>
    <div>
      <v-btn
        v-if="feedback.has_screenshot"
        class="ml-1"
        small
        depressed
        @click="showScreenshot = !showScreenshot"
        >查看截屏</v-btn
      >
      <v-expand-transition>
        <div v-show="showScreenshot" class="pa-2">
          <v-img v-if="screenshotUrl" :src="screenshotUrl" class="ma-2" />
          <v-skeleton-loader type="image" v-else />
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';
import { IFeedback } from '@/interfaces';
import { api } from '@/api';

@Component
export default class Feedback extends CVue {
  @Prop() readonly feedback!: IFeedback;
  private showScreenshot: boolean = false;
  private screenshotUrl: string = '';

  readonly statusCN = {
    sent: '已发送',
    processing: '正在处理',
    closed: '已解决',
    wontfix: '无法解决',
  };

  async mounted() {
    if (this.feedback.has_screenshot) {
      this.screenshotUrl =
        'data:image/gif;base64,' +
        (await api.getFeedbackScreenshotBase64(this.token, this.feedback.id));
    }
  }
}
</script>
