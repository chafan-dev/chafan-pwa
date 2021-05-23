import { api } from '@/api';
import { IUserUpdateMe } from '@/interfaces';
import router from '@/router';
import { getLocalToken, removeLocalToken, saveLocalToken } from '@/utils';
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
  commitSetTopBanner,
  commitSetUserProfile,
} from './mutations';
import { AppNotification, MainState } from './state';
import { env } from '@/env';
import { apiMe } from '@/api/me';
import { captureException } from '@sentry/vue';

type MainContext = ActionContext<MainState, State>;

export interface ILoginPayload {
  type: 'email' | 'cellphone';
  username?: string;
  password?: string;
  code?: string;
  phoneNumber?: string;
  hcaptcha_token?: string;
}

export const actions = {
  async actionLogIn(context: MainContext, payload: ILoginPayload) {
    try {
      let response;
      if (payload.type === 'email') {
        response = await api.logInGetToken(
          payload.username!,
          payload.password!,
          payload.hcaptcha_token!
        );
      } else {
        response = await api.logInWithCodeGetToken(payload.phoneNumber!, payload.code!);
      }
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
          content: 'Logged in',
          color: 'success',
        });
      } else {
        await dispatchLogOut(context);
      }
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.detail === 'Incorrect email or password'
      ) {
        throw new Error('Incorrect email or password');
      } else {
        await dispatchCheckApiError(context, err);
      }
    }
  },
  async actionGetUserProfile(context: MainContext) {
    try {
      const response = await apiMe.getMe(context.state.token);
      if (response.data) {
        commitSetUserProfile(context, response.data);
      }
    } catch (error) {
      await dispatchCheckApiError(context, error);
    }
  },
  async actionGetModeratedSites(context: MainContext) {
    try {
      const sites = (await apiMe.getModeratedSites(context.state.token)).data;
      commitSetModeratedSites(context, sites);
    } catch (error) {
      await dispatchCheckApiError(context, error);
    }
  },
  async actionUpdateUserProfile(context: MainContext, payload: IUserUpdateMe) {
    try {
      const loadingNotification = { content: 'saving', showProgress: true };
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
    } catch (error) {
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
          const response = await apiMe.getMe(token);
          commitSetLoggedIn(context, true);
          if (readUserProfile(context) === null) {
            commitSetUserProfile(context, response.data);
          }
          if (readModeratedSites(context) === null) {
            apiMe.getModeratedSites(token).then((r) => {
              commitSetModeratedSites(context, r.data);
            });
          }
        } catch (error) {
          await dispatchCheckApiError(context, error);
        }
      } else {
        await dispatchRemoveLogIn(context);
      }
    }
  },
  async actionRemoveLogIn(context: MainContext) {
    removeLocalToken();
    commitSetToken(context, '');
    commitSetLoggedIn(context, false);
  },
  async actionLogOut(context: MainContext) {
    await dispatchRemoveLogIn(context);
  },
  async actionUserLogOut(context: MainContext) {
    await dispatchLogOut(context);
    commitAddNotification(context, { content: 'Logged out', color: 'success' });
  },
  async actionCheckApiError(context: MainContext, payload: AxiosError) {
    if (payload.toString() === 'Error: Network Error') {
      commitSetTopBanner(context, {
        color: 'grey',
        textColor: 'white',
        text: '无法连接到服务器',
        enabled: true,
      });
    } else {
      let message = payload.message;
      if (payload.response && payload.response.data && payload.response.data.detail) {
        message += `, detail: ${JSON.stringify(payload.response.data.detail)}`;
      }
      commitAddNotification(context, { content: message, color: 'error' });
      if (payload.response && payload.response.status === 401) {
        await dispatchLogOut(context);
      } else if (env !== 'development') {
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
      content: 'Sending password recovery email',
      showProgress: true,
    };
    try {
      commitAddNotification(context, loadingNotification);
      (
        await Promise.all([
          api.passwordRecovery(payload.email),
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ])
      )[0];
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        content: 'Password recovery email sent',
        color: 'success',
      });
      await dispatchLogOut(context);
    } catch (error) {
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        color: 'error',
        content: 'Incorrect email',
      });
    }
  },
  async resetPassword(context: MainContext, payload: { password: string; token: string }) {
    const loadingNotification = {
      content: 'Resetting password',
      showProgress: true,
    };
    try {
      commitAddNotification(context, loadingNotification);
      (
        await Promise.all([
          api.resetPassword(payload.password, payload.token),
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ])
      )[0];
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        content: 'Password successfully reset',
        color: 'success',
      });
      await dispatchLogOut(context);
    } catch (error) {
      commitRemoveNotification(context, loadingNotification);
      commitAddNotification(context, {
        color: 'error',
        content: 'Error resetting password',
      });
    }
  },
  async apiErrorCaptured(context: MainContext, action: () => Promise<void>) {
    try {
      await action();
    } catch (err) {
      await dispatchCheckApiError(context, err);
    }
  },
  async apiErrorCapturedWithErrorHandler(
    context: MainContext,
    fns: {
      action: () => Promise<void>;
      errorFilter: (err: AxiosError) => boolean;
    }
  ) {
    try {
      await fns.action();
    } catch (err) {
      if (fns.errorFilter && fns.errorFilter(err)) {
        // Do nothing
      } else {
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
export const dispatchCaptureApiErrorWithErrorHandler = dispatch(
  actions.apiErrorCapturedWithErrorHandler
);
export const dispatchUserLogOut = dispatch(actions.actionUserLogOut);
export const dispatchRemoveLogIn = dispatch(actions.actionRemoveLogIn);
export const dispatchRouteLoggedIn = dispatch(actions.actionRouteLoggedIn);
export const dispatchUpdateUserProfile = dispatch(actions.actionUpdateUserProfile);
export const dispatchAddFlag = dispatch(actions.actionAddFlag);
export const dispatchRemoveFlag = dispatch(actions.actionRemoveFlag);
export const dispatchRemoveNotification = dispatch(actions.removeNotification);
export const dispatchPasswordRecovery = dispatch(actions.passwordRecovery);
export const dispatchResetPassword = dispatch(actions.resetPassword);
