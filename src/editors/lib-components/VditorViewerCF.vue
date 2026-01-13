<template>
  <div />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Vditor from 'vditor';
import { vditorCDN } from '../common';

@Component
export default class Viewer extends Vue {
  @Prop() private readonly body!: string;
  @Prop() public readonly onViewerReady!: (elem: HTMLDivElement) => void | undefined;

  mounted() {
    const vditorElem = this.$el as HTMLDivElement;
    Vditor.preview(vditorElem, this.body, {
      mode: 'light',
      cdn: vditorCDN,
      after: () => {
        if (this.onViewerReady) {
          this.onViewerReady(vditorElem);
        }
      },
      math: {
        inlineDigit: true,
        engine: 'KaTeX',
      },
    });
  }
}
</script>
