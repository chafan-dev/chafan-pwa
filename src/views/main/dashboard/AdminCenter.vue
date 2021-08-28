<template>
  <div>
    <v-card>
      <v-card-title> 反馈状态 </v-card-title>
      <v-card-text>
        <v-list v-if="feedbacks.length > 0">
          <template v-for="(feedback, idx) in feedbacks">
            <v-divider v-if="idx > 0" :key="feedback.id" class="ma-2" />
            <v-list-item :key="feedback.id">
              <div>
                <div>
                  <span><b>编号</b>: #{{ feedback.id }}</span
                  >，
                  <span
                    ><b>创建于</b>: {{ $dayjs.utc(feedback.created_at).local().fromNow() }}</span
                  >
                </div>
                <div><b>描述</b>：#{{ feedback.description }}</div>
                <div><b>状态</b>: {{ statusCN[feedback.status] }}</div>
              </div>
              <!-- TODO: 截屏 -->
            </v-list-item>
          </template>
        </v-list>
        <EmptyPlaceholder v-else />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { CVue } from '@/common';
import { IFeedback } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { api2 } from '@/api2';
import EmptyPlaceholder from '@/components/EmptyPlaceholder.vue';
@Component({
  components: { EmptyPlaceholder },
})
export default class AdminCenter extends CVue {
  private feedbacks: IFeedback[] = [];
  private readonly statusCN = {
    sent: '已发送',
    processing: '正在处理',
    closed: '已解决',
    wontfix: '无法解决',
  };

  async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      this.feedbacks = (await api2.getFeedbacks(this.token)).data;
    });
  }
}
</script>
