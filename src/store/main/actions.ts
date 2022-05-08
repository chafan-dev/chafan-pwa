import { api } from '@/api';
import { IUserUpdateMe } from '@/interfaces';
import router from '@/router';
import { getLocalToken, isDev, removeLocalToken, saveLocalToken } from '@/utils';
import { AxiosError } from 'axios';
import { getStoreAccessors } from 'typesafe-vuex';
import { ActionContext } from 'vuex';
import { State } from '../state';
import { readModeratedSites, readUserProfile } from './getters';
import {
  commitAddNotification,
  commitRemoveNotification,
  commitSetLoggedIn,
  commitSetLogInError,
  commitSetModeratedSites,
  commitSetShowLoginPrompt,
  commitSetToken,
  commitSetUserProfile,
} from './mutations';
import { AppNotification, MainState } from './state';
import { apiMe } from '@/api/me';
import { captureException, captureMessage } from '@sentry/vue';
import { translateErrorMsgCN } from '@/common';

type MainContext = ActionContext<MainState, State>;

export interface ILoginPayload {
  username?: string;
  password?: string;
  hcaptcha_token?: string;
}

export const actions = {
  async actionLogIn(context: MainContext, payload: ILoginPayload) {
    try {
      if (!payload.username || !payload.password) {
        commitAddNotification(context, {
          content: '错误：没有指定邮箱或密码，无法登录',
          color: 'error',
        });
        return;
      }
      const response = await api.logInGetToken(
        payload.username,
        payload.password,
        payload.hcaptcha_token
      );
      const token = response.data.access_token;
      if (token) {
        saveLocalToken(token);
        commitSetToken(context, token);
        commitSetLoggedIn(context, true);
        commitSetLogInError(context, false);
        await dispatchGetModeratedSites(context);
        await dispatchGetUserProfile(context);
        await dispatchRouteLoggedIn(context);
        commitAddNotification(context, {
          content: '登录成功',
          color: 'success',
        });
      } else {
        await dispatchLogOut(context);
      }
    } catch (err: any) {
      await dispatchCheckApiError(context, err);
    }
  },
  async actionGetUserProfile(context: MainContext) {
    try {
      const response = await apiMe.getMe(context.state.token);
      if (response.data) {
        commitSetUserProfile(context, response.data);
      }
    } catch (error: any) {
      await dispatchCheckApiError(context, error);
    }
  },
  async actionGetModeratedSites(context: MainContext) {
    try {
      const sites = (await apiMe.getModeratedSites(context.state.token)).data;
      commitSetModeratedSites(context, sites);
    } catch (error: any) {
      await dispatchCheckApiError(context, error);
    }
  },
  async actionUpdateUserProfile(context: MainContext, payload: IUserUpdateMe) {
    try {
      const loadingNotification = { content: '保存中', showProgress: true };
      commitAddNotification(context, loadingNotification);
      const response = (
        await Promise.all([
          apiMe.updateMe(context.state.token, payload),
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ])
      )[0];
      commitSetUserProfile(context, response.data);
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        content: '设置成功更新',
        color: 'success',
      });
    } catch (error: any) {
      await dispatchCheckApiError(context, error);
    }
  },
  async actionAddFlag(context: MainContext, flag: string) {
    const userProfile = readUserProfile(context);
    if (userProfile) {
      const flagList = userProfile.flag_list;
      if (!flagList.includes(flag)) {
        flagList.push(flag);
      }
      await dispatchCaptureApiError(context, async () => {
        const resp = await apiMe.updateMe(context.state.token, {
          flag_list: flagList,
        });
        commitSetUserProfile(context, resp.data);
      });
    }
  },
  async actionRemoveFlag(context: MainContext, flag: string) {
    const userProfile = readUserProfile(context);
    if (userProfile) {
      const flagList = userProfile.flag_list;
      if (flagList.includes(flag)) {
        flagList.splice(flagList.indexOf(flag), 1);
      }
      await dispatchCaptureApiError(context, async () => {
        const resp = await apiMe.updateMe(context.state.token, {
          flag_list: flagList,
        });
        commitSetUserProfile(context, resp.data);
      });
    }
  },
  async actionCheckLoggedIn(context: MainContext) {
    if (!context.state.isLoggedIn) {
      let token = context.state.token;
      if (!token) {
        const localToken = getLocalToken();
        if (localToken) {
          commitSetToken(context, localToken);
          token = localToken;
        }
      }
      if (token) {
        try {
          commitSetLoggedIn(context, true);
          if (readUserProfile(context) === null) {
            const response = await apiMe.getMe(token);
            commitSetUserProfile(context, response.data);
          }
          if (readModeratedSites(context) === null) {
            apiMe.getModeratedSites(token).then((r) => {
              commitSetModeratedSites(context, r.data);
            });
          }
        } catch (error: any) {
          await dispatchCheckApiError(context, error);
        }
      } else {
        await dispatchLogOut(context);
      }
    }
  },
  async actionLogOut(context: MainContext) {
    removeLocalToken();
    commitSetToken(context, '');
    commitSetLoggedIn(context, false);
  },
  async actionUserLogOut(context: MainContext) {
    await dispatchLogOut(context);
    commitAddNotification(context, { content: '已登出', color: 'success' });
  },
  async actionCheckApiError(context: MainContext, payload: AxiosError) {
    if (payload.toString() === 'Error: Network Error') {
      captureMessage(`actionCheckApiError: ${payload}`);
      commitAddNotification(context, {
        color: 'warning',
        content: '无法连接到服务器',
      });
    } else {
      let message = payload.message;
      if (payload.response && payload.response.data && payload.response.data.detail) {
        message = translateErrorMsgCN(payload.response.data.detail);
      }
      commitAddNotification(context, { content: message, color: 'error' });
      if (
        payload.response &&
        (payload.response.status === 401 || payload.response.status === 403)
      ) {
        await dispatchLogOut(context);
      } else if (!isDev) {
        captureException(payload);
      } else {
        throw payload;
      }
    }
  },
  actionRouteLoggedIn(context: MainContext) {
    if (router.currentRoute.path === '/login') {
      router.push('/');
    } else {
      commitSetShowLoginPrompt(context, false);
      router.go(0);
    }
  },
  async removeNotification(
    context: MainContext,
    payload: { notification: AppNotification; timeout: number }
  ) {
    return new Promise((resolve) => {
      setTimeout(() => {
        commitRemoveNotification(context, payload.notification);
        resolve(true);
      }, payload.timeout);
    });
  },
  async passwordRecovery(context: MainContext, payload: { email: string }) {
    const loadingNotification = {
      content: '密码找回邮件正在发送',
      showProgress: true,
    };
    try {
      commitAddNotification(context, loadingNotification);
      await Promise.all([
        api.passwordRecovery(payload.email),
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
      ]);
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        content: '密码找回邮件已发送',
        color: 'success',
      });
      await dispatchLogOut(context);
    } catch (error) {
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        color: 'error',
        content: '邮箱地址有误',
      });
    }
  },
  async resetPassword(context: MainContext, payload: { password: string; token: string }) {
    const loadingNotification = {
      content: '重置密码中',
      showProgress: true,
    };
    try {
      commitAddNotification(context, loadingNotification);
      await Promise.all([
        api.resetPassword(payload.password, payload.token),
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
      ]);
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        content: '密码重置成功',
        color: 'success',
      });
      await dispatchLogOut(context);
      return true;
    } catch (error) {
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        color: 'error',
        content: '密码重置失败',
      });
    }
    return false;
  },
  async apiErrorCaptured<T>(
    context: MainContext,
    action: () => Promise<T>
  ): Promise<T | undefined> {
    try {
      return await action();
    } catch (err: any) {
      await dispatchCheckApiError(context, err);
    }
  },
  async tryApi<T>(context: MainContext, action: () => Promise<T>): Promise<T | undefined> {
    try {
      return await action();
    } catch (err) {
      return;
    }
  },
  async apiErrorCapturedWithErrorHandler(
    context: MainContext,
    fns: {
      // perform action and capture exception thrown from within
      action: () => Promise<void>;
      // if set and returns true depending on the error, do nothing
      errorFilter: (err: AxiosError) => boolean;
    }
  ) {
    try {
      await fns.action();
    } catch (err: any) {
      if (!(fns.errorFilter && fns.errorFilter(err))) {
        await dispatchCheckApiError(context, err);
      }
    }
  },
};

