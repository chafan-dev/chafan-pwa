import { http } from '@/api/client';
import { IWebhook, IWebhookCreate, IWebhookUpdate } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiWebhook = {
  async create(token: string, payload: IWebhookCreate) {
    return http.post<IWebhook>(`/webhooks/`, payload, authHeaders(token));
  },
  async update(token: string, id: number, payload: IWebhookUpdate) {
    return http.put<IWebhook>(`/webhooks/${id}`, payload, authHeaders(token));
  },
};
