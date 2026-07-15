import { http } from '@/api/client';
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
  async getAnswer(answerUUID: string) {
    return http.get<IAnswer>(`/answers/${answerUUID}`);
  },
  async getAnswerUpvotes(answerUUID: string) {
    return http.get<IAnswerUpvotes>(`/answers/${answerUUID}/upvotes/`);
  },
  async upvoteAnswer(token: string, answerUUID: string) {
    return http.post<IAnswerUpvotes>(
      `/answers/${answerUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteAnswer(token: string, answerUUID: string) {
    return http.delete<IAnswerUpvotes>(
      `/answers/${answerUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async postAnswer(token: string, data: IAnswerCreate) {
    return http.post<IAnswer>(`/answers/`, data, authHeaders(token));
  },
  async updateAnswer(token: string, answerUUID: string, payload: IAnswerUpdate) {
    return http.put<IAnswer>(`/answers/${answerUUID}`, payload, authHeaders(token));
  },
  async deleteAnswer(token: string, answerUUID: string) {
    return http.delete<IGenericResponse>(`/answers/${answerUUID}`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, answerUUID: string) {
    return http.post<IGenericResponse>(
      `/answers/${answerUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getAnswerDraft(token: string, answerUUID: string) {
    return http.get<IAnswerDraft>(`/answers/${answerUUID}/draft`, authHeaders(token));
  },
  async deleteAnswerDraft(token: string, answerUUID: string) {
    return http.delete<IAnswerDraft>(`/answers/${answerUUID}/draft`, authHeaders(token));
  },
  async getAnswerArchives(token: string, answerUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IAnswerArchive[]>(
      `/answers/${answerUUID}/archives/`,
      authHeadersWithParams(token, params)
    );
  },
  async getSuggestions(token: string, uuid: string) {
    return http.get<IAnswerSuggestEdit[]>(
      `/answers/${uuid}/suggestions/`,
      authHeaders(token)
    );
  },
  async createSuggestion(token: string, payload: IAnswerSuggestEditCreate) {
    return http.post<IAnswerSuggestEdit>(
      `/answer-suggest-edits/`,
      payload,
      authHeaders(token)
    );
  },
  async updateSuggestion(token: string, uuid: string, payload: IAnswerSuggestEditUpdate) {
    return http.put<IAnswerSuggestEdit>(
      `/answer-suggest-edits/${uuid}`,
      payload,
      authHeaders(token)
    );
  },
};
