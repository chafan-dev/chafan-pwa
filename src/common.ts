import { apiQuestion } from '@/api/question';
import { apiUrl, appName } from '@/env';

export const URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)/gi;

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
  const title = properties['title'] || properties['og:title'];
  const imageUrl = properties['og:image'];
  anchor.href = originalUrl;
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
    div.appendChild(titleDiv);
  }
  if (description && description !== title) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('og-card-desc', 'text--secondary', 'text-caption');
    descriptionDiv.innerText = description;
    div.appendChild(descriptionDiv);
  }
  if (siteName) {
    const siteNameDiv = document.createElement('div');
    siteNameDiv.classList.add('og-card-sitename', 'text--secondary');
    siteNameDiv.innerText = siteName;
    div.appendChild(siteNameDiv);
  }
  if (div.children.length) {
    return anchor;
  }
  return null;
}

const linkPreviewHosts = new Set(['www.flickr.com', 'github.com', 'www.zhihu.com']);

export const postProcessViewerDOM = async (token: string, viewer: HTMLElement) => {
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
        if (linkPreviewHosts.has(url.host)) {
          const props = (await api.generateLinkPreview(a.href)).data;
          const card = getOpenGraphCard(a.href, props);
          if (card) {
            a.parentNode!.replaceChild(card, a);
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

export const getVditorUploadConfig = (token: string) => {
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

export const constants = {
  explore: '探索',
  dashboard: '个人中心',
  profile: '个人资料',
  edit_profile: '编辑个人资料',
  security_center: '安全中心',
  moderate_circles: '管理圈子',
  login: '登录',
  signup: '注册',
  recover_password: '找回密码',
  reset_password: '重置密码',
  invitation_to_join: '邀请加入',
  search_results: '搜索结果',
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
