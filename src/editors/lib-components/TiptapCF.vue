<template>
  <div ref="rootEl" class="tiptap-editor">
    <div
      v-if="editor"
      :class="{ 'editor-border editor-border-gray-300 editor-rounded editor-border-solid': editable }"
    >
      <template v-if="editable">
        <Dialog v-if="showImageDialog" @cancel="showImageDialog = false" @confirm="insertImage">
          <template v-slot:title>
            <h1>添加图片</h1>
          </template>
          <template v-slot:content>
            <input
              v-model="insertImageUrl"
              class="editor-shadow editor-appearance-none editor-border editor-rounded editor-w-full editor-py-2 editor-px-3 editor-text-gray-700 editor-leading-tight editor-outline-none editor-shadow-outline"
              placeholder="图片 URL"
              type="text"
            />
          </template>
        </Dialog>

        <Dialog v-if="showVideoDialog" @cancel="showVideoDialog = false" @confirm="insertVideo">
          <template v-slot:title>
            <h1>添加视频</h1>
          </template>
          <template v-slot:content>
            <div class="editor-space-y-3">
              <input
                v-model="youtubeUrl"
                class="editor-shadow editor-appearance-none editor-border editor-rounded editor-w-full editor-py-2 editor-pr-0 editor-text-gray-700 editor-leading-tight editor-outline-none editor-shadow-outline"
                placeholder="YouTube URL"
                type="text"
              />
              <input
                v-model="bilibiliEmbedCode"
                class="editor-shadow editor-appearance-none editor-border editor-rounded editor-w-full editor-py-2 editor-pr-0 editor-text-gray-700 editor-leading-tight editor-outline-none editor-shadow-outline"
                placeholder="哔哩哔哩 Embed Code"
                type="text"
              />
            </div>
          </template>
        </Dialog>

        <Dialog v-if="showLinkDialog" @cancel="showLinkDialog = false" @confirm="insertLink">
          <template v-slot:title>
            <h1>插入超链接</h1>
          </template>
          <template v-slot:content>
            <div class="editor-space-y-3">
              <input
                v-model="linkToInsert"
                class="editor-shadow editor-appearance-none editor-border editor-rounded editor-w-full editor-py-2 editor-pr-0 editor-text-gray-700 editor-leading-tight editor-outline-none editor-shadow-outline"
                placeholder="https://..."
                type="text"
              />
            </div>
          </template>
        </Dialog>

        <!-- Fixed menu -->
        <div
          v-if="!commentMode"
          class="editor-flex editor-space-x-0\.5 editor-p-1 editor-border-0 editor-border-b editor-border-solid editor-border-gray-300"
        >
          <Btn :active="editor.isActive('bold')" @click="editor.chain().focus().toggleBold().run()">
            <BoldIcon />
          </Btn>
          <Btn
            :active="editor.isActive('italic')"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <ItalicIcon />
          </Btn>
          <Btn
            :active="editor.isActive('underline')"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <UnderlineIcon />
          </Btn>
          <Btn
            :active="editor.isActive('strike')"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <StrikethroughIcon />
          </Btn>
          <Btn
            :active="editor.isActive('codeBlock')"
            @click="editor.chain().focus().toggleCodeBlock().run()"
          >
            <CodeBlockIcon />
          </Btn>
          <Btn :active="editor.isActive('codeBlock')" @click="detectLink({ editor })">
            <LinkIcon />
          </Btn>
          <Btn @click="showImageDialog = true">
            <ImageIcon />
          </Btn>
          <Btn @click="showVideoDialog = true">
            <VideoIcon />
          </Btn>
        </div>
        <BubbleMenu v-if="commentMode" :editor="editor" class="editor-space-x-0\.5">
          <Btn
            :active="editor.isActive('bold')"
            color="dark"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <BoldIcon />
          </Btn>
          <Btn
            :active="editor.isActive('italic')"
            color="dark"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <ItalicIcon />
          </Btn>
          <Btn
            :active="editor.isActive('underline')"
            color="dark"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <UnderlineIcon />
          </Btn>
          <Btn
            :active="editor.isActive('strike')"
            color="dark"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <StrikethroughIcon />
          </Btn>
        </BubbleMenu>
      </template>

      <EditorContent
        :class="{
          'editor-p-2': editable,
          'editable-comment': commentMode && editable,
          'editable-non-comment': !commentMode && editable,
        }"
        :editor="editor"
        class="editor__content"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { Extension, mergeAttributes } from '@tiptap/core';
import { BubbleMenu, Editor, EditorContent, VueRenderer } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Link, pasteRegex } from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Mention from '@tiptap/extension-mention';
import { lowlight } from 'lowlight';
import tippy from 'tippy.js';
import * as _ from 'lodash';

import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import c from 'highlight.js/lib/languages/c';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import go from 'highlight.js/lib/languages/go';
import ruby from 'highlight.js/lib/languages/ruby';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import php from 'highlight.js/lib/languages/php';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import getYouTubeID from 'get-youtube-id';

import '../styles/main.css';

