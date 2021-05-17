import axios from 'axios';
import { IWebhook, IWebhookCreate, IWebhookUpdate } from '@/interfaces';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';

export const apiWebhook = {
  async create(token: string, payload: IWebhookCreate) {
    return axios.post<IWebhook>(`${apiUrl}/api/v1/webhooks/`, payload, authHeaders(token));
  },
  async update(token: string, id: number, payload: IWebhookUpdate) {
    return axios.put<IWebhook>(`${apiUrl}/api/v1/webhooks/${id}`, payload, authHeaders(token));
  },
};
