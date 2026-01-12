import { useEnv } from '@/composables/useEnv';
import { useErrorHandling } from '@/composables/useErrorHandling';

// Mock the utils module for useEnv
jest.mock('@/utils', () => ({
  isDev: true,
  isProdDev: false,
}));

// Mock the store for useErrorHandling
jest.mock('@/store', () => ({
  default: {
    commit: jest.fn(),
  },
}));

jest.mock('@/store/main/mutations', () => ({
  commitAddNotification: jest.fn(),
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
      jest.clearAllMocks();
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
        const { commitAddNotification } = require('@/store/main/mutations');
        const { commitErrMsg } = useErrorHandling();

        const error = {
          response: { status: 400 },
          message: 'Bad Request',
        } as any;

        const result = commitErrMsg(error);

        expect(result).toBe('Bad Request');
        expect(commitAddNotification).toHaveBeenCalledWith(
          expect.anything(),
          {
            content: 'Bad Request',
            color: 'warning',
          }
        );
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