import Btn from '../widgets/Btn.vue';
import ImageIcon from '../widgets/ImageIcon.vue';
import VideoIcon from '../widgets/VideoIcon.vue';
import CodeBlockIcon from '../widgets/CodeBlockIcon.vue';
import BoldIcon from '../widgets/BoldIcon.vue';
import ItalicIcon from '../widgets/ItalicIcon.vue';
import StrikethroughIcon from '../widgets/StrikethroughIcon.vue';
import Dialog from '../widgets/Dialog.vue';
import UnderlineIcon from '../widgets/UnderlineIcon.vue';
import LinkIcon from '../widgets/LinkIcon.vue';
import ImageUpload from '../extensions/ImageUpload';
import Iframe from '../extensions/Iframe';
import MentionList from '../extensions/MentionList.vue';

lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('css', css);
lowlight.registerLanguage('c', c);
lowlight.registerLanguage('java', java);
lowlight.registerLanguage('python', python);
lowlight.registerLanguage('cpp', cpp);
lowlight.registerLanguage('csharp', csharp);
lowlight.registerLanguage('json', json);
lowlight.registerLanguage('sql', sql);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('go', go);
lowlight.registerLanguage('ruby', ruby);
lowlight.registerLanguage('bash', bash);
lowlight.registerLanguage('xml', xml);
lowlight.registerLanguage('php', php);
lowlight.registerLanguage('rust', rust);
lowlight.registerLanguage('swift', swift);
lowlight.registerLanguage('yaml', yaml);
lowlight.registerLanguage('markdown', markdown);

const EMPTY_DOCUMENT = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

const props = withDefaults(
  defineProps<{
    onEditorChange?: (body: string) => void;
    editable?: boolean;
    placeholder?: string;
    commentMode?: boolean;
    searchUsers?: (query: string) => any[];
    userLabel?: (userItem: any) => string;
    userHref?: (userItem: any) => string;
    bodyFormat?: 'html' | 'tiptap_json';
    body?: string;
    upload?: (blob: Blob) => Promise<string>;
    onEditorReady?: (contentElem: HTMLElement) => void;
  }>(),
  {
    editable: true,
    commentMode: false,
  }
);

const emit = defineEmits<{
  (e: 'shortcutSubmit'): void;
}>();

const rootEl = ref<HTMLElement | null>(null);
const editor = ref<Editor | null>(null);
const showVideoDialog = ref(false);
const showImageDialog = ref(false);
const showLinkDialog = ref(false);
const linkToInsert = ref<string | null>(null);
const insertImageUrl = ref('');
const youtubeUrl = ref('');
const bilibiliEmbedCode = ref('');

const jsonBody = computed(() => {
  if (!props.body) return undefined;
  if (!props.bodyFormat || props.bodyFormat === 'tiptap_json') {
    return JSON.parse(props.body);
  }
  return undefined;
});

function insertImage() {
  addImage(insertImageUrl.value);
  insertImageUrl.value = '';
  showImageDialog.value = false;
}

function insertVideo() {
  let url = '';
  if (youtubeUrl.value) {
    const youtubeId = getYouTubeID(youtubeUrl.value);
    if (youtubeId) {
      url = `https://www.youtube.com/embed/${youtubeId}`;
    }
  } else if (bilibiliEmbedCode.value) {
    const bilibiliEmbedDOM = new DOMParser().parseFromString(bilibiliEmbedCode.value, 'text/html');
    const iframe = bilibiliEmbedDOM.getElementsByTagName('iframe')[0];
    if (iframe) {
      const iframeUrl = new URL(iframe.src);
      if (iframeUrl.hostname === 'player.bilibili.com') {
        url = iframeUrl.href;
      }
    }
  }
  if (!url) return;
  addVideo(url);
  showVideoDialog.value = false;
  youtubeUrl.value = '';
  bilibiliEmbedCode.value = '';
}

function insertLink() {
  if (linkToInsert.value && pasteRegex.test(linkToInsert.value)) {
    editor.value?.chain().focus().toggleLink({ href: linkToInsert.value }).run();
    linkToInsert.value = null;
    showLinkDialog.value = false;
  }
}

function detectLink({ editor: ed }: { editor: any }) {
  const firstChildInSelection = ed.state.selection.content().content.firstChild;
  if (firstChildInSelection) {
    const text = firstChildInSelection.textContent.trim();
    if (pasteRegex.test(text)) {
      return ed.commands.setLink({ href: text });
    }
  }
  showLinkDialog.value = true;
  return true;
}

