import { commitAddNotification } from '@/store/main/mutations';
import { AxiosError } from 'axios';
import { IComment } from '@/interfaces';
import store from '@/store';

/**
 * Composable for error handling and utility functions.
 * Replaces CVue's commitErrMsg and recursiveCommentsCount methods.
 */
export function useErrorHandling() {
  /**
   * Handles an Axios error and shows notification
   * Replaces CVue's commitErrMsg method
   */
  function commitErrMsg(err: AxiosError): string | null {
    if (err.response && err.message) {
      commitAddNotification(store, {
        content: err.message,
        color: 'warning',
      });
      return err.message;
    }
    return null;
  }

  /**
   * Recursively counts all comments including nested child comments
   * Replaces CVue's recursiveCommentsCount method
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
