<template>
  <div class="simple-editor">
    <SimpleVditor
      v-show="isVditor"
      ref="simpleVditor"
      :initial-value="initialValue"
      :placeholder="placeholder"
      :showMenu="showMenu"
    />
    <ChafanTiptap
      v-show="isTiptap"
      ref="tiptap"
      :comment-mode="true"
      :initial-value="initialValue"
      :placeholder="placeholder"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import SimpleVditor from '@/components/editor/SimpleVditor.vue';
import { readUserProfile } from '@/store/main/getters';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';
import { commitAddNotification } from '@/store/main/mutations';
import { editor_T } from '@/interfaces';

@Component({
  components: { ChafanTiptap, SimpleVditor },
})
export default class SimpleEditor extends Vue {
  @Prop() public readonly initialValue: string | undefined;
  @Prop() public readonly placeholder: string | undefined;
  @Prop() public readonly editorProp: editor_T | undefined;
  @Prop({ default: false }) public readonly showMenu!: boolean;
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
    return this.$refs.tiptap as ChafanTiptap;
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

  private mounted() {
    if (this.editor === 'tiptap') {
      this.isTiptap = true;
    } else {
      this.isVditor = true;
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
