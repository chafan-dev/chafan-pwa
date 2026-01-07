// Mock dependencies before imports to avoid Vue file parsing
jest.mock('@/api/question', () => ({}));
jest.mock('@/api/article', () => ({}));
jest.mock('@/api/answer', () => ({}));
jest.mock('@/utils', () => ({
  getLocalValue: jest.fn(),
}));

import {
  translateErrorMsgCN,
  URLRegex,
  PasswordRegex,
  PhoneNumberRegex,
  getDefaultNarrowFeedUI,
  NARROW_FEED_UI_KEY,
} from '@/common';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('common.ts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('translateErrorMsgCN', () => {
    it('translates known error messages', () => {
      expect(translateErrorMsgCN('Inactive user')).toBe('账户已暂停');
      expect(translateErrorMsgCN('Invalid token')).toBe('无效的 token');
      expect(translateErrorMsgCN('User not found')).toBe('用户不存在');
    });

    it('handles messages with trailing period', () => {
      expect(translateErrorMsgCN('Unauthorized.')).toBe('访问受限');
    });

    it('returns original message for unknown errors', () => {
      expect(translateErrorMsgCN('Some unknown error')).toBe('Some unknown error');
    });

    it('handles empty string', () => {
      expect(translateErrorMsgCN('')).toBe('');
    });
  });

  describe('URLRegex', () => {
    it('matches valid HTTP URLs', () => {
      expect(URLRegex.test('http://example.com')).toBe(true);
      expect(URLRegex.test('https://example.com')).toBe(true);
      expect(URLRegex.test('https://www.example.com')).toBe(true);
      expect(URLRegex.test('https://example.com/path')).toBe(true);
      expect(URLRegex.test('https://example.com/path?query=1')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(URLRegex.test('not a url')).toBe(false);
      expect(URLRegex.test('ftp://example.com')).toBe(false);
      expect(URLRegex.test('example.com')).toBe(false);
    });
  });

  describe('PasswordRegex', () => {
    it('matches valid passwords (8+ chars with allowed symbols)', () => {
      expect(PasswordRegex.test('password1')).toBe(true);
      expect(PasswordRegex.test('Pass@word1')).toBe(true);
      expect(PasswordRegex.test('12345678')).toBe(true);
      expect(PasswordRegex.test('a1b2c3d4e5')).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      expect(PasswordRegex.test('short')).toBe(false);
      expect(PasswordRegex.test('1234567')).toBe(false);
    });
  });

  describe('PhoneNumberRegex', () => {
    it('matches valid international phone numbers', () => {
      expect(PhoneNumberRegex.test('+12025551234')).toBe(true);
      expect(PhoneNumberRegex.test('+8613812345678')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(PhoneNumberRegex.test('12025551234')).toBe(false); // missing +
      expect(PhoneNumberRegex.test('+02025551234')).toBe(false); // starts with 0
    });
  });

  describe('getDefaultNarrowFeedUI', () => {
    it('returns true when localStorage value is null', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getDefaultNarrowFeedUI()).toBe(true);
    });

    it('returns true when localStorage value is "true"', () => {
      localStorageMock.getItem.mockReturnValueOnce('true');
      expect(getDefaultNarrowFeedUI()).toBe(true);
    });

    it('returns false when localStorage value is "false"', () => {
      localStorageMock.getItem.mockReturnValueOnce('false');
      expect(getDefaultNarrowFeedUI()).toBe(false);
    });
  });

  describe('NARROW_FEED_UI_KEY', () => {
    it('has the correct value', () => {
      expect(NARROW_FEED_UI_KEY).toBe('narrowFeedUI');
    });
  });
});
