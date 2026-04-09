import { apiArticle } from '@/api/article';
import { editor_T, IRichEditorState } from '@/interfaces';
import { loadLocalEdit } from './local-storage';

export interface IArticleDraft {
  title?: string;
  body?: string;
  editor: editor_T;
}

export const getArticleDraft = async (
  dayjs: typeof import('dayjs'),
  token: string,
  uuid: string
): Promise<IArticleDraft | null> => {
  const localSavedEdit = loadLocalEdit('article', uuid);
  const response = await apiArticle.getArticleDraft(token, uuid);
  const draft = response.data;
  if (
    (draft.title_draft || draft.content_draft) &&
    (localSavedEdit === null ||
      dayjs.utc(draft.draft_saved_at).isAfter(dayjs(String(localSavedEdit.createdAt))))
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
