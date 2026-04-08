import { apiAnswer } from '@/api/answer';
import { IAnswer, INewEditEvent, IRichEditorState } from '@/interfaces';
import { useMainStore } from '@/stores/main';
import { captureException } from '@sentry/vue';
import { isDev, logDebug } from '@/utils/misc';

export const newAnswerHandler = async (
  vueInstance: any,
  edit: IRichEditorState,
  writingSessionUUID: string,
  isAutosaved: boolean,
  questionUUID: string
) => {
  if (edit.body && (!edit.rendered_body_text || edit.rendered_body_text.length < 5)) {
    useMainStore().notifications.push({
      content: '答案太短了',
      color: 'error',
    });
    return;
  }
  try {
    if (edit.body) {
      const newAnswer = (
        await apiAnswer.postAnswer(useMainStore().token, {
          content: {
            source: edit.body,
            editor: edit.editor,
            rendered_text: edit.rendered_body_text || '',
          },
          question_uuid: questionUUID,
          visibility: edit.visibility,
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
  } catch (err: any) {
    if (!isDev) {
      captureException(err);
      await useMainStore().checkApiError(err);
    } else {
      throw err;
    }
  }
};

export interface IVueInstance {
  $t: any;
}

export class AnswerEditHandler {
  private handlingNewEdit = false;
  private vueInstance: IVueInstance;
  private answerUUID: string | null;
  private questionUUID: string;
  private updatedAnswerCallback: (answer: IAnswer, isAutoSaved: boolean) => void;
  private newAnswerCallback?: (answer: IAnswer, isAutoSaved: boolean) => void;
  private invalidAnswerCallback?: () => void;

  constructor(
    vueInstance: any,
    answerUUID: string | null,
    questionUUID: string,
    updatedAnswerCallback: (answer: IAnswer, isAutoSaved: boolean) => void,
    newAnswerCallback?: (answer: IAnswer, isAutoSaved: boolean) => void,
    invalidAnswerCallback?: () => void
  ) {
    this.vueInstance = vueInstance;
    this.answerUUID = answerUUID;
    this.questionUUID = questionUUID;
    this.updatedAnswerCallback = updatedAnswerCallback;
    this.newAnswerCallback = newAnswerCallback;
    this.invalidAnswerCallback = invalidAnswerCallback;
  }

  get token() {
    return useMainStore().token;
  }

  public async newEditHandler(payload: INewEditEvent, isAuthor: boolean) {
    if (this.handlingNewEdit) {
      logDebug('newEditHandler: skip since handlingNewEdit');
      return;
    }
    this.handlingNewEdit = true;
    const store = useMainStore();
    await store.captureApiError(async () => {
      if (!payload.edit.rendered_body_text || payload.edit.rendered_body_text.length < 5) {
        logDebug('newEditHandler: answer too short');
        if (!payload.isAutosaved) {
          store.notifications.push({
            content: '答案内容太短了',
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        if (this.invalidAnswerCallback) {
          this.invalidAnswerCallback();
        }
        return;
      }
      if (!payload.edit.body || payload.edit.body.length < 5) {
        logDebug('newEditHandler: answer too short');
        if (!payload.isAutosaved) {
          store.notifications.push({
            content: '答案内容太短了',
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        if (this.invalidAnswerCallback) {
          this.invalidAnswerCallback();
        }
        return;
      }
      // new answer to question
      if (!this.answerUUID && !payload.answerId) {
        const answer = await newAnswerHandler(
          this.vueInstance,
          payload.edit,
          payload.writingSessionUUID,
          payload.isAutosaved,
          this.questionUUID
        );
        if (answer) {
          this.answerUUID = answer.uuid;
          if (payload.saveCallback) {
            payload.saveCallback(answer);
          }
          if (this.newAnswerCallback) {
            this.newAnswerCallback(answer, payload.isAutosaved);
          }
          if (!payload.isAutosaved) {
            store.notifications.push({
              content: payload.edit.is_draft ? '草稿已保存' : '已发表',
              color: 'success',
            });
          }
        }
      } else {
        // Existing answer
        const answerUUID = this.answerUUID ? this.answerUUID : payload.answerId!;
        logDebug(`newEditHandler existing answer payload.edit: ${JSON.stringify(payload.edit)}`);
        if (isAuthor) {
          const response = await apiAnswer.updateAnswer(this.token, answerUUID, {
            updated_content: {
              source: payload.edit.body,
              rendered_text: payload.edit.rendered_body_text || '',
              editor: payload.edit.editor,
            },
            is_draft: payload.edit.is_draft,
            visibility: payload.edit.visibility,
          });
          if (response) {
            if (!payload.isAutosaved) {
              store.notifications.push({
                content: payload.edit.is_draft ? '答案草稿已更新' : '更新已发表',
                color: 'success',
              });
            }
            if (payload.saveCallback) {
              payload.saveCallback(response.data);
            }
            this.updatedAnswerCallback(response.data, payload.isAutosaved);
          }
        } else {
          const response = await apiAnswer.createSuggestion(this.token, {
            answer_uuid: answerUUID,
            body_rich_text: {
              source: payload.edit.body,
              rendered_text: payload.edit.rendered_body_text || '',
              editor: payload.edit.editor,
            },
            comment: payload.answerSuggestEditComment,
          });
          if (response) {
            store.notifications.push({
              content: '建议提交成功',
              color: 'success',
            });
            if (payload.submitAnswerSuggestEditCallback) {
              payload.submitAnswerSuggestEditCallback(response.data);
            }
          }
        }
      }
      this.handlingNewEdit = false;
    });
  }
}
