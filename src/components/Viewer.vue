<template>
  <div ref="vditorViewer" :class="{ 'vditor-viewer-desktop': $vuetify.breakpoint.mdAndUp }">
    <div class="vditor-viewer" v-html="sanitizedBody" v-if="bodyFormat === 'html'" />
    <div class="vditor-viewer" v-if="bodyFormat === 'markdown'" />
    <LightboxGroup ref="lightbox" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from '@chafan/vditor';
import LightboxGroup from '@/components/LightboxGroup.vue';
import { vditorCDN } from '@/common';
import DOMPurify from 'dompurify';

@Component({
  components: { LightboxGroup },
})
export default class Viewer extends Vue {
  @Prop() public readonly body!: string;
  @Prop() public readonly bodyFormat!: 'markdown' | 'html';

  get sanitizedBody() {
    return DOMPurify.sanitize(this.body);
  }

  private mounted() {
    if (this.bodyFormat === 'html') {
      const lightbox = this.$refs.lightbox as LightboxGroup;
      lightbox.loadImagesFrom(this.$refs.vditorViewer as HTMLElement);
    } else if (this.bodyFormat === 'markdown') {
      Vditor.preview(this.$el as HTMLDivElement, this.body, {
        mode: 'light',
        cdn: vditorCDN,
        after: () => {
          const lightbox = this.$refs.lightbox as LightboxGroup;
          lightbox.loadImagesFrom(this.$refs.vditorViewer as HTMLElement);
        },
      });
    }
  }
}
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.vditor-viewer-desktop img
    max-height: 500px

.vditor-viewer img
  max-width: 100%

.vditor-viewer
    font-family: $body-font-family
    font-size: $font-size-root
</style>

<style scoped>
.vditor-reset a {
  text-decoration: none !important;
}
</style>
