import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('env host validation', () => {
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // restore mutable env keys used by the module under test
    for (const key of Object.keys(import.meta.env)) {
      if (!(key in originalEnv)) {
        delete (import.meta.env as Record<string, unknown>)[key];
      }
    }
    Object.assign(import.meta.env, originalEnv);
  });

  async function loadEnvWith(apiHost: string) {
    (import.meta.env as Record<string, string>).VITE_APP_API = apiHost;
    (import.meta.env as Record<string, string>).VITE_APP_ENV = 'test';
    (import.meta.env as Record<string, string>).VITE_APP_NAME = 'ChaFan';
    (import.meta.env as Record<string, string>).VITE_GIT_COMMIT = 'abc123456789';
    (import.meta.env as Record<string, string>).VITE_GIT_BRANCH = 'master';
    (import.meta.env as Record<string, string>).VITE_GIT_COMMIT_TIME = '2026-01-01T00:00:00Z';
    (import.meta.env as Record<string, string>).VITE_GIT_TAGS = '';
    return import('@/env');
  }

  it('accepts production api.cha.fan host', async () => {
    const env = await loadEnvWith('api.cha.fan');
    expect(env.apiUrl).toBe('https://api.cha.fan/api/v1');
    expect(env.wsUrl).toBe('wss://api.cha.fan/api/v1');
  });

  it('accepts api_dev.cha.fan style hosts', async () => {
    const env = await loadEnvWith('api_dev.cha.fan');
    expect(env.apiUrl).toBe('https://api_dev.cha.fan/api/v1');
  });

  it('accepts localhost with port for development', async () => {
    const env = await loadEnvWith('localhost:8000');
    expect(env.apiUrl).toBe('https://localhost:8000/api/v1');
  });

  it('rejects disallowed hosts', async () => {
    await expect(loadEnvWith('evil.example.com')).rejects.toThrow(/Invalid API host/);
  });

  it('exposes buildInfo commit short hash', async () => {
    const env = await loadEnvWith('api.cha.fan');
    expect(env.buildInfo.commitHashShort).toBe('abc12345');
    expect(env.buildInfo.branch).toBe('master');
  });
});
