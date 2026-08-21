import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/api/client', () => ({
  http: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

// Both the api module and the router reach env.ts through src/utils, and
// env.ts refuses to load without a valid VITE_APP_API. A developer has one in
// .env and CI does not, so the env is set before anything is imported and
// every import here is dynamic. env.spec.ts uses the same shape.
async function withEnv<T>(load: () => Promise<T>): Promise<T> {
  (import.meta.env as Record<string, string>).VITE_APP_API = 'api.cha.fan';
  (import.meta.env as Record<string, string>).VITE_APP_ENV = 'test';
  return load();
}

describe('bot link code', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function callCreate() {
    const { apiMe } = await withEnv(() => import('@/api/me'));
    const { http } = await import('@/api/client');
    vi.mocked(http.post).mockClear();
    await apiMe.createBotLinkCode('test-token-123');
    return vi.mocked(http.post).mock.calls[0];
  }

  it('asks the API as the logged-in user', async () => {
    const [path, body, config] = await callCreate();
    expect(path).toBe('/me/bot-link-codes/');
    // Authenticated, because the code must only ever be issued to whoever is
    // already signed in as the account being bound.
    expect(config).toEqual({ headers: { Authorization: 'Bearer test-token-123' } });
    expect(body).toEqual({});
  });

  it('sends no identifier for the bot', async () => {
    // The backend never learns which platform is asking: the mapping from a
    // platform account to a token lives in the bot, so nothing here names one.
    const [, body] = await callCreate();
    expect(JSON.stringify(body)).not.toMatch(/discord|telegram/i);
  });
});

describe('/link route', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  async function loadRouter() {
    return (await withEnv(() => import('@/router'))).default;
  }

  it('resolves, so the URL the bot prints actually lands somewhere', async () => {
    const router = await loadRouter();
    expect(router.resolve('/link').matched.length).toBeGreaterThan(0);
  });

  it('carries ?from through, which is all that query is for', async () => {
    // It only changes what the page calls the bot. Nothing is decided by it.
    const router = await loadRouter();
    const resolved = router.resolve('/link?from=discord');
    expect(resolved.matched.length).toBeGreaterThan(0);
    expect(resolved.query.from).toBe('discord');
  });
});
