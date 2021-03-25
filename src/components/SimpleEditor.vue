<template>
  <div class="simple-editor">
    <SimpleVditor
      v-show="isVditor"
      ref="simpleVditor"
      :initial-value="initialValue"
      :placeholder="placeholder"
    />
    <Tiptap
      :initial-value="initialValue"
      :placeholder="placeholder"
      :comment-mode="true"
      v-show="isTiptap"
      ref="tiptap"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import SimpleVditor from '@/components/editor/SimpleVditor.vue';
import { readUserProfile } from '@/store/main/getters';
import Tiptap from '@/components/editor/Tiptap.vue';
import { commitAddNotification } from '@/store/main/mutations';
import { editor_T } from '@/interfaces';

@Component({
  components: { Tiptap, SimpleVditor },
})
export default class SimpleEditor extends Vue {
  @Prop({ default: '' }) public readonly initialValue!: string;
  @Prop() public readonly placeholder: string | undefined;
  @Prop() public readonly editorProp: editor_T | undefined;
  private isVditor = false;
  private isTiptap = false;

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
    return this.$refs.tiptap as Tiptap;
  }

  private mounted() {
    if (this.editor === 'tiptap') {
      this.isTiptap = true;
    } else {
      this.isVditor = true;
    }
  }

  get content() {
    if (this.isTiptap) {
      return JSON.stringify(this.tiptap.getJSON());
    } else if (this.isVditor) {
      return this.simpleVditor.content;
    }
    return '';
  }

  set content(value: string) {
    if (this.isTiptap) {
      this.tiptap.loadJSON(JSON.parse(value));
    } else if (this.isVditor) {
      this.simpleVditor.content = value;
    }
  }

  public getTextContent() {
    if (this.isTiptap) {
      return this.tiptap.getText();
    } else if (this.isVditor) {
      return this.simpleVditor.getText();
    }
    commitAddNotification(this.$store, {
      content: this.$t('编辑器错误').toString(),
      color: 'error',
    });
    return '';
  }

  public reset() {
    if (this.isVditor) {
      this.simpleVditor.initVditor();
    } else if (this.isTiptap) {
      this.tiptap.reset();
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
