<template>
  <div :class="{ 'vditor-without-menu': !showMenu }" class="lite-vditor" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import Vditor from 'vditor';
import { vditorCDN } from '../common';

@Component
export default class SimpleVditor extends Vue {
  @Prop() public readonly initialValue: string | undefined;
  @Prop() public readonly placeholder: string | undefined;
  @Prop({ default: false }) public readonly showMenu!: boolean;
  @Prop() public readonly vditorUploadConfig!: any;

  private vditor: Vditor | null = null;

  get content() {
    return this.vditor?.getValue() || '';
  }

  set content(value: string) {
    if (this.vditor) {
      this.vditor.setValue(value);
    }
  }

  public initVditor() {
    if (this.vditor !== null) {
      this.vditor.destroy();
    }
    this.vditor = new Vditor(this.$el as HTMLElement, {
      cdn: vditorCDN,
      placeholder: this.placeholder ? this.placeholder : '',
      value: this.initialValue,
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
      upload: this.vditorUploadConfig,
      counter: {
        enable: false,
      },
    });
  }

  public getText() {
    let text = (this.$el.getElementsByClassName('vditor-wysiwyg')[0] as HTMLElement).innerText;
    const hasImg = this.getHTML().includes('<img ');
    if (hasImg) {
      text += '[图片]';
    }
    return text || '';
  }

  public getHTML() {
    return this.vditor!.getHTML();
  }

  public reset() {
    this.initVditor();
  }

  mounted() {
    this.initVditor();
  }
}
</script>

<style>
.lite-vditor .vditor-reset {
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.lite-vditor h1::before,
.lite-vditor h2::before,
.lite-vditor h3::before {
  content: '';
}

.vditor-without-menu .vditor-toolbar {
  height: 0px;
  border-bottom: 0px;
}
</style>
