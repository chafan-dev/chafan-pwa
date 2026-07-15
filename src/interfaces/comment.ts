import type { IAnswerPreview } from './answer';
import type { IArticlePreview } from './article';
import type { IRichText } from './common';
import type { IQuestionPreview } from './question';
import type { ISubmission } from './submission';
import type { IUserPreview } from './user';

export interface IComment {
  uuid: string;
  author: IUserPreview;
  created_at: string;
  updated_at: string;
  content: IRichText;
  root_route?: string;
  shared_to_timeline: boolean;
  is_deleted: boolean;
  upvotes_count: number;
  upvoted: boolean;
  child_comments: IComment[];
}

export interface CommentArticle {
  verb: 'comment_article';
  subject: IUserPreview;
  comment: IComment;
  article: IArticlePreview;
}

export interface CommentQuestion {
  verb: 'comment_question';
  subject: IUserPreview;
  comment: IComment;
  question: IQuestionPreview;
}

export interface CommentSubmission {
  verb: 'comment_submission';
  subject: IUserPreview;
  comment: IComment;
  submission: ISubmission;
}

export interface ReplyComment {
  verb: 'reply_comment';
  subject: IUserPreview;
  reply: IComment;
  parent_comment: IComment;
}

export interface MentionedInComment {
  verb: 'mentioned_in_comment';
  subject: IUserPreview;
  comment: IComment;
}

export interface CommentAnswer {
  verb: 'comment_answer';
  subject: IUserPreview;
  comment: IComment;
  answer: IAnswerPreview;
}

export interface ICommentCreate {
  site_uuid?: string;
  content: IRichText;
  question_uuid?: string;
  submission_uuid?: string;
  article_uuid?: string;
  blog_uuid?: string;
  answer_uuid?: string;
  parent_comment_uuid?: string;
  mentioned: string[];
}

export interface ICommentUpdate {
  content?: IRichText;
  shared_to_timeline?: true;
  mentioned?: string[];
}

export interface ICommentUpvotes {
  comment_uuid: string;
  count: number;
  upvoted: boolean;
}

