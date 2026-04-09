import { vi } from 'vitest';
import { useEnv } from '@/composables/useEnv';
import { useErrorHandling } from '@/composables/useErrorHandling';

// Mock the utils module for useEnv
vi.mock('@/utils', () => ({
  isDev: true,
  isProdDev: false,
}));

// Mock the Pinia store for useErrorHandling
const mockNotifications: any[] = [];
vi.mock('@/stores/main', () => ({
  useMainStore: () => ({
    notifications: mockNotifications,
  }),
}));

describe('Composables', () => {
  describe('useEnv', () => {
    it('returns isDev and isProdDev flags', () => {
      const { isDev, isProdDev } = useEnv();

      expect(isDev).toBe(true);
      expect(isProdDev).toBe(false);
    });
  });

  describe('useErrorHandling', () => {
    beforeEach(() => {
      mockNotifications.length = 0;
    });

    describe('recursiveCommentsCount', () => {
      it('counts comments with no children', () => {
        const { recursiveCommentsCount } = useErrorHandling();
        const comments = [
          { id: 1, child_comments: [] },
          { id: 2, child_comments: [] },
        ] as any;

        expect(recursiveCommentsCount(comments)).toBe(2);
      });

      it('counts nested comments recursively', () => {
        const { recursiveCommentsCount } = useErrorHandling();
        const comments = [
          {
            id: 1,
            child_comments: [
              { id: 3, child_comments: [] },
              { id: 4, child_comments: [{ id: 5, child_comments: [] }] },
            ],
          },
          { id: 2, child_comments: [] },
        ] as any;

        // 1 + 2 + 1 + 1 = 5 total comments
        expect(recursiveCommentsCount(comments)).toBe(5);
      });

      it('returns 0 for empty array', () => {
        const { recursiveCommentsCount } = useErrorHandling();
        expect(recursiveCommentsCount([])).toBe(0);
      });
    });

    describe('commitErrMsg', () => {
      it('returns error message when response and message exist', () => {
        mockNotifications.length = 0;
        const { commitErrMsg } = useErrorHandling();

        const error = {
          response: { status: 400 },
          message: 'Bad Request',
        } as any;

        const result = commitErrMsg(error);

        expect(result).toBe('Bad Request');
        expect(mockNotifications).toContainEqual({
          content: 'Bad Request',
          color: 'warning',
        });
      });

      it('returns null when response is missing', () => {
        const { commitErrMsg } = useErrorHandling();

        const error = {
          message: 'Network Error',
        } as any;

        const result = commitErrMsg(error);

        expect(result).toBeNull();
      });

      it('returns null when message is missing', () => {
        const { commitErrMsg } = useErrorHandling();

        const error = {
          response: { status: 500 },
        } as any;

        const result = commitErrMsg(error);

        expect(result).toBeNull();
      });
    });
  });
});
