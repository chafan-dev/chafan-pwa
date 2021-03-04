import axios from 'axios';
import { apiUrl } from '@/env';
import { IMsg, IQuestion, IQuestionArchive, IQuestionUpvotes } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiQuestion = {
  async upvoteQuestion(token: string, questionUUID: string) {
    return axios.post<IQuestionUpvotes>(
      `${apiUrl}/api/v1/questions/${questionUUID}/upvotes/`, null, authHeaders(token));
  },
  async cancelUpvoteQuestion(token: string, questionUUID: string) {
    return axios.delete<IQuestionUpvotes>(`${apiUrl}/api/v1/questions/${questionUUID}/upvotes/`, authHeaders(token));
  },
  async getQuestionArchives(token: string, questionUUID: string) {
    return axios.get<IQuestionArchive[]>(`${apiUrl}/api/v1/questions/${questionUUID}/archives/`, authHeaders(token));
  },
  async bumpViewsCounter(token: string, questionUUID: string) {
    return axios.post<IMsg>(`${apiUrl}/api/v1/questions/${questionUUID}/views/`, null, authHeaders(token));
  },
  async moveQuestion(token: string, questionUUID: string, newSiteUUID: string) {
    return axios.put<IQuestion>(
      `${apiUrl}/api/v1/questions/${questionUUID}/parent-site/${newSiteUUID}`, null, authHeaders(token));
  },
  async hideQuestion(token: string, questionUUID: string) {
    return axios.put<IQuestion>(
      `${apiUrl}/api/v1/questions/${questionUUID}/hide`, null, authHeaders(token));
  },
};
