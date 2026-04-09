<template>
  <v-card class="pa-4 my-3" variant="outlined">
    <div class="text-h6 mb-4 d-flex">
      教育经历
      <v-spacer />
      <v-btn color="primary" variant="flat" size="small" @click="showAddDialog">
        添加
      </v-btn>
    </div>
    <template v-for="(exp, index) in modelValue" :key="'edu-' + (exp.school_topic_name || '') + '-' + index">
      <v-divider v-if="index > 0" class="py-1" />
      <div class="py-1 d-flex justify-space-between">
        <EduExp
          :school-name="exp.school_topic_name"
          :level-name="exp.level_name"
          :enroll-year="exp.enroll_year"
          :graduate-year="exp.graduate_year"
          :major="exp.major"
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
        <v-card-title>编辑教育经历</v-card-title>
        <v-card-text v-if="editedItem">
          <v-text-field v-model="editedItem.school_topic_name" label="学校名" />
          <v-combobox
            v-model="editedItem.level_name"
            :items="levelNames"
            label="教育水平"
          />
          <v-text-field
            v-model="editedItem.major"
            label="专业/方向（选填）"
            clearable
          />
          <div class="d-flex">
            <v-autocomplete
              class="mr-2"
              :items="years"
              v-model="editedItem.enroll_year"
              label="入学年份（选填）"
              clearable
            />
            <v-autocomplete
              :items="['在读'].concat(years)"
              v-model="editedItem.graduate_year"
              label="毕业年份（选填）"
              clearable
            />
          </div>
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
import EduExp from '@/components/EduExp.vue';
import AppIcon from '@/components/icons/AppIcon.vue';

interface EduExpItem {
  school_topic_name?: string;
  level_name?: string;
  major?: string;
  enroll_year?: string;
  graduate_year?: string;
}

const props = defineProps<{
  modelValue: EduExpItem[];
  years: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: EduExpItem[]): void;
  (e: 'request-remove', index: number): void;
}>();

const levelNames = ['高中及以下', '大专', '本科', '硕士', '博士及以上'];

const editedIndex = ref<number | null>(null);
const editorShown = ref(false);
const editedItem = ref<EduExpItem | null>(null);

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
