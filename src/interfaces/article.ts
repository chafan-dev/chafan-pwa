import type { IComment } from './comment';
import type { IRichText } from './common';
import type { ITopic } from './topic';
import type { IUserArticleColumnSubscription, IUserPreview } from './user';

export interface CreateArticle {
  verb: 'create_article';
  subject: IUserPreview;
  article: IArticlePreview;
}

export interface UpvoteArticle {
  verb: 'upvote_article';
  subject: IUserPreview;
  article: IArticlePreview;
  subjects?: IUserPreview[];
}

export interface SubscribeArticleColumn {
  verb: 'follow_article_column';
  subject: IUserPreview;
  article_column: IArticleColumn;
}

export interface IArticleCreate {
  title: string;
  article_column_uuid: string;
  is_published: boolean;
  visibility: 'anyone' | 'registered';
  writing_session_uuid: string;
  content: IRichText;
}

export interface IArticleUpdate {
  updated_title: string;
  is_draft: boolean;
  visibility: 'anyone' | 'registered';
  updated_content: IRichText;
}

export interface IArticleDraft {
  title_draft?: string;
  draft_saved_at?: string;
  content_draft?: IRichText;
}

export interface IArticle {
  uuid: string;
  title: string;
  updated_at: string;
  initial_published_at: string;
  draft_saved_at?: string;
  is_published: boolean;
  visibility: 'anyone' | 'registered';
  topics: ITopic[];
  upvotes_count: number;
  author: IUserPreview;
  comments: IComment[];
  article_column: IArticleColumn;
  upvoted: boolean;
  view_times: number;
  bookmark_count: number;
  archives_count: number;
  bookmarked: boolean;

  content: IRichText;
}

export interface IArticleUpvotes {
  article_uuid: string;
  count: number;
  upvoted: boolean;
}

export interface IArticleColumnCreate {
  name: string;
  description?: string;
}

export interface IArticleColumnUpdate {
  name?: string;
  description?: string;
}

export interface IArticleColumn {
  uuid: string;
  name: string;
  description: string;
  created_at: string;
  owner: IUserPreview;
  subscription?: IUserArticleColumnSubscription;
}

export interface IArticlePreview {
  uuid: string;
  author: IUserPreview;
  article_column: IArticleColumn;
  title: string;
  body_text?: string;
  upvotes_count: number;
  is_published: boolean;
}

export interface IArticleArchive {
  uuid: string;
  title: string;
  topics: ITopic[];
  created_at: string;
  content: IRichText;
}

