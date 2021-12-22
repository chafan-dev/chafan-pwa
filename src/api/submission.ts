import axios from 'axios';
import { apiUrl } from '@/env';
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
    return axios.post<ISubmission>(`${apiUrl}/submissions/`, data, authHeaders(token));
  },
  async getForUser(token: string) {
    return axios.get<ISubmission[]>(`${apiUrl}/submissions/`, authHeaders(token));
  },
  async getSubmission(token: string, uuid: string) {
    return axios.get<ISubmission>(`${apiUrl}/submissions/${uuid}`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, uuid: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/submissions/${uuid}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getUpvotes(token: string, uuid: string) {
    return axios.get<ISubmissionUpvotes>(
      `${apiUrl}/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
  async updateSubmission(token: string, uuid: string, payload: ISubmissionUpdate) {
    return axios.put<ISubmission>(`${apiUrl}/submissions/${uuid}`, payload, authHeaders(token));
  },
  async upvoteSubmission(token: string, uuid: string) {
    return axios.post<ISubmissionUpvotes>(
      `${apiUrl}/submissions/${uuid}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteSubmission(token: string, uuid: string) {
    return axios.delete<ISubmissionUpvotes>(
      `${apiUrl}/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
  async getSubmissionArchives(token: string, uuid: string) {
    return axios.get<ISubmissionArchive[]>(
      `${apiUrl}/submissions/${uuid}/archives/`,
      authHeaders(token)
    );
  },
  async getSubmissionUpvotes(token: string, uuid: string) {
    return axios.get<ISubmissionUpvotes>(
      `${apiUrl}/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
  async getSuggestions(token: string, uuid: string) {
    return axios.get<ISubmissionSuggestion[]>(
      `${apiUrl}/submissions/${uuid}/suggestions/`,
      authHeaders(token)
    );
  },
  async hideSubmission(token: string, uuid: string) {
    return axios.put<ISubmission>(`${apiUrl}/submissions/${uuid}/hide`, null, authHeaders(token));
  },
  async createSuggestion(token: string, payload: ISubmissionSuggestionCreate) {
    return axios.post<ISubmissionSuggestion>(
      `${apiUrl}/submission-suggestions/`,
      payload,
      authHeaders(token)
    );
  },
  async updateSubmissionSuggestion(
    token: string,
    uuid: string,
    payload: ISubmissionSuggestionUpdate
  ) {
    return axios.put<ISubmissionSuggestion>(
      `${apiUrl}/submission-suggestions/${uuid}`,
      payload,
      authHeaders(token)
    );
  },
  async upvote(token: string, uuid: string) {
    return axios.post<ISubmissionUpvotes>(
      `${apiUrl}/submissions/${uuid}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvote(token: string, uuid: string) {
    return axios.delete<ISubmissionUpvotes>(
      `${apiUrl}/submissions/${uuid}/upvotes/`,
      authHeaders(token)
    );
  },
};
