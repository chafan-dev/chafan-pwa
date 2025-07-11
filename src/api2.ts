import axios from 'axios';
import { apiUrl } from '@/env';
import {
  ICoinPayment,
  IFeedback,
  IGenericResponse,
  INotification,
  IUploadedImage,
  IUserInvite,
  IWsAuthResponse,
} from './interfaces';
import { authHeaders, authHeadersFormData } from './utils';

// NOTE: This is because webpack seems having weird bug when I put too many things in api.ts
export const api2 = {
  async getCoinPayments(token: string) {
    return axios.get<ICoinPayment[]>(`${apiUrl}/coin-payments/`, authHeaders(token));
  },
  async getReadNotifications(token: string) {
    return axios.get<INotification[]>(`${apiUrl}/notifications/read/`, authHeaders(token));
  },
  async inviteUser(token: string, payload: IUserInvite) {
    return axios.post<IGenericResponse>(`${apiUrl}/users/invite`, payload, authHeaders(token));
  },
  async uploadFile(token: string, payload: FormData) {
    return axios.post<IUploadedImage>(
      `${apiUrl}/upload/images/`,
      payload,
      authHeadersFormData(token)
    );
  },
  async getWsToken(token: string) {
    return axios.post<IWsAuthResponse>(`${apiUrl}/ws/token`, null, authHeaders(token));
  },
  async uploadFeedback(token: string, payload: FormData) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/feedbacks/`,
      payload,
      authHeadersFormData(token)
    );
  },
  async getFeedbacks(token: string) {
    return axios.get<IFeedback[]>(`${apiUrl}/feedbacks/`, authHeadersFormData(token));
  },
};
