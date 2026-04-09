<template>
  <v-dialog :model-value="visible" max-width="600" @update:model-value="$emit('update:visible', $event)">
    <v-card>
      <v-card-title>
        举报 <UserLink :user-preview="answerAuthor" />的回答
        <v-spacer />
        <AppIcon name="Close" @click="$emit('update:visible', false)"  />
      </v-card-title>
      <v-card-text>
        <p>
          <v-select
            :items="reportReasonItems"
            v-model="reportReason"
            item-text="text"
            item-value="value"
            label="举报原因"
          />
        </p>
        <p>
          <v-textarea
            v-model="reportReasonComment"
            hide-details
            label="备注（可选）"
          />
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="warning"
          size="small"
          variant="flat"
          @click="submitReport"
          :disabled="submitReportIntermediate"
        >
          提交
          <v-progress-circular
            v-if="submitReportIntermediate"
            indeterminate
            size="15"
            class="ml-1"
          />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { IUserPreview, ISevereReportReason } from '@/interfaces';
import { api } from '@/api';
import { useAuth } from '@/composables';
import { useMainStore } from '@/stores/main';
import UserLink from '@/components/UserLink.vue';
import AppIcon from '@/components/icons/AppIcon.vue';

const props = defineProps<{
  visible: boolean;
  answerUuid: string;
  answerAuthor: IUserPreview;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'submitted'): void;
}>();

const store = useMainStore();
const { token } = useAuth();

const reportReasonItems = [
  { value: 'SPAM', text: '垃圾信息' },
  { value: 'OFF_TOPIC', text: '和主题范围无关' },
  { value: 'RUDE_OR_ABUSIVE', text: '恶意、极端、偏激类言论' },
  { value: 'RIGHT_INFRINGEMENT', text: '抄袭或者侵犯他人隐私' },
  { value: 'NEED_MODERATOR_INTERVENTION', text: '需要管理员人工判断' },
];
const reportReason = ref<ISevereReportReason>('NEED_MODERATOR_INTERVENTION');
const reportReasonComment = ref<string | null>(null);
const submitReportIntermediate = ref(false);

async function submitReport() {
  submitReportIntermediate.value = true;
  await api.createReport(token.value, {
    answer_uuid: props.answerUuid,
    reason: reportReason.value,
    reason_comment: reportReasonComment.value || undefined,
  });
  store.notifications.push({
    color: 'success',
    content: '举报提交成功',
  });
  submitReportIntermediate.value = false;
  emit('update:visible', false);
  emit('submitted');
}
</script>
