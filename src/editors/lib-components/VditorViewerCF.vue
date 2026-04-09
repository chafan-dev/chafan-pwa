<template>
  <div ref="rootEl" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { vditorCDN } from '../common';

let vditorImportPromise: Promise<typeof import('vditor')> | null = null;

const props = defineProps<{
  body: string;
  onViewerReady?: (elem: HTMLDivElement) => void;
}>();

const rootEl = ref<HTMLDivElement>();

onMounted(async () => {
  if (!vditorImportPromise) {
    vditorImportPromise = import('vditor');
  }
  const { default: Vditor } = await vditorImportPromise;
  const vditorElem = rootEl.value!;
  Vditor.preview(vditorElem, props.body, {
    mode: 'light',
    cdn: vditorCDN,
    after: () => {
      if (props.onViewerReady) {
        props.onViewerReady(vditorElem);
      }
    },
    math: {
      inlineDigit: true,
      engine: 'KaTeX',
    },
  });
});
</script>
