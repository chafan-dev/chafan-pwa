import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock dependencies
vi.mock('@/env', () => ({
  apiUrl: 'https://api.test.cha.fan/api/v1',
  wsUrl: 'wss://api.test.cha.fan/api/v1',
  env: 'test',
}));

vi.mock('@/api', () => ({
  api: {
    logInGetToken: vi.fn(),
    passwordRecovery: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

vi.mock('@/api/me', () => ({
  apiMe: {
    getMe: vi.fn(),
    getModeratedSites: vi.fn(),
    updateMe: vi.fn(),
  },
}));

vi.mock('@/utils', () => ({
  getLocalToken: vi.fn(() => null),
  saveLocalToken: vi.fn(),
  removeLocalToken: vi.fn(),
  isDev: false,
}));

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import { useMainStore } from '@/stores/main';
import { useNotificationStore } from '@/stores/notifications';
import { api } from '@/api';
import { apiMe } from '@/api/me';
import { getLocalToken, saveLocalToken, removeLocalToken } from '@/utils';

describe('Main Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const store = useMainStore();
      expect(store.token).toBe('');
      expect(store.isLoggedIn).toBeNull();
      expect(store.logInError).toBe(false);
      expect(store.userProfile).toBeNull();
      expect(store.moderated_sites).toBeNull();
      expect(store.showLoginPrompt).toBe(false);
      expect(store.narrowUI).toBe(true);
      expect(store.theme).toBe('default');
    });
  });

  describe('getters', () => {
    it('hasModeratedSites returns false when null', () => {
      const store = useMainStore();
      expect(store.hasModeratedSites).toBeFalsy();
    });

    it('hasModeratedSites returns false when empty', () => {
      const store = useMainStore();
      store.moderated_sites = [];
      expect(store.hasModeratedSites).toBeFalsy();
    });

    it('hasModeratedSites returns true when sites exist', () => {
      const store = useMainStore();
      store.moderated_sites = [{ uuid: '1', name: 'test' }] as any;
      expect(store.hasModeratedSites).toBeTruthy();
    });

    it('notification store firstNotification returns false when empty', () => {
      const notifications = useNotificationStore();
      expect(notifications.firstNotification).toBe(false);
    });

    it('notification store firstNotification returns first notification', () => {
      const notifications = useNotificationStore();
      const notif = { content: 'test', color: 'success' };
      notifications.push(notif);
      expect(notifications.firstNotification).toEqual(notif);
    });
  });

  describe('actions', () => {
    describe('logIn', () => {
      it('shows error when username/password missing', async () => {
        const store = useMainStore();
        const notifications = useNotificationStore();
        await store.logIn({});
        expect(notifications.notifications).toHaveLength(1);
        expect(notifications.notifications[0].color).toBe('error');
      });

      it('saves token and logs in on success', async () => {
        const store = useMainStore();
        vi.mocked(api.logInGetToken).mockResolvedValue({
          data: { access_token: 'test-token' },
        } as any);
        vi.mocked(apiMe.getMe).mockResolvedValue({ data: { uuid: '1' } } as any);
        vi.mocked(apiMe.getModeratedSites).mockResolvedValue({ data: [] } as any);

        // Mock routeLoggedIn to avoid router dependency
        store.routeLoggedIn = vi.fn();

        await store.logIn({ username: 'user@test.com', password: 'password123' });

        expect(saveLocalToken).toHaveBeenCalledWith('test-token');
        expect(store.token).toBe('test-token');
        expect(store.isLoggedIn).toBe(true);
        expect(store.logInError).toBe(false);
      });

      it('logs out when no token returned', async () => {
        const store = useMainStore();
        vi.mocked(api.logInGetToken).mockResolvedValue({
          data: { access_token: '' },
        } as any);

        await store.logIn({ username: 'user@test.com', password: 'password123' });

        expect(removeLocalToken).toHaveBeenCalled();
        expect(store.isLoggedIn).toBe(false);
      });
    });

    describe('logOut', () => {
      it('clears token and sets logged out state', () => {
        const store = useMainStore();
        store.token = 'some-token';
        store.isLoggedIn = true;

        store.logOut();

        expect(removeLocalToken).toHaveBeenCalled();
        expect(store.token).toBe('');
        expect(store.isLoggedIn).toBe(false);
      });
    });

    describe('userLogOut', () => {
      it('logs out and shows notification', async () => {
        const store = useMainStore();
        const notifications = useNotificationStore();
        store.token = 'some-token';

        await store.userLogOut();

        expect(store.isLoggedIn).toBe(false);
        expect(notifications.notifications).toHaveLength(1);
        expect(notifications.notifications[0].content).toBe('已登出');
      });
    });

    describe('checkLoggedIn', () => {
      it('logs out when no token available', async () => {
        const store = useMainStore();
        vi.mocked(getLocalToken).mockReturnValue(null);

        await store.checkLoggedIn();

        expect(store.isLoggedIn).toBe(false);
      });

      it('fetches profile when token available', async () => {
        const store = useMainStore();
        vi.mocked(getLocalToken).mockReturnValue('saved-token');
        vi.mocked(apiMe.getMe).mockResolvedValue({
          data: { uuid: '1', handle: 'testuser' },
        } as any);
        vi.mocked(apiMe.getModeratedSites).mockResolvedValue({ data: [] } as any);

        await store.checkLoggedIn();

        expect(store.token).toBe('saved-token');
        expect(store.isLoggedIn).toBe(true);
        expect(store.userProfile).toEqual({ uuid: '1', handle: 'testuser' });
      });
    });

    describe('getUserProfile', () => {
      it('fetches and sets user profile', async () => {
        const store = useMainStore();
        store.token = 'test-token';
        vi.mocked(apiMe.getMe).mockResolvedValue({
          data: { uuid: '1', handle: 'testuser' },
        } as any);

        await store.getUserProfile();

        expect(store.userProfile).toEqual({ uuid: '1', handle: 'testuser' });
      });
    });

    describe('captureApiError', () => {
      it('returns result on success', async () => {
        const store = useMainStore();
        const result = await store.captureApiError(async () => 'hello');
        expect(result).toBe('hello');
      });

      it('handles error and returns undefined', async () => {
        const store = useMainStore();
        const error = new Error('Network Error') as any;
        error.message = 'Network Error';
        error.toString = () => 'Error: Network Error';

        const result = await store.captureApiError(async () => {
          throw error;
        });

        expect(result).toBeUndefined();
      });
    });

    describe('tryApi', () => {
      it('returns result on success', async () => {
        const store = useMainStore();
        const result = await store.tryApi(async () => 42);
        expect(result).toBe(42);
      });

      it('returns undefined on error', async () => {
        const store = useMainStore();
        const result = await store.tryApi(async () => {
          throw new Error('fail');
        });
        expect(result).toBeUndefined();
      });
    });

    describe('checkApiError', () => {
      it('shows network error notification', async () => {
        const store = useMainStore();
        const notifications = useNotificationStore();
        const error = new Error('Network Error') as any;
        error.toString = () => 'Error: Network Error';

        await store.checkApiError(error);

        expect(notifications.notifications).toContainEqual({
          color: 'warning',
          content: '无法连接到服务器',
        });
      });

      it('logs out on 401 error', async () => {
        const store = useMainStore();
        store.token = 'test-token';
        store.isLoggedIn = true;
        const error = {
          toString: () => 'Error: 401',
          message: 'Unauthorized',
          response: { status: 401 },
        } as any;

        await store.checkApiError(error);

        expect(store.isLoggedIn).toBe(false);
        expect(store.token).toBe('');
      });
    });

    describe('addFlag / removeFlag', () => {
      it('addFlag adds flag to user profile', async () => {
        const store = useMainStore();
        store.token = 'test-token';
        store.userProfile = { uuid: '1', flag_list: ['existing'] } as any;
        vi.mocked(apiMe.updateMe).mockResolvedValue({
          data: { uuid: '1', flag_list: ['existing', 'new-flag'] },
        } as any);

        await store.addFlag('new-flag');

        expect(store.userProfile!.flag_list).toContain('new-flag');
      });

      it('addFlag does not duplicate existing flag', async () => {
        const store = useMainStore();
        store.token = 'test-token';
        store.userProfile = { uuid: '1', flag_list: ['existing'] } as any;
        vi.mocked(apiMe.updateMe).mockResolvedValue({
          data: { uuid: '1', flag_list: ['existing'] },
        } as any);

        await store.addFlag('existing');

        // Should still call updateMe with the same list (no duplicate added)
        expect(apiMe.updateMe).toHaveBeenCalledWith('test-token', {
          flag_list: ['existing'],
        });
      });

      it('removeFlag removes flag from user profile', async () => {
        const store = useMainStore();
        store.token = 'test-token';
        store.userProfile = { uuid: '1', flag_list: ['a', 'b'] } as any;
        vi.mocked(apiMe.updateMe).mockResolvedValue({
          data: { uuid: '1', flag_list: ['a'] },
        } as any);

        await store.removeFlag('b');

        expect(store.userProfile!.flag_list).toEqual(['a']);
      });
    });
  });
});
