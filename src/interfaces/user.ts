import type { IEvent } from './activity';
import type { IRichText, editor_T } from './common';
import type { IOrigin, ISite } from './site';
import type { ITopic } from './topic';

export interface IUserProfile {
  id: number;
  uuid: string;
  email: string;
  secondary_emails: string[];
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string;
  handle: string;
  about?: string;
  moderated_sites: ISite[];
  subscribed_topics: ITopic[];
  residency_topics: ITopic[];
  profession_topics: ITopic[];
  remaining_coins: number;
  view_times: number;
  personal_introduction?: string;
  locale_preference?: string;
  flag_list: string[];
  avatar_url?: string;
  gif_avatar_url?: string;
  github_username?: string;
  twitter_username?: string;
  linkedin_url?: string;
  homepage_url?: string;
  zhihu_url?: string;
  karma: number;
  enable_deliver_unread_notifications: boolean;
  default_editor_mode: editor_T;
  feed_settings?: IUserFeedSettings;
  can_create_public_site: boolean;
  can_create_private_site: boolean;
}

export interface IUserSiteProfile {
  karma: number;
  site: ISite;
  owner: IUserPreview;
}

export interface IUserUpdateMe {
  full_name?: string;
  handle?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  about?: string | null;
  residency_topic_uuids?: string[];
  profession_topic_uuids?: string[];
  work_experiences?: IUserWorkExperienceUpdate[];
  education_experiences?: IUserEducationExperienceUpdate[];
  personal_introduction?: string;
  locale_preference?: string;
  flag_list?: string[];
  avatar_url?: string;
  gif_avatar_url?: string;
  github_username?: string;
  twitter_username?: string;
  linkedin_url?: string;
  homepage_url?: string;
  zhihu_url?: string;
  enable_deliver_unread_notifications?: boolean;
  default_editor_mode?: editor_T;
}

export interface IUserProfileUpdate {
  email?: string;
  full_name?: string;
  handle?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  flag_list?: string[];
}

export interface IUserProfileCreate {
  email: string;
  full_name?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface IUserFollows {
  user_uuid: string;
  followers_count: number;
  followed_count: number;
  followed_by_me: boolean;
}

export interface IUserUpdateSecondaryEmails {
  secondary_email: string;
  action: 'add' | 'remove';
  verification_code?: string;
}

export interface IUserUpdatePrimaryEmail {
  email: string;
  verification_code?: string;
}

export interface ISocialAnnotations {
  follow_follows?: number;
}

export interface IUserPreview {
  uuid: string;
  handle: string;
  full_name?: string;
  avatar_url?: string;
  personal_introduction?: string;
  karma: number;
  social_annotations: ISocialAnnotations;
  follows?: IUserFollows; // For front-end mocking only
}

export interface FollowUser {
  verb: 'follow_user';
  subject: IUserPreview;
  user: IUserPreview;
  subjects?: IUserPreview[];
  users?: IUserPreview[];
}

export interface IUserQuestionSubscription {
  question_uuid: string;
  subscription_count: number;
  subscribed_by_me: boolean;
}

export interface IUserSubmissionSubscription {
  submission_uuid: string;
  subscription_count: number;
  subscribed_by_me: boolean;
}

export interface IUserAnswerBookmark {
  answer_uuid: string;
  bookmarked_by_me: boolean;
  bookmarkers_count: number;
}

export interface IUserTopicSubscription {
  topic_uuid: string;
  subscribed_by_me: boolean;
  subscription_count: number;
}

export interface IUserPublic extends IUserPreview {
  gif_avatar_url?: string;
  about_content?: IRichText;
  profile_view_times: number;
  subscribed_topics: ITopic[];
  github_username?: string;
  twitter_username?: string;
  linkedin_url?: string;
  zhihu_url?: string;
  homepage_url?: string;
  residency_topics: ITopic[];
  answers_count: number;
  submissions_count: number;
  questions_count: number;
  articles_count: number;
  created_at: string;
  profession_topics: ITopic[];
  edu_exps: IUserEducationExperience[];
  work_exps: IUserWorkExperience[];
  contributions?: { year: number; data: number[] }[];
}

export interface IUserPublicForVisitor {
  gif_avatar_url?: string;
  uuid: string;
  full_name?: string;
  handle: string;
  karma: number;
  answers_count: number;
  submissions_count: number;
  questions_count: number;
  articles_count: number;
  created_at: string;
}

export interface IUserWorkExperience {
  company_topic: ITopic;
  position_topic: ITopic;
}

export interface IUserWorkExperienceUpdate {
  company_topic_uuid: string;
  position_topic_uuid: string;
}

export interface IUserEducationExperience {
  school_topic: ITopic;
  level: string;
  major?: string;
  enroll_year?: string;
  graduate_year?: string;
}

export interface IUserEducationExperienceUpdate {
  school_topic_uuid: string;
  level_name: string;
  major?: string;
  enroll_year?: string;
  graduate_year?: string;
}

export interface IUserInvite {
  site_uuid: string;
  user_uuid: string;
}

export interface ICoinPayment {
  id: number;
  created_at: string;
  amount: number;
  event?: IEvent;
  payer: IUserPreview;
  payee: IUserPreview;
  comment?: string;
}

export interface IUserArticleBookmark {
  article_uuid: string;
  bookmarked_by_me: boolean;
  bookmarkers_count: number;
}

export interface IUserArticleColumnSubscription {
  article_column_uuid: string;
  subscription_count: number;
  subscribed_by_me: boolean;
}

export interface IUserFeedSettings {
  blocked_origins: IOrigin[];
}

export interface IFeedback {
  id: number;
  created_at: string;
  description: string;
  has_screenshot: boolean;
  status: 'sent' | 'processing' | 'closed' | 'wontfix';
}