onMounted(() => {
  const userLabel = props.userLabel ?? ((u: any) => String(u));
  const userHref = props.userHref ?? (() => '#');

  const SubmitShortCut = Extension.create({
    name: 'submitShortCut',
    addKeyboardShortcuts: () => ({
      'Mod-Enter': () => {
        emit('shortcutSubmit');
        return true;
      },
    }),
  });

  editor.value = new Editor({
    onCreate: () => {
      if (props.onEditorReady && rootEl.value) {
        const editorContentElem = rootEl.value.getElementsByClassName(
          'editor__content'
        )[0] as HTMLElement;
        if (editorContentElem) {
          props.onEditorReady(editorContentElem);
        }
      }
    },
    content: jsonBody.value,
    extensions: [
      Underline,
      Link.extend({
        addKeyboardShortcuts: () => ({
          'Mod-k': detectLink,
        }),
      }),
      Iframe,
      Placeholder.configure({
        emptyEditorClass: 'is-editor-empty',
        emptyNodeClass: 'is-empty',
        placeholder: props.placeholder || '',
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      ImageUpload.configure({ uploadFunc: props.upload }),
      CodeBlockLowlight.configure({ lowlight }),
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: {
          items: props.searchUsers as any,
          render: () => {
            let component: VueRenderer;
            let popup: any;
            return {
              onStart: (suggestionProps: any) => {
                suggestionProps.userLabel = userLabel;
                component = new VueRenderer(MentionList, {
                  props: suggestionProps,
                  editor: editor.value!,
                });
                popup = tippy(document.body, {
                  getReferenceClientRect: suggestionProps.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                });
              },
              onUpdate(suggestionProps: any) {
                component.updateProps(suggestionProps);
                popup[0].setProps({ getReferenceClientRect: suggestionProps.clientRect });
              },
              onKeyDown(suggestionProps: any) {
                return component.ref?.onKeyDown(suggestionProps);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }).extend({
        renderHTML({ node, HTMLAttributes }) {
          return [
            'a',
            mergeAttributes(mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), {
              href: userHref(node.attrs.id),
            }),
            '@' + userLabel(node.attrs.id),
          ];
        },
        renderText({ node }) {
          return '@' + userLabel(node.attrs.id);
        },
      }),
      StarterKit,
      SubmitShortCut,
    ],
    onUpdate: () => {
      if (props.onEditorChange) {
        props.onEditorChange(getText());
      }
    },
    editable: props.editable,
  });

  if (props.body) {
    if (!props.bodyFormat || props.bodyFormat === 'tiptap_json') {
      loadJSON(JSON.parse(props.body));
    } else if (props.bodyFormat === 'html') {
      loadHTML(props.body);
    }
  }
});

onBeforeUnmount(() => {
  editor.value?.destroy();
});

function loadHTML(htmlBody: string) {
  editor.value?.commands.setContent(htmlBody);
}

function getText(): string {
  if (!rootEl.value) return '';
  let text = (rootEl.value.querySelector('.editor__content')! as HTMLElement).innerText;
  const hasImg = getHTML().includes('<img ');
  if (hasImg) text += '[图片]';
  return text || '';
}

function getJSON(): object | null {
  if (!editor.value) return null;
  const json = editor.value.getJSON();
  if (_.isEqual(json, EMPTY_DOCUMENT)) return null;
  return json;
}

function loadJSON(object: any) {
  editor.value?.commands.setContent(object);
}

function getHTML(): string {
  return editor.value?.getHTML() ?? '';
}

function addImage(url: string) {
  editor.value?.chain().focus().setImage({ src: url }).run();
}

function addVideo(url: string) {
  editor.value?.chain().focus().setIframe({ src: url, height: 315, width: 500 }).run();
}

function reset() {
  editor.value?.commands.clearContent();
}

defineExpose({ loadHTML, getText, getJSON, loadJSON, getHTML, addImage, addVideo, reset });
</script>

<style lang="scss">
$color-black: #000;
$color-white: #fff;
$color-grey: #ddd;
$body-font-family: 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'PingFang SC',
  sans-serif, 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei';
$mono-font-family: mononoki, Consolas, Liberation Mono, Courier, monospace;

.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  p {
    margin: 0;
  }
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #ced4da;
  pointer-events: none;
  height: 0;
}

.editor {
  &__content {
    overflow-wrap: break-word;
    word-break: break-all;
    font-family: $body-font-family;

    * {
      line-height: 1.5rem;
      caret-color: currentcolor;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: rgba($color-grey, 0.3);
      color: $color-black;
      overflow-x: auto;

      code {
        display: block;
        font-family: $mono-font-family;
      }
    }

    p code {
      padding: 0.2rem 0.4rem;
      border-radius: 5px;
      background: rgba($color-grey, 0.3);
      color: $color-black;
      font-family: $mono-font-family;
    }

    ul,
    ol {
      padding-left: 1rem;
      margin-top: 0;
    }

    li > p,
    li > ol,
    li > ul {
      margin: 0;
    }

    a {
      text-decoration: none;
      color: #1976d2;
    }

    blockquote {
      border-left: 3px solid rgba($color-black, 0.1);
      color: rgba($color-black, 0.8);
      padding-left: 0.8rem;
      font-style: italic;

      p {
        margin-bottom: 0.25rem;
      }
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td,
      th {
        min-width: 1em;
        border: 2px solid $color-grey;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;

        > * {
          margin-bottom: 0;
        }
      }

      th {
        font-weight: bold;
        text-align: left;
      }
    }
  }
}

.editable-comment .ProseMirror {
  min-height: 5rem;
}

.editable-non-comment .ProseMirror {
  min-height: 30rem;
}

.ProseMirror-focused.ProseMirror-focused {
  outline: none;
}

.mention {
  font-family: $body-font-family;
  text-decoration: none;
  color: #1976d2;
}
</style>
