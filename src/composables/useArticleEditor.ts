import { apiArticle } from '@/api/article';
import { IRichEditorState } from '@/interfaces';
import { useMainStore } from '@/stores/main';
import { captureException } from '@sentry/vue';
import { isDev } from '@/utils/misc';
import { useNotificationStore } from '@/stores/notifications';

export const newArticleHandler = async (
  context: { token: string; router?: any },
  edit: IRichEditorState,
  writingSessionUUID: string,
  isAutosaved: boolean,
  articleColumnId: string
) => {
  if (!edit.title || !edit.body) {
    useNotificationStore().push({
      content: '文章必须有标题',
      color: 'error',
    });
    return;
  }
  try {
    const newArticle = (
      await apiArticle.postArticle(context.token, {
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
    if (!isAutosaved && context.router) {
      await context.router.push(`/articles/${articleId}`);
    }
    return newArticle;
  } catch (err: any) {
    if (!isDev) {
      captureException(err);
      await useMainStore().checkApiError(err);
    } else {
      throw err;
    }
  }
};
