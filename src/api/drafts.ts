import { http } from '@/api/client';
import { IAnswerPreview, IArticlePreview } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiDrafts = {
  async getAnswerDrafts(token: string) {
    return http.get<IAnswerPreview[]>(`/drafts/answers/`, authHeaders(token));
  },

  async getArticleDrafts(token: string) {
    return http.get<IArticlePreview[]>(`/drafts/articles/`, authHeaders(token));
  },
};
