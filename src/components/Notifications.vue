<template>
  <span>
    <v-menu
      v-if="userProfile"
      v-model="showNotifications"
      :close-on-content-click="false"
      :max-width="Math.min($vuetify.breakpoint.width * 0.9, 600)"
      :min-width="Math.min($vuetify.breakpoint.width * 0.9, 600)"
      left
      offset-y
      transition="slide-x-transition"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          :class="{ 'thin-btn': !$vuetify.breakpoint.mdAndUp }"
          dark
          icon
        >
          <v-badge
            v-if="unreadNotificationsCount > 0"
            :content="unreadNotificationsCount"
            color="green"
          >
            <NotificationIcon />
          </v-badge>
          <NotificationIcon v-else />
        </v-btn>
      </template>

      <v-card>
        <v-sheet
          class="h-sticky d-flex align-center justify-space-between elevation-1 rounded-t mb-1"
        >
          <v-subheader class="font-weight-bold">通知</v-subheader>

          <div class="mr-1">
            <v-btn class="slim-btn" depressed small @click="readAllNotifs">
              <MuteNotificationIcon />
              全部已读
            </v-btn>
          </div>
        </v-sheet>

        <div style="max-height: 300px; overflow: auto">
          <v-list class="py-0">
            <template v-for="(notif, idx) in notifications">
              <v-divider v-if="idx" :key="'divider-' + notif.id" class="mx-1" />

              <template v-if="notif.is_read">
                <v-list-item :key="notif.id" class="grey lighten-4" color="grey">
                  <Event
                    v-if="notif.event"
                    :enable-user-link-popup="false"
                    :event="notif.event"
                    :on-click-handler="
                      () => {
                        showNotifications = false;
                      }
                    "
                    class="my-2"
                  />
                </v-list-item>
              </template>
              <template v-else>
                <v-list-item :key="notif.id">
                  <Event
                    v-if="notif.event"
                    :enable-user-link-popup="false"
                    :event="notif.event"
                    :on-click-handler="
                      () => {
                        showNotifications = false;
                        readNotif(notif);
                      }
                    "
                    class="my-2"
                  />
                  <v-spacer />
                  <MuteNotificationIcon class="ml-2" @click="readNotif(notif)" />
                </v-list-item>
              </template>
            </template>
            <div v-if="loadNotifsIntermediate" class="text-center">
              <v-progress-circular color="primary" indeterminate size="20" />
            </div>
          </v-list>
        </div>
      </v-card>
    </v-menu>

    <v-dialog v-model="showReadNotifications">
      <v-list>
        <v-card-title primary-title>
          <div class="headline primary--text">已读通知</div>
        </v-card-title>
        <v-list-item v-for="notif in notifications" :key="notif.id">
          <Event v-if="notif.event" :event="notif.event" />
        </v-list-item>
      </v-list>
    </v-dialog>
  </span>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';

import MuteNotificationIcon from '@/components/icons/MuteNotificationIcon.vue';
import NotificationIcon from '@/components/icons/NotificationIcon.vue';
import { INotification, IWsUserMsg } from '@/interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { api } from '@/api';
import { api2 } from '@/api2';
import { wsUrl } from '@/env';
import Event from '@/components/Event.vue';
import { CVue } from '@/common';
import { logDebug } from '@/utils';

@Component({
  components: {
    MuteNotificationIcon,
    NotificationIcon,
    Event,
  },
})
export default class Notifications extends CVue {
  private notifications: INotification[] = [];
  private loadNotifsIntermediate = true;
  private showReadNotifications = false;
  private showNotifications = false;
  private wsConnection: WebSocket | null = null;

  get unreadNotificationsCount() {
    return this.notifications.filter((x) => !x.is_read).length;
  }

  private async mounted() {
    await dispatchCaptureApiError(this.$store, async () => {
      const notifs = (await api.getUnreadNotifications(this.$store.state.main.token)).data;
      if (notifs) {
        notifs.forEach((notif) => {
          if (notif !== null) {
            this.notifications.push(notif);
          }
        });
      }
      this.notifications.push(...(await api2.getReadNotifications(this.token)).data);
      this.loadNotifsIntermediate = false;

      const wsToken = (await api2.getWsToken(this.token)).data.token;
      this.wsConnection = new WebSocket(wsUrl + '/ws?token=' + wsToken);
      this.wsConnection.onmessage = (message) => {
        const wsMsg = JSON.parse(message.data) as IWsUserMsg;
        this.handleWsMsg(wsMsg);
      };
      this.wsConnection.onerror = (err) => {
        logDebug('notif ws err: ' + err);
      };
      this.wsConnection.onopen = () => {
        logDebug('notif ws opened');
      };
      this.wsConnection.onclose = () => {
        logDebug('notif ws closed');
      };
    });
  }

  private handleWsMsg(msg: IWsUserMsg) {
    if (msg.type === 'notification') {
      if (!this.notifications.find((notif) => notif.id === msg.data.id)) {
        this.notifications.unshift(msg.data);
      }
    }
  }

  private readNotif(notif: INotification) {
    notif.is_read = true;
    api.updateNotification(this.$store.state.main.token, notif.id, {
      is_read: true,
    });
  }

  private async readAllNotifs() {
    this.notifications.forEach((notif) => {
      this.readNotif(notif);
    });
  }
}
</script>
