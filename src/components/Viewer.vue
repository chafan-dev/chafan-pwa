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
    <template v-else>
      <div v-if="bodyFormat === 'html'" v-html="sanitizedBody" />
      <div v-else-if="!bodyFormat || bodyFormat === 'markdown'" ref="vditorViewer" />
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
import DOMPurify from 'dompurify';
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
  @Prop() public readonly body!: string;
  @Prop() public readonly bodyFormat: body_format_T | undefined;
  @Prop() public readonly editor!: editor_T;
  public textContent: string | null = null;

  get sanitizedBody() {
    return DOMPurify.sanitize(this.body);
  }

  private onViewerReady(contentElem: HTMLElement) {
    postProcessViewerDOM(this.$store.state.main.token, contentElem);
    this.textContent = contentElem.textContent;
  }

  private mounted() {
    if (this.editor !== 'tiptap') {
      const viewer = this.$refs.viewer as HTMLElement;
      if (this.bodyFormat === 'html') {
        this.$data.contentElem = viewer;
        this.onViewerReady(viewer);
      } else if (!this.bodyFormat || this.bodyFormat === 'markdown') {
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

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.viewer-desktop img
  max-height: 500px

.viewer img
  max-width: 100%

.viewer
  font-family: $body-font-family
  font-size: $font-size-root

.og-card
  border: 1px lightgrey solid
  border-radius: 5px
  padding: 5px
  width: fit-content

.og-card img
  max-width: 500px

.og-card-desc
  padding-top: 5px
</style>

<style scoped>
.vditor-reset a {
  text-decoration: none !important;
}

.vditor-reset {
  padding: 0;
}
</style>
