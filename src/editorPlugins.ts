const Viewer = () => import('@/components/Viewer.vue');
const RichEditor = () => import('@/components/RichEditor.vue');

export default {
  install: (Vue) => {
    Vue.component('Viewer', Viewer);
    Vue.component('RichEditor', RichEditor);
  },
};
