// Barrel re-export for backwards compatibility.
// New code should import from specific modules instead:
//   @/theme - theme definitions and types
//   @/i18n - constants, error translations
//   @/dom-utils - DOM manipulation helpers (postProcessViewerDOM, updateHead)

export { isEqual } from 'lodash';

// From @/theme
export {
  themeDefs,
  themeLocalStorageKey,
} from './theme';
export type { ThemeClassKey, IThemeDef } from './theme';

// From @/i18n
export {
  constants,
  INSUFFICIENT_KARMA_TO_JOIN_SITE,
  MISSING_REQUIRED_SECONDARY_EMAIL,
  translateErrorMsgCN,
} from './i18n';

// From @/dom-utils
export { postProcessViewerDOM, updateHead } from './dom-utils';

// Regex validators
export const URLRegex =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)$/;
export const PasswordRegex = /^[\w\-\+@$!%*?&]{8,}$/;
export const PhoneNumberRegex = /^\+[1-9]\d{1,14}$/;

// Feature flags / localStorage keys
export const NARROW_FEED_UI_KEY = 'narrowFeedUI';
export const LABS_TIPTAP_EDITOR_OPTION = 'labs.tiptap-editor-option';
export const YES_FLAG = 'user-agreement-yes';
export const EXPLORE_SITES = 'closed-explore-sites-in-home';

export const getDefaultNarrowFeedUI = () => {
  try {
    const value = localStorage.getItem(NARROW_FEED_UI_KEY);
    return value === null || value === 'true';
  } catch (e) {
    return false;
  }
};

import { apiUrl } from '@/env';

export const getVditorUploadConfig = (token: string) => {
  return {
    max: 1024 * 1024,
    accept: 'image/png, image/jpeg, image/bmp, image/gif',
    fieldName: 'files',
    url: `${apiUrl}/upload/vditor/`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const doNothing = () => {};
