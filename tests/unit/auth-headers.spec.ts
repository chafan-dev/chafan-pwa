import { describe, it, expect } from 'vitest';
import {
  authHeaders,
  authHeadersArrayBuffer,
  authHeadersFormData,
  authHeadersWithParams,
} from '@/utils/auth-headers';

describe('authHeaders helpers', () => {
  const token = 'test-token-123';

  it('authHeaders sets Bearer Authorization', () => {
    expect(authHeaders(token)).toEqual({
      headers: { Authorization: 'Bearer test-token-123' },
    });
  });

  it('authHeadersArrayBuffer sets Authorization and arraybuffer responseType', () => {
    expect(authHeadersArrayBuffer(token)).toEqual({
      headers: { Authorization: 'Bearer test-token-123' },
      responseType: 'arraybuffer',
    });
  });

  it('authHeadersFormData sets multipart Content-Type', () => {
    expect(authHeadersFormData(token)).toEqual({
      headers: {
        Authorization: 'Bearer test-token-123',
        'Content-Type': 'multipart/form-data',
      },
    });
  });

  it('authHeadersWithParams includes query params', () => {
    const params = new URLSearchParams({ skip: '0', limit: '10' });
    expect(authHeadersWithParams(token, params)).toEqual({
      headers: { Authorization: 'Bearer test-token-123' },
      params,
    });
  });
});
