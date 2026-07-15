import type { IAnswer, IAnswerSuggestEdit } from './answer';
import type { IArticle } from './article';
import type { IRichEditorState } from './common';

export interface INewEditEvent {
  edit: IRichEditorState;
  isAutosaved: boolean;
  answerId?: string;
  articleId?: string;
  writingSessionUUID: string;
  saveCallback?: (answer: IAnswer) => void;
  saveArticleCallback?: (article: IArticle) => void;
  answerSuggestEditComment?: string;
  submitAnswerSuggestEditCallback?: (edit: IAnswerSuggestEdit) => void;
}
