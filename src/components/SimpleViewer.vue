<template>
  <div class="simple-viewer">
    <ChafanTiptap
      v-if="editor === 'tiptap'"
      :editable="false"
      :body="body"
      :on-editor-ready="onViewerReady"
    />
    <div v-else id="vditorViewer" />
    <LightboxGroup v-if="contentElem" :container="contentElem" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from '@chafan/vditor';
import LightboxGroup from '@/components/image/LightboxGroup.vue';
import { postProcessViewerDOM, vditorCDN } from '@/common';
import { editor_T } from '@/interfaces';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';

@Component({
  components: { ChafanTiptap, LightboxGroup },
})
export default class SimpleViewer extends Vue {
  @Prop() public readonly body!: string;
  @Prop() public readonly editor: editor_T | undefined;

  private contentElem: HTMLElement | null = null;

  private onViewerReady(contentElem: HTMLElement) {
    postProcessViewerDOM(this.$store.state.main.token, contentElem);
  }

  private mounted() {
    if (this.editor !== 'tiptap') {
      const vditorViewerDiv = this.$el.querySelector('#vditorViewer') as HTMLDivElement;
      Vditor.preview(vditorViewerDiv, this.body, {
        mode: 'light',
        cdn: vditorCDN,
        after: () => {
          this.contentElem = vditorViewerDiv;
          this.onViewerReady(vditorViewerDiv);
        },
      });
    }
  }
}
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.simple-viewer img
  max-height: 100px
  max-width: 100%

.simple-viewer
  font-family: $body-font-family
  font-size: $font-size-root

.simple-viewer h1, .simple-viewer h2, .simple-viewer h3
  border-bottom: none !important
  font-family: $body-font-family
  font-size: $font-size-root
  margin-top: 10px
  margin-bottom: 10px

.simple-viewer p
  margin-bottom: 10px

.simple-viewer .ProseMirror
  padding-left: 0
  padding-right: 0
</style>

<style>
.vditor-reset a {
  text-decoration: none !important;
}
</style>
