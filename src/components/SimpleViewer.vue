<template>
  <div>
    <div ref="vditorViewer" class="simple-viewer" />
    <LightboxGroup ref="lightbox" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from '@chafan/vditor';
import LightboxGroup from '@/components/LightboxGroup.vue';
import { vditorCDN } from '@/common';

@Component({
  components: { LightboxGroup },
})
export default class Viewer extends Vue {
  @Prop() public readonly body!: string;

  private mounted() {
    Vditor.preview(this.$refs.vditorViewer as HTMLDivElement, this.body, {
      mode: 'light',
      cdn: vditorCDN,
      after: () => {
        const lightbox = this.$refs.lightbox as LightboxGroup;
        lightbox.loadImagesFrom(this.$refs.vditorViewer as HTMLElement);
      },
    });
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
