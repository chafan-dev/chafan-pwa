<template>
  <div class="simple-viewer">
    <Tiptap
      ref="tiptapViewer"
      v-if="editor === 'tiptap'"
      :editable="false"
      :initial-value="parsedBody"
    />
    <div ref="vditorViewer" v-else />
    <LightboxGroup ref="lightbox" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from '@chafan/vditor';
import LightboxGroup from '@/components/LightboxGroup.vue';
import { postProcessViewerDOM, vditorCDN } from '@/common';
import { editor_T } from '@/interfaces';
import Tiptap from '@/components/editor/Tiptap.vue';

@Component({
  components: { Tiptap, LightboxGroup },
})
export default class SimpleViewer extends Vue {
  @Prop() public readonly body!: string;
  @Prop() public readonly editor: editor_T | undefined;

  get parsedBody() {
    return JSON.parse(this.body);
  }

  private mounted() {
    if (this.editor !== 'tiptap') {
      Vditor.preview(this.$refs.vditorViewer as HTMLDivElement, this.body, {
        mode: 'light',
        cdn: vditorCDN,
        after: () => {
          const lightbox = this.$refs.lightbox as LightboxGroup;
          lightbox.loadImagesFrom(this.$refs.vditorViewer as HTMLElement);
          postProcessViewerDOM(
            this.$store.state.main.token,
            this.$refs.vditorViewer as HTMLElement
          );
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
</style>

<style>
.vditor-reset a {
  text-decoration: none !important;
}
</style>
