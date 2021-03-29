<template>
  <div ref="viewer" class="viewer" :class="{ 'viewer-desktop': $vuetify.breakpoint.mdAndUp }">
    <template v-if="editor === 'tiptap'">
      <ChafanTiptap :body="body" :bodyFormat="bodyFormat" :editable="false" />
    </template>
    <template v-else>
      <div v-html="sanitizedBody" v-if="bodyFormat === 'html'" />
      <div ref="vditorViewer" v-else-if="!bodyFormat || bodyFormat === 'markdown'" />
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
})
export default class Viewer extends Vue {
  @Prop() public readonly body!: string;
  @Prop() public readonly bodyFormat: body_format_T | undefined;
  @Prop() public readonly editor!: editor_T;

  private contentElem: HTMLElement | null = null;

  get sanitizedBody() {
    return DOMPurify.sanitize(this.body);
  }

  private mounted() {
    if (this.editor !== 'tiptap') {
      const viewer = this.$refs.viewer as HTMLElement;
      if (this.bodyFormat === 'html') {
        this.contentElem = viewer;
        postProcessViewerDOM(this.$store.state.main.token, viewer);
      } else if (!this.bodyFormat || this.bodyFormat === 'markdown') {
        Vditor.preview(this.$refs.vditorViewer as HTMLDivElement, this.body, {
          mode: 'light',
          cdn: vditorCDN,
          after: () => {
            this.contentElem = viewer;
            postProcessViewerDOM(this.$store.state.main.token, viewer);
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
</style>

<style scoped>
.vditor-reset a {
  text-decoration: none !important;
}
</style>
