<template>
  <div>
    <v-snackbar v-model="show" :color="currentNotificationColor">
      <v-progress-circular v-show="showProgress" class="ma-2" indeterminate></v-progress-circular>
      {{ currentNotificationContent }}
      <v-btn variant="text" @click.native="close">关闭</v-btn>
    </v-snackbar>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMainStore, type AppNotification } from '@/stores/main';

const store = useMainStore();


const show = ref(false);
const showProgress = ref(false);
const currentNotification = ref<AppNotification | false>(false);

const firstNotification = computed(() => store.firstNotification);

const currentNotificationContent = computed(() => {
  return (currentNotification.value && currentNotification.value.content) || '';
});

const currentNotificationColor = computed(() => {
  return (currentNotification.value && currentNotification.value.color) || 'info';
});

async function hide() {
  show.value = false;
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
}

async function close() {
  await hide();
  await removeCurrentNotification();
}

async function removeCurrentNotification() {
  if (currentNotification.value) {
    store.notifications = store.notifications.filter((n) => n !== currentNotification.value);
  }
}

async function setNotification(notification: AppNotification | false) {
  if (show.value) {
    await hide();
  }
  if (notification) {
    currentNotification.value = notification;
    showProgress.value = notification.showProgress || false;
    show.value = true;
  } else {
    currentNotification.value = false;
  }
}

watch(firstNotification, async (newNotification) => {
  if (newNotification !== currentNotification.value) {
    await setNotification(newNotification);
    if (newNotification) {
      store.removeNotificationAfter(newNotification, 6500);
    }
  }
});
</script>
