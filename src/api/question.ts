import axios from 'axios';
import { apiUrl } from '@/env';
import {
  IGenericResponse,
  IQuestion,
  IQuestionArchive,
  IQuestionCreate,
  IQuestionPage,
  IQuestionUpdate,
  IQuestionUpvotes,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiQuestion = {
  async upvoteQuestion(token: string, questionUUID: string) {
    return axios.post<IQuestionUpvotes>(
      `${apiUrl}/api/v1/questions/${questionUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteQuestion(token: string, questionUUID: string) {
    return axios.delete<IQuestionUpvotes>(
      `${apiUrl}/api/v1/questions/${questionUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async getQuestionArchives(token: string, questionUUID: string) {
    return axios.get<IQuestionArchive[]>(
      `${apiUrl}/api/v1/questions/${questionUUID}/archives/`,
      authHeaders(token)
    );
  },
  async getUpvotes(token: string, questionUUID: string) {
    return axios.get<IQuestionUpvotes>(
      `${apiUrl}/api/v1/questions/${questionUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async bumpViewsCounter(token: string, questionUUID: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/api/v1/questions/${questionUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async hideQuestion(token: string, questionUUID: string) {
    return axios.put<IQuestion>(
      `${apiUrl}/api/v1/questions/${questionUUID}/hide`,
      null,
      authHeaders(token)
    );
  },
  async getQuestion(token: string, questionUUID: string, withAnswers: boolean = false) {
    const params = new URLSearchParams();
    if (withAnswers) {
      params.append('with_answers', 'true');
    }
    return axios.get<IQuestion>(
      `${apiUrl}/api/v1/questions/${questionUUID}`,
      authHeadersWithParams(token, params)
    );
  },
  async getQuestionPage(token: string, questionUUID: string) {
    return axios.get<IQuestionPage>(
      `${apiUrl}/api/v1/questions/${questionUUID}/page`,
      authHeaders(token)
    );
  },
  async postQuestion(token: string, data: IQuestionCreate) {
    return axios.post<IQuestion>(`${apiUrl}/api/v1/questions/`, data, authHeaders(token));
  },
  async updateQuestion(token: string, questionUUID: string, payload: IQuestionUpdate) {
    return axios.put<IQuestion>(
      `${apiUrl}/api/v1/questions/${questionUUID}`,
      payload,
      authHeaders(token)
    );
  },
};
