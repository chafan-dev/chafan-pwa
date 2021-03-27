<template>
  <v-sheet @click="close">
    <v-overlay v-for="(imgObject, idx) in imgObjects" :key="idx" v-model="overlayModel">
      <v-img @click="close" :src="imgObject.url" max-height="90vh" max-width="90vw" contain />
    </v-overlay>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class LightboxGroup extends Vue {
  protected overlayModel = false;
  private imgObjects: { url: string; showDialog: boolean }[] = [];

  public loadImagesFrom(container: HTMLElement) {
    for (const img of container.getElementsByTagName('img')) {
      const imgObject = {
        url: img.src,
        showDialog: false,
      };
      this.imgObjects.push(imgObject);
      img.onclick = () => {
        this.overlayModel = true;
      };
      img.style.cursor = 'pointer';
    }
  }

  protected close() {
    this.overlayModel = false;
  }
}
</script>
