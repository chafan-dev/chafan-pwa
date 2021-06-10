<template>
  <div ref="viewer" :class="{ 'viewer-desktop': $vuetify.breakpoint.mdAndUp }" class="viewer">
    <template v-if="editor === 'tiptap'">
      <ChafanTiptap
        :body="body"
        :bodyFormat="bodyFormat"
        :editable="false"
        :on-editor-ready="onViewerReady"
      />
    </template>
    <template v-else-if="!bodyFormat || bodyFormat === 'markdown'">
      <div ref="vditorViewer" />
    </template>
    <template v-if="contentElem">
      <LightboxGroup :container="contentElem" />
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from '@chafan/vditor';
import LightboxGroup from '@/components/image/LightboxGroup.vue';
import { vditorCDN, postProcessViewerDOM } from '@/common';
import { body_format_T, editor_T } from '@/interfaces';
import ChafanTiptap from '@/components/editor/ChafanTiptap.vue';

@Component({
  components: { ChafanTiptap, LightboxGroup },
  data: function () {
    return {
      contentElem: null,
    };
  },
})
export default class Viewer extends Vue {
  @Prop() private readonly body!: string;
  @Prop() private readonly bodyFormat: body_format_T | undefined;
  @Prop() private readonly editor!: editor_T;
  public textContent: string | null = null;

  private onViewerReady(contentElem: HTMLElement) {
    postProcessViewerDOM(this.$store.state.main.token, contentElem);
    this.textContent = contentElem.innerText;
  }

  private mounted() {
    if (this.editor !== 'tiptap') {
      const viewer = this.$refs.viewer as HTMLElement;
      if (!this.bodyFormat || this.bodyFormat === 'markdown') {
        Vditor.preview(this.$refs.vditorViewer as HTMLDivElement, this.body, {
          mode: 'light',
          cdn: vditorCDN,
          after: () => {
            this.$data.contentElem = viewer;
            this.onViewerReady(viewer);
          },
        });
      }
    }
  }
}
</script>
