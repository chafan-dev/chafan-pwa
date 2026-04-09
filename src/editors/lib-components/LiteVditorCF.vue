<template>
  <div ref="rootEl" :class="{ 'vditor-without-menu': !showMenu }" class="lite-vditor" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { vditorCDN } from '../common';

const props = withDefaults(
  defineProps<{
    initialValue?: string;
    placeholder?: string;
    showMenu?: boolean;
    vditorUploadConfig?: any;
  }>(),
  {
    showMenu: false,
  }
);

const rootEl = ref<HTMLDivElement>();
let vditor: any = null;

async function initVditor() {
  const { default: Vditor } = await import('vditor');
  if (vditor !== null) {
    vditor.destroy();
  }
  vditor = new Vditor(rootEl.value!, {
    cdn: vditorCDN,
    placeholder: props.placeholder ? props.placeholder : '',
    value: props.initialValue,
    mode: 'wysiwyg',
    toolbar: [
      'bold',
      'italic',
      'link',
      'list',
      'line',
      'strike',
      'undo',
      'redo',
      {
        name: 'upload',
        tip: '上传图片',
      },
    ],
    cache: {
      enable: false,
    },
    upload: props.vditorUploadConfig,
    counter: {
      enable: false,
    },
  });
}

function getText() {
  let text = (rootEl.value!.getElementsByClassName('vditor-wysiwyg')[0] as HTMLElement).innerText;
  const hasImg = getHTML().includes('<img ');
  if (hasImg) {
    text += '[图片]';
  }
  return text || '';
}

function getHTML() {
  return vditor!.getHTML();
}

function reset() {
  initVditor();
}

onMounted(async () => {
  await initVditor();
});

defineExpose({ getText, getHTML, reset });
</script>

<style>
.lite-vditor .vditor-reset.vditor-reset {
  padding-left: 8px;
  padding-right: 8px;
}

.lite-vditor h1::before,
.lite-vditor h2::before,
.lite-vditor h3::before {
  content: '';
}

.vditor-without-menu .vditor-toolbar {
  height: 0;
  border-bottom: 0;
}
</style>
