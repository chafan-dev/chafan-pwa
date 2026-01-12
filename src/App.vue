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

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue';
import NotificationsManager from '@/components/NotificationsManager.vue';
import LoginCard from '@/components/login/LoginCard.vue';
import store from '@/store';
import { readShowLoginPrompt } from '@/store/main/getters';
import { dispatchCheckLoggedIn } from '@/store/main/actions';
import { getLocalValue, setAppLocale } from '@/utils';
import {
  commitSetNarrowUI,
  commitSetShowLoginPrompt,
  commitSetTheme,
} from './store/main/mutations';
import { getDefaultNarrowFeedUI, themeLocalStorageKey } from '@/common';
import { ThemeType } from '@/interfaces';
import { useTheme } from '@/composables';
const { theme } = useTheme();

const registration = ref<ServiceWorkerRegistration | null>(null);
const updateExists = ref(false);
const refreshing = ref(false);
const loading = ref(true);

const showLoginPrompt = computed({
  get() {
    return readShowLoginPrompt(store);
  },
  set(value: boolean) {
    commitSetShowLoginPrompt(store, value);
  },
});

const pwaWaiting = computed(() => {
  return registration.value && registration.value.waiting;
});

onMounted(async () => {
  document.addEventListener(
    'swUpdated',
    (event) => {
      registration.value = (event as any).detail;
      updateExists.value = true;
    },
    { once: true }
  );

  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing.value) {
        return;
      }
      refreshing.value = true;
      window.location.reload();
    });
  }
  await dispatchCheckLoggedIn(store);
  loading.value = false;
  const instance = getCurrentInstance();
  if (instance) {
    setAppLocale(instance.proxy);
  }
  commitSetNarrowUI(store, getDefaultNarrowFeedUI());
  const savedTheme = getLocalValue(themeLocalStorageKey) as ThemeType;
  if (savedTheme) {
    commitSetTheme(store, savedTheme);
  }
});

function refreshApp() {
  updateExists.value = false;
  if (!pwaWaiting.value) {
    return;
  }
  registration.value?.waiting?.postMessage({ type: 'SKIP_WAITING ' });
}
</script>
