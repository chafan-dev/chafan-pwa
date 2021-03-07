<template>
    <div ref="editor" class="simple-editor" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { env } from '@/env';

import Vditor from '@chafan/vditor';
import { vditorCDN } from '@/common';

@Component
export default class SimpleEditor extends Vue {
    @Prop({default: ''}) public readonly initialValue!: string;
    @Prop() public readonly placeholder: string | undefined;

    private vditor: Vditor | null = null;

    private initVditor() {
        if (this.vditor !== null) {
            this.vditor.destroy();
        }
        this.vditor = new Vditor(this.$refs.editor as HTMLElement, {
            debugger: env === 'development',
            cdn: vditorCDN,
            placeholder: this.placeholder ? this.placeholder : '',
            value: this.initialValue,
            mode: 'wysiwyg',
            toolbarConfig: {
                hide: true,
            },
            toolbar: [
                'bold', 'italic', 'link', 'list', 'line', 'strike',
                'undo', 'redo',
            ],
            cache: {
                enable: false,
            },
            counter: {
                enable: false,
            },
        });
    }

    private mounted() {
        this.initVditor();
    }

    get content() {
        return this.vditor?.getValue() || '';
    }

    set content(value: string) {
        if (this.vditor) {
            this.vditor.setValue(value);
        }
    }

    public reset() {
        this.initVditor();
    }
}
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.simple-editor h1, .simple-editor h2, .simple-editor h3
    border-bottom: none !important
    font-family: $body-font-family
    font-size: $font-size-root
    margin-top: 10px
    margin-bottom: 10px

.simple-editor img
    max-height: 100px

.simple-editor p
    margin-bottom: 10px
</style>

<style>
.vditor {
    --textarea-background-color: white;
}

.simple-editor .vditor-reset {
    padding-left: 8px !important;
    padding-right: 8px !important;
}

.simple-editor h1::before, .simple-editor h2::before, .simple-editor h3::before {
    content: ''
}
</style>