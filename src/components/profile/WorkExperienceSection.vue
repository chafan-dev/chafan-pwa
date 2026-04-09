<template>
  <v-card class="pa-4 my-3" variant="outlined">
    <div class="text-h6 mb-4 d-flex">
      工作经历
      <v-spacer />
      <v-btn color="primary" variant="flat" size="small" @click="showAddDialog">
        添加
      </v-btn>
    </div>
    <template v-for="(exp, index) in modelValue" :key="'work-' + (exp.company_topic_name || '') + '-' + index">
      <v-divider v-if="index > 0" class="py-1" />
      <div class="py-1 d-flex justify-space-between">
        <WorkExp
          :company-name="exp.company_topic_name"
          :position-name="exp.position_topic_name"
        />
        <div>
          <AppIcon name="Edit" class="pl-1" @click="showEditor(index)"  />
          <AppIcon name="Up" class="pl-1" @click="moveUp(index)"  />
          <AppIcon name="Down" class="pl-1" @click="moveDown(index)"  />
          <AppIcon name="Delete" class="pl-1" @click="$emit('request-remove', index)"  />
        </div>
      </div>
    </template>
    <v-dialog v-model="editorShown" max-width="600">
      <v-card>
        <v-card-title>编辑工作经历</v-card-title>
        <v-card-text v-if="editedItem">
          <v-text-field v-model="editedItem.company_topic_name" label="公司名" />
          <v-text-field v-model="editedItem.position_topic_name" label="职位名" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn size="small" variant="tonal" @click="editorShown = false">取消</v-btn>
          <v-btn size="small" variant="flat" color="primary" @click="saveEditDraft">保存草稿</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { deepCopy } from '@/utils';
import WorkExp from '@/components/WorkExp.vue';
import AppIcon from '@/components/icons/AppIcon.vue';

interface WorkExpItem {
  company_topic_name?: string;
  position_topic_name?: string;
}

const props = defineProps<{
  modelValue: WorkExpItem[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: WorkExpItem[]): void;
  (e: 'request-remove', index: number): void;
}>();

const editedIndex = ref<number | null>(null);
const editorShown = ref(false);
const editedItem = ref<WorkExpItem | null>(null);

function showAddDialog() {
  editedItem.value = {};
  editedIndex.value = props.modelValue.length;
  editorShown.value = true;
}

function showEditor(index: number) {
  editedIndex.value = index;
  editedItem.value = deepCopy(props.modelValue[index]);
  editorShown.value = true;
}

function saveEditDraft() {
  if (editedIndex.value !== null && editedItem.value) {
    const newList = [...props.modelValue];
    if (editedIndex.value >= newList.length) {
      newList.push(editedItem.value);
    } else {
      newList.splice(editedIndex.value, 1, editedItem.value);
    }
    emit('update:modelValue', newList);
    editorShown.value = false;
  }
}

function moveUp(index: number) {
  if (index === 0) return;
  const newList = [...props.modelValue];
  const item = newList.splice(index, 1)[0];
  newList.splice(index - 1, 0, item);
  emit('update:modelValue', newList);
}

function moveDown(index: number) {
  if (index === props.modelValue.length - 1) return;
  const newList = [...props.modelValue];
  const item = newList.splice(index, 1)[0];
  newList.splice(index + 1, 0, item);
  emit('update:modelValue', newList);
}
</script>
