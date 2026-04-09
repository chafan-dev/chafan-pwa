<template>
  <v-expansion-panels v-if="suggestions.length" class="mt-2">
    <v-expansion-panel v-for="suggestion in suggestions" :key="suggestion.uuid">
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
          <div v-if="suggestion.accepted_diff_base.title !== suggestion.title && suggestion.title">
            <span class="font-weight-bold">标题改动：</span>
            <DiffView :s1="suggestion.accepted_diff_base.title" :s2="suggestion.title" />
          </div>
          <div
            v-if="
              suggestion.desc &&
              (!suggestion.accepted_diff_base.desc ||
                suggestion.accepted_diff_base.desc.source !== suggestion.desc.source)
            "
          >
            <span class="font-weight-bold">描述改动：</span>
            <DiffView
              :s1="suggestion.accepted_diff_base.desc ? suggestion.accepted_diff_base.desc.rendered_text : ''"
              :s2="suggestion.desc.rendered_text"
            />
          </div>
        </template>
        <template v-else-if="suggestion.status !== 'accepted'">
          <div v-if="submission.title !== suggestion.title && suggestion.title">
            <span class="font-weight-bold">标题改动：</span>
            <DiffView :s1="submission.title" :s2="suggestion.title" />
          </div>
          <div
            v-if="
              suggestion.desc &&
              (!submission.desc || submission.desc.source !== suggestion.desc.source)
            "
          >
            <span class="font-weight-bold">描述改动：</span>
            <DiffView
              :s1="submission.desc ? submission.desc.rendered_text : ''"
              :s2="suggestion.desc.rendered_text"
            />
          </div>
          <div v-if="suggestion.topics">
            <span class="font-weight-bold">话题改动：</span>
            <DiffView
              :s1="topicNames(submission.topics)"
              :s2="topicNames(suggestion.topics)"
            />
          </div>
        </template>
        <div class="d-flex justify-end mt-1">
          <template v-if="suggestion.status === 'pending'">
            <v-btn class="mr-2" variant="outlined" size="small" @click="previewSuggestion(suggestion)">
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
              <v-btn class="mr-2" color="green" variant="outlined" size="small" @click="$emit('accept', suggestion)">
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
              <v-btn class="mr-2" color="green" variant="outlined" size="small" @click="$emit('accept', suggestion)">
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
      <v-chip-group v-if="previewedSuggestion.topics" class="px-5">
        <v-chip
          v-for="topic in previewedSuggestion.topics"
          :key="topic.uuid"
          :to="'/topics/' + topic.uuid"
          size="small"
        >
          {{ topic.name }}
        </v-chip>
      </v-chip-group>
      <v-card-title>{{ previewedSuggestion.title }}</v-card-title>
      <v-card-text>
        <Viewer v-if="previewedSuggestion.desc" :content="previewedSuggestion.desc" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ISubmission, ISubmissionSuggestion, ITopic } from '@/interfaces';
import { useDayjs } from '@/composables';
import UserLink from '@/components/UserLink.vue';
import DiffView from '@/components/widgets/DiffView.vue';
import Viewer from '@/components/Viewer.vue';

defineProps<{
  suggestions: ISubmissionSuggestion[];
  submission: ISubmission;
  isAuthor: boolean;
  currentUserUuid?: string;
  highlightUuid?: string;
}>();

defineEmits<{
  (e: 'accept', suggestion: ISubmissionSuggestion): void;
  (e: 'reject', suggestion: ISubmissionSuggestion): void;
  (e: 'retract', suggestion: ISubmissionSuggestion): void;
  (e: 'revert-retract', suggestion: ISubmissionSuggestion): void;
}>();

const { fromNow } = useDayjs();

const previewedSuggestion = ref<ISubmissionSuggestion | null>(null);
const showPreviewDialog = ref(false);

function previewSuggestion(suggestion: ISubmissionSuggestion) {
  previewedSuggestion.value = suggestion;
  showPreviewDialog.value = true;
}

function topicNames(topics: ITopic[]) {
  return topics.map((topic) => topic.name).sort().join(', ');
}
</script>
