import { http } from '@/api/client';
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
    return http.post<IArticleUpvotes>(
      `/articles/${articleUUID}/upvotes/`,
      null,
      authHeaders(token)
    );
  },
  async cancelUpvoteArticle(token: string, articleUUID: string) {
    return http.delete<IArticleUpvotes>(
      `/articles/${articleUUID}/upvotes/`,
      authHeaders(token)
    );
  },
  async postArticle(token: string, data: IArticleCreate) {
    return http.post<IArticle>(`/articles/`, data, authHeaders(token));
  },
  async updateArticle(token: string, articleUUID: string, payload: IArticleUpdate) {
    return http.put<IArticle>(`/articles/${articleUUID}`, payload, authHeaders(token));
  },
  async deleteArticle(token: string, articleUUID: string) {
    return http.delete<IGenericResponse>(`/articles/${articleUUID}`, authHeaders(token));
  },
  async getArticle(token: string, articleUUID: string) {
    return http.get<IArticle>(`/articles/${articleUUID}`, authHeaders(token));
  },
  async getArticleColumn(token: string, articleColumnUUID: string) {
    return http.get<IArticleColumn>(
      `/article-columns/${articleColumnUUID}`,
      authHeaders(token)
    );
  },
  async bumpViewsCounter(token: string, articleUUID: string) {
    return http.post<IGenericResponse>(
      `/articles/${articleUUID}/views/`,
      null,
      authHeaders(token)
    );
  },
  async getArticleArchives(token: string, articleUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IArticleArchive[]>(
      `/articles/${articleUUID}/archives/`,
      authHeadersWithParams(token, params)
    );
  },
  async getArticlesOfColumn(token: string, articleColumnUUID: string) {
    return http.get<IArticlePreview[]>(
      `/article-columns/${articleColumnUUID}/articles/`,
      authHeaders(token)
    );
  },
  async createArticleColumn(token: string, data: IArticleColumnCreate) {
    return http.post<IArticleColumn>(`/article-columns/`, data, authHeaders(token));
  },
  async updateArticleColumn(token: string, articleColumnUUID: string, data: IArticleColumnUpdate) {
    return http.put<IArticleColumn>(
      `/article-columns/${articleColumnUUID}`,
      data,
      authHeaders(token)
    );
  },
  async getArticleDraft(token: string, articleUUID: string) {
    return http.get<IArticleDraft>(`/articles/${articleUUID}/draft`, authHeaders(token));
  },
  async deleteArticleDraft(token: string, articleUUID: string) {
    return http.delete<IArticleDraft>(
      `/articles/${articleUUID}/draft`,
      authHeaders(token)
    );
  },
  async getArticleColumnSubscription(token: string, articleColumnUUID: string) {
    return http.get<IUserArticleColumnSubscription>(
      `/me/article-column-subscriptions/${articleColumnUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeArticleColumn(token: string, articleColumnUUID: string) {
    return http.delete<IUserArticleColumnSubscription>(
      `/me/article-column-subscriptions/${articleColumnUUID}`,
      authHeaders(token)
    );
  },
  async subscribeArticleColumn(token: string, articleColumnUUID: string) {
    return http.post<IUserArticleColumnSubscription>(
      `/me/article-column-subscriptions/${articleColumnUUID}`,
      null,
      authHeaders(token)
    );
  },
};
