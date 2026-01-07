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

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ImgObject {
  url: string;
  showDialog: boolean;
}

const props = defineProps<{
  container: HTMLElement;
}>();

const imgObjects = ref<ImgObject[]>([]);
const openedImgObject = ref<ImgObject | null>(null);

onMounted(() => {
  for (const img of props.container.getElementsByTagName('img')) {
    const imgObject: ImgObject = {
      url: img.src,
      showDialog: false,
    };
    imgObjects.value.push(imgObject);
    img.onclick = () => {
      openedImgObject.value = imgObject;
    };
    img.style.cursor = 'pointer';
  }
});

function close() {
  openedImgObject.value = null;
}
</script>
