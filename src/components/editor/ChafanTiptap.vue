<template>
  <div>
    <span v-if="initialContent === '[DELETED]'" class="grey--text"> 已删除 </span>
    <TiptapCF
      v-else
      ref="base"
      v-bind="$attrs"
      v-on="$listeners"
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
import { useStore } from 'vuex';
import { apiSearch } from '@/api/search';
import { IUserPreview } from '@/interfaces';

import 'tippy.js/dist/tippy.css';
import 'highlight.js/styles/github.css';

import { TiptapCF } from 'chafan-vue-editors';
import { resizeImage } from '@/imagelib';
import piexif from 'piexifjs';
import { api2 } from '@/api2';
import { readToken } from '@/store/main/getters';

declare const renderMathInElement: any;

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

const store = useStore();
const instance = getCurrentInstance();

const base = ref<any>(null);

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

function loadJSON(json: any) {
  return base.value?.loadJSON(json);
}

function reset() {
  base.value?.reset();
}

async function upload(file: Blob) {
  const resized = await resizeImage({
    maxSize: 500, // px
    file,
  });

  const formData = new FormData();
  // Upload candidate image and update URL
  try {
    formData.append('file', piexif.remove(resized.blob));
    // Remove EXIF if it is jpeg
  } catch {
    formData.append('file', resized.blob);
  }
  const response = await api2.uploadFile(readToken(store), formData);
  return response.data.url;
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
  return (await apiSearch.searchUsers(store.state.main.token, query)).data;
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
