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
