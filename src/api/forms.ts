import { http } from '@/api/client';
import { IForm, IFormCreate, IFormResponse, IFormResponseCreate } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiForm = {
  async createForm(token: string, payload: IFormCreate) {
    return http.post<IForm>(`/forms/`, payload, authHeaders(token));
  },
  async getForms(token: string) {
    return http.get<IForm[]>(`/forms/`, authHeaders(token));
  },
  async getForm(token: string, uuid: string) {
    return http.get<IForm>(`/forms/${uuid}`, authHeaders(token));
  },
  async submitFormResponse(token: string, payload: IFormResponseCreate) {
    return http.post<IFormResponse>(`/form-responses/`, payload, authHeaders(token));
  },
};
