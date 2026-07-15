import { http } from '@/api/client';
import { authHeaders } from '@/utils';
import {
  IGenericResponse,
  ISubmission,
  ISubmissionArchive,
  ISubmissionCreate,
  ISubmissionSuggestion,
  ISubmissionSuggestionCreate,
  ISubmissionSuggestionUpdate,
  ISubmissionUpdate,
  ISubmissionUpvotes,
} from '@/interfaces';

export const apiSubmission = {
  async postSubmission(token: string, data: ISubmissionCreate) {
    return http.post<ISubmission>(`/submissions/`, data, authHeaders(token));
  },
  async getForUser(token: string) {
    return http.get<ISubmission[]>(`/submissions/`, authHeaders(token));
  },
  async getSubmission(token: string, uuid: string) {
    return http.get<ISubmission>(`/submissions/${uuid}`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, uuid: string) {
    return http.post<IGenericResponse>(
      `/submissions/${uuid}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getUpvotes(token: string, uuid: string) {
    return http.get<ISubmissionUpvotes>(
      `/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
  async updateSubmission(token: string, uuid: string, payload: ISubmissionUpdate) {
    return http.put<ISubmission>(`/submissions/${uuid}`, payload, authHeaders(token));
  },
  async upvoteSubmission(token: string, uuid: string) {
    return http.post<ISubmissionUpvotes>(
      `/submissions/${uuid}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteSubmission(token: string, uuid: string) {
    return http.delete<ISubmissionUpvotes>(
      `/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
  async getSubmissionArchives(token: string, uuid: string) {
    return http.get<ISubmissionArchive[]>(
      `/submissions/${uuid}/archives/`,
      authHeaders(token)
    );
  },
  async getSubmissionUpvotes(token: string, uuid: string) {
    return http.get<ISubmissionUpvotes>(
      `/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
  async getSuggestions(token: string, uuid: string) {
    return http.get<ISubmissionSuggestion[]>(
      `/submissions/${uuid}/suggestions/`,
      authHeaders(token)
    );
  },
  async hideSubmission(token: string, uuid: string) {
    return http.put<ISubmission>(`/submissions/${uuid}/hide`, null, authHeaders(token));
  },
  async createSuggestion(token: string, payload: ISubmissionSuggestionCreate) {
    return http.post<ISubmissionSuggestion>(
      `/submission-suggestions/`,
      payload,
      authHeaders(token)
    );
  },
  async updateSubmissionSuggestion(
    token: string,
    uuid: string,
    payload: ISubmissionSuggestionUpdate
  ) {
    return http.put<ISubmissionSuggestion>(
      `/submission-suggestions/${uuid}`,
      payload,
      authHeaders(token)
    );
  },
  async upvote(token: string, uuid: string) {
    return http.post<ISubmissionUpvotes>(
      `/submissions/${uuid}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvote(token: string, uuid: string) {
    return http.delete<ISubmissionUpvotes>(
      `/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
};
