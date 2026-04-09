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

import { useNotification } from '@/composables/useNotification';
import { useMainStore } from '@/stores/main';

describe('useNotification', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('notifySuccess pushes success notification', () => {
    const { notifySuccess } = useNotification();
    notifySuccess('Operation completed');

    const store = useMainStore();
    expect(store.notifications).toContainEqual({
      content: 'Operation completed',
      color: 'success',
    });
  });

  it('notifyError pushes error notification', () => {
    const { notifyError } = useNotification();
    notifyError('Something failed');

    const store = useMainStore();
    expect(store.notifications).toContainEqual({
      content: 'Something failed',
      color: 'error',
    });
  });

  it('notifyWarning pushes warning notification', () => {
    const { notifyWarning } = useNotification();
    notifyWarning('Be careful');

    const store = useMainStore();
    expect(store.notifications).toContainEqual({
      content: 'Be careful',
      color: 'warning',
    });
  });

  it('notifyInfo pushes info notification', () => {
    const { notifyInfo } = useNotification();
    notifyInfo('FYI');

    const store = useMainStore();
    expect(store.notifications).toContainEqual({
      content: 'FYI',
      color: 'info',
    });
  });

  describe('expectOkAndCommitMsg', () => {
    it('shows success message on success response', () => {
      const { expectOkAndCommitMsg } = useNotification();
      expectOkAndCommitMsg({ success: true }, 'Done!');

      const store = useMainStore();
      expect(store.notifications).toContainEqual({
        content: 'Done!',
        color: 'success',
      });
    });

    it('shows error message on failure response', () => {
      const { expectOkAndCommitMsg } = useNotification();
      expectOkAndCommitMsg({ success: false }, 'Done!');

      const store = useMainStore();
      expect(store.notifications).toContainEqual({
        content: '服务器错误',
        color: 'error',
      });
    });
  });

  describe('commitErrMsg', () => {
    it('returns error message and notifies when response exists', () => {
      const { commitErrMsg } = useNotification();
      const error = {
        response: { status: 400 },
        message: 'Bad Request',
      } as any;

      const result = commitErrMsg(error);
      expect(result).toBe('Bad Request');

      const store = useMainStore();
      expect(store.notifications).toContainEqual({
        content: 'Bad Request',
        color: 'warning',
      });
    });

    it('returns null when no response', () => {
      const { commitErrMsg } = useNotification();
      const error = { message: 'Network Error' } as any;

      expect(commitErrMsg(error)).toBeNull();
    });

    it('returns null when no message', () => {
      const { commitErrMsg } = useNotification();
      const error = { response: { status: 500 } } as any;

      expect(commitErrMsg(error)).toBeNull();
    });
  });
});