const { dispatch } = getStoreAccessors<MainState | any, State>('');

export const dispatchCheckApiError = dispatch(actions.actionCheckApiError);
export const dispatchCheckLoggedIn = dispatch(actions.actionCheckLoggedIn);
export const dispatchGetUserProfile = dispatch(actions.actionGetUserProfile);
export const dispatchGetModeratedSites = dispatch(actions.actionGetModeratedSites);
export const dispatchLogIn = dispatch(actions.actionLogIn);
export const dispatchLogOut = dispatch(actions.actionLogOut);
export const dispatchCaptureApiError = dispatch(actions.apiErrorCaptured);
export const tryApi = dispatch(actions.tryApi);
export const dispatchCaptureApiErrorWithErrorHandler = dispatch(
  actions.apiErrorCapturedWithErrorHandler
);
export const dispatchUserLogOut = dispatch(actions.actionUserLogOut);
export const dispatchRouteLoggedIn = dispatch(actions.actionRouteLoggedIn);
export const dispatchUpdateUserProfile = dispatch(actions.actionUpdateUserProfile);
export const dispatchAddFlag = dispatch(actions.actionAddFlag);
export const dispatchRemoveFlag = dispatch(actions.actionRemoveFlag);
export const dispatchRemoveNotification = dispatch(actions.removeNotification);
export const dispatchPasswordRecovery = dispatch(actions.passwordRecovery);
export const dispatchResetPassword = dispatch(actions.resetPassword);
