import dayjs from '@/dayjs';
import { VueConstructor } from 'vue';

export default {
  install: (Vue: VueConstructor) => {
    Vue.prototype.$dayjs = dayjs;
  },
};
