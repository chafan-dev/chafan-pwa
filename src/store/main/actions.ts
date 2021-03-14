import { api } from '@/api';
import { IUserUpdateMe } from '@/interfaces';
import router from '@/router';
import { getLocalToken, handleApiError, removeLocalToken, saveLocalToken } from '@/utils';
import axios, { AxiosError } from 'axios';
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
import { prodStateJsonURL } from '@/env';
import { apiMe } from '@/api/me';

type MainContext = ActionContext<MainState, State>;

export interface ILoginPayload {
  type: 'email' | 'cellphone';
  username?: string;
  password?: string;
  code?: string;
  phoneNumber?: string;
}

export const actions = {
  async actionLogIn(context: MainContext, payload: ILoginPayload) {
    try {
      let response;
      if (payload.type === 'email') {
        response = await api.logInGetToken(payload.username!, payload.password!);
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
        await handleApiError(context, err);
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
  async actionUpdateUserProfileQuiet(context: MainContext, payload: IUserUpdateMe) {
    try {
      const response = await apiMe.updateMe(context.state.token, payload);
      commitSetUserProfile(context, response.data);
    } catch (error) {
      await dispatchCheckApiError(context, error);
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
            commitSetModeratedSites(context, (await apiMe.getModeratedSites(token)).data);
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
    await dispatchRouteLogOut(context);
  },
  async actionUserLogOut(context: MainContext) {
    await dispatchLogOut(context);
    commitAddNotification(context, { content: 'Logged out', color: 'success' });
  },
  actionRouteLogOut() {},
  async actionCheckApiError(context: MainContext, payload: AxiosError) {
    let message = payload.message;
    if (payload.response && payload.response.data && payload.response.data.detail) {
      message += `, detail: ${JSON.stringify(payload.response.data.detail)}`;
    }
    axios.get(prodStateJsonURL).then((response) => {
      commitSetTopBanner(context, response.data['top-banner']);
    });
    commitAddNotification(context, { content: message, color: 'error' });
    if (payload.response && payload.response.status === 401) {
      await dispatchLogOut(context);
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
      await handleApiError(context, err);
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
        await handleApiError(context, err);
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
export const dispatchRouteLogOut = dispatch(actions.actionRouteLogOut);
export const dispatchUpdateUserProfile = dispatch(actions.actionUpdateUserProfile);
export const dispatchUpdateUserProfileQuiet = dispatch(actions.actionUpdateUserProfileQuiet);
export const dispatchRemoveNotification = dispatch(actions.removeNotification);
export const dispatchPasswordRecovery = dispatch(actions.passwordRecovery);
export const dispatchResetPassword = dispatch(actions.resetPassword);
