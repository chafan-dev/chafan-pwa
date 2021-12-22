import axios from 'axios';
import { apiUrl } from '@/env';
import { IForm, IFormCreate, IFormResponse, IFormResponseCreate } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiForm = {
  async createForm(token: string, payload: IFormCreate) {
    return axios.post<IForm>(`${apiUrl}/forms/`, payload, authHeaders(token));
  },
  async getForms(token: string) {
    return axios.get<IForm[]>(`${apiUrl}/forms/`, authHeaders(token));
  },
  async getForm(token: string, uuid: string) {
    return axios.get<IForm>(`${apiUrl}/forms/${uuid}`, authHeaders(token));
  },
  async submitFormRespnse(token: string, payload: IFormResponseCreate) {
    return axios.post<IFormResponse>(`${apiUrl}/form-responses/`, payload, authHeaders(token));
  },
};
