import { http } from '@/api/client';
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
          return http.get<IQuestion>(`/questions/${questionUUID}`, authHeaders(token));
      } else {
          //info("get question without token");
          return http.get<IQuestion>(`/questions/${questionUUID}`);
      }
  },
  async getQuestionPage(token: string, questionUUID: string) {
      if (token) {
          return http.get<IQuestionPage>(`/questions/${questionUUID}/page`, authHeaders(token));
      } else {
          return http.get<IQuestionPage>(`/questions/${questionUUID}/page`);
      }
  },
  async upvoteQuestion(token: string, questionUUID: string) {
    return http.post<IQuestionUpvotes>(
      `/questions/${questionUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteQuestion(token: string, questionUUID: string) {
    return http.delete<IQuestionUpvotes>(
      `/questions/${questionUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async getQuestionArchives(token: string, questionUUID: string) {
    return http.get<IQuestionArchive[]>(
      `/questions/${questionUUID}/archives/`,
      authHeaders(token)
    );
  },
  async getUpvotes(token: string, questionUUID: string) {
    return http.get<IQuestionUpvotes>(
      `/questions/${questionUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async bumpViewsCounter(token: string, questionUUID: string) {
    return http.post<IGenericResponse>(
      `/questions/${questionUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async hideQuestion(token: string, questionUUID: string) {
    return http.put<IQuestion>(
      `/questions/${questionUUID}/hide`,
      null,
      authHeaders(token)
    );
  },
  async postQuestion(token: string, data: IQuestionCreate) {
    return http.post<IQuestion>(`/questions/`, data, authHeaders(token));
  },
  async updateQuestion(token: string, questionUUID: string, payload: IQuestionUpdate) {
    return http.put<IQuestion>(`/questions/${questionUUID}`, payload, authHeaders(token));
  },
};
