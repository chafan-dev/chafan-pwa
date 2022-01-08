import axios from 'axios';
import { IAnswerPreview, IQuestionPreview, IUserPreview } from '@/interfaces';
import { apiUrl } from '@/env';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiDiscovery = {
  async getPinnedQuestions() {
    return axios.get<IQuestionPreview[]>(`${apiUrl}/discovery/pinned-questions/`);
  },
  async getPendingQuestions(token: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/discovery/pending-questions/`,
      authHeaders(token)
    );
  },
  async getInterestingQuestions(token: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/discovery/interesting-questions/`,
      authHeaders(token)
    );
  },
  async getInterestingUsers(token: string) {
    return axios.get<IUserPreview[]>(`${apiUrl}/discovery/interesting-users/`, authHeaders(token));
  },
  async getFeaturedAnswers(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IAnswerPreview[]>(
      `${apiUrl}/discovery/featured-answers/`,
      authHeadersWithParams(token, params)
    );
  },
};
