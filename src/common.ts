import { apiQuestion } from '@/api/question';
import { apiUrl, appName } from '@/env';

export const URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)/gi;
export const vditorCDN = 'https://cdn.jsdelivr.net/npm/@chafan/vditor@3.8.2-chafan.3';

export const NARROW_FEED_UI_KEY = 'narrowFeedUI';
export const LABS_TIPTAP_EDITOR_OPTION = 'labs.tiptap-editor-option';
export const YES_FLAG = 'user-agreement-yes';
export const FAB_FLAG = 'webfront-fab-clicked';
export const EXPLORE_SITES = 'closed-explore-sites-in-home';

export { isEqual } from 'lodash';
import { api } from '@/api';

export const getDefaultNarrowFeedUI = () => {
  try {
    const value = localStorage.getItem(NARROW_FEED_UI_KEY);
    return value === null || value === 'true';
  } catch (e) {
    return false;
  }
};

function getOpenGraphCard(
  originalUrl: string,
  properties: Record<string, string>
): HTMLElement | null {
  const anchor = document.createElement('a');
  anchor.target = '_blank';
  const div = document.createElement('div');
  anchor.appendChild(div);
  div.classList.add('og-card');
  const title = properties['og:title'];
  const imageUrl = properties['og:image'];
  anchor.href = properties['og:url'] || originalUrl;
  const siteName = properties['og:site_name'];
  const description = properties['og:description'];
  if (imageUrl) {
    const imageDiv = document.createElement('img');
    imageDiv.src = imageUrl;
    div.appendChild(imageDiv);
  }
  if (title) {
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('og-card-title', 'text--primary');
    titleDiv.innerText = title;
    if (siteName) {
      titleDiv.innerText += ` (${siteName})`;
    }
    div.appendChild(titleDiv);
  }
  if (description && description !== title) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('og-card-desc', 'text--secondary', 'text-caption');
    descriptionDiv.innerText = description;
    div.appendChild(descriptionDiv);
  }
  if (div.children.length) {
    return anchor;
  }
  return null;
}

export const postProcessViewerDOM = async (token: string, viewer: HTMLElement) => {
  for (const a of viewer.getElementsByTagName('a')) {
    const url = new URL(a.href);
    if (url.origin === window.origin) {
      const match = url.pathname.match(/^\/questions\/(\w+)$/);
      if (match) {
        const questionUUID = match[1];
        const question = (await apiQuestion.getQuestion(token, questionUUID)).data;
        a.innerText = question.title;
      }
    }
    if (url.host === 'www.flickr.com') {
      const props = (await api.generateLinkPreview(a.href)).data;
      const card = getOpenGraphCard(a.href, props);
      if (card) {
        a.parentNode!.replaceChild(card, a);
      }
    }
  }
};

export const vditorUploadConfig = (token: string) => {
  return {
    max: 5 * 1024 * 1024,
    // TODO: token for CORS validation
    accept: 'image/png, image/jpeg, image/bmp, image/gif',
    fieldName: 'files',
    url: `${apiUrl}/api/v1/upload/vditor/`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const updateHead = (routePath: string, title: string, descriptionText?: string) => {
  document.title = title;
  document.querySelector('meta[property="og.title"]')?.setAttribute('content', title);
  document.querySelector('meta[property="og.site_name"]')?.setAttribute('content', appName);
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
