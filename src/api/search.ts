import { http } from '@/api/client';
import {
  IAnswerPreview,
  IArticlePreview,
  IQuestionPreview,
  ISite,
  ISubmission,
  ITopic,
  IUserPreview,
} from '@/interfaces';
import { authHeadersWithParams } from '@/utils';

export const apiSearch = {
  async searchUsers(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<IUserPreview[]>(
      `/search/users/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchTopics(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<ITopic[]>(`/search/topics/`, authHeadersWithParams(token, params));
  },
  async searchQuestions(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<IQuestionPreview[]>(
      `/search/questions/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchSites(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<ISite[]>(`/search/sites/`, authHeadersWithParams(token, params));
  },
  async searchSubmissions(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<ISubmission[]>(
      `/search/submissions/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchAnswers(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<IAnswerPreview[]>(
      `/search/answers/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchArticles(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return http.get<IArticlePreview[]>(
      `/search/articles/`,
      authHeadersWithParams(token, params)
    );
  },
};
