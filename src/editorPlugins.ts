import type { App } from 'vue';
import { defineAsyncComponent } from 'vue';

const Viewer = defineAsyncComponent(() => import('@/components/Viewer.vue'));
const AnswerEditor = defineAsyncComponent(() => import('@/components/AnswerEditor.vue'));

export default {
  install: (app: App) => {
    app.component('Viewer', Viewer);
    app.component('AnswerEditor', AnswerEditor);
  },
};
