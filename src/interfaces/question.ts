import type { IAnswer, IAnswerPreview } from './answer';
import type { IComment } from './comment';
import type { IRichText } from './common';
import type { ISite } from './site';
import type { ITopic } from './topic';
import type { IUserPreview, IUserQuestionSubscription } from './user';

export interface IQuestionUpvotes {
  question_uuid: string;
  count: number;
  upvoted: boolean;
}

export interface IQuestion {
  uuid: string;
  site: ISite;
  author: IUserPreview;
  editor?: IUserPreview;
  created_at: string;
  updated_at: string;
  title: string;
  topics: ITopic[];
  desc?: IRichText;
  comments: IComment[];
  view_times: number;
  is_placed_at_home: boolean;
  answers_count: number;
  keywords?: string[];
  upvotes?: IQuestionUpvotes;
}

export interface IQuestionCreate {
  site_uuid: string;
  title: string;
}

export interface IQuestionPreview {
  uuid: string;
  author: IUserPreview;
  title: string;
  desc?: IRichText;
  site: ISite;
  is_placed_at_home: boolean;
  created_at: string;
  answers_count: number;
  comments_count: number;
  upvotes?: IQuestionUpvotes;
}

export interface CreateQuestion {
  verb: 'create_question';
  subject: IUserPreview;
  question: IQuestionPreview;
}

export interface AnswerQuestion {
  verb: 'answer_question';
  subject: IUserPreview;
  answer: IAnswerPreview;
}

export interface EditQuestion {
  verb: 'edit_question';
  subject: IUserPreview;
  question: IQuestionPreview;
}

export interface InviteAnswer {
  verb: 'invite_answer';
  subject: IUserPreview;
  question: IQuestionPreview;
  user: IUserPreview;
}

export interface UpvoteQuestion {
  verb: 'upvote_question';
  subject: IUserPreview;
  question: IQuestionPreview;
  subjects?: IUserPreview[];
}

export interface IQuestionUpdate {
  title?: string;
  desc?: IRichText | null;
  topic_uuids?: string[];
}

export interface IQuestionArchive {
  id: number;
  title?: string;
  desc?: IRichText;
  topics: ITopic[];
  created_at: string;
  editor?: IUserPreview;
}

export interface IQuestionPageFlags {
  editable: boolean;
  answer_writable: boolean;
  comment_writable: boolean;
  hideable: boolean;
  is_mod: boolean;
}

export interface IQuestionPage {
  question: IQuestion;
  answer_previews: IAnswerPreview[];
  full_answers: IAnswer[];
  question_subscription?: IUserQuestionSubscription;
  flags: IQuestionPageFlags;
}

