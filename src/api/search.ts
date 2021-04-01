import axios from 'axios';
import { apiUrl } from '@/env';
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
    return axios.get<IUserPreview[]>(
      `${apiUrl}/api/v1/search/users/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchTopics(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return axios.get<ITopic[]>(
      `${apiUrl}/api/v1/search/topics/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchQuestions(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/api/v1/search/questions/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchSites(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return axios.get<ISite[]>(
      `${apiUrl}/api/v1/search/sites/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchSubmissions(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return axios.get<ISubmission[]>(
      `${apiUrl}/api/v1/search/submissions/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchAnswers(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return axios.get<IAnswerPreview[]>(
      `${apiUrl}/api/v1/search/answers/`,
      authHeadersWithParams(token, params)
    );
  },
  async searchArticles(token: string, fragment: string) {
    const params = new URLSearchParams();
    params.append('q', fragment);
    return axios.get<IArticlePreview[]>(
      `${apiUrl}/api/v1/search/articles/`,
      authHeadersWithParams(token, params)
    );
  },
};
