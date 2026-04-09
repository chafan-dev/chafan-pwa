import { AxiosRequestConfig } from 'axios';

export const authHeaders = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const authHeadersArrayBuffer = (token: string): AxiosRequestConfig => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'arraybuffer',
  };
};

export const authHeadersFormData = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
};

export const authHeadersWithParams = (token: string, params: URLSearchParams) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };
};
