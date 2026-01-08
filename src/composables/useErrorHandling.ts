import { IComment } from '@/interfaces';
import { useNotification } from './useNotification';

/**
 * Composable for error handling and utility functions.
 * Replaces CVue's commitErrMsg and recursiveCommentsCount methods.
 */
export function useErrorHandling() {
  const { commitErrMsg } = useNotification();

  /**
   * Recursively counts all comments including nested child comments
   */
  function recursiveCommentsCount(comments: IComment[]): number {
    return (
      comments.length +
      comments.reduce(
        (sum, comment) => sum + recursiveCommentsCount(comment.child_comments),
        0
      )
    );
  }

  return {
    commitErrMsg,
    recursiveCommentsCount,
  };
}
