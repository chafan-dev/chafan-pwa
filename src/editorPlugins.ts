const Viewer = () => import('@/components/Viewer.vue');
const AnswerEditor = () => import('@/components/AnswerEditor.vue');

export default {
  install: (Vue) => {
    Vue.component('Viewer', Viewer);
    Vue.component('AnswerEditor', AnswerEditor);
  },
};
