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

export const updateHead = (routePath: string, title: string, descriptionText?: string) => {
  document.title = title;
  document.querySelector('meta[property="og.title"]')?.setAttribute('content', title);
  if (appName) {
    document.querySelector('meta[property="og.site_name"]')?.setAttribute('content', appName);
  }
  if (descriptionText) {
    document.querySelector('meta[name="description"]')?.setAttribute('content', descriptionText);
    document
      .querySelector('meta[property="description"]')
      ?.setAttribute('content', descriptionText);
    document
      .querySelector('meta[property="og.description"]')
      ?.setAttribute('content', descriptionText);
  }
  document.querySelector('meta[property="og.type"]')?.setAttribute('content', 'article');
  document
    .querySelector('meta[property="og.url"]')
    ?.setAttribute('content', 'https://cha.fan' + routePath);
};
