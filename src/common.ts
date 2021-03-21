export const URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)/gi;
export const vditorCDN = 'https://cdn.jsdelivr.net/npm/@chafan/vditor@3.8.2-chafan.3';

export const NARROW_FEED_UI_KEY = 'narrowFeedUI';
export const LABS_TIPTAP_EDITOR_OPTION = 'labs.tiptap-editor-option';

export const getDefaultNarrowFeedUI = () => {
  try {
    const value = localStorage.getItem(NARROW_FEED_UI_KEY);
    return value === null || value === 'true';
  } catch (e) {
    return false;
  }
};
