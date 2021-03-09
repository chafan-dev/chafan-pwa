import axios from 'axios';
import { apiUrl } from '@/env';
import { IAnswerDraft, IAnswer, IAnswerCreate, IAnswerPreview, IAnswerUpdate,
  IArchive, IAnswerUpvotes, IUserAnswerBookmark, IMsg } from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiAnswer = {
  async upvoteAnswer(token: string, answerUUID: string) {
    return axios.post<IAnswerUpvotes>(`${apiUrl}/api/v1/answers/${answerUUID}/upvotes/`, null, authHeaders(token));
  },
  async cancelUpvoteAnswer(token: string, answerUUID: string) {
    return axios.delete<IAnswerUpvotes>(`${apiUrl}/api/v1/answers/${answerUUID}/upvotes/`, authHeaders(token));
  },
  async postAnswer(token: string, data: IAnswerCreate) {
    return axios.post<IAnswer>(`${apiUrl}/api/v1/answers/`, data, authHeaders(token));
  },
  async updateAnswer(token: string, answerUUID: string, payload: IAnswerUpdate) {
    return axios.put<IAnswer>(`${apiUrl}/api/v1/answers/${answerUUID}`, payload, authHeaders(token));
  },
  async deleteAnswer(token: string, answerUUID: string) {
    return axios.delete<IMsg>(`${apiUrl}/api/v1/answers/${answerUUID}`, authHeaders(token));
  },
  async getAnswerBookmarks(token: string) {
    return axios.get<IAnswerPreview[]>(`${apiUrl}/api/v1/me/answer-bookmarks/`, authHeaders(token));
  },
  async getAnswerBookmark(token: string, answerUUID: string) {
    return axios.get<IUserAnswerBookmark>(`${apiUrl}/api/v1/me/answer-bookmarks/${answerUUID}`, authHeaders(token));
  },
  async unbookmarkAnswer(token: string, answerUUID: string) {
    return axios.delete<IUserAnswerBookmark>(`${apiUrl}/api/v1/me/answer-bookmarks/${answerUUID}`,
      authHeaders(token));
  },
  async bookmarkAnswer(token: string, answerUUID: string) {
    return axios.post<IUserAnswerBookmark>(`${apiUrl}/api/v1/me/answer-bookmarks/${answerUUID}`,
      null, authHeaders(token));
  },
  async getAnswer(token: string, answerUUID: string) {
    return axios.get<IAnswer>(`${apiUrl}/api/v1/answers/${answerUUID}`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, answerUUID: string) {
    return axios.post<IMsg>(`${apiUrl}/api/v1/answers/${answerUUID}/views/`, null, authHeaders(token));
  },
  async getAnswerDraft(token: string, answerUUID: string) {
    return axios.get<IAnswerDraft>(`${apiUrl}/api/v1/answers/${answerUUID}/draft`, authHeaders(token));
  },
  async deleteAnswerDraft(token: string, answerUUID: string) {
    return axios.delete<IAnswerDraft>(`${apiUrl}/api/v1/answers/${answerUUID}/draft`, authHeaders(token));
  },
  async getAnswerArchives(token: string, answerUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IArchive[]>(`${apiUrl}/api/v1/answers/${answerUUID}/archives/`, authHeadersWithParams(token, params));
  },
};
