<template>
  <div class="simple-vditor" :class="{ 'vditor-without-menu': !showMenu }" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { env } from '@/env';

import Vditor from '@chafan/vditor';
import { vditorCDN, vditorUploadConfig } from '@/common';

@Component
export default class SimpleVditor extends Vue {
  @Prop() public readonly initialValue: string | undefined;
  @Prop() public readonly placeholder: string | undefined;
  @Prop({ default: false }) public readonly showMenu!: boolean;

  private vditor: Vditor | null = null;

  public initVditor() {
    if (this.vditor !== null) {
      this.vditor.destroy();
    }
    this.vditor = new Vditor(this.$el as HTMLElement, {
      debugger: env === 'development',
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
      upload: vditorUploadConfig(this.$store.state.main.token),
      counter: {
        enable: false,
      },
    });
  }

  private mounted() {
    this.initVditor();
  }

  get content() {
    return this.vditor?.getValue() || '';
  }

  set content(value: string) {
    if (this.vditor) {
      this.vditor.setValue(value);
    }
  }

  public getText() {
    return this.$el.getElementsByClassName('vditor-wysiwyg')[0].textContent || '';
  }

  public reset() {
    this.initVditor();
  }
}
</script>

<style>
.simple-vditor .vditor-reset {
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.vditor-without-menu .vditor-toolbar {
  height: 0px;
  border-bottom: 0px;
}

.simple-vditor h1::before,
.simple-vditor h2::before,
.simple-vditor h3::before {
  content: '';
}
</style>
