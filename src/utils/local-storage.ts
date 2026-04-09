import { IRichEditorState } from '@/interfaces';

const CHAFAN_TOKEN = 'chafan:token';

export const getLocalValue = (key: string, defaultVal: string | null = null) => {
  try {
    const v = localStorage.getItem(key);
    if (v === null) {
      return defaultVal;
    }
    return v;
  } catch (e) {
    return defaultVal;
  }
};

export const setLocalValue = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Do nothing
  }
};

export const getLocalToken = () => {
  try {
    return localStorage.getItem(CHAFAN_TOKEN);
  } catch (e) {
    return null;
  }
};

export const saveLocalToken = (token: string) => {
  try {
    localStorage.setItem(CHAFAN_TOKEN, token);
  } catch (e) {
    // do nothing
  }
};

export const removeLocalToken = () => {
  try {
    localStorage.removeItem(CHAFAN_TOKEN);
  } catch (e) {
    // TODO
  }
};

export interface LocalEdit {
  edit: IRichEditorState | string;
  createdAt: Date;
}

export const saveLocalEdit = (
  draftType: 'article' | 'answer',
  uuid: string | null,
  edit: IRichEditorState | string
) => {
  const now = new Date();
  try {
    const key = `${draftType}-${uuid}`;
    const value: LocalEdit = {
      edit,
      createdAt: now,
    };
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // TODO
  }
};

export const loadLocalEdit = (
  draftType: 'article' | 'answer',
  uuid: string | null
): LocalEdit | null => {
  try {
    const key = `${draftType}-${uuid}`;
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (e) {
    // TODO
    return null;
  }
};

export const clearLocalEdit = (draftType: 'article' | 'answer', uuid: string | null) => {
  try {
    const key = `${draftType}-${uuid}`;
    localStorage.removeItem(key);
  } catch (e) {
    //  TODO
  }
};
