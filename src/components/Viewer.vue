<template>
    <div class="vditor-viewer" />
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

.vditor-viewer img
    max-height: 500px

.vditor-viewer
    font-family: $body-font-family
    font-size: $font-size-root
</style>

<style scoped>
.vditor-reset a {
    text-decoration: none !important;
}
</style>