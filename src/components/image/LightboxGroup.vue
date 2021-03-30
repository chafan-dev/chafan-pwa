<template>
  <v-sheet @click="close">
    <template v-for="(imgObject, idx) in imgObjects">
      <v-overlay v-if="imgObject === openedImgObject" :key="idx">
        <v-img :src="imgObject.url" contain max-height="90vh" max-width="90vw" @click="close">
          <template v-slot:placeholder>
            <v-row align="center" class="fill-height ma-0" justify="center">
              <v-progress-circular color="grey lighten-5" indeterminate></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </v-overlay>
    </template>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class LightboxGroup extends Vue {
  @Prop() public readonly container!: HTMLElement;

  private imgObjects: { url: string; showDialog: boolean }[] = [];
  private openedImgObject: { url: string; showDialog: boolean } | null = null;

  public mounted() {
    for (const img of this.container.getElementsByTagName('img')) {
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
