import axios from 'axios';
import { apiUrl } from '@/env';
import {
  IAnswer,
  IAnswerCreate,
  IAnswerDraft,
  IAnswerUpdate,
  IAnswerUpvotes,
  IAnswerArchive,
  IMsg,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiAnswer = {
  async getAnswerUpvotes(token: string, answerUUID: string) {
    return axios.get<IAnswerUpvotes>(
      `${apiUrl}/api/v1/answers/${answerUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async upvoteAnswer(token: string, answerUUID: string) {
    return axios.post<IAnswerUpvotes>(
      `${apiUrl}/api/v1/answers/${answerUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteAnswer(token: string, answerUUID: string) {
    return axios.delete<IAnswerUpvotes>(
      `${apiUrl}/api/v1/answers/${answerUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async postAnswer(token: string, data: IAnswerCreate) {
    return axios.post<IAnswer>(`${apiUrl}/api/v1/answers/`, data, authHeaders(token));
  },
  async updateAnswer(token: string, answerUUID: string, payload: IAnswerUpdate) {
    return axios.put<IAnswer>(
      `${apiUrl}/api/v1/answers/${answerUUID}`,
      payload,
      authHeaders(token)
    );
  },
  async deleteAnswer(token: string, answerUUID: string) {
    return axios.delete<IMsg>(`${apiUrl}/api/v1/answers/${answerUUID}`, authHeaders(token));
  },
  async getAnswer(token: string, answerUUID: string) {
    return axios.get<IAnswer>(`${apiUrl}/api/v1/answers/${answerUUID}`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, answerUUID: string) {
    return axios.post<IMsg>(
      `${apiUrl}/api/v1/answers/${answerUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getAnswerDraft(token: string, answerUUID: string) {
    return axios.get<IAnswerDraft>(
      `${apiUrl}/api/v1/answers/${answerUUID}/draft`,
      authHeaders(token)
    );
  },
  async deleteAnswerDraft(token: string, answerUUID: string) {
    return axios.delete<IAnswerDraft>(
      `${apiUrl}/api/v1/answers/${answerUUID}/draft`,
      authHeaders(token)
    );
  },
  async getAnswerArchives(token: string, answerUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IAnswerArchive[]>(
      `${apiUrl}/api/v1/answers/${answerUUID}/archives/`,
      authHeadersWithParams(token, params)
    );
  },
};
