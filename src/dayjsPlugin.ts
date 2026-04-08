import dayjs from '@/dayjs';
import type { App } from 'vue';

export default {
  install: (app: App) => {
    app.config.globalProperties.$dayjs = dayjs;
  },
};
