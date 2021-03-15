import axios from 'axios';
import { IQuestionPreview } from '@/interfaces';
import { apiUrl } from '@/env';
import { authHeaders } from '@/utils';

export const apiDiscovery = {
  async getPinnedQuestions() {
    return axios.get<IQuestionPreview[]>(`${apiUrl}/api/v1/discovery/pinned-questions/`);
  },
  async getPendingQuestions(token: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/api/v1/discovery/pending-questions/`,
      authHeaders(token)
    );
  },
  async getInterestingQuestions(token: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/api/v1/discovery/interesting-questions/`,
      authHeaders(token)
    );
  },
};
