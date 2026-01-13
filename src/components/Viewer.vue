<template>
  <div :class="{ 'viewer-desktop': $vuetify.breakpoint.mdAndUp }" class="viewer">
    <template v-if="content.editor === 'tiptap'">
      <ChafanTiptap :body="content.source" :editable="false" :on-editor-ready="onViewerReady" />
    </template>
    <template v-else>
      <VditorViewerCF :body="content.source" :onViewerReady="onViewerReady" />
    </template>

    <template v-if="contentElem">
      <LightboxGroup :container="contentElem" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VditorViewerCF from '@/editors/lib-components/VditorViewerCF.vue';
import LightboxGroup from '@/components/image/LightboxGroup.vue';
import { postProcessViewerDOM } from '@/common';
import { IRichText } from '@/interfaces';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { useAuth } from '@/composables';

const props = defineProps<{
  content: IRichText;
}>();

const emit = defineEmits<{
  (e: 'viewer-ready', contentElem: HTMLElement): void;
}>();

const { token } = useAuth();

const contentElem = ref<HTMLElement | null>(null);
const textContent = ref<string | null>(null);

function onViewerReady(elem: HTMLElement) {
  contentElem.value = elem;
  postProcessViewerDOM(token.value, elem);
  textContent.value = elem.innerText;
  emit('viewer-ready', elem);
}

defineExpose({
  textContent,
});
</script>
