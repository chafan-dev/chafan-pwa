import axios from 'axios';
import { IQuestionPreview } from '@/interfaces';
import { apiUrl } from '@/env';

export const apiDiscovery = {
  async getPinnedQuestions() {
    return axios.get<IQuestionPreview[]>(`${apiUrl}/api/v1/discovery/pinned-questions/`);
  },
};
