import { commitAddNotification } from '@/store/main/mutations';
import { IGenericResponse } from '@/interfaces';
import { AxiosError } from 'axios';
import store from '@/store';

/**
 * Composable for notification helpers.
 * Replaces CVue's expectOkAndCommitMsg and commitErrMsg methods.
 */
export function useNotification() {
  /**
   * Shows a success notification
   */
  function notifySuccess(content: string) {
    commitAddNotification(store, {
      content,
      color: 'success',
    });
  }

  /**
   * Shows an error notification
   */
  function notifyError(content: string) {
    commitAddNotification(store, {
      content,
      color: 'error',
    });
  }

  /**
   * Shows a warning notification
   */
  function notifyWarning(content: string) {
    commitAddNotification(store, {
      content,
      color: 'warning',
    });
  }

  /**
   * Shows an info notification
   */
  function notifyInfo(content: string) {
    commitAddNotification(store, {
      content,
      color: 'info',
    });
  }

  /**
   * Handles a generic response - shows success message or error
   * Replaces CVue's expectOkAndCommitMsg method
   */
  function expectOkAndCommitMsg(response: IGenericResponse, successMsg: string) {
    if (response.success) {
      notifySuccess(successMsg);
    } else {
      notifyError('服务器错误');
    }
  }

  /**
   * Handles an Axios error and shows notification
   * Replaces CVue's commitErrMsg method
   */
  function commitErrMsg(err: AxiosError): string | null {
    if (err.response && err.message) {
      notifyWarning(err.message);
      return err.message;
    }
    return null;
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    expectOkAndCommitMsg,
    commitErrMsg,
  };
}
