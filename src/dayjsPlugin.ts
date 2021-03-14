import dayjs from '@/dayjs';

export default {
  install: (Vue) => {
    Vue.prototype.$dayjs = dayjs;
  },
};
