import Vue from 'vue';
import {ValidationProvider, ValidationObserver, extend} from 'vee-validate';

extend('password1', {
  params: ['target'],
  validate(value, args: Record<string, any>) {
    return value === args.target;
  },
  message: 'Password confirmation does not match',
});

extend('password', {
  validate(value: string) {
    return value.match(/^[\x00-\x7F]{8,30}$/g) !== null;
  },
  message: 'Password must be between 8 and 30 characters long.',
});


extend('url', {
  validate(value: string) {
    return value.match(URLRegex) !== null;
  },
  message: '无效的 URL',
});

extend('phone_number_e164', {
  validate(value: string) {
    return value.match(/^\+[1-9]\d{1,14}$/g) !== null;
  },
  message: 'Invalid format, valid example: +1222333444, +8611122223333',
});

extend('subdomain', {
  validate(value: string) {
    return value.match(/^[\w-]+$/g) !== null;
  },
  message: 'Only alphanumeric, underscore or hyphen is allowed in subdomain.',
});

import { email, required, min } from 'vee-validate/dist/rules';

// No message specified.
extend('email', email);
extend('required', required);
extend('min', min);

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

import { localize } from 'vee-validate';
import en from 'vee-validate/dist/locale/en.json';
import zh_CN from 'vee-validate/dist/locale/zh_CN.json';
import { URLRegex } from '@/common';

localize({
  en,
  zh_CN,
});

localize({
  en: {
    names: {
      password: 'Password',
      email: 'Email',
      phonenumber: 'Phone number',
      confirm: 'Password confirmation',
    },
  },
  zh_CN: {
    names: {
      password: '密码',
      email: '电子邮件地址',
      phonenumber: '电话号',
      confirm: '密码确认',
    },
  },
});
