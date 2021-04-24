<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import Vditor from '@chafan/vditor';
import { vditorCDN, vditorUploadConfig } from '@/common';
import { env } from '@/env';
import { editor_T } from '@/interfaces';

@Component
export default class VditorComponent extends Vue {
  @Prop() public readonly onEditorChange!: (string) => void;

  private allToolbarItems: any[] = [
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

  private showInMobileToolBar = [
    'headings',
    'bold',
    'italic',
    'link',
    'list',
    'line',
    'upload',
    'fullscreen',
  ];
  private vditor: Vditor | null = null;

  private toolBar: any[] = [];

  get token() {
    return this.$store.state.main.token;
  }

  public mounted() {
    if (this.$vuetify.breakpoint.mdAndUp) {
      this.toolBar = this.allToolbarItems.slice(0, this.allToolbarItems.length - 7).concat([
        {
          name: 'more',
          toolbar: this.allToolbarItems.slice(this.allToolbarItems.length - 7),
        },
      ]);
    } else {
      const toolBarMore: any[] = [];
      for (const item of this.allToolbarItems) {
        if (
          this.showInMobileToolBar.includes(item) ||
          this.showInMobileToolBar.includes(item.name)
        ) {
          this.toolBar.push(item);
        } else if (item !== '|') {
          toolBarMore.push(item);
        }
      }
      this.toolBar.push({
        name: 'more',
        toolbar: toolBarMore,
      });
    }
  }

  public init(editorMode: editor_T, markdownBody?: string, htmlBody?: string) {
    if (this.vditor) {
      this.vditor.destroy();
    }
    this.vditor = new Vditor(this.$el as HTMLElement, {
      minHeight: 300,
      toolbar: this.toolBar,
      debugger: env === 'development',
      cdn: vditorCDN,
      preview: {
        mode: 'both',
        actions: [],
      },
      input: (value: string) => {
        this.onEditorChange(value);
      },
      upload: vditorUploadConfig(this.token),
      value: markdownBody,
      mode: this.translateMode(editorMode),
      cache: {
        enable: false,
      },
      after: () => {
        if (htmlBody) {
          this.vditor!.setValue(this.vditor!.html2md(htmlBody));
        }
      },
    });
  }

  public getText(): string | null {
    return (
      this.$el.querySelectorAll(`.vditor-${this.translateMode(this.getMode())}`)[0].textContent ||
      null
    );
  }

  public getContent() {
    return this.vditor!.getValue();
  }

  public getHTML() {
    return this.vditor!.getHTML();
  }

  public getMode() {
    if (this.vditor!.getCurrentMode() === 'wysiwyg') {
      return 'wysiwyg';
    } else if (this.vditor!.getCurrentMode() === 'ir') {
      return 'markdown_realtime_rendering';
    } else {
      return 'markdown_splitview';
    }
  }

  private translateMode(editor: editor_T): 'wysiwyg' | 'sv' | 'ir' {
    if (editor === 'markdown' || editor == 'markdown_realtime_rendering') {
      return 'ir';
    } else if (editor === 'wysiwyg') {
      return 'wysiwyg';
    } else {
      return 'sv';
    }
  }
}
</script>

<style lang="scss">
.vditor {
  --textarea-background-color: white;
}

.vditor-sv {
  font-family: mononoki, Consolas, Liberation Mono, Menlo, Courier, monospace, Apple Color Emoji,
    Segoe UI Emoji, Noto Color Emoji, Segoe UI Symbol, Android Emoji, EmojiSymbols;
}
</style>
