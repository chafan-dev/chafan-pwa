<template>
  <div id="app">
    <v-app>
      <v-progress-linear v-if="loading" indeterminate />
      <router-view v-else />
      <NotificationsManager />
      <v-snackbar :timeout="-1" :value="updateExists" bottom color="primary" right>
        PWA 有新的更新
        <v-btn v-if="pwaWaiting" text @click="refreshApp"> 升级 </v-btn>
      </v-snackbar>
      <v-dialog v-model="showLoginPrompt" max-width="600">
        <LoginCard :showTopBar="false" class="py-10" />
      </v-dialog>
    </v-app>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NotificationsManager from '@/components/NotificationsManager.vue';
import LoginCard from '@/components/login/LoginCard.vue';
import { readIsLoggedIn, readShowLoginPrompt } from '@/store/main/getters';
import { dispatchCheckLoggedIn } from '@/store/main/actions';
import { setAppLocale } from '@/utils';
import { commitSetNarrowUI, commitSetShowLoginPrompt } from './store/main/mutations';
import { getDefaultNarrowFeedUI } from '@/common';

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
export default class App extends Vue {
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

  public async mounted() {
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
  }

  get pwaWaiting() {
    return this.registration && this.registration.waiting;
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
