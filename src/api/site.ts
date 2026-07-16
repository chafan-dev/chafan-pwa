import { http } from '@/api/client';
import {
  ICreateSiteResponse,
  IGenericResponse,
  IQuestionPreview,
  ISite,
  ISiteApplicationResponse,
  ISiteCreate,
  ISiteUpdate,
  ISubmission,
  IWebhook,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiSite = {
  async getSite(subdomain: string) {
    return http.get<ISite>(`/sites/${subdomain}`);
  },
  async getSiteQuestions(siteUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IQuestionPreview[]>(
      `/sites/${siteUUID}/questions/`,
      { params }
    );
  },
  async updateSiteConfig(token: string, siteUUID: string, payload: ISiteUpdate) {
    return http.put<ISite>(`/sites/${siteUUID}/config`, payload, authHeaders(token));
  },
  async getSiteSubmissions(token: string, uuid: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<ISubmission[]>(
      `/sites/${uuid}/submissions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getWebhooks(token: string, uuid: string) {
    return http.get<IWebhook[]>(`/sites/${uuid}/webhooks/`, authHeaders(token));
  },
  async getRelatedSites(uuid: string) {
    return http.get<ISite[]>(`/sites/${uuid}/related/`);
  },
  async createSite(token: string, payload: ISiteCreate) {
    return http.post<ICreateSiteResponse>(`/sites/`, payload, authHeaders(token));
  },
  async getSiteApply(token: string, siteUUID: string) {
    return http.get<ISiteApplicationResponse>(
      `/sites/${siteUUID}/apply`,
      authHeaders(token)
    );
  },
  async applySite(token: string, siteUUID: string) {
    return http.post<ISiteApplicationResponse>(
      `/sites/${siteUUID}/apply`,
      null,
      authHeaders(token)
    );
  },
  async leaveSite(token: string, siteUUID: string) {
    return http.delete<IGenericResponse>(
      `/sites/${siteUUID}/membership`,
      authHeaders(token)
    );
  },
};
