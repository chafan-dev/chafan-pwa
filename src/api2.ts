import axios from 'axios';
import { apiUrl, lambdaUrlBase } from '@/env';
import {
  ICoinPayment,
  IComment,
  IDynoState,
  IFeedback,
  IGenericResponse,
  INotification,
  IReaction,
  IReactions,
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
  async getChildComments(token: string, commentId: string) {
    return axios.get<IComment[]>(
      `${apiUrl}/comments/${commentId}/child-comments/`,
      authHeaders(token)
    );
  },
  async getWsToken(token: string) {
    return axios.post<IWsAuthResponse>(`${apiUrl}/ws/token`, null, authHeaders(token));
  },
  async getReactions(
    token: string,
    objectId: string,
    objectType: 'question' | 'answer' | 'comment' | 'article'
  ) {
    return axios.get<IReactions>(
      `${apiUrl}/reactions/${objectType}/${objectId}`,
      authHeaders(token)
    );
  },
  async updateReaction(token: string, payload: IReaction) {
    return axios.put<IReactions>(`${apiUrl}/reactions/`, payload, authHeaders(token));
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
  async getDevDynoState() {
    return axios.get<IDynoState>(`${lambdaUrlBase}/chafan-dyno-check`);
  },
};
