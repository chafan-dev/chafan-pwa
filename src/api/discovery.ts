import { http } from '@/api/client';
import { IAnswerPreview, IQuestionPreview, IUserPreview } from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiDiscovery = {
  async getPinnedQuestions() {
    return http.get<IQuestionPreview[]>(`/discovery/pinned-questions/`);
  },
  async getPendingQuestions(token: string) {
    return http.get<IQuestionPreview[]>(
      `/discovery/pending-questions/`,
      authHeaders(token)
    );
  },
  async getInterestingQuestions(token: string) {
    return http.get<IQuestionPreview[]>(
      `/discovery/interesting-questions/`,
      authHeaders(token)
    );
  },
  async getInterestingUsers(token: string) {
    return http.get<IUserPreview[]>(`/discovery/interesting-users/`, authHeaders(token));
  },
  async getFeaturedAnswers(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IAnswerPreview[]>(
      `/discovery/featured-answers/`,
      authHeadersWithParams(token, params)
    );
  },
};
