import axios from 'axios';
import { apiUrl } from '@/env';
import {
  IAnswer,
  IAnswerArchive,
  IAnswerCreate,
  IAnswerDraft,
  IAnswerUpdate,
  IAnswerUpvotes,
  IGenericResponse,
  IAnswerSuggestEdit,
  IAnswerSuggestEditCreate,
  IAnswerSuggestEditUpdate,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiAnswer = {
  async getAnswer(_token: string, answerUUID: string) {
    return axios.get<IAnswer>(`${apiUrl}/answers/${answerUUID}`);
  },
  async getAnswerUpvotes(_token: string, answerUUID: string) {
    return axios.get<IAnswerUpvotes>(`${apiUrl}/answers/${answerUUID}/upvotes/`);
  },
  async upvoteAnswer(token: string, answerUUID: string) {
    return axios.post<IAnswerUpvotes>(
      `${apiUrl}/answers/${answerUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteAnswer(token: string, answerUUID: string) {
    return axios.delete<IAnswerUpvotes>(
      `${apiUrl}/answers/${answerUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async postAnswer(token: string, data: IAnswerCreate) {
    return axios.post<IAnswer>(`${apiUrl}/answers/`, data, authHeaders(token));
  },
  async updateAnswer(token: string, answerUUID: string, payload: IAnswerUpdate) {
    return axios.put<IAnswer>(`${apiUrl}/answers/${answerUUID}`, payload, authHeaders(token));
  },
  async deleteAnswer(token: string, answerUUID: string) {
    return axios.delete<IGenericResponse>(`${apiUrl}/answers/${answerUUID}`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, answerUUID: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/answers/${answerUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getAnswerDraft(token: string, answerUUID: string) {
    return axios.get<IAnswerDraft>(`${apiUrl}/answers/${answerUUID}/draft`, authHeaders(token));
  },
  async deleteAnswerDraft(token: string, answerUUID: string) {
    return axios.delete<IAnswerDraft>(`${apiUrl}/answers/${answerUUID}/draft`, authHeaders(token));
  },
  async getAnswerArchives(token: string, answerUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IAnswerArchive[]>(
      `${apiUrl}/answers/${answerUUID}/archives/`,
      authHeadersWithParams(token, params)
    );
  },
  async getSuggestions(token: string, uuid: string) {
    return axios.get<IAnswerSuggestEdit[]>(
      `${apiUrl}/answers/${uuid}/suggestions/`,
      authHeaders(token)
    );
  },
  async createSuggestion(token: string, payload: IAnswerSuggestEditCreate) {
    return axios.post<IAnswerSuggestEdit>(
      `${apiUrl}/answer-suggest-edits/`,
      payload,
      authHeaders(token)
    );
  },
  async updateSuggestion(token: string, uuid: string, payload: IAnswerSuggestEditUpdate) {
    return axios.put<IAnswerSuggestEdit>(
      `${apiUrl}/answer-suggest-edits/${uuid}`,
      payload,
      authHeaders(token)
    );
  },
};
