// Mock dependencies before imports
jest.mock('@/env', () => ({
  apiUrl: 'https://api.test.cha.fan/api/v1',
  wsUrl: 'wss://api.test.cha.fan/api/v1',
  env: 'test',
}));
jest.mock('@/store/main/actions', () => ({}));
jest.mock('@/store/main/mutations', () => ({ commitAddNotification: jest.fn() }));
jest.mock('@/api/article', () => ({}));
jest.mock('@/api/answer', () => ({}));
jest.mock('@sentry/vue', () => ({ captureException: jest.fn() }));

import {
  getLocalValue,
  setLocalValue,
  getLocalToken,
  saveLocalToken,
  removeLocalToken,
  getBrowserLocale,
  availableLocales,
  uuidv4,
  deepCopy,
  authHeaders,
  authHeadersFormData,
  authHeadersWithParams,
  authHeadersArrayBuffer,
} from '@/utils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('utils.ts', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getLocalValue', () => {
    it('returns value when key exists', () => {
      localStorageMock.getItem.mockReturnValueOnce('test-value');
      expect(getLocalValue('test-key')).toBe('test-value');
    });

    it('returns default value when key does not exist', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getLocalValue('missing-key', 'default')).toBe('default');
    });

    it('returns null as default when no default provided', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getLocalValue('missing-key')).toBeNull();
    });
  });

  describe('setLocalValue', () => {
    it('sets value in localStorage', () => {
      setLocalValue('key', 'value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('Token functions', () => {
    it('getLocalToken returns token from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('my-token');
      expect(getLocalToken()).toBe('my-token');
    });

    it('saveLocalToken saves token to localStorage', () => {
      saveLocalToken('new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chafan:token', 'new-token');
    });

    it('removeLocalToken removes token from localStorage', () => {
      removeLocalToken();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('chafan:token');
    });
  });

  describe('getBrowserLocale', () => {
    const originalNavigator = window.navigator;

    afterEach(() => {
      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('returns zh as default fallback', () => {
      Object.defineProperty(window, 'navigator', {
        value: { language: 'fr-FR', languages: ['fr-FR', 'de-DE'] },
        writable: true,
      });
      expect(getBrowserLocale()).toBe('zh');
    });

    it('returns en when browser language is English', () => {
      Object.defineProperty(window, 'navigator', {
        value: { language: 'en-US', languages: ['en-US'] },
        writable: true,
      });
      expect(getBrowserLocale()).toBe('en');
    });

    it('returns zh when browser language is Chinese', () => {
      Object.defineProperty(window, 'navigator', {
        value: { language: 'zh-CN', languages: ['zh-CN'] },
        writable: true,
      });
      expect(getBrowserLocale()).toBe('zh');
    });
  });

  describe('availableLocales', () => {
    it('contains en and zh', () => {
      expect(availableLocales).toContain('en');
      expect(availableLocales).toContain('zh');
      expect(availableLocales).toHaveLength(2);
    });
  });

  describe('uuidv4', () => {
    it('generates a valid UUID v4 format', () => {
      const uuid = uuidv4();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(uuid).toMatch(uuidRegex);
    });

    it('generates unique UUIDs', () => {
      const uuid1 = uuidv4();
      const uuid2 = uuidv4();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('deepCopy', () => {
    it('creates a deep copy of an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
      expect(copy.b).not.toBe(original.b);
    });

    it('handles arrays', () => {
      const original = [1, 2, { a: 3 }];
      const copy = deepCopy(original);

      expect(copy).toEqual(original);
      expect(copy).not.toBe(original);
    });

    it('handles null and undefined values', () => {
      expect(deepCopy(null)).toBeNull();
      expect(deepCopy({ a: null, b: undefined })).toEqual({ a: null });
    });
  });

  describe('authHeaders', () => {
    it('returns correct authorization header', () => {
      const result = authHeaders('test-token');
      expect(result).toEqual({
        headers: {
          Authorization: 'Bearer test-token',
        },
      });
    });
  });

  describe('authHeadersFormData', () => {
    it('returns headers with Content-Type for form data', () => {
      const result = authHeadersFormData('test-token');
      expect(result).toEqual({
        headers: {
          Authorization: 'Bearer test-token',
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  });

  describe('authHeadersWithParams', () => {
    it('returns headers with params', () => {
      const params = new URLSearchParams();
      params.append('key', 'value');
      const result = authHeadersWithParams('test-token', params);

      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(result.params).toBe(params);
    });
  });

  describe('authHeadersArrayBuffer', () => {
    it('returns headers with arraybuffer response type', () => {
      const result = authHeadersArrayBuffer('test-token');
      expect(result).toEqual({
        headers: {
          Authorization: 'Bearer test-token',
        },
        responseType: 'arraybuffer',
      });
    });
  });
});
