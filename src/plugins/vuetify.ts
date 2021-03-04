import Vue from 'vue';
import Vuetify from 'vuetify/lib';

import zh from 'vuetify/es5/locale/zh-Hans';
import en from 'vuetify/es5/locale/en';

import { getBrowserLocale } from '@/utils';

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { zh, en },
    current: getBrowserLocale(),
  },
  icons: {
    iconfont: 'mdiSvg',
  },
});
