import { http } from '@/api/client';
import { IGenericResponse, INotification, INotificationUpdate } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiNotifications = {
  async getUnreadNotifications(token: string) {
    return http.get<INotification[]>(`/notifications/unread/`, authHeaders(token));
  },

  async getReadNotifications(token: string) {
    return http.get<INotification[]>(`/notifications/read/`, authHeaders(token));
  },

  async updateNotification(token: string, notifId: number, payload: INotificationUpdate) {
    // notifId can arrive via WebSocket payloads; constrain to a non-negative
    // integer path segment so the request URL cannot be attacker-controlled.
    if (typeof notifId !== 'number' || !Number.isSafeInteger(notifId) || notifId < 0) {
      throw new TypeError('Invalid notification id');
    }
    const path = `/notifications/${notifId}`;
    if (!/^\/notifications\/\d+$/.test(path)) {
      throw new TypeError('Invalid notification path');
    }
    return http.put<IGenericResponse>(path, payload, authHeaders(token));
  },
};
