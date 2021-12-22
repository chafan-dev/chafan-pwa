import axios from 'axios';
import { IQuestionPreview, IUserPreview } from '@/interfaces';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';

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
};
