import { defineStore } from 'pinia';

export interface AppNotification {
  content: string;
  color?: string;
  showProgress?: boolean;
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as AppNotification[],
  }),

  getters: {
    firstNotification: (state): AppNotification | false =>
      state.notifications.length > 0 ? state.notifications[0] : false,
  },

  actions: {
    push(notification: AppNotification) {
      this.notifications.push(notification);
    },

    remove(notification: AppNotification) {
      this.notifications = this.notifications.filter((n) => n !== notification);
    },

    async removeAfter(notification: AppNotification, timeout: number) {
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          this.remove(notification);
          resolve(true);
        }, timeout);
      });
    },
  },
});
