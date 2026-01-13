<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import Vditor from 'vditor';
import { vditorCDN, editor_T, getOS } from '../common';

// Emits:
// - shortcutSubmit: ctrl-Enter or cmd-Enter
@Component
export default class VditorCF extends Vue {
  @Prop() public readonly onEditorChange: ((value: string) => void) | undefined;
  @Prop({ default: undefined }) public readonly vditorUploadConfig: any;
  @Prop({ default: false }) public readonly isMobile!: boolean;
  @Prop() public readonly initialContent: string | undefined;
  @Prop({ default: 'wysiwyg' }) public readonly editorMode!: editor_T;
  @Prop() public readonly placeholder: string | undefined;

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

  private isFocus: boolean = false;

  public mounted() {
    if (!this.isMobile) {
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
    this.init(this.editorMode, this.initialContent || '');
  }

  public init(editorMode: editor_T, markdownBody?: string, htmlBody?: string) {
    if (this.vditor) {
      this.vditor.destroy();
    }
    const options: IOptions = {
      placeholder: this.placeholder,
      minHeight: 300,
      toolbar: this.toolBar,
      cdn: vditorCDN,
      preview: {
        mode: 'both',
        actions: [],
        math: {
          inlineDigit: true,
        },
      },
      input: (value: string) => {
        if (this.onEditorChange) {
          this.onEditorChange(value);
        }
      },
      focus: () => {
        this.isFocus = true;
      },
      blur: () => {
        this.isFocus = false;
      },
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
    };
    if (this.vditorUploadConfig) {
      options.upload = this.vditorUploadConfig;
    }
    this.vditor = new Vditor(this.$el as HTMLElement, options);
    window.addEventListener('keydown', this.shortCutKeyHandler);
  }

  public beforeDestroy() {
    window.removeEventListener('keydown', this.shortCutKeyHandler);
  }

  private shortCutKeyHandler(event: KeyboardEvent) {
    const os = getOS();
    if (os === 'Mac OS') {
      if (event.metaKey && event.key === 'Enter') {
        this.isFocus && this.$emit('shortcutSubmit');
      }
    } else {
      if (event.ctrlKey && event.key === 'Enter') {
        this.isFocus && this.$emit('shortcutSubmit');
      }
    }
  }

  public getText(): string | null {
    let fromDiv: string = this.translateMode(this.getMode());
    if (fromDiv === 'sv') {
      fromDiv = 'preview';
    }
    let text = (this.$el.querySelectorAll(`.vditor-${fromDiv}`)[0] as HTMLElement).innerText;
    const hasImg = this.getHTML().includes('<img ');
    if (hasImg) {
      text += '[图片]';
    }
    return text || null;
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
