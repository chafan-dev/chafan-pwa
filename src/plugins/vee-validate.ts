import Vue from 'vue';
import { extend, localize, ValidationObserver, ValidationProvider } from 'vee-validate';
import { email, min, required } from 'vee-validate/dist/rules';
import en from 'vee-validate/dist/locale/en.json';
import zh_CN from 'vee-validate/dist/locale/zh_CN.json';
import { URLRegex } from '@/common';

extend('password1', {
  params: ['target'],
  validate(value, args: Record<string, any>) {
    return value === args.target;
  },
  message: '密码不一致',
});

extend('password', {
  validate(value: string) {
    return value.length >= 8;
  },
  message: '密码必须长于8位',
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
  message: '无效格式，有效格式的例子：+1222333444, +8611122223333',
});

extend('id', {
  validate(value: string) {
    return value.match(/^[\w-]+$/g) !== null;
  },
  message: 'id 中仅允许使用字母数字、下划线和"-"，区分大小写',
});

// No message specified.
extend('email', email);
extend('required', required);
extend('min', min);

Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);

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
