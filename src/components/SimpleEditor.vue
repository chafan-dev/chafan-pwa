<template>
  <div class="simple-editor">
    <SimpleVditor
      v-if="topLevelEditor === 'vditor'"
      ref="simpleVditor"
      :initial-value="initialValue"
      :placeholder="placeholder"
    />
    <Tiptap
      :initial-value="initialValue"
      :comment-mode="true"
      v-if="topLevelEditor === 'tiptap'"
      ref="tiptap"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import SimpleVditor from '@/components/editor/SimpleVditor.vue';
import { readUserProfile } from '@/store/main/getters';
import Tiptap from '@/components/editor/Tiptap.vue';

@Component({
  components: { Tiptap, SimpleVditor },
})
export default class SimpleEditor extends Vue {
  @Prop({ default: '' }) public readonly initialValue!: string;
  @Prop() public readonly placeholder: string | undefined;
  private topLevelEditor: 'vditor' | 'tiptap' | null = null;

  get editor() {
    return readUserProfile(this.$store)!.default_editor_mode;
  }

  get simpleVditor() {
    return this.$refs.simpleVditor as SimpleVditor;
  }

  get tiptap() {
    return this.$refs.tiptap as Tiptap;
  }

  private mounted() {
    if (this.editor === 'tiptap') {
      this.topLevelEditor = 'tiptap';
    } else {
      this.topLevelEditor = 'vditor';
      this.simpleVditor.initVditor();
    }
  }

  get content() {
    if (this.topLevelEditor === 'tiptap') {
      return JSON.stringify(this.tiptap.getJSON());
    } else if (this.topLevelEditor === 'vditor') {
      return this.simpleVditor.content;
    }
    return '';
  }

  set content(value: string) {
    if (this.topLevelEditor === 'tiptap') {
      this.tiptap.loadJSON(JSON.parse(value));
    } else if (this.topLevelEditor === 'vditor') {
      this.simpleVditor.content = value;
    }
  }

  public reset() {
    if (this.topLevelEditor === 'vditor') {
      this.simpleVditor.initVditor();
    } else if (this.topLevelEditor === 'tiptap') {
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
