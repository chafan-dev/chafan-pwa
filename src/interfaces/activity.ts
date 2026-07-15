import type { AcceptAnswerSuggestEdit, CreateAnswerSuggestEdit, UpvoteAnswer } from './answer';
import type { CreateArticle, SubscribeArticleColumn, UpvoteArticle } from './article';
import type { CommentAnswer, CommentArticle, CommentQuestion, CommentSubmission, MentionedInComment, ReplyComment } from './comment';
import type { IChannel } from './messaging';
import type { AnswerQuestion, CreateQuestion, EditQuestion, InviteAnswer, UpvoteQuestion } from './question';
import type { ApplyJoinSite, CreateSiteNeedApproval, IOrigin, ISite, InviteJoinSite, SiteBroadcast } from './site';
import type { AcceptSubmissionSuggestion, CreateSubmission, CreateSubmissionSuggestion, UpvoteSubmission } from './submission';
import type { FollowUser, IUserPreview } from './user';

export interface InvitedUserActivated {
  verb: 'invited_user_activated';
  invited_email?: string;
  payment_amount?: number;
}

export interface SystemBroadcast {
  verb: 'system_broadcast';
  message: string;
}

export interface CreateMessage {
  verb: 'create_message';
  subject: IUserPreview;
  channel: IChannel;
}

export interface SystemSendInvitation {
  verb: 'system_send_invitation';
  invited_email: string;
}

export interface IEvent {
  created_at: string;
  content:
    | CreateQuestion
    | AnswerQuestion
    | CommentQuestion
    | ReplyComment
    | MentionedInComment
    | InviteAnswer
    | InviteJoinSite
    | ApplyJoinSite
    | CommentAnswer
    | UpvoteAnswer
    | UpvoteQuestion
    | FollowUser
    | SystemBroadcast
    | CreateMessage
    | InvitedUserActivated
    | CreateArticle
    | CommentArticle
    | UpvoteArticle
    | SubscribeArticleColumn
    | CreateSubmission
    | CreateSubmissionSuggestion
    | AcceptSubmissionSuggestion
    | CreateAnswerSuggestEdit
    | AcceptAnswerSuggestEdit
    | CommentSubmission
    | UpvoteSubmission
    | SystemSendInvitation
    | SiteBroadcast
    | EditQuestion
    | CreateSiteNeedApproval;
}

export interface IActivity {
  id: number;
  created_at: string;
  site?: ISite;
  verb: string;
  event: IEvent;
  origins?: IOrigin[];
}

export interface IFeedSequence {
  activities: IActivity[];
  random: boolean;
}

