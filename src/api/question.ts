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
import { authHeaders } from '@/utils';
import  { info }  from '@/logging'

export const apiQuestion = {
  async getQuestion(token: string, questionUUID: string) {
      if (token) {
          //info("get question with token: " + token);
          return axios.get<IQuestion>(`${apiUrl}/questions/${questionUUID}`, authHeaders(token));
      } else {
          //info("get question without token");
          return axios.get<IQuestion>(`${apiUrl}/questions/${questionUUID}`);
      }
  },
  async getQuestionPage(token: string, questionUUID: string) {
      if (token) {
          return axios.get<IQuestionPage>(`${apiUrl}/questions/${questionUUID}/page`, authHeaders(token));
      } else {
          return axios.get<IQuestionPage>(`${apiUrl}/questions/${questionUUID}/page`);
      }
  },
  async upvoteQuestion(token: string, questionUUID: string) {
    return axios.post<IQuestionUpvotes>(
      `${apiUrl}/questions/${questionUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteQuestion(token: string, questionUUID: string) {
    return axios.delete<IQuestionUpvotes>(
      `${apiUrl}/questions/${questionUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async getQuestionArchives(token: string, questionUUID: string) {
    return axios.get<IQuestionArchive[]>(
      `${apiUrl}/questions/${questionUUID}/archives/`,
      authHeaders(token)
    );
  },
  async getUpvotes(token: string, questionUUID: string) {
    return axios.get<IQuestionUpvotes>(
      `${apiUrl}/questions/${questionUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async bumpViewsCounter(token: string, questionUUID: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/questions/${questionUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async hideQuestion(token: string, questionUUID: string) {
    return axios.put<IQuestion>(
      `${apiUrl}/questions/${questionUUID}/hide`,
      null,
      authHeaders(token)
    );
  },
  async postQuestion(token: string, data: IQuestionCreate) {
    return axios.post<IQuestion>(`${apiUrl}/questions/`, data, authHeaders(token));
  },
  async updateQuestion(token: string, questionUUID: string, payload: IQuestionUpdate) {
    return axios.put<IQuestion>(`${apiUrl}/questions/${questionUUID}`, payload, authHeaders(token));
  },
};
