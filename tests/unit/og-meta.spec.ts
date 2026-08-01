import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  defaultOgImage,
  escapeHtmlAttr,
  injectOgTags,
  isCrawlerRequest,
  matchContentRoute,
  normalizeDescription,
  resolveApiBase,
  resolveSiteName,
  richTextToPlain,
} from '../../functions/lib/og';

describe('functions/lib/og', () => {
  describe('isCrawlerRequest', () => {
    it('detects common chat/social bots', () => {
      const url = new URL('https://preview.cha.fan/questions/abc');
      expect(isCrawlerRequest('Discordbot/2.0', url)).toBe(true);
      expect(isCrawlerRequest('facebookexternalhit/1.1', url)).toBe(true);
      expect(isCrawlerRequest('Twitterbot/1.0', url)).toBe(true);
      expect(isCrawlerRequest('Slackbot-LinkExpanding 1.0', url)).toBe(true);
      expect(isCrawlerRequest('MicroMessenger', url)).toBe(true);
      expect(isCrawlerRequest('Mozilla/5.0 (compatible; Googlebot/2.1)', url)).toBe(true);
    });

    it('does not treat normal browsers as crawlers', () => {
      const url = new URL('https://preview.cha.fan/questions/abc');
      expect(
        isCrawlerRequest(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
          url
        )
      ).toBe(false);
      expect(isCrawlerRequest(null, url)).toBe(false);
    });

    it('forces preview with ?__og_preview=1', () => {
      const url = new URL('https://preview.cha.fan/questions/abc?__og_preview=1');
      expect(isCrawlerRequest('Mozilla/5.0', url)).toBe(true);
      expect(isCrawlerRequest(null, url)).toBe(true);
    });
  });

  describe('matchContentRoute', () => {
    it('matches questions / articles / submissions', () => {
      expect(matchContentRoute('/questions/7e7QP9AoCJdUDBPa62VF')?.apiPath).toBe(
        '/questions/7e7QP9AoCJdUDBPa62VF/page'
      );
      expect(matchContentRoute('/articles/abc123')?.apiPath).toBe('/articles/abc123');
      expect(matchContentRoute('/submissions/xyz')?.apiPath).toBe('/submissions/xyz');
    });

    it('rejects non-content paths', () => {
      expect(matchContentRoute('/')).toBeNull();
      expect(matchContentRoute('/explore')).toBeNull();
      expect(matchContentRoute('/questions/')).toBeNull();
      expect(matchContentRoute('/questions/abc/extra')).toBeNull();
      expect(matchContentRoute('/assets/index.js')).toBeNull();
    });

    it('picks title and description from question payload', () => {
      const route = matchContentRoute('/questions/abc')!;
      const picked = route.pick({
        question: { title: '测试问题', desc: { rendered_text: '问题描述' } },
      });
      expect(picked).toEqual({ title: '测试问题', description: '问题描述' });
      expect(route.pick({})).toBeNull();
    });

    it('falls back to the top answer when a question has no description', () => {
      const route = matchContentRoute('/questions/abc')!;
      expect(
        route.pick({
          question: { title: '测试问题', desc: null },
          full_answers: [
            { is_hidden_by_moderator: true, content: { rendered_text: '被隐藏' } },
            { is_hidden_by_moderator: false, content: { source: '第一个回答', editor: 'wysiwyg' } },
          ],
        })
      ).toEqual({ title: '测试问题', description: '第一个回答' });

      // No full answers exposed → the truncated preview body still works.
      expect(
        route.pick({
          question: { title: '测试问题' },
          answer_previews: [{ body: '预览正文' }],
        })
      ).toEqual({ title: '测试问题', description: '预览正文' });
    });

    it('reads the article rich text from `content`', () => {
      const route = matchContentRoute('/articles/abc')!;
      expect(
        route.pick({
          title: '文章标题',
          content: { source: '正文内容', rendered_text: null, editor: 'wysiwyg' },
        })
      ).toEqual({ title: '文章标题', description: '正文内容' });
    });
  });

  describe('richTextToPlain', () => {
    it('prefers rendered_text and strips markup', () => {
      expect(richTextToPlain({ rendered_text: '<p>hello <b>world</b></p>', source: 'x' })).toContain(
        'hello'
      );
      expect(richTextToPlain({ rendered_text: '<p>a &amp; b</p>' })).toContain('a & b');
    });

    it('falls back to markdown source when rendered_text is null', () => {
      expect(
        richTextToPlain({
          rendered_text: null,
          source: '## 标题\n\n- 一项\n- 二项\n\n[链接](https://cha.fan)',
          editor: 'wysiwyg',
        })
      ).toBe('标题\n\n一项\n二项\n\n链接');
    });

    it('extracts text from a tiptap document', () => {
      const doc = JSON.stringify({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: '一段正文' }] }],
      });
      expect(richTextToPlain({ rendered_text: null, source: doc, editor: 'tiptap' })).toBe('一段正文');
    });

    it('never leaks raw JSON for a doc with no text', () => {
      const imageOnly = JSON.stringify({
        type: 'doc',
        content: [{ type: 'image', attrs: { src: 'https://assets.cha.fan/x' } }],
      });
      expect(richTextToPlain({ rendered_text: null, source: imageOnly })).toBeUndefined();
    });

    it('returns undefined for empty or missing rich text', () => {
      expect(richTextToPlain(null)).toBeUndefined();
      expect(richTextToPlain({ rendered_text: null, source: '\n' })).toBeUndefined();
      expect(richTextToPlain({})).toBeUndefined();
    });
  });

  describe('normalizeDescription', () => {
    it('falls back to default', () => {
      expect(normalizeDescription(undefined)).toBe(DEFAULT_DESCRIPTION);
      expect(normalizeDescription('   ')).toBe(DEFAULT_DESCRIPTION);
    });

    it('collapses whitespace and truncates', () => {
      expect(normalizeDescription('a\n\nb   c')).toBe('a b c');
      const long = '字'.repeat(250);
      const out = normalizeDescription(long, 50);
      expect(out.length).toBeLessThanOrEqual(50);
      expect(out.endsWith('…')).toBe(true);
    });
  });

  describe('escapeHtmlAttr', () => {
    it('escapes attribute-sensitive characters', () => {
      expect(escapeHtmlAttr('a&b"c<d>e')).toBe('a&amp;b&quot;c&lt;d&gt;e');
    });
  });

  describe('injectOgTags', () => {
    const shell = `<!DOCTYPE html><html><head>
<title>PREPROD</title>
<meta name="description" content="old desc" />
<meta property="og.title" content="legacy" />
<meta property="og:title" content="Chafan 茶饭" />
<meta property="og:description" content="old" />
<meta property="og:url" content="https://cha.fan" />
</head><body></body></html>`;

    it('rewrites title and og tags and strips legacy og.*', () => {
      const out = injectOgTags(shell, {
        title: '大家现在工作之余有什么爱好吗？',
        description: '我花了不少时间看网络小说。',
        url: 'https://preview.cha.fan/questions/7e7QP9AoCJdUDBPa62VF',
        siteName: 'PREPROD',
        image: 'https://preview.cha.fan/img/icons/android-chrome-512x512.png',
      });

      expect(out).toContain('<title>大家现在工作之余有什么爱好吗？</title>');
      expect(out).toContain('property="og:title" content="大家现在工作之余有什么爱好吗？"');
      expect(out).toContain('property="og:description" content="我花了不少时间看网络小说。"');
      expect(out).toContain(
        'property="og:url" content="https://preview.cha.fan/questions/7e7QP9AoCJdUDBPa62VF"'
      );
      expect(out).toContain('property="og:image"');
      expect(out).toContain('name="twitter:card" content="summary"');
      expect(out).not.toMatch(/property="og\./);
    });

    it('escapes HTML in injected values', () => {
      const out = injectOgTags(shell, {
        title: 'A <script> "x" & y',
        description: 'desc',
        url: 'https://cha.fan/q',
      });
      expect(out).toContain('A &lt;script&gt; &quot;x&quot; &amp; y');
      expect(out).not.toContain('<script>');
    });
  });

  describe('resolveApiBase / resolveSiteName', () => {
    it('builds api base from host-only env', () => {
      expect(resolveApiBase({ VUE_APP_API: 'api.cha.fan' })).toBe('https://api.cha.fan/api/v1');
      expect(resolveApiBase({ VITE_APP_API: 'api_dev.cha.fan' })).toBe(
        'https://api_dev.cha.fan/api/v1'
      );
      expect(resolveApiBase({})).toBe('https://api.cha.fan/api/v1');
    });

    it('accepts full URL env values', () => {
      expect(resolveApiBase({ VUE_APP_API: 'https://api.cha.fan/' })).toBe(
        'https://api.cha.fan/api/v1'
      );
    });

    it('resolves site name', () => {
      expect(resolveSiteName({ VUE_APP_NAME: 'PREPROD' })).toBe('PREPROD');
      expect(resolveSiteName({})).toBe(DEFAULT_TITLE);
    });
  });

  describe('defaultOgImage', () => {
    it('points at the app icon under the request origin', () => {
      expect(defaultOgImage('https://preview.cha.fan')).toBe(
        'https://preview.cha.fan/img/icons/android-chrome-512x512.png'
      );
    });
  });
});
