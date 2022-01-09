export type editor_T =
  | 'tiptap'
  | 'wysiwyg'
  | 'markdown'
  | 'markdown_splitview'
  | 'markdown_realtime_rendering';

export interface IRichText {
  source: string;
  rendered_text?: string;
  editor: editor_T;
}

export interface IUserProfile {
  id: number;
  uuid: string;
  email: string;
  secondary_emails: string[];
  phone_number?: string;
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

export interface IAnswerModUpdate {
  is_hidden_by_moderator?: boolean;
}

export interface IAnswerUpvotes {
  answer_uuid: string;
  count: number;
  upvoted: boolean;
}

export interface IQuestionUpvotes {
  question_uuid: string;
  count: number;
  upvoted: boolean;
}

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
  phone_number?: string;
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

export interface IRichEditorState {
  title?: string; // for article
  body: string | null;
  rendered_body_text: string | null;
  visibility: 'anyone' | 'registered';
  is_draft: boolean;
  editor: editor_T;
}

export interface IQuestionCreate {
  site_uuid: string;
  title: string;
}

export interface IUserFollows {
  user_uuid: string;
  followers_count: number;
  followed_count: number;
  followed_by_me: boolean;
}

export interface IUserUpdateLoginPhoneNumber {
  phone_number: string;
  verification_code: string;
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

export interface CreateQuestion {
  verb: 'create_question';
  subject: IUserPreview;
  question: IQuestionPreview;
}

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

export interface CreateArticle {
  verb: 'create_article';
  subject: IUserPreview;
  article: IArticlePreview;
}

export interface CommentArticle {
  verb: 'comment_article';
  subject: IUserPreview;
  comment: IComment;
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

export interface AnswerQuestion {
  verb: 'answer_question';
  subject: IUserPreview;
  answer: IAnswerPreview;
}

export interface CommentQuestion {
  verb: 'comment_question';
  subject: IUserPreview;
  comment: IComment;
  question: IQuestionPreview;
}

export interface CreateSiteNeedApproval {
  verb: 'create_site_need_approval';
  subject: IUserPreview;
  channel: IChannel;
}

export interface EditQuestion {
  verb: 'edit_question';
  subject: IUserPreview;
  question: IQuestionPreview;
}

export interface CommentSubmission {
  verb: 'comment_submission';
  subject: IUserPreview;
  comment: IComment;
  submission: ISubmission;
}

export interface UpvoteSubmission {
  verb: 'upvote_submission';
  subject: IUserPreview;
  submission: ISubmission;
  subjects?: IUserPreview[];
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

export interface InviteAnswer {
  verb: 'invite_answer';
  subject: IUserPreview;
  question: IQuestionPreview;
  user: IUserPreview;
}

export interface InviteJoinSite {
  verb: 'invite_join_site';
  subject: IUserPreview;
  site: ISite;
  user?: IUserPreview;
  invited_email?: string;
}

export interface InvitedUserActivated {
  verb: 'invited_user_activated';
  invited_email?: string;
  payment_amount?: number;
}

export interface ApplyJoinSite {
  verb: 'apply_join_site';
  subject: IUserPreview;
  site: ISite;
}

export interface CommentAnswer {
  verb: 'comment_answer';
  subject: IUserPreview;
  comment: IComment;
  answer: IAnswerPreview;
}

export interface UpvoteAnswer {
  verb: 'upvote_answer';
  subject: IUserPreview;
  answer: IAnswerPreview;
  subjects?: IUserPreview[];
}

export interface UpvoteQuestion {
  verb: 'upvote_question';
  subject: IUserPreview;
  question: IQuestionPreview;
  subjects?: IUserPreview[];
}

export interface FollowUser {
  verb: 'follow_user';
  subject: IUserPreview;
  user: IUserPreview;
  subjects?: IUserPreview[];
  users?: IUserPreview[];
}

export interface SystemBroadcast {
  verb: 'system_broadcast';
  message: string;
}

export interface SiteBroadcast {
  verb: 'site_broadcast';
  submission: ISubmission;
  site: ISite;
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

export interface IQuestionUpdate {
  title?: string;
  desc?: IRichText | null;
  topic_uuids?: string[];
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
  profiles: IUserSiteProfile[];
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

export interface ITopic {
  uuid: string;
  name: string;
  description?: string;
  parent_topic_uuid?: string;
}

export interface ITopicCreate {
  name: string;
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

export interface IChannel {
  id: number;
  name: string;
  is_private: boolean;
  private_with_user: IUserPreview;
  admin: IUserPreview;
  feedback_subject?: IFeedback;
  site_creation_subject?: ISiteCreate;
}

export interface IChannelCreate {
  private_with_user_uuid: string;
}

export interface IMessage {
  id: number;
  channel_id: number;
  body: string;
  author: IUserPreview;
  created_at: string;
  updated_at: string;
}

export interface IMessageCreate {
  channel_id: number;
  body: string;
}

export interface IGenericResponse {
  success: boolean;
}

export interface IUploadedImage {
  url: string;
}

export interface IWsAuthResponse {
  token: string;
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

export type ITaskDefinition = SiteModeratorBroadcastTaskDefinition;

export interface ITask {
  id: number;
  created_at: string;
  task_definition: ITaskDefinition;
  pending: 'pending' | 'finished' | 'failed';
  initiator: IUserPreview;
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

export interface INotification {
  id: number;
  created_at: string;
  body: string;
  event?: Event;
  is_read: boolean;
}

export interface INotificationUpdate {
  is_read: boolean;
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

export interface IWsUserMsg {
  type: 'notification';
  data: INotification;
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

export interface IReactions {
  counters: Map<string, number>;
  my_reactions: string[];
}

export interface IReaction {
  object_uuid: string;
  object_type: 'question' | 'answer' | 'comment' | 'article';
  reaction: '👍' | '👎' | '👀' | '❤️' | '😂' | '🙏';
  action: 'add' | 'cancel';
}

export interface IQuestionArchive {
  id: number;
  title?: string;
  desc?: IRichText;
  topics: ITopic[];
  created_at: string;
  editor?: IUserPreview;
}

export interface ITopBanner {
  enabled: boolean;
  color: string;
  textColor?: string;
  text: string;
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
  draft_saved_at?: number[];
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

export interface IVerificationCodeRequest {
  email?: string;
  phone_number?: string;
}

export interface ITopicUpdate {
  description?: string;
  parent_topic_uuid?: string;
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

export interface IAnsweredQuestionCondition {
  condition_type: 'answered_question';
  question_uuid: string;
}

export interface IRewardCondition {
  content: IAnsweredQuestionCondition;
}

export interface IRewardCreate {
  expired_after_days: number;
  receiver_uuid: string;
  coin_amount: number;
  note_to_receiver?: string;
  condition?: IRewardCondition;
}

export interface IReward {
  id: number;
  created_at: string;
  expired_at: string;
  claimed_at?: string;
  refunded_at?: string;
  coin_amount: number;
  note_to_receiver?: string;
  giver: IUserPreview;
  receiver: IUserPreview;
  condition?: IRewardCondition;
}

export interface ITextField {
  field_type_name: 'text_field';
  desc: string;
}

export interface ISingleChoiceField {
  field_type_name: 'single_choice_field';
  desc: string;
  choices: string[];
}

export interface IMultipleChoicesField {
  field_type_name: 'multiple_choices_field';
  desc: string;
  choices: string[];
}

export interface IFormField {
  unique_name: string;
  field_type: ITextField | ISingleChoiceField | IMultipleChoicesField;
}

export interface IFormCreate {
  title: string;
  form_fields: IFormField[];
}

export interface IForm {
  author: IUserPreview;
  title: string;
  uuid: string;
  form_fields: IFormField[];
  created_at: string;
  updated_at: string;
}

export interface ITextResponseField {
  field_type_name: 'text_response_field';
  desc: string;
  text: string;
}

export interface ISingleChoiceResponseField {
  field_type_name: 'single_choice_response_field';
  desc: string;
  selected_choice: string;
}

export interface IMutipleChoicesResponseField {
  field_type_name: 'multiple_choices_response_field';
  desc: string;
  selected_choices: string[];
}

export interface IFormResponseField {
  unique_name: string;
  field_content: ITextResponseField | ISingleChoiceResponseField | IMutipleChoicesResponseField;
}

export interface IFormResponseCreate {
  form_uuid: string;
  response_fields: IFormResponseField[];
}

export interface IFormResponse {
  response_author: IUserPreview;
  form: IForm;
  id: number;
  response_fields: IFormResponseField[];
  created_at: string;
}

export interface IScores {
  full_score: number;
  score: number;
}

export interface IClaimWelcomeTestScoreMsg {
  success: boolean;
  scores: IScores;
}

export interface INewEditEvent {
  edit: IRichEditorState;
  isAutosaved: boolean;
  answerId?: string;
  articleId?: string;
  writingSessionUUID: string;
  saveCallback?: (answer: IAnswer) => void;
  saveArticleCallback?: (article: IArticle) => void;
  submitAnswerSuggestEditCallback?: (edit: IAnswerSuggestEdit) => void;
}

export interface IApplication {
  id: number;
  created_at: string;
  applicant: IUserPreview;
  applied_site: ISite;
  pending: boolean;
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

export interface IAnswerSuggestEditCreate {
  answer_uuid: string;
  body_rich_text: IRichText;
  comment?: string;
}

export interface IAnswerSuggestEditUpdate {
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

export interface ICommentUpvotes {
  comment_uuid: string;
  count: number;
  upvoted: boolean;
}

export interface IInvitationLinkCreate {
  invited_to_site_uuid?: string;
}

export interface IInvitationLink {
  uuid: string;
  created_at: string;
  expired_at: string;
  invited_to_site?: ISite;
  inviter: IUserPreview;
  remaining_quota: number;
  valid: boolean;
}

export interface IAuditLog {
  uuid: string;
  created_at: string;
  api: string;
  user: IUserPreview;
}

export interface IWebhookSiteEvent {
  event_type: 'site_event';
  new_question?: boolean;
  new_answer?: boolean;
  new_submission?: boolean;
}

export interface IWebhookEventSpec {
  content: IWebhookSiteEvent;
}

export interface IWebhookCreate {
  site_uuid: string;
  event_spec: IWebhookEventSpec;
  secret: string;
  callback_url: string;
}

export interface IWebhookUpdate {
  enabled?: boolean;
  event_spec?: IWebhookEventSpec;
  secret?: string;
  callback_url?: string;
}

export interface IWebhook {
  id: number;
  updated_at: string;
  enabled: boolean;
  event_spec: IWebhookEventSpec;
  secret: string;
  callback_url: string;
  site: ISite;
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

export interface IUserFeedSettings {
  blocked_origins: IOrigin[];
}

export type ThemeType = 'default' | 'blue';

export interface IFeedback {
  id: number;
  created_at: string;
  description: string;
  has_screenshot: boolean;
  status: 'sent' | 'processing' | 'closed' | 'wontfix';
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

export interface IDynoState {
  state: 'up' | 'crashed' | 'down' | 'idle' | 'starting';
}

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
