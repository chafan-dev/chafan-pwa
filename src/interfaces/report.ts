import type { IUserPreview } from './user';

export type ISevereReportReason =
  // CoC 2, 4, 8
  | 'SPAM'
  // CoC 3
  | 'OFF_TOPIC'
  // CoC 5, 6, 10
  | 'RUDE_OR_ABUSIVE'
  // CoC 1
  | 'RIGHT_INFRINGEMENT'
  | 'NEED_MODERATOR_INTERVENTION';

export type IBenignReportReason =
  // CoC 1
  'NEEDS_IMPROVEMENT' | 'DUPLICATE';

export type IReportReason = IBenignReportReason | ISevereReportReason;

export interface IReportCreate {
  question_uuid?: string;
  submission_uuid?: string;
  answer_uuid?: string;
  article_uuid?: string;
  comment_uuid?: string;
  reason: IReportReason;
  reason_comment?: string;
}

export interface IReport {
  id: number;
  created_at: string;
  reason: IReportReason;
  reason_comment?: string;
  author: IUserPreview;
}
