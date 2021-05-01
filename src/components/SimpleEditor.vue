<template>
  <div class="simple-editor">
    <ChafanTiptap
      v-if="editor === 'tiptap'"
      ref="tiptap"
      :comment-mode="true"
      :body="initialValue"
      :placeholder="placeholder"
    />
    <SimpleVditor
      v-else
      ref="simpleVditor"
      :initial-value="initialValue"
      :placeholder="placeholder"
      :showMenu="showMenu"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import SimpleVditor from '@/components/editor/SimpleVditor.vue';
import { readUserProfile } from '@/store/main/getters';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { editor_T } from '@/interfaces';

@Component({
  components: { ChafanTiptap, SimpleVditor },
})
export default class SimpleEditor extends Vue {
  @Prop() public readonly initialValue: string | undefined;
  @Prop() public readonly placeholder: string | undefined;
  @Prop() public readonly editorProp: editor_T | undefined;
  @Prop({ default: false }) public readonly showMenu!: boolean;

  get simpleVditor() {
    return this.$refs.simpleVditor as SimpleVditor;
  }

  get editor() {
    if (this.editorProp) {
      return this.editorProp;
    }
    return readUserProfile(this.$store)!.default_editor_mode;
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

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.simple-editor h1, .simple-editor h2, .simple-editor h3
  border-bottom: none !important
  font-family: $body-font-family
  font-size: $font-size-root
  margin-top: 10px
  margin-bottom: 10px

.simple-editor img
  max-height: 100px

.simple-editor p
  margin-bottom: 10px
</style>
