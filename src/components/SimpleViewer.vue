<template>
    <div class="vditor-viewer simple-viewer" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from '@chafan/vditor';
import { vditorCDN } from '@/common';

@Component
export default class Viewer extends Vue {
    @Prop() public readonly body!: string;

    private mounted() {
        Vditor.preview(
            this.$el as HTMLDivElement,
            this.body,
            {
                mode: 'light',
                cdn: vditorCDN,

            },
        );
    }
}
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

img
    max-height: 100px

.vditor-viewer
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