import axios from 'axios';
import { apiUrl } from '@/env';
import { getLocalToken } from '@/utils/local-storage';

/**
 * Shared Axios instance for ChaFan API calls.
 * baseURL is the versioned API root (…/api/v1).
 *
 * Request interceptor attaches Bearer token from localStorage when the
 * caller did not set Authorization explicitly (authHeaders still works).
 */
export const http = axios.create({
  baseURL: apiUrl,
});

http.interceptors.request.use((config) => {
  const headers = config.headers;
  const hasAuth =
    headers &&
    (typeof headers.get === 'function'
      ? Boolean(headers.get('Authorization'))
      : Boolean((headers as Record<string, unknown>).Authorization));

  if (!hasAuth) {
    const token = getLocalToken();
    if (token) {
      if (headers && typeof headers.set === 'function') {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers = {
          ...(headers as Record<string, string> | undefined),
          Authorization: `Bearer ${token}`,
        } as typeof config.headers;
      }
    }
  }
  return config;
});
