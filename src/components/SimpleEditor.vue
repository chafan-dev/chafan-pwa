<template>
  <div class="simple-editor">
    <ChafanTiptap
      v-if="editor === 'tiptap'"
      ref="tiptap"
      :body="initialValue"
      :comment-mode="true"
      :onMentionedHandles="onMentionedHandles"
      :placeholder="placeholder"
    />
    <LiteVditorCF
      v-else
      ref="simpleVditor"
      :initial-value="initialValue"
      :placeholder="placeholder"
      :showMenu="showMenu"
      :vditorUploadConfig="vditorUploadConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LiteVditorCF from '@/editors/lib-components/LiteVditorCF.vue';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { editor_T } from '@/interfaces';
import { getVditorUploadConfig } from '@/common';
import { useAuth } from '@/composables';

const props = withDefaults(
  defineProps<{
    initialValue?: string;
    placeholder?: string;
    editorProp?: editor_T;
    showMenu?: boolean;
    onMentionedHandles?: (handles: string[]) => void;
  }>(),
  {
    showMenu: false,
  }
);

const { token } = useAuth();

const tiptap = ref<InstanceType<typeof ChafanTiptap> | null>(null);
const simpleVditor = ref<any>(null);

const editor = computed(() => {
  if (props.editorProp) {
    return props.editorProp;
  }
  return 'tiptap';
});

const vditorUploadConfig = computed(() => {
  return getVditorUploadConfig(token.value);
});

function getContent(): string | null {
  if (editor.value === 'tiptap') {
    return tiptap.value?.getContent() ?? null;
  } else {
    return simpleVditor.value?.content ?? null;
  }
}

function setContent(value: string | null) {
  if (value) {
    if (editor.value === 'tiptap') {
      tiptap.value?.setContent(value);
    } else if (simpleVditor.value) {
      simpleVditor.value.content = value;
    }
  } else {
    if (editor.value === 'tiptap') {
      tiptap.value?.reset();
    } else {
      simpleVditor.value?.reset();
    }
  }
}

function getTextContent(): string | null {
  if (editor.value === 'tiptap') {
    return tiptap.value?.getText() ?? null;
  } else {
    return simpleVditor.value?.getText() ?? null;
  }
}

function reset() {
  if (editor.value === 'tiptap') {
    tiptap.value?.reset();
  } else {
    simpleVditor.value?.initVditor();
  }
}

defineExpose({
  getContent,
  setContent,
  getTextContent,
  reset,
  editor,
});
</script>
