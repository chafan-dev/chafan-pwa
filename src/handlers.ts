import { apiAnswer } from './api/answer';
import { IAnswer, INewEditEvent } from './interfaces';
import { dispatchCaptureApiError } from '@/store/main/actions';
import { commitAddNotification } from './store/main/mutations';
import { newAnswerHandler } from './utils';

export interface IVueInstance {
  $store: any;
  $t: any;
}

class AnswerEditHandler {
  private handlingNewEdit = false;
  private vueInstance: IVueInstance;
  private answerUUID: string | null;
  private questionUUID: string;
  private updatedAnswerCallback: (answer: IAnswer, isAutoSaved: boolean) => void;
  private newAnswerCallback?: (answer: IAnswer, isAutoSaved: boolean) => void;

  constructor(
    vueInstance: any,
    answerUUID: string | null,
    questionUUID: string,
    updatedAnswerCallback: (answer: IAnswer, isAutoSaved: boolean) => void,
    newAnswerCallback?: (answer: IAnswer, isAutoSaved: boolean) => void
  ) {
    this.vueInstance = vueInstance;
    this.answerUUID = answerUUID;
    this.questionUUID = questionUUID;
    this.updatedAnswerCallback = updatedAnswerCallback;
    this.newAnswerCallback = newAnswerCallback;
  }

  get token() {
    return this.vueInstance.$store.state.main.token;
  }

  public async newEditHandler(payload: INewEditEvent) {
    if (this.handlingNewEdit) {
      return;
    }
    this.handlingNewEdit = true;
    await dispatchCaptureApiError(this.vueInstance.$store, async () => {
      if (!payload.edit.rendered_body_text || payload.edit.rendered_body_text.length < 5) {
        if (!payload.isAutosaved) {
          commitAddNotification(this.vueInstance.$store, {
            content: '答案内容太短了',
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        return;
      }
      if (!payload.edit.body || payload.edit.body.length < 5) {
        if (!payload.isAutosaved) {
          commitAddNotification(this.vueInstance.$store, {
            content: '答案内容太短了',
            color: 'error',
          });
        }
        this.handlingNewEdit = false;
        return;
      }
      if (!this.answerUUID && !payload.answerId) {
        // new answer to question
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
            commitAddNotification(this.vueInstance.$store, {
              content: payload.edit.is_draft ? '草稿已保存' : '已发表',
              color: 'success',
            });
          }
        }
      } else {
        const answerUUID = this.answerUUID ? this.answerUUID : payload.answerId!;
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
            commitAddNotification(this.vueInstance.$store, {
              content: payload.edit.is_draft ? '答案草稿已更新' : '更新已发表',
              color: 'success',
            });
          }
          if (payload.saveCallback) {
            payload.saveCallback(response.data);
          }
          this.updatedAnswerCallback(response.data, payload.isAutosaved);
        }
      }
      this.handlingNewEdit = false;
    });
  }
}

export { AnswerEditHandler };
