import { apiQuestion } from '@/api/question';
import { apiUrl } from '@/env';

export const URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)/gi;
export const vditorCDN = 'https://cdn.jsdelivr.net/npm/@chafan/vditor@3.8.2-chafan.3';

export const NARROW_FEED_UI_KEY = 'narrowFeedUI';
export const LABS_TIPTAP_EDITOR_OPTION = 'labs.tiptap-editor-option';
export const YES_FLAG = 'user-agreement-yes';
export const FAB_FLAG = 'webfront-fab-clicked';
export const EXPLORE_SITES = 'closed-explore-sites-in-home';

export const getDefaultNarrowFeedUI = () => {
  try {
    const value = localStorage.getItem(NARROW_FEED_UI_KEY);
    return value === null || value === 'true';
  } catch (e) {
    return false;
  }
};

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
