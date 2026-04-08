import { defineRule, configure } from 'vee-validate';
import { required, email, min } from '@vee-validate/rules';
import { localize, setLocale } from '@vee-validate/i18n';
import en from '@vee-validate/i18n/dist/locale/en.json';
import zh_CN from '@vee-validate/i18n/dist/locale/zh_CN.json';
import { URLRegex, PasswordRegex, PhoneNumberRegex } from '@/common';

// Built-in rules
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);

// Custom rules
defineRule('password1', (value: string, [target]: string[]) => {
  if (value === target) return true;
  return '密码不一致';
});

defineRule('password', (value: string) => {
  if (value.match(PasswordRegex) !== null) return true;
  return '密码必须至少8位，由数字、字母或者特殊符号组成';
});

defineRule('url', (value: string) => {
  if (value.match(URLRegex) !== null) return true;
  return '无效的 URL';
});

defineRule('phone_number_e164', (value: string) => {
  if (value.match(PhoneNumberRegex) !== null) return true;
  return '无效格式，有效格式的例子：+1222333444, +8611122223333';
});

defineRule('id', (value: string) => {
  if (value.match(/^[\w-]+$/g) !== null) return true;
  return 'id 中仅允许使用字母数字、下划线和"-"，区分大小写';
});

// Configure i18n
configure({
  generateMessage: localize({
    en: {
      ...en,
      names: {
        password: 'Password',
        email: 'Email',
        phonenumber: 'Phone number',
        confirm: 'Password confirmation',
      },
    },
    zh_CN: {
      ...zh_CN,
      names: {
        password: '密码',
        email: '电子邮件地址',
        phonenumber: '电话号',
        confirm: '密码确认',
      },
    },
  }),
});

setLocale('zh_CN');
