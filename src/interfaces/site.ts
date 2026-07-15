import type { IChannel } from './messaging';
import type { ISubmission } from './submission';
import type { ITopic } from './topic';
import type { IUserPreview } from './user';

export interface ISiteUpdate {
  name?: string;
  description?: string;
  category_topic_uuid?: string;
  topic_uuids?: string[];
  auto_approval?: boolean;
  min_karma_for_application?: number;
  email_domain_suffix_for_application?: string;
  moderator_uuid?: string;
}

export interface ISite {
  name: string;
  description?: string;
  topics: ITopic[];
  moderator?: IUserPreview;
  uuid: string;
  public_readable: boolean;
  public_writable_question: boolean;
  public_writable_submission: boolean;
  public_writable_answer: boolean;
  public_writable_comment: boolean;
  create_question_coin_deduction: number;
  subdomain: string;
  permission_type: 'public' | 'private';
  auto_approval: boolean;
  min_karma_for_application?: number;
  email_domain_suffix_for_application?: string;
  questions_count: number;
  submissions_count: number;
  members_count: number;
  category_topic?: ITopic;
}

export interface CreateSiteNeedApproval {
  verb: 'create_site_need_approval';
  subject: IUserPreview;
  channel: IChannel;
}

export interface InviteJoinSite {
  verb: 'invite_join_site';
  subject: IUserPreview;
  site: ISite;
  user?: IUserPreview;
  invited_email?: string;
}

export interface ApplyJoinSite {
  verb: 'apply_join_site';
  subject: IUserPreview;
  site: ISite;
}

export interface SiteBroadcast {
  verb: 'site_broadcast';
  submission: ISubmission;
  site: ISite;
}

export interface ISiteCreate {
  name: string;
  description?: string;
  category_topic_uuid?: string;
  subdomain: string;
  permission_type: 'public' | 'private';
}

export interface ICreateSiteResponse {
  created_site?: ISite;
  application_channel?: IChannel;
}

export interface ISiteApplicationResponse {
  applied_before: boolean;
  auto_approved: boolean;
}

export interface SiteModeratorBroadcastTaskDefinition {
  task_type: 'site_broadcast';
  to_members_of_site_uuid: string;
  submission_uuid: string;
}

export interface ISiteMap {
  topic: ITopic;
  sub_site_maps: ISiteMap[];
  sites: ISite[];
}

export interface ISiteMaps {
  site_maps: ISiteMap[];
  sites_without_topics: ISite[];
}

export interface IOriginSite {
  origin_type: 'site';
  subdomain: string;
}

export type IOrigin = IOriginSite;

export interface IUpdateOrigins {
  action: 'add' | 'remove';
  origin: IOrigin;
}

