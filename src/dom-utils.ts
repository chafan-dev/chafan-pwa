import { apiQuestion } from '@/api/question';
import { appName } from '@/env';

export const postProcessViewerDOM = async (token: string, viewer: HTMLElement | undefined) => {
  if (!viewer) {
    return;
  }
  for (const a of viewer.getElementsByTagName('a')) {
    try {
      const url = new URL(a.href);
      if (a.href === a.innerText) {
        // Replace nodes
        if (url.origin === window.origin) {
          const match = url.pathname.match(/^\/questions\/(\w+)$/);
          if (match) {
            const questionUUID = match[1];
            const question = (await apiQuestion.getQuestion(token, questionUUID)).data;
            a.innerText = question.title;
            continue;
          }
        }
      }
      // Open in new window
      if (url.origin !== window.origin) {
        a.target = '_blank';
      }
    } finally {
    }
  }
};

const setMetaContent = (selector: string, content: string) => {
  document.querySelector(selector)?.setAttribute('content', content);
};

/**
 * Update document title and Open Graph / Twitter meta for the current SPA route.
 * Note: external chat crawlers do not run this — see functions/_middleware.ts.
 */
export const updateHead = (routePath: string, title: string, descriptionText?: string) => {
  const absoluteUrl = `${window.location.origin}${routePath}`;
  const ogImage = `${window.location.origin}/img/icons/android-chrome-512x512.png`;

  document.title = title;

  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[name="twitter:title"]', title);

  if (appName) {
    setMetaContent('meta[property="og:site_name"]', appName);
  }

  if (descriptionText) {
    setMetaContent('meta[name="description"]', descriptionText);
    setMetaContent('meta[property="description"]', descriptionText);
    setMetaContent('meta[property="og:description"]', descriptionText);
    setMetaContent('meta[name="twitter:description"]', descriptionText);
  }

  setMetaContent('meta[property="og:type"]', 'article');
  setMetaContent('meta[property="og:url"]', absoluteUrl);
  setMetaContent('meta[property="og:image"]', ogImage);
  setMetaContent('meta[name="twitter:card"]', 'summary');
  setMetaContent('meta[name="twitter:image"]', ogImage);
};
