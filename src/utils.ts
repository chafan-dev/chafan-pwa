const CHAFAN_TOKEN = 'chafan:token';

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
    const key = `local-edit-${draftType}-${uuid}`;
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

export const availableLocales = ['en', 'zh'];

export const getBrowserLocale = () => {
  const langFirst = navigator.language.split('-')[0];
  if (availableLocales.includes(langFirst)) {
    return langFirst;
  }
  for (const lang of navigator.languages) {
    const langFirst2 = lang.split('-')[0];
    if (availableLocales.includes(langFirst2)) {
      return langFirst2;
    }
  }
  return 'zh';
};

import { localize } from 'vee-validate';
import { apiAnswer } from '@/api/answer';
import { apiArticle } from '@/api/article';

export const setAppLocale = (vueInstance: any) => {
  localize('zh_CN');
  vueInstance.$dayjs.locale('zh-cn');
};

import { commitAddNotification } from '@/store/main/mutations';
import { dispatchCheckApiError } from './store/main/actions';
import { captureException } from '@sentry/vue';
import { editor_T, IComment, IRichEditorState } from './interfaces';
import { env } from './env';

export const newAnswerHandler = async (
  vueInstance: any,
  edit: IRichEditorState,
  writingSessionUUID: string,
  isAutosaved: boolean,
  questionUUID: string
) => {
  if (edit.body && (!edit.rendered_body_text || edit.rendered_body_text.length < 5)) {
    commitAddNotification(vueInstance.$store, {
      content: vueInstance.$t('Answer is too short: minimum length 5 characters.').toString(),
      color: 'error',
    });
    return;
  }
  try {
    if (edit.body) {
      const newAnswer = (
        await apiAnswer.postAnswer(vueInstance.$store.state.main.token, {
          body: edit.body,
          editor: edit.editor,
          question_uuid: questionUUID,
          visibility: edit.visibility,
          body_text: edit.rendered_body_text || '',
          writing_session_uuid: writingSessionUUID,
          is_published: !edit.is_draft,
        })
      ).data;
      const answerUUID = newAnswer.uuid;
      if (!isAutosaved) {
        await vueInstance.$router.push(`/questions/${questionUUID}/answers/${answerUUID}`);
      }
      return newAnswer;
    }
  } catch (err) {
    if (env !== 'development') {
      captureException(err);
      await dispatchCheckApiError(vueInstance.$store, err);
    } else {
      throw err;
    }
  }
};

export const logDebug = (msg: string) => {
  if (env === 'development') {
    console.log(msg);
  }
};

export const newArticleHandler = async (
  vueInstance: any,
  edit: IRichEditorState,
  writingSessionUUID: string,
  isAutosaved: boolean,
  articleColumnId: string
) => {
  if (!edit.title || !edit.body) {
    commitAddNotification(vueInstance.$store, {
      content: vueInstance.$t('Article must have title.').toString(),
      color: 'error',
    });
    return;
  }
  try {
    const newArticle = (
      await apiArticle.postArticle(vueInstance.$store.state.main.token, {
        title: edit.title,
        content: {
          source: edit.body,
          rendered_text: edit.rendered_body_text || '',
          editor: edit.editor,
        },
        visibility: edit.visibility,
        is_published: !edit.is_draft,
        writing_session_uuid: writingSessionUUID,
        article_column_uuid: articleColumnId,
      })
    ).data;
    const articleId = newArticle.uuid;
    if (!isAutosaved) {
      await vueInstance.$router.push(`/articles/${articleId}`);
    }
    return newArticle;
  } catch (err) {
    if (env !== 'development') {
      captureException(err);
      await dispatchCheckApiError(vueInstance.$store, err);
    } else {
      throw err;
    }
  }
};

export const authHeaders = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const authHeadersFormData = (token: string) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
};

export const authHeadersWithParams = (token: string, params: URLSearchParams) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };
};

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const rankComments = (dayjs, comments: IComment[]) => {
  return comments.sort((a, b) => {
    if (a.upvotes_count > b.upvotes_count) {
      return -1;
    }
    if (dayjs.utc(a.created_at).isAfter(dayjs.utc(b.created_at))) {
      return -1;
    }
    return 1;
  });
};

export const deepCopy = (o: any): any => {
  return JSON.parse(JSON.stringify(o));
};

export interface IArticleDraft {
  title?: string;
  body?: string;
  editor: editor_T;
}

export const getArticleDraft = async (
  dayjs,
  token: string,
  uuid: string
): Promise<IArticleDraft | null> => {
  const localSavedEdit = loadLocalEdit('article', uuid);
  const response = await apiArticle.getArticleDraft(token, uuid);
  const draft = response.data;
  if (
    (draft.title_draft || draft.content_draft) &&
    (localSavedEdit === null ||
      dayjs.utc(draft.draft_saved_at).isAfter(dayjs(localSavedEdit.createdAt)))
  ) {
    return {
      title: draft.title_draft,
      body: draft.content_draft?.source,
      editor: draft.content_draft?.editor || 'wysiwyg',
    };
  } else if (localSavedEdit) {
    return {
      title: (localSavedEdit.edit as IRichEditorState).title,
      body: (localSavedEdit.edit as IRichEditorState).body || undefined,
      editor: (localSavedEdit.edit as IRichEditorState).editor,
    };
  } else {
    return null;
  }
};
