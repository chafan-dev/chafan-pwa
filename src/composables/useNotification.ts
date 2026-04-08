import { useMainStore } from '@/stores/main';
import { IGenericResponse } from '@/interfaces';
import { AxiosError } from 'axios';

/**
 * Composable for notification helpers.
 */
export function useNotification() {
  function notifySuccess(content: string) {
    useMainStore().notifications.push({ content, color: 'success' });
  }

  function notifyError(content: string) {
    useMainStore().notifications.push({ content, color: 'error' });
  }

  function notifyWarning(content: string) {
    useMainStore().notifications.push({ content, color: 'warning' });
  }

  function notifyInfo(content: string) {
    useMainStore().notifications.push({ content, color: 'info' });
  }

  function expectOkAndCommitMsg(response: IGenericResponse, successMsg: string) {
    if (response.success) {
      notifySuccess(successMsg);
    } else {
      notifyError('服务器错误');
    }
  }

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
