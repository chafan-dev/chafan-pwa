<template>
  <div>
    <span v-if="initialContent === '[DELETED]'" class="text-grey"> 已删除 </span>
    <TiptapCF
      v-else
      ref="base"
      v-bind="$attrs"
     
      :comment-mode="commentMode"
      :editable="editable"
      :on-editor-change="onChange"
      :on-editor-ready="onEditorReadyInternal"
      :search-users="searchUsers"
      :upload="upload"
      :user-href="userHref"
      :user-label="userLabel"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '@/interfaces';

import 'tippy.js/dist/tippy.css';
import 'highlight.js/styles/github.css';

import TiptapCF from '@/editors/lib-components/TiptapCF.vue';
import { useAuth, useImageUpload, useNotification } from '@/composables';
import { uploadErrorMessage } from '@/upload';

declare const renderMathInElement: (element: HTMLElement, options: Record<string, unknown>) => void;

const props = withDefaults(
  defineProps<{
    onEditorReady?: (contentElem: HTMLElement) => void;
    onEditorChange?: (text: string) => void;
    initialContent?: string;
    editable?: boolean;
    commentMode?: boolean;
    onMentionedHandles?: (handles: string[]) => void;
    placeholder?: string;
  }>(),
  {
    editable: true,
    commentMode: false,
  }
);

const instance = getCurrentInstance();
const { token } = useAuth();
const { uploadImage } = useImageUpload();
const { notifyError } = useNotification();

const base = ref<InstanceType<typeof TiptapCF> | null>(null);

function getContent(): string | null {
  const json = base.value?.getJSON();
  if (json) {
    return JSON.stringify(json);
  }
  return null;
}

function setContent(value: string | null) {
  if (!value) {
    base.value?.reset();
    return;
  }
  base.value?.loadJSON(JSON.parse(value));
}

function getText(): string | null {
  return base.value?.getText();
}

function getHTML() {
  return base.value?.getHTML();
}

function loadHTML(html: string) {
  return base.value?.loadHTML(html);
}

function loadJSON(json: Record<string, unknown>) {
  return base.value?.loadJSON(json);
}

function reset() {
  base.value?.reset();
}

// Rejecting matters as much as resolving: the editor inserts the resolved URL
// as an image node, so a failed upload must not resolve with anything.
async function upload(file: Blob) {
  try {
    return await uploadImage(file, 'figure');
  } catch (error: unknown) {
    notifyError(uploadErrorMessage(error));
    throw error;
  }
}

onMounted(() => {
  if (props.initialContent) {
    loadJSON(JSON.parse(props.initialContent));
  }
});

function onEditorReadyInternal(contentElem: HTMLElement) {
  if (!props.editable) {
    renderMathInElement(contentElem, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
    });
  }
  if (props.onEditorReady) {
    props.onEditorReady(contentElem);
  }
}

function onChange() {
  if (props.onMentionedHandles && instance?.proxy?.$el) {
    const handles: string[] = [];
    instance.proxy.$el.querySelectorAll('a.mention').forEach((elem: Element) => {
      const anchor = elem as HTMLAnchorElement;
      const url = new URL(anchor.href);
      const segments = url.pathname.split('/');
      if (segments.length === 3 && segments[1] === 'users') {
        handles.push(decodeURI(segments[2]));
      }
    });
    props.onMentionedHandles(handles);
  }
  if (props.onEditorChange) {
    props.onEditorChange(getText() || '');
  }
}

async function searchUsers(query: string) {
  return (await apiSearch.searchUsers(token.value, query)).data;
}

function userHref(user: IUserPreview) {
  return `/users/${user.handle}`;
}

function userLabel(user: IUserPreview) {
  return user.full_name ? `${user.full_name} (${user.handle})` : user.handle;
}

defineExpose({
  getContent,
  setContent,
  getText,
  getHTML,
  loadHTML,
  loadJSON,
  reset,
});
</script>
