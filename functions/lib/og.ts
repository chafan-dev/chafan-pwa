/**
 * Pure helpers for Open Graph / Twitter meta injection (Cloudflare Pages Functions).
 * Kept free of runtime globals so unit tests can import this module.
 */

export const DEFAULT_DESCRIPTION = 'Chafan 茶饭 - 有深度的社交问答网站';
export const DEFAULT_TITLE = 'Chafan 茶饭';

function stripHtml(text: string): string {
  return text
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#3?9;/gi, "'")
    .replace(/&amp;/gi, '&');
}

/** Drop the markup that would otherwise show up verbatim in an unfurl card. */
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]{0,3}>[ \t]?/gm, '')
    .replace(/^[ \t]{0,3}([-*+]|\d+\.)[ \t]+/gm, '')
    .replace(/[*_~`]/g, '');
}

/** Text nodes of a ProseMirror/tiptap document, in document order. */
function prosemirrorToPlain(node: unknown, out: string[] = []): string {
  if (Array.isArray(node)) {
    for (const child of node) prosemirrorToPlain(child, out);
  } else if (node && typeof node === 'object') {
    const n = node as Record<string, unknown>;
    if (typeof n.text === 'string') out.push(n.text);
    if (n.content) prosemirrorToPlain(n.content, out);
  }
  return out.join(' ');
}

/**
 * Best-effort plain text for a Chafan rich text blob (`{ source, rendered_text, editor }`).
 *
 * `rendered_text` is null on most stored content, so `source` — markdown for the
 * vditor editors, a ProseMirror JSON doc for tiptap — is the real fallback.
 */
export function richTextToPlain(rich: unknown): string | undefined {
  if (!rich || typeof rich !== 'object') {
    return undefined;
  }
  const { source, rendered_text: rendered } = rich as {
    source?: string | null;
    rendered_text?: string | null;
  };

  if (typeof rendered === 'string' && rendered.trim()) {
    return stripHtml(rendered);
  }
  if (typeof source !== 'string' || !source.trim()) {
    return undefined;
  }

  if (source.trimStart().startsWith('{')) {
    let doc: unknown;
    try {
      doc = JSON.parse(source);
    } catch {
      doc = null;
    }
    if (doc) {
      // A doc with no text nodes (e.g. image-only) has no description to give;
      // never fall through, or the raw JSON would end up in the card.
      const text = prosemirrorToPlain(doc);
      return text.trim() ? text : undefined;
    }
  }

  const markdown = stripMarkdown(source);
  return markdown.trim() ? markdown : undefined;
}

/** Questions rarely carry a description, so the top answer is the real content. */
function firstAnswerText(page: Record<string, unknown>): string | undefined {
  const answers = Array.isArray(page.full_answers) ? page.full_answers : [];
  for (const answer of answers) {
    const a = answer as Record<string, unknown>;
    if (a.is_hidden_by_moderator) continue;
    const text = richTextToPlain(a.content);
    if (text) return text;
  }
  const previews = Array.isArray(page.answer_previews) ? page.answer_previews : [];
  for (const preview of previews) {
    const p = preview as Record<string, unknown>;
    if (p.is_hidden_by_moderator) continue;
    if (typeof p.body === 'string' && p.body.trim()) return stripHtml(p.body);
  }
  return undefined;
}

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
    // /page carries the answers too, so one request covers both fallbacks.
    apiPath: (id) => `/questions/${id}/page`,
    pick: (body) => {
      const question = (body.question ?? {}) as Record<string, unknown>;
      const title = typeof question.title === 'string' ? question.title : null;
      if (!title) return null;
      return {
        title,
        description: richTextToPlain(question.desc) || firstAnswerText(body),
      };
    },
  },
  {
    re: /^\/articles\/([A-Za-z0-9]+)$/,
    apiPath: (id) => `/articles/${id}`,
    pick: (body) => {
      const title = typeof body.title === 'string' ? body.title : null;
      if (!title) return null;
      return {
        title,
        // The API field is `content`; `body` never existed and always read undefined.
        description: richTextToPlain(body.content),
      };
    },
  },
  {
    re: /^\/submissions\/([A-Za-z0-9]+)$/,
    apiPath: (id) => `/submissions/${id}`,
    pick: (body) => {
      const title = typeof body.title === 'string' ? body.title : null;
      if (!title) return null;
      return {
        title,
        description: richTextToPlain(body.desc),
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
