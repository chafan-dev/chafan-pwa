<template>
    <span>
        <v-dialog v-model="imgObject.showDialog" v-for="(imgObject, idx) in imgObjects" :key="idx">
            <v-img :src="imgObject.url" />
        </v-dialog>
    </span>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class LightboxGroup extends Vue {
    private imgObjects: {url: string, showDialog: boolean}[] = [];

    public loadImagesFrom(container: HTMLElement) {
        for (const img of container.getElementsByTagName("img")) {
            const imgObject = {
                url: img.src,
                showDialog: false,
            };
            this.imgObjects.push(imgObject);
            img.onclick = () => {
                imgObject.showDialog = true;
            };
            img.style.cursor = 'pointer';
        }
    }
}
</script>
