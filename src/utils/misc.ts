import { localize } from '@vee-validate/i18n';
import dayjs from '@/dayjs';
import { IComment } from '@/interfaces';
import { env } from '@/env';
import range from 'lodash/range';

export { v4 as uuidv4 } from 'uuid';

export const availableLocales = ['en', 'zh'];

export const getBrowserLocale = () => {
  const langFirst = navigator.language.split('-')[0];
  if (availableLocales.includes(langFirst)) {
    return langFirst;
  }
  for (const lang of navigator.languages) {
    const langFirst2 = lang.split('-')[0];
    if (availableLocales.includes(langFirst2)) {
      return langFirst2;
    }
  }
  return 'zh';
};

export const setAppLocale = () => {
  localize('zh_CN');
};

export const isDev = env !== 'production' || window.location.hostname === 'dev.cha.fan';
export const isProdDev = window.location.hostname === 'dev.cha.fan';

export const logDebug = (msg: string) => {
  if (isDev) {
    console.log(msg);
  }
};

export const rankComments = (comments: IComment[]) => {
  return comments.sort((a, b) => {
    if (a.upvotes_count > b.upvotes_count) {
      return -1;
    }
    if (dayjs.utc(a.created_at).isAfter(dayjs.utc(b.created_at))) {
      return -1;
    }
    return 1;
  });
};

export const getRecentYears = () => {
  return range(1950, dayjs().year(), 1)
    .map((y: number) => y.toString())
    .reverse();
};

export const deepCopy = (o: any): any => {
  return JSON.parse(JSON.stringify(o));
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
