import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiMe } from '@/api/me';
import { http } from '@/api/client';
import router from '@/router';

vi.mock('@/api/client', () => ({
  http: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}));

describe('bot link code', () => {
  beforeEach(() => {
    vi.mocked(http.post).mockClear();
  });

  it('asks the API as the logged-in user', async () => {
    await apiMe.createBotLinkCode('test-token-123');
    const [path, body, config] = vi.mocked(http.post).mock.calls[0];
    expect(path).toBe('/me/bot-link-codes/');
    // Authenticated, because the code must only ever be issued to whoever is
    // already signed in as the account being bound.
    expect(config).toEqual({ headers: { Authorization: 'Bearer test-token-123' } });
    expect(body).toEqual({});
  });

  it('sends no identifier for the bot', async () => {
    // The backend never learns which platform is asking: the mapping from a
    // platform account to a token lives in the bot, so nothing here names one.
    await apiMe.createBotLinkCode('test-token-123');
    const [, body] = vi.mocked(http.post).mock.calls[0];
    expect(JSON.stringify(body)).not.toMatch(/discord|telegram/i);
  });
});

describe('/link route', () => {
  it('resolves, so the URL the bot prints actually lands somewhere', () => {
    const resolved = router.resolve('/link');
    expect(resolved.matched.length).toBeGreaterThan(0);
  });

  it('carries ?from through, which is all that query is for', () => {
    // It only changes what the page calls the bot. Nothing is decided by it.
    const resolved = router.resolve('/link?from=discord');
    expect(resolved.matched.length).toBeGreaterThan(0);
    expect(resolved.query.from).toBe('discord');
  });
});
