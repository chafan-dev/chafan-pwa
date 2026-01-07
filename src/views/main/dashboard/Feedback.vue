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

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IFeedback } from '@/interfaces';
import { api } from '@/api';
import { useAuth } from '@/composables';

const props = defineProps<{
  feedback: IFeedback;
}>();

const { token } = useAuth();

const showScreenshot = ref(false);
const screenshotUrl = ref('');

const statusCN: Record<string, string> = {
  sent: '已发送',
  processing: '正在处理',
  closed: '已解决',
  wontfix: '无法解决',
};

onMounted(async () => {
  if (props.feedback.has_screenshot) {
    screenshotUrl.value =
      'data:image/gif;base64,' +
      (await api.getFeedbackScreenshotBase64(token.value, props.feedback.id));
  }
});
</script>
