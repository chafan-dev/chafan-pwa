<template>
  <div id="app">
    <v-app :style="{ background: theme.app.background }">
      <v-progress-linear v-if="loading" indeterminate />
      <router-view v-else />
      <NotificationsManager />
      <v-snackbar :timeout="-1" :value="updateExists" bottom color="primary" right>
        PWA 有新的更新
        <v-btn v-if="pwaWaiting" text @click="refreshApp"> 升级</v-btn>
      </v-snackbar>
      <v-dialog v-model="showLoginPrompt" max-width="600">
        <LoginCard :showTopBar="false" class="py-10" />
      </v-dialog>
    </v-app>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import NotificationsManager from '@/components/NotificationsManager.vue';
import LoginCard from '@/components/login/LoginCard.vue';
import { readIsLoggedIn, readShowLoginPrompt } from '@/store/main/getters';
import { dispatchCheckLoggedIn } from '@/store/main/actions';
import { getLocalValue, setAppLocale } from '@/utils';
import {
  commitAddNotification,
  commitSetNarrowUI,
  commitSetShowLoginPrompt,
  commitSetTheme,
} from './store/main/mutations';
import { CVue, getDefaultNarrowFeedUI, themeLocalStorageKey } from '@/common';
import { ThemeType } from '@/interfaces';
import { api2 } from '@/api2';
import { isDev } from '@/env';

@Component({
  data: function () {
    return {
      loading: true,
    };
  },
  components: {
    NotificationsManager,
    LoginCard,
  },
})
export default class App extends CVue {
  private registration: ServiceWorkerRegistration | null = null;
  private updateExists = false;
  private refreshing = false;
  private loading = true;

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get showLoginPrompt() {
    return readShowLoginPrompt(this.$store);
  }

  set showLoginPrompt(value: boolean) {
    commitSetShowLoginPrompt(this.$store, value);
  }

  get pwaWaiting() {
    return this.registration && this.registration.waiting;
  }

  public async mounted() {
    if (isDev) {
      const dynoState = (await api2.getDevDynoState()).data;
      if (dynoState.state !== 'up') {
        commitAddNotification(this.$store, {
          content: `测试服务器已收到请求，正在启动，当前状态为：${dynoState.state}。请稍后几分钟。如有问题，请在 https://github.com/chafan-dev/chafan-frontend 提一个 issue`,
          color: 'warning',
        });
      }
      // https://github.com/chafan-dev/chafan-frontend
    }
    document.addEventListener(
      'swUpdated',
      (event) => {
        this.registration = (event as any).detail;
        this.updateExists = true;
      },
      { once: true }
    );

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this.refreshing) {
          return;
        }
        this.refreshing = true;
        window.location.reload();
      });
    }
    await dispatchCheckLoggedIn(this.$store);
    this.$data.loading = false;
    setAppLocale(this);
    commitSetNarrowUI(this.$store, getDefaultNarrowFeedUI());
    const theme = getLocalValue(themeLocalStorageKey) as ThemeType;
    if (theme) {
      commitSetTheme(this.$store, theme);
    }
  }

  private refreshApp() {
    this.updateExists = false;
    if (!this.pwaWaiting) {
      return;
    }
    this.registration?.waiting?.postMessage({ type: 'SKIP_WAITING ' });
  }
}
</script>
