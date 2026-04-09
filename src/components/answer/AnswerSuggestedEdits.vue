<template>
  <v-expansion-panels
    v-if="suggestedEdits.length"
    class="mt-2"
    v-model="openedSuggestionIdx"
  >
    <v-expansion-panel v-for="suggestion in suggestedEdits" :key="suggestion.uuid">
      <v-expansion-panel-header
        :class="{
          'text-grey': suggestion.status !== 'pending',
          'text-primary': suggestion.uuid === highlightUuid,
        }"
      >
        <span>
          <UserLink :show-avatar="true" :user-preview="suggestion.author" /> 的建议编辑：
          <template v-if="suggestion.status === 'pending'">
            待处理（{{ fromNow(suggestion.created_at) }}）
          </template>
          <template v-if="suggestion.status === 'accepted'">
            已接受（{{ fromNow(suggestion.accepted_at) }}）
          </template>
          <template v-if="suggestion.status === 'rejected'">
            已拒绝（{{ fromNow(suggestion.rejected_at) }}）
          </template>
          <template v-if="suggestion.status === 'retracted'">
            已撤回（{{ fromNow(suggestion.retracted_at) }}）
          </template>
        </span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div v-if="suggestion.comment">
          <span class="font-weight-bold">附言：</span>{{ suggestion.comment }}
        </div>
        <template v-if="suggestion.status === 'accepted' && suggestion.accepted_diff_base">
          <div
            v-if="suggestion.accepted_diff_base.source !== suggestion.body_rich_text.source"
          >
            <DiffView
              :s1="suggestion.accepted_diff_base.rendered_text"
              :s2="suggestion.body_rich_text.rendered_text"
            />
          </div>
          <div v-else>无改动</div>
        </template>
        <template v-else-if="suggestion.status !== 'accepted'">
          <div v-if="answerContentSource !== suggestion.body_rich_text.source">
            <DiffView
              :s1="answerContentRenderedText"
              :s2="suggestion.body_rich_text.rendered_text"
            />
          </div>
        </template>
        <div class="d-flex justify-end mt-1">
          <template v-if="suggestion.status === 'pending'">
            <v-btn class="mr-2" variant="outlined" size="small" @click="$emit('preview', suggestion)">
              预览
            </v-btn>
            <v-btn
              v-if="currentUserUuid === suggestion.author.uuid"
              variant="outlined"
              size="small"
              @click="$emit('retract', suggestion)"
            >
              撤回
            </v-btn>
            <template v-if="isAuthor">
              <v-btn
                class="mr-2"
                color="green"
                variant="outlined"
                size="small"
                @click="$emit('accept', suggestion)"
              >
                接受
              </v-btn>
              <v-btn color="warning" variant="outlined" size="small" @click="$emit('reject', suggestion)">
                拒绝
              </v-btn>
            </template>
          </template>
          <template v-if="suggestion.status === 'rejected'">
            <v-btn
              v-if="currentUserUuid === suggestion.author.uuid"
              variant="outlined"
              size="small"
              @click="$emit('retract', suggestion)"
            >
              撤回
            </v-btn>
            <template v-if="isAuthor">
              <v-btn
                class="mr-2"
                color="green"
                variant="outlined"
                size="small"
                @click="$emit('accept', suggestion)"
              >
                接受
              </v-btn>
            </template>
          </template>
          <template v-if="suggestion.status === 'retracted'">
            <v-btn
              v-if="currentUserUuid === suggestion.author.uuid"
              variant="outlined"
              size="small"
              @click="$emit('revert-retract', suggestion)"
            >
              取消撤回
            </v-btn>
          </template>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-dialog v-model="showPreviewDialog">
    <v-card v-if="previewedSuggestion" :key="previewedSuggestion.uuid">
      <v-card-title> 建议改动后内容预览 </v-card-title>
      <v-card-text>
        <Viewer :content="previewedSuggestion.body_rich_text" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { IAnswerSuggestEdit } from '@/interfaces';
import { useDayjs } from '@/composables';
import UserLink from '@/components/UserLink.vue';
import DiffView from '@/components/widgets/DiffView.vue';
import Viewer from '@/components/Viewer.vue';

const props = defineProps<{
  suggestedEdits: IAnswerSuggestEdit[];
  answerContentSource: string;
  answerContentRenderedText: string;
  isAuthor: boolean;
  currentUserUuid?: string;
  highlightUuid?: string;
}>();

defineEmits<{
  (e: 'accept', suggestion: IAnswerSuggestEdit): void;
  (e: 'reject', suggestion: IAnswerSuggestEdit): void;
  (e: 'retract', suggestion: IAnswerSuggestEdit): void;
  (e: 'revert-retract', suggestion: IAnswerSuggestEdit): void;
  (e: 'preview', suggestion: IAnswerSuggestEdit): void;
}>();

const { fromNow } = useDayjs();

const openedSuggestionIdx = ref<number | null>(null);
const previewedSuggestion = ref<IAnswerSuggestEdit | null>(null);
const showPreviewDialog = ref(false);

// Auto-open highlighted suggestion
watch(() => props.highlightUuid, (uuid) => {
  if (uuid) {
    const idx = props.suggestedEdits.findIndex((v) => v.uuid === uuid);
    if (idx >= 0) openedSuggestionIdx.value = idx;
  }
}, { immediate: true });

function openPreview(suggestion: IAnswerSuggestEdit) {
  previewedSuggestion.value = suggestion;
  showPreviewDialog.value = true;
}

defineExpose({ openPreview });
</script>
