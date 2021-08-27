import axios from 'axios';
import { apiUrl } from '@/env';
import {
  IArticle,
  IArticleArchive,
  IArticleColumn,
  IArticleColumnCreate,
  IArticleColumnUpdate,
  IArticleCreate,
  IArticleDraft,
  IArticlePreview,
  IArticleUpdate,
  IArticleUpvotes,
  IGenericResponse,
  IUserArticleColumnSubscription,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiArticle = {
  async upvoteArticle(token: string, articleUUID: string) {
    return axios.post<IArticleUpvotes>(
      `${apiUrl}/api/v1/articles/${articleUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteArticle(token: string, articleUUID: string) {
    return axios.delete<IArticleUpvotes>(
      `${apiUrl}/api/v1/articles/${articleUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async postArticle(token: string, data: IArticleCreate) {
    return axios.post<IArticle>(`${apiUrl}/api/v1/articles/`, data, authHeaders(token));
  },
  async updateArticle(token: string, articleUUID: string, payload: IArticleUpdate) {
    return axios.put<IArticle>(
      `${apiUrl}/api/v1/articles/${articleUUID}`,
      payload,
      authHeaders(token)
    );
  },
  async deleteArticle(token: string, articleUUID: string) {
    return axios.delete<IGenericResponse>(
      `${apiUrl}/api/v1/articles/${articleUUID}`,
      authHeaders(token)
    );
  },
  async getArticle(token: string, articleUUID: string) {
    return axios.get<IArticle>(`${apiUrl}/api/v1/articles/${articleUUID}`, authHeaders(token));
  },
  async getArticleColumn(token: string, articleColumnUUID: string) {
    return axios.get<IArticleColumn>(
      `${apiUrl}/api/v1/article-columns/${articleColumnUUID}`,
      authHeaders(token)
    );
  },
  async bumpViewsCounter(token: string, articleUUID: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/api/v1/articles/${articleUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getArticleArchives(token: string, articleUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IArticleArchive[]>(
      `${apiUrl}/api/v1/articles/${articleUUID}/archives/`,
      authHeadersWithParams(token, params)
    );
  },
  async getArticlesOfColumn(token: string, articleColumnUUID: string) {
    return axios.get<IArticlePreview[]>(
      `${apiUrl}/api/v1/article-columns/${articleColumnUUID}/articles/`,
      authHeaders(token)
    );
  },
  async createArticleColumn(token: string, data: IArticleColumnCreate) {
    return axios.post<IArticleColumn>(
      `${apiUrl}/api/v1/article-columns/`,
      data,
      authHeaders(token)
    );
  },
  async updateArticleColumn(token: string, articleColumnUUID: string, data: IArticleColumnUpdate) {
    return axios.put<IArticleColumn>(
      `${apiUrl}/api/v1/article-columns/${articleColumnUUID}`,
      data,
      authHeaders(token)
    );
  },
  async getArticleDraft(token: string, articleUUID: string) {
    return axios.get<IArticleDraft>(
      `${apiUrl}/api/v1/articles/${articleUUID}/draft`,
      authHeaders(token)
    );
  },
  async deleteArticleDraft(token: string, articleUUID: string) {
    return axios.delete<IArticleDraft>(
      `${apiUrl}/api/v1/articles/${articleUUID}/draft`,
      authHeaders(token)
    );
  },
  async getArticleColumnSubscription(token: string, articleColumnUUID: string) {
    return axios.get<IUserArticleColumnSubscription>(
      `${apiUrl}/api/v1/me/article-column-subscriptions/${articleColumnUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeArticleColumn(token: string, articleColumnUUID: string) {
    return axios.delete<IUserArticleColumnSubscription>(
      `${apiUrl}/api/v1/me/article-column-subscriptions/${articleColumnUUID}`,
      authHeaders(token)
    );
  },
  async subscribeArticleColumn(token: string, articleColumnUUID: string) {
    return axios.post<IUserArticleColumnSubscription>(
      `${apiUrl}/api/v1/me/article-column-subscriptions/${articleColumnUUID}`,
      null,
      authHeaders(token)
    );
  },
};
