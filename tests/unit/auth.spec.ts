import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/env', () => ({
  apiUrl: 'https://api.test.cha.fan/api/v1',
  wsUrl: 'wss://api.test.cha.fan/api/v1',
  env: 'test',
}));

vi.mock('@/utils', () => ({
  getLocalToken: vi.fn(() => null),
  saveLocalToken: vi.fn(),
  removeLocalToken: vi.fn(),
  isDev: false,
}));

vi.mock('@/api', () => ({
  api: {},
}));

vi.mock('@/api/me', () => ({
  apiMe: {},
}));

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import { useAuth } from '@/composables/useAuth';
import { useMainStore } from '@/stores/main';

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('returns reactive token from store', () => {
    const store = useMainStore();
    const { token } = useAuth();

    expect(token.value).toBe('');

    store.token = 'new-token';
    expect(token.value).toBe('new-token');
  });

  it('returns reactive loggedIn from store', () => {
    const store = useMainStore();
    const { loggedIn } = useAuth();

    expect(loggedIn.value).toBeNull();

    store.isLoggedIn = true;
    expect(loggedIn.value).toBe(true);
  });

  it('returns reactive userProfile from store', () => {
    const store = useMainStore();
    const { userProfile } = useAuth();

    expect(userProfile.value).toBeNull();

    store.userProfile = { uuid: '123', handle: 'testuser' } as any;
    expect(userProfile.value).toEqual({ uuid: '123', handle: 'testuser' });
  });

  it('returns reactive currentUserId from store', () => {
    const store = useMainStore();
    const { currentUserId } = useAuth();

    expect(currentUserId.value).toBeUndefined();

    store.userProfile = { uuid: 'user-1' } as any;
    expect(currentUserId.value).toBe('user-1');
  });
});
