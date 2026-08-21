import { describe, expect, it } from 'vitest';
import { validate } from 'vee-validate';

// Importing the plugin registers the rules globally via defineRule.
import '@/plugins/vee-validate';

// An untouched optional field holds null, not ''. These rules used to call
// String.match on it and throw inside validation, which aborted the whole
// submission with no message and no request -- the profile form's 个人主页,
// 知乎个人页 and Linkedin fields are all optional and all default to null.
const EMPTY = [null, undefined, ''];

describe('custom rules accept empty values', () => {
  for (const rule of ['url', 'password', 'phone_number_e164', 'id']) {
    for (const value of EMPTY) {
      it(`${rule} passes ${JSON.stringify(value)} instead of throwing`, async () => {
        const result = await validate(value, rule);
        expect(result.valid).toBe(true);
      });
    }
  }
});

describe('custom rules still reject bad values', () => {
  const bad: [string, string][] = [
    ['url', 'not a url'],
    ['password', 'short'],
    ['phone_number_e164', '12345'],
    ['id', 'has spaces'],
  ];
  for (const [rule, value] of bad) {
    it(`${rule} rejects ${JSON.stringify(value)}`, async () => {
      const result = await validate(value, rule);
      expect(result.valid).toBe(false);
    });
  }
});

describe('required still rejects empty', () => {
  for (const value of EMPTY) {
    it(`required rejects ${JSON.stringify(value)}`, async () => {
      // Emptiness stays required's job; that is why the rules above may pass it.
      const result = await validate(value, 'required');
      expect(result.valid).toBe(false);
    });
  }
});
