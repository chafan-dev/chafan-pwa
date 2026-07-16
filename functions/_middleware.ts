/**
 * Cloudflare Pages middleware: inject per-content Open Graph tags for crawlers.
 *
 * Chat apps and social crawlers do not execute the Vue SPA, so they only see
 * static index.html meta. For /questions|articles|submissions/:id requests from
 * known bots (or ?__og_preview=1), we fetch the public API and rewrite the HTML.
 */

import {
  defaultOgImage,
  injectOgTags,
  isCrawlerRequest,
  matchContentRoute,
  normalizeDescription,
  resolveApiBase,
  resolveSiteName,
} from './lib/og';

interface PagesContext {
  request: Request;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Record<string, unknown> & {
    ASSETS?: { fetch: typeof fetch };
  };
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Skip non-document requests early.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  // Never rewrite static assets.
  if (looksLikeStaticAsset(url.pathname)) {
    return next();
  }

  const route = matchContentRoute(url.pathname);
  if (!route) {
    return next();
  }

  const ua = request.headers.get('user-agent');
  if (!isCrawlerRequest(ua, url)) {
    return next();
  }

  // Serve the SPA shell (Pages _redirects maps /* → /index.html).
  const assetResponse = await next();
  const contentType = assetResponse.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return assetResponse;
  }

  let html: string;
  try {
    html = await assetResponse.text();
  } catch {
    return assetResponse;
  }

  const meta = await fetchContentMeta(route.apiPath, route.pick, env);
  if (!meta) {
    // Still fix legacy og.* → proper tags on the shell for this response.
    const fixed = injectOgTags(html, {
      title: resolveSiteName(env),
      description: normalizeDescription(undefined),
      url: `${url.origin}${url.pathname}`,
      siteName: resolveSiteName(env),
      image: defaultOgImage(url.origin),
    });
    return htmlResponse(fixed, assetResponse);
  }

  const rewritten = injectOgTags(html, {
    title: meta.title,
    description: normalizeDescription(meta.description),
    url: `${url.origin}${url.pathname}`,
    siteName: resolveSiteName(env),
    image: defaultOgImage(url.origin),
  });

  return htmlResponse(rewritten, assetResponse);
};

function looksLikeStaticAsset(pathname: string): boolean {
  return /\.(js|css|map|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|eot|json|txt|xml|webmanifest)$/i.test(
    pathname
  );
}

async function fetchContentMeta(
  apiPath: string,
  pick: ReturnType<typeof matchContentRoute> extends null
    ? never
    : NonNullable<ReturnType<typeof matchContentRoute>>['pick'],
  env: Record<string, unknown>
): Promise<{ title: string; description?: string } | null> {
  const apiBase = resolveApiBase(env);
  const endpoint = `${apiBase}${apiPath}`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        // Identify ourselves; some APIs rate-limit anonymous bots.
        'User-Agent': 'Chafan-OG-Preview/1.0 (+https://cha.fan)',
      },
    });
    if (!res.ok) {
      return null;
    }
    const body = (await res.json()) as Record<string, unknown>;
    return pick(body);
  } catch {
    return null;
  }
}

function htmlResponse(html: string, base: Response): Response {
  const headers = new Headers(base.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  // Ensure crawlers don't get a long-lived wrong cache if API content changes.
  headers.set('cache-control', 'public, max-age=300, must-revalidate');
  // Body length changed after rewrite.
  headers.delete('content-length');
  return new Response(html, {
    status: base.status,
    statusText: base.statusText,
    headers,
  });
}
