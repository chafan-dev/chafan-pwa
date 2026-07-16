/**
 * Pure helpers for Open Graph / Twitter meta injection (Cloudflare Pages Functions).
 * Kept free of runtime globals so unit tests can import this module.
 */

export const DEFAULT_DESCRIPTION = 'Chafan 茶饭 - 有深度的社交问答网站';
export const DEFAULT_TITLE = 'Chafan 茶饭';

/** Content routes that should receive dynamic OG tags. */
export const CONTENT_ROUTE_PATTERNS: ReadonlyArray<{
  re: RegExp;
  /** API path under /api/v1 */
  apiPath: (id: string) => string;
  /** Map JSON body → title + description */
  pick: (body: Record<string, unknown>) => { title: string; description?: string } | null;
}> = [
  {
    re: /^\/questions\/([A-Za-z0-9]+)$/,
    apiPath: (id) => `/questions/${id}`,
    pick: (body) => {
      const title = typeof body.title === 'string' ? body.title : null;
      if (!title) return null;
      const desc = body.desc as { rendered_text?: string } | null | undefined;
      return {
        title,
        description: desc?.rendered_text || undefined,
      };
    },
  },
  {
    re: /^\/articles\/([A-Za-z0-9]+)$/,
    apiPath: (id) => `/articles/${id}`,
    pick: (body) => {
      const title = typeof body.title === 'string' ? body.title : null;
      if (!title) return null;
      const bodyField = body.body as { rendered_text?: string } | null | undefined;
      return {
        title,
        description: bodyField?.rendered_text || undefined,
      };
    },
  },
  {
    re: /^\/submissions\/([A-Za-z0-9]+)$/,
    apiPath: (id) => `/submissions/${id}`,
    pick: (body) => {
      const title = typeof body.title === 'string' ? body.title : null;
      if (!title) return null;
      const desc = body.desc as { rendered_text?: string } | null | undefined;
      return {
        title,
        description: desc?.rendered_text || undefined,
      };
    },
  },
];

/** Well-known crawlers / chat unfurl bots. */
const CRAWLER_UA =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|SkypeUriPreview|Applebot|Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Embedly|redditbot|Pinterest|vkShare|W3C_Validator|Slurp|ia_archiver|MicroMessenger|Bytespider|PetalBot|Sogou|YisouSpider|Slack-ImgProxy|meta-externalagent/i;

export function isCrawlerRequest(userAgent: string | null, url: URL): boolean {
  // Force dynamic meta for manual verification: ?__og_preview=1
  if (url.searchParams.get('__og_preview') === '1') {
    return true;
  }
  if (!userAgent) {
    return false;
  }
  return CRAWLER_UA.test(userAgent);
}

export function matchContentRoute(
  pathname: string
): { apiPath: string; pick: (typeof CONTENT_ROUTE_PATTERNS)[number]['pick'] } | null {
  for (const route of CONTENT_ROUTE_PATTERNS) {
    const m = pathname.match(route.re);
    if (m) {
      return { apiPath: route.apiPath(m[1]), pick: route.pick };
    }
  }
  return null;
}

export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Collapse whitespace and cap length for OG description. */
export function normalizeDescription(text: string | undefined, maxLen = 200): string {
  if (!text) {
    return DEFAULT_DESCRIPTION;
  }
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (!collapsed) {
    return DEFAULT_DESCRIPTION;
  }
  if (collapsed.length <= maxLen) {
    return collapsed;
  }
  return collapsed.slice(0, maxLen - 1).trimEnd() + '…';
}

export function defaultOgImage(origin: string): string {
  return `${origin}/img/icons/android-chrome-512x512.png`;
}

export interface OgPayload {
  title: string;
  description: string;
  url: string;
  siteName?: string;
  image?: string;
  type?: string;
}

/**
 * Rewrite HTML head meta for Open Graph / Twitter / description / title.
 * Accepts both legacy `og.*` and correct `og:*` property names.
 */
export function injectOgTags(html: string, payload: OgPayload): string {
  const title = escapeHtmlAttr(payload.title);
  const description = escapeHtmlAttr(payload.description);
  const url = escapeHtmlAttr(payload.url);
  const image = escapeHtmlAttr(payload.image || '');
  const siteName = escapeHtmlAttr(payload.siteName || DEFAULT_TITLE);
  const type = escapeHtmlAttr(payload.type || 'article');

  let out = html;

  // <title>
  if (/<title>[\s\S]*?<\/title>/i.test(out)) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  } else {
    out = out.replace(/<\/head>/i, `<title>${title}</title>\n</head>`);
  }

  const setMeta = (attr: 'property' | 'name', key: string, content: string) => {
    // Match either order: property/name before or after content=
    const re = new RegExp(
      `<meta\\s+[^>]*${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
      'i'
    );
    const tag = `<meta ${attr}="${key}" content="${content}" />`;
    if (re.test(out)) {
      out = out.replace(re, tag);
    } else {
      out = out.replace(/<\/head>/i, `${tag}\n</head>`);
    }
  };

  // Standard description
  setMeta('name', 'description', description);
  setMeta('property', 'description', description);

  // Open Graph (correct colon form)
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', siteName);
  if (image) {
    setMeta('property', 'og:image', image);
  }

  // Remove legacy dotted og.* tags so crawlers are not confused
  out = out.replace(/<meta\s+[^>]*property=["']og\.[^"']+["'][^>]*>\s*/gi, '');

  // Twitter card
  setMeta('name', 'twitter:card', 'summary');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  if (image) {
    setMeta('name', 'twitter:image', image);
  }

  return out;
}

export function resolveApiBase(env: Record<string, unknown> | undefined): string {
  const host =
    (typeof env?.VUE_APP_API === 'string' && env.VUE_APP_API) ||
    (typeof env?.VITE_APP_API === 'string' && env.VITE_APP_API) ||
    'api.cha.fan';
  // Host only (no scheme) as used by the Vue app; allow accidental full URL too.
  if (host.startsWith('http://') || host.startsWith('https://')) {
    return host.replace(/\/$/, '') + '/api/v1';
  }
  return `https://${host}/api/v1`;
}

export function resolveSiteName(env: Record<string, unknown> | undefined): string {
  return (
    (typeof env?.VUE_APP_NAME === 'string' && env.VUE_APP_NAME) ||
    (typeof env?.VITE_APP_NAME === 'string' && env.VITE_APP_NAME) ||
    DEFAULT_TITLE
  );
}
