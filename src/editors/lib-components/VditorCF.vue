<template>
  <div ref="rootEl" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

import { vditorCDN, editor_T, getOS } from '../common';

// Emits:
// - shortcutSubmit: ctrl-Enter or cmd-Enter

const props = withDefaults(
  defineProps<{
    onEditorChange?: (value: string) => void;
    vditorUploadConfig?: any;
    isMobile?: boolean;
    initialContent?: string;
    editorMode?: editor_T;
    placeholder?: string;
  }>(),
  {
    isMobile: false,
    editorMode: 'wysiwyg',
  }
);

const emit = defineEmits<{
  shortcutSubmit: [];
}>();

const rootEl = ref<HTMLElement>();

const allToolbarItems: any[] = [
  'emoji',
  'headings',
  'bold',
  'italic',
  'strike',
  {
    name: 'link',
    suffix: ']()',
  },
  '|',
  'list',
  'ordered-list',
  'check',
  'outdent',
  'indent',
  '|',
  'quote',
  'line',
  'code',
  'inline-code',
  'insert-before',
  'insert-after',
  '|',
  {
    name: 'upload',
    tip: '上传图片',
  },
  'table',
  '|',
  'undo',
  'redo',
  '|',
  'fullscreen',
  'edit-mode',
  'both',
  'code-theme',
  'content-theme',
  'export',
  'outline',
  'info',
  'help',
];

const showInMobileToolBar = [
  'headings',
  'bold',
  'italic',
  'link',
  'list',
  'line',
  'upload',
  'fullscreen',
];

let vditor: any = null;
let toolBar: any[] = [];
let isFocus = false;

function translateMode(editor: editor_T): 'wysiwyg' | 'sv' | 'ir' {
  if (editor === 'markdown' || editor == 'markdown_realtime_rendering') {
    return 'ir';
  } else if (editor === 'wysiwyg') {
    return 'wysiwyg';
  } else {
    return 'sv';
  }
}

function shortCutKeyHandler(event: KeyboardEvent) {
  const os = getOS();
  if (os === 'Mac OS') {
    if (event.metaKey && event.key === 'Enter') {
      isFocus && emit('shortcutSubmit');
    }
  } else {
    if (event.ctrlKey && event.key === 'Enter') {
      isFocus && emit('shortcutSubmit');
    }
  }
}

async function init(editorMode: editor_T, markdownBody?: string, htmlBody?: string) {
  const { default: Vditor } = await import('vditor');
  if (vditor) {
    vditor.destroy();
  }
  const options: any = {
    placeholder: props.placeholder,
    minHeight: 300,
    toolbar: toolBar,
    cdn: vditorCDN,
    preview: {
      mode: 'both',
      actions: [],
      math: {
        inlineDigit: true,
      },
    },
    input: (value: string) => {
      if (props.onEditorChange) {
        props.onEditorChange(value);
      }
    },
    focus: () => {
      isFocus = true;
    },
    blur: () => {
      isFocus = false;
    },
    value: markdownBody,
    mode: translateMode(editorMode),
    cache: {
      enable: false,
    },
    after: () => {
      if (htmlBody) {
        vditor!.setValue(vditor!.html2md(htmlBody));
      }
    },
  };
  if (props.vditorUploadConfig) {
    options.upload = props.vditorUploadConfig;
  }
  vditor = new Vditor(rootEl.value!, options);
  window.addEventListener('keydown', shortCutKeyHandler);
}

function getText(): string | null {
  let fromDiv: string = translateMode(getMode());
  if (fromDiv === 'sv') {
    fromDiv = 'preview';
  }
  let text = (rootEl.value!.querySelectorAll(`.vditor-${fromDiv}`)[0] as HTMLElement).innerText;
  const hasImg = getHTML().includes('<img ');
  if (hasImg) {
    text += '[图片]';
  }
  return text || null;
}

function getContent() {
  return vditor!.getValue();
}

function getHTML() {
  return vditor!.getHTML();
}

function getMode(): editor_T {
  if (vditor!.getCurrentMode() === 'wysiwyg') {
    return 'wysiwyg';
  } else if (vditor!.getCurrentMode() === 'ir') {
    return 'markdown_realtime_rendering';
  } else {
    return 'markdown_splitview';
  }
}

onMounted(async () => {
  if (!props.isMobile) {
    toolBar = allToolbarItems.slice(0, allToolbarItems.length - 7).concat([
      {
        name: 'more',
        toolbar: allToolbarItems.slice(allToolbarItems.length - 7),
      },
    ]);
  } else {
    const toolBarMore: any[] = [];
    for (const item of allToolbarItems) {
      if (
        showInMobileToolBar.includes(item) ||
        showInMobileToolBar.includes(item.name)
      ) {
        toolBar.push(item);
      } else if (item !== '|') {
        toolBarMore.push(item);
      }
    }
    toolBar.push({
      name: 'more',
      toolbar: toolBarMore,
    });
  }
  init(props.editorMode, props.initialContent || '');
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', shortCutKeyHandler);
});

defineExpose({ init, getText, getContent, getHTML, getMode });
</script>
