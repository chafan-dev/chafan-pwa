<template>
  <div :class="{ 'vditor-without-menu': !showMenu }" class="simple-vditor" />
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

  public getText() {
    return this.$el.getElementsByClassName('vditor-wysiwyg')[0].textContent || '';
  }

  public reset() {
    this.initVditor();
  }

  private mounted() {
    this.initVditor();
  }
}
</script>
