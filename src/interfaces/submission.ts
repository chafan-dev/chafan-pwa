import type { IComment } from './comment';
import type { IRichText } from './common';
import type { ISite } from './site';
import type { ITopic } from './topic';
import type { IUserPreview } from './user';

export interface CreateSubmission {
  verb: 'create_submission';
  subject: IUserPreview;
  submission: ISubmission;
}

export interface CreateSubmissionSuggestion {
  verb: 'create_submission_suggestion';
  subject: IUserPreview;
  submission_suggestion: ISubmissionSuggestion;
}

export interface AcceptSubmissionSuggestion {
  verb: 'accept_submission_suggestion';
  subject: IUserPreview;
  submission_suggestion: ISubmissionSuggestion;
}

export interface UpvoteSubmission {
  verb: 'upvote_submission';
  subject: IUserPreview;
  submission: ISubmission;
  subjects?: IUserPreview[];
}

export interface ISubmissionCreate {
  site_uuid: string;
  title: string;
  url?: string;
}

export interface ISubmissionUpdate {
  title?: string;
  desc?: IRichText;
  topic_uuids?: string[];
}

export interface ISubmissionSuggestionCreate {
  submission_uuid: string;
  title: string;
  desc?: IRichText;
  topic_uuids?: string[];
  comment?: string;
}

export interface ISubmissionSuggestionUpdate {
  status: 'pending' | 'accepted' | 'rejected' | 'retracted';
}

export interface ISubmissionEditableSnapshot {
  title: string;
  desc?: IRichText;
  topic_uuids?: string[];
}

export interface ISubmissionSuggestion {
  uuid: string;
  title: string;
  desc?: IRichText;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'retracted';
  accepted_at?: string;
  rejected_at?: string;
  retracted_at?: string;
  author: IUserPreview;
  submission: ISubmission;
  topics?: ITopic[];
  accepted_diff_base?: ISubmissionEditableSnapshot;
  comment?: string;
}

export interface ISubmission {
  uuid: string;
  title: string;
  desc?: IRichText;
  url?: string;
  created_at: string;
  updated_at: string;
  topics: ITopic[];
  author: IUserPreview;
  contributors: IUserPreview[];
  comments: IComment[];
  site: ISite;
  view_times: number;
  keywords?: string[];
}

export interface ISubmissionUpvotes {
  submission_uuid: string;
  count: number;
  upvoted: boolean;
}

export interface ISubmissionArchive {
  id: number;
  title: string;
  desc?: IRichText;
  url?: string;
  created_at: string;
}

