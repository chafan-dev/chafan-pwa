<template>
  <v-sheet>
    <v-overlay v-for="(imgObject, idx) in imgObjects" :key="idx" :value="overlayModel">
      <img v-click-outside="{ handler: onClickOutside }" :src="imgObject.url" />
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

  protected onClickOutside() {
    this.overlayModel = false;
  }
}
</script>

<style lang="scss" scoped>
.lightbox-wrapper {
  height: 90vh;
  transform: translate3d(0px, 0px, 0px);
}

.lightbox-img {
  position: absolute;
  height: 100%;
  width: 100%;
  left: 50%;
  top: 50%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translate3d(-50%, -50%, 0) scaleX(1);
  transform: translate3d(-50%, -50%, 0) scaleX(1);
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;

  img {
    margin: auto;
    max-width: 100%;
    max-height: 100%;
    vertical-align: center;
  }
}
</style>
