import axios from 'axios';
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
import { apiUrl } from '@/env';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiSite = {
  async getSite(subdomain: string) {
    return axios.get<ISite>(`${apiUrl}/sites/${subdomain}`);
  },
  async getSiteQuestions(_token: string, siteUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/sites/${siteUUID}/questions/?skip=${skip}&limit=${limit}`
    );
  },
  async updateSiteConfig(token: string, siteUUID: string, payload: ISiteUpdate) {
    return axios.put<ISite>(`${apiUrl}/sites/${siteUUID}/config`, payload, authHeaders(token));
  },
  async getSiteSubmissions(token: string, uuid: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<ISubmission[]>(
      `${apiUrl}/sites/${uuid}/submissions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getWebhooks(token: string, uuid: string) {
    return axios.get<IWebhook[]>(`${apiUrl}/sites/${uuid}/webhooks/`, authHeaders(token));
  },
  async getRelatedSites(uuid: string) {
    return axios.get<ISite[]>(`${apiUrl}/sites/${uuid}/related/`);
  },
  async createSite(token: string, payload: ISiteCreate) {
    return axios.post<ICreateSiteResponse>(`${apiUrl}/sites/`, payload, authHeaders(token));
  },
  async getSiteApply(token: string, siteUUID: string) {
    return axios.get<ISiteApplicationResponse>(
      `${apiUrl}/sites/${siteUUID}/apply`,
      authHeaders(token)
    );
  },
  async applySite(token: string, siteUUID: string) {
    return axios.post<ISiteApplicationResponse>(
      `${apiUrl}/sites/${siteUUID}/apply`,
      null,
      authHeaders(token)
    );
  },
  async leaveSite(token: string, siteUUID: string) {
    return axios.delete<IGenericResponse>(
      `${apiUrl}/sites/${siteUUID}/membership`,
      authHeaders(token)
    );
  },
};
