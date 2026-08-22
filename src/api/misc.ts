import { http } from '@/api/client';
import { ISiteMaps, ITopic } from '@/interfaces';

export const apiMisc = {
  async getSiteMaps() {
    return http.get<ISiteMaps>(`/sitemaps/`);
  },

  async getCategoryTopics() {
    return http.get<ITopic[]>(`/category-topics/`);
  },

  async generateLinkPreview(url: string) {
    const params = new URLSearchParams();
    params.append('url', url);
    return http.get<Record<string, string>>(`/link-preview/`, { params });
  },
};
