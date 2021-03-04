import axios from 'axios';
import { apiUrl } from '@/env';
import { IForm, IFormCreate, IFormResponseCreate, IFormResponse } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiForm = {
  async createForm(token: string, payload: IFormCreate) {
    return axios.post<IForm>(`${apiUrl}/api/v1/forms/`, payload, authHeaders(token));
  },
  async getForms(token: string) {
    return axios.get<IForm[]>(`${apiUrl}/api/v1/forms/`, authHeaders(token));
  },
  async getForm(token: string, uuid: string) {
    return axios.get<IForm>(`${apiUrl}/api/v1/forms/${uuid}`, authHeaders(token));
  },
  async submitFormRespnse(token: string, payload: IFormResponseCreate) {
    return axios.post<IFormResponse>(`${apiUrl}/api/v1/form-responses/`, payload, authHeaders(token));
  },
};
