import { defineStore } from 'pinia';
import { api } from '@/api';
import { IUserUpdateMe, IRichEditorState, ISite, ITopBanner, IUserProfile, ThemeType } from '@/interfaces';
import { getLocalToken, isDev, removeLocalToken, saveLocalToken } from '@/utils';
import { AxiosError } from 'axios';
import { apiMe } from '@/api/me';
import { captureException, captureMessage } from '@sentry/vue';
import { useNotificationStore, type AppNotification } from '@/stores/notifications';

// Re-export for backward-compatible imports from @/stores/main
export type { AppNotification } from '@/stores/notifications';

export interface ILoginPayload {
  username?: string;
  password?: string;
  hcaptcha_token?: string;
}

function axiosErrorString(errorId: string, axiosError: AxiosError) {
  let s = `errorId:${errorId}\n${axiosError}`;
  const response = axiosError.response;
  if (response) {
    s += `\nresponse.data: ${JSON.stringify(response.data)}`;
    s += `\nresponse.config: ${JSON.stringify(response.config)}`;
  }
  return s;
}

function notify(notification: AppNotification) {
  useNotificationStore().push(notification);
}

function removeNotify(notification: AppNotification) {
  useNotificationStore().remove(notification);
}

export const useMainStore = defineStore('main', {
  state: () => ({
    token: '' as string,
    isLoggedIn: null as boolean | null,
    logInError: false as boolean,
    userProfile: null as IUserProfile | null,
    dashboardMiniDrawer: false as boolean,
    dashboardShowDrawer: false as boolean,
    moderated_sites: null as ISite[] | null,
    workingDraft: null as IRichEditorState | null,
    topBanner: null as ITopBanner | null,
    showLoginPrompt: false as boolean,
    narrowUI: true as boolean,
    theme: 'default' as ThemeType,
  }),

  getters: {
    hasModeratedSites: (state) => state.moderated_sites && state.moderated_sites.length > 0,
    loginError: (state) => state.logInError,
    localePreference: (state) => state.userProfile?.locale_preference,
  },

  actions: {
    async logIn(payload: ILoginPayload) {
      try {
        if (!payload.username || !payload.password) {
          notify({
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
          this.token = token;
          this.isLoggedIn = true;
          this.logInError = false;
          await this.getModeratedSites();
          await this.getUserProfile();
          await this.routeLoggedIn();
          notify({ content: '登录成功', color: 'success' });
        } else {
          await this.logOut();
        }
      } catch (err: unknown) {
        await this.checkApiError(err as AxiosError);
      }
    },

    async getUserProfile() {
      try {
        const response = await apiMe.getMe(this.token);
        if (response.data) {
          this.userProfile = response.data;
        }
      } catch (error: unknown) {
        await this.checkApiError(error as AxiosError);
      }
    },

    async getModeratedSites() {
      try {
        const sites = (await apiMe.getModeratedSites(this.token)).data;
        this.moderated_sites = sites;
      } catch (error: unknown) {
        await this.checkApiError(error as AxiosError);
      }
    },

    async updateUserProfile(payload: IUserUpdateMe) {
      try {
        const loadingNotification = { content: '保存中', showProgress: true };
        notify(loadingNotification);
        const response = (
          await Promise.all([
            apiMe.updateMe(this.token, payload),
            new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
          ])
        )[0];
        this.userProfile = response.data;
        removeNotify(loadingNotification);
        notify({ content: '设置成功更新', color: 'success' });
      } catch (error: unknown) {
        await this.checkApiError(error as AxiosError);
      }
    },

    async addFlag(flag: string) {
      if (this.userProfile) {
        const flagList = this.userProfile.flag_list;
        if (!flagList.includes(flag)) {
          flagList.push(flag);
        }
        await this.captureApiError(async () => {
          const resp = await apiMe.updateMe(this.token, { flag_list: flagList });
          this.userProfile = resp.data;
        });
      }
    },

    async removeFlag(flag: string) {
      if (this.userProfile) {
        const flagList = this.userProfile.flag_list;
        if (flagList.includes(flag)) {
          flagList.splice(flagList.indexOf(flag), 1);
        }
        await this.captureApiError(async () => {
          const resp = await apiMe.updateMe(this.token, { flag_list: flagList });
          this.userProfile = resp.data;
        });
      }
    },

    async checkLoggedIn() {
      if (!this.isLoggedIn) {
        let token = this.token;
        if (!token) {
          const localToken = getLocalToken();
          if (localToken) {
            this.token = localToken;
            token = localToken;
          }
        }
        if (token) {
          try {
            this.isLoggedIn = true;
            if (this.userProfile === null) {
              const response = await apiMe.getMe(token);
              this.userProfile = response.data;
            }
            if (this.moderated_sites === null) {
              apiMe.getModeratedSites(token).then((r) => {
                this.moderated_sites = r.data;
              });
            }
          } catch (error: unknown) {
            await this.checkApiError(error as AxiosError);
          }
        } else {
          await this.logOut();
        }
      }
    },

    logOut() {
      removeLocalToken();
      this.token = '';
      this.isLoggedIn = false;
    },

    async userLogOut() {
      this.logOut();
      notify({ content: '已登出', color: 'success' });
    },

    async checkApiError(axiosError: AxiosError) {
      if (axiosError.toString() === 'Error: Network Error') {
        notify({ color: 'warning', content: '无法连接到服务器' });
      } else {
        const message = axiosError.message;
        notify({ content: message, color: 'error' });
        if (
          axiosError.response &&
          (axiosError.response.status === 401 || axiosError.response.status === 403)
        ) {
          if (isDev) {
            console.log(axiosErrorString('checkApiError: Unauthorized, logOut', axiosError));
          }
          this.logOut();
        } else if (!isDev) {
          captureMessage(axiosErrorString('checkApiError: Other error', axiosError));
          captureException(axiosError);
        } else {
          console.log(axiosErrorString('checkApiError: Other error', axiosError));
          throw axiosError;
        }
      }
    },

    routeLoggedIn() {
      // Circular dependency with router avoided by dynamic import
      import('@/router').then(({ default: router }) => {
        if (router.currentRoute.value.path === '/login') {
          router.push('/');
        } else {
          this.showLoginPrompt = false;
          router.go(0);
        }
      });
    },

    async passwordRecovery(payload: { email: string }) {
      const loadingNotification = { content: '密码找回邮件正在发送', showProgress: true };
      try {
        notify(loadingNotification);
        await Promise.all([
          api.passwordRecovery(payload.email),
          new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ]);
        removeNotify(loadingNotification);
        notify({ content: '密码找回邮件已发送', color: 'success' });
        this.logOut();
      } catch {
        removeNotify(loadingNotification);
        notify({ color: 'error', content: '邮箱地址有误' });
      }
    },

    async resetPassword(payload: { password: string; token: string }) {
      const loadingNotification = { content: '重置密码中', showProgress: true };
      try {
        notify(loadingNotification);
        await Promise.all([
          api.resetPassword(payload.password, payload.token),
          new Promise<void>((resolve) => setTimeout(() => resolve(), 500)),
        ]);
        removeNotify(loadingNotification);
        notify({ content: '密码重置成功', color: 'success' });
        this.logOut();
        return true;
      } catch {
        removeNotify(loadingNotification);
        notify({ color: 'error', content: '密码重置失败' });
      }
      return false;
    },

    async captureApiError<T>(action: () => Promise<T>): Promise<T | undefined> {
      try {
        return await action();
      } catch (err: unknown) {
        await this.checkApiError(err as AxiosError);
      }
    },

    async tryApi<T>(action: () => Promise<T>): Promise<T | undefined> {
      try {
        return await action();
      } catch {
        return;
      }
    },

    async captureApiErrorWithErrorHandler(fns: {
      action: () => Promise<void>;
      errorFilter: (err: AxiosError) => boolean;
    }) {
      try {
        await fns.action();
      } catch (err: unknown) {
        if (!(fns.errorFilter && fns.errorFilter(err as AxiosError))) {
          await this.checkApiError(err as AxiosError);
        }
      }
    },
  },
});
