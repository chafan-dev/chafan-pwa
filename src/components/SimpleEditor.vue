<template>
  <div class="simple-editor">
    <ChafanTiptap
      v-if="editor === 'tiptap'"
      ref="tiptap"
      :body="initialValue"
      :comment-mode="true"
      :onMentionedHandles="onMentionedHandles"
      :placeholder="placeholder"
    />
    <LiteVditorCF
      v-else
      ref="simpleVditor"
      :initial-value="initialValue"
      :placeholder="placeholder"
      :showMenu="showMenu"
      :vditorUploadConfig="vditorUploadConfig"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { LiteVditorCF } from 'chafan-vue-editors';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { editor_T } from '@/interfaces';
import { getVditorUploadConfig } from '@/common';
import { readToken } from '@/store/main/getters';

@Component({
  components: { ChafanTiptap, LiteVditorCF },
})
export default class SimpleEditor extends Vue {
  @Prop() public readonly initialValue: string | undefined;
  @Prop() public readonly placeholder: string | undefined;
  @Prop() public readonly editorProp: editor_T | undefined;
  @Prop({ default: false }) public readonly showMenu!: boolean;
  @Prop() private readonly onMentionedHandles: ((handles: string[]) => void) | undefined;

  get simpleVditor() {
    return this.$refs.simpleVditor as any;
  }

  get editor() {
    if (this.editorProp) {
      return this.editorProp;
    }
    return 'tiptap';
  }

  get tiptap() {
    return this.$refs.tiptap as ChafanTiptap;
  }

  get content(): string | null {
    if (this.editor === 'tiptap') {
      return this.tiptap.content;
    } else {
      return this.simpleVditor.content;
    }
  }

  set content(value: string | null) {
    if (value) {
      if (this.editor === 'tiptap') {
        this.tiptap.content = value;
      } else {
        this.simpleVditor.content = value;
      }
    } else {
      if (this.editor === 'tiptap') {
        this.tiptap.reset();
      } else {
        this.simpleVditor.reset();
      }
    }
  }

  get vditorUploadConfig() {
    return getVditorUploadConfig(readToken(this.$store));
  }

  public getTextContent() {
    if (this.editor === 'tiptap') {
      return this.tiptap.getText();
    } else {
      return this.simpleVditor.getText();
    }
  }

  public reset() {
    if (this.editor === 'tiptap') {
      this.tiptap.reset();
    } else {
      this.simpleVditor.initVditor();
    }
  }
}
</script>
