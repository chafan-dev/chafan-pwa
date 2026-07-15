import type { IComment } from './comment';
import type { IRichText } from './common';
import type { IQuestionPreview } from './question';
import type { ISite } from './site';
import type { IUserPreview } from './user';

export interface IAnswerModUpdate {
  is_hidden_by_moderator?: boolean;
}

export interface IAnswerUpvotes {
  answer_uuid: string;
  count: number;
  upvoted: boolean;
}

export interface IAnswer {
  uuid: string;
  author: IUserPreview;
  site: ISite;
  question: IQuestionPreview;
  updated_at: string;
  featured_at?: string;
  draft_saved_at?: string;
  is_published: boolean;
  comments: IComment[];
  is_hidden_by_moderator: boolean;
  view_times: number;
  comment_writable: boolean;
  bookmark_count: number;
  archives_count: number;
  bookmarked: boolean;
  visibility: 'anyone' | 'registered';
  keywords?: string[];
  content: IRichText;
  upvotes?: IAnswerUpvotes;
  suggest_editable: boolean;
}

export interface IAnswerCreate {
  question_uuid: string;
  is_published: boolean;
  visibility: 'anyone' | 'registered';
  writing_session_uuid: string;
  content: IRichText;
}

export interface IAnswerUpdate {
  updated_content: IRichText;
  is_draft: boolean;
  visibility: 'anyone' | 'registered';
}

export interface IAnswerPreview {
  uuid: string;
  author: IUserPreview;
  question: IQuestionPreview;
  body: string;
  body_is_truncated?: boolean;
  upvotes_count: number;
  is_hidden_by_moderator: boolean;
  full_answer?: IAnswer;
  featured_at?: string;
}

export interface CreateAnswerSuggestEdit {
  verb: 'create_answer_suggest_edit';
  subject: IUserPreview;
  answer_suggest_edit: IAnswerSuggestEdit;
}

export interface AcceptAnswerSuggestEdit {
  verb: 'accept_answer_suggest_edit';
  subject: IUserPreview;
  answer_suggest_edit: IAnswerSuggestEdit;
}

export interface UpvoteAnswer {
  verb: 'upvote_answer';
  subject: IUserPreview;
  answer: IAnswerPreview;
  subjects?: IUserPreview[];
}

export interface IAnswerDraft {
  content_draft?: IRichText;
  draft_saved_at?: string;
}

export interface IAnswerArchive {
  id: number;
  created_at: string;
  content: IRichText;
}

export interface IAnsweredQuestionCondition {
  condition_type: 'answered_question';
  question_uuid: string;
}

export interface IAnswerSuggestEditCreate {
  answer_uuid: string;
  body_rich_text: IRichText;
  comment?: string;
}

export interface IAnswerSuggestEditUpdate {
  status: 'pending' | 'accepted' | 'rejected' | 'retracted';
}

export interface IAnswerSuggestEdit {
  uuid: string;
  body_rich_text?: IRichText;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'retracted';
  accepted_at?: string;
  rejected_at?: string;
  retracted_at?: string;
  author: IUserPreview;
  answer: IAnswer;
  accepted_diff_base?: IRichText;
  comment?: string;
}

