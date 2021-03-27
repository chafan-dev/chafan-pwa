<template>
  <v-sheet @click="close">
    <template v-for="(imgObject, idx) in imgObjects">
      <v-overlay :key="idx" v-if="imgObject === openedImgObject">
        <v-img @click="close" :src="imgObject.url" max-height="90vh" max-width="90vw" contain>
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </v-overlay>
    </template>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class LightboxGroup extends Vue {
  private imgObjects: { url: string; showDialog: boolean }[] = [];
  private openedImgObject: { url: string; showDialog: boolean } | null = null;

  public loadImagesFrom(container: HTMLElement) {
    for (const img of container.getElementsByTagName('img')) {
      const imgObject = {
        url: img.src,
        showDialog: false,
      };
      this.imgObjects.push(imgObject);
      img.onclick = () => {
        this.openedImgObject = imgObject;
      };
      img.style.cursor = 'pointer';
    }
  }

  protected close() {
    this.openedImgObject = null;
  }
}
</script>
