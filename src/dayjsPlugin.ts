import dayjs from '@/dayjs';

export default {
    install: (Vue, options) => {
        Vue.prototype.$dayjs = dayjs;
    },
};
