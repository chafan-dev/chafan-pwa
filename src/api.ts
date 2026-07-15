import { http } from '@/api/client';
import {
  IAnswer,
  IAnswerModUpdate,
  IAnswerPreview,
  IApplication,
  IArticleColumn,
  IArticlePreview,
  IAuditLog,
  IChannel,
  IChannelCreate,
  IClaimWelcomeTestScoreMsg,
  ICoinPayment,
  IGenericResponse,
  IInvitationLink,
  IInvitationLinkCreate,
  IMessage,
  IMessageCreate,
  INotification,
  INotificationUpdate,
  IReport,
  IReportCreate,
  IReward,
  IRewardCreate,
  ISiteMaps,
  ITask,
  ITaskDefinition,
  ITopic,
  IUserInvite,
  IUserPreview,
  IUserProfile,
  IUserProfileCreate,
  IUserProfileUpdate,
  IUserSiteProfile,
  IVerificationCodeRequest,
  IWsAuthResponse,
  IFeedback,
} from './interfaces';
import { authHeaders, authHeadersArrayBuffer, authHeadersFormData } from './utils';

export const api = {
  async logInGetToken(username: string, password: string, hcaptcha_token?: string) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    if (hcaptcha_token) {
      params.append('hcaptcha_token', hcaptcha_token);
    }
    return http.post(`/login/access-token`, params);
  },
  async logInInvitedGetToken(inviteToken: string) {
    return http.post(`/login/access-token-for-invited`, {
      invite_token: inviteToken,
    });
  },
  async getUser(token: string, userId: number) {
    return http.get<IUserProfile>(`/users/${userId}`, authHeaders(token));
  },
  async getUsers(token: string) {
    return http.get<IUserProfile[]>(`/users/`, authHeaders(token));
  },
  async updateUser(token: string, userId: number, data: IUserProfileUpdate) {
    return http.put(`/users/${userId}`, data, authHeaders(token));
  },
  async createUser(token: string, data: IUserProfileCreate) {
    return http.post(`/users/`, data, authHeaders(token));
  },
  async passwordRecovery(email: string) {
    return http.post(`/password-recovery/${email}`);
  },
  async resetPassword(password: string, token: string) {
    return http.post(`/reset-password/`, {
      new_password: password,
      token,
    });
  },
  async getSiteMaps() {
    return http.get<ISiteMaps>(`/sitemaps/`);
  },
  async getUserSiteProfile(token: string, siteUUID: string, userUUID: string) {
    return http.get<IUserSiteProfile>(
      `/profiles/members/${siteUUID}/${userUUID}`,
      authHeaders(token)
    );
  },

  async getSiteProfiles(token: string, siteUUID: string) {
    return http.get<IUserSiteProfile[]>(
      `/profiles/members/${siteUUID}`,
      authHeaders(token)
    );
  },
  async getMyArticleColumns(token: string) {
    return http.get<IArticleColumn[]>(`/me/article-columns/`, authHeaders(token));
  },
  async createChannel(token: string, payload: IChannelCreate) {
    return http.post<IChannel>(`/channels/`, payload, authHeaders(token));
  },
  async getChannel(token: string, channelId: number) {
    return http.get<IChannel>(`/channels/${channelId}`, authHeaders(token));
  },
  async getChannelMessages(token: string, channelId: number) {
    return http.get<IMessage[]>(`/channels/${channelId}/messages/`, authHeaders(token));
  },
  async createMessage(token: string, payload: IMessageCreate) {
    return http.post<IMessage>(`/messages/`, payload, authHeaders(token));
  },
  async addUserToChannel(token: string, channelId: number, handle: string) {
    return http.put<IUserPreview>(
      `/channels/${channelId}`,
      { handle },
      authHeaders(token)
    );
  },
  async createTask(token: string, payload: ITaskDefinition) {
    return http.post<ITask>(`/tasks/`, payload, authHeaders(token));
  },
  async updateAnswerByMod(token: string, answerUUID: string, payload: IAnswerModUpdate) {
    return http.put<IAnswer>(`/answers/${answerUUID}/mod`, payload, authHeaders(token));
  },
  async sendVerificationCode(payload: IVerificationCodeRequest) {
    return http.post<IGenericResponse>(`/send-verification-code`, payload);
  },
  async openAccount(
    email: string,
    handle: string,
    code: string,
    password: string,
    invitation_link_uuid: string
  ) {
    return http.post<IUserProfile>(`/open-account`, {
      email,
      handle,
      password,
      code,
      invitation_link_uuid,
    });
  },
  async getQuestionAnswers(token: string, questionUUID: string) {
    return http.get<IAnswerPreview[]>(
      `/questions/${questionUUID}/answers/`,
      authHeaders(token)
    );
  },
  async getUnreadNotifications(token: string) {
    return http.get<INotification[]>(`/notifications/unread/`, authHeaders(token));
  },
  async getReadNotifications(token: string) {
    return http.get<INotification[]>(`/notifications/read/`, authHeaders(token));
  },
  async updateNotification(token: string, notifId: number, payload: INotificationUpdate) {
    // notifId can arrive via WebSocket payloads; constrain to a non-negative
    // integer path segment so the request URL cannot be attacker-controlled.
    if (typeof notifId !== 'number' || !Number.isSafeInteger(notifId) || notifId < 0) {
      throw new TypeError('Invalid notification id');
    }
    const path = `/notifications/${notifId}`;
    if (!/^\/notifications\/\d+$/.test(path)) {
      throw new TypeError('Invalid notification path');
    }
    return http.put<IGenericResponse>(path, payload, authHeaders(token));
  },
  async getCoinPayments(token: string) {
    return http.get<ICoinPayment[]>(`/coin-payments/`, authHeaders(token));
  },
  async inviteUser(token: string, payload: IUserInvite) {
    return http.post<IGenericResponse>(`/users/invite`, payload, authHeaders(token));
  },
  async getWsToken(token: string) {
    return http.post<IWsAuthResponse>(`/ws/token`, null, authHeaders(token));
  },
  async uploadFeedback(token: string, payload: FormData) {
    return http.post<IGenericResponse>(`/feedbacks/`, payload, authHeadersFormData(token));
  },
  async getFeedbacks(token: string) {
    return http.get<IFeedback[]>(`/feedbacks/`, authHeadersFormData(token));
  },
  async inviteAnswer(token: string, questionUUID: string, userUUID: string) {
    return http.post<IGenericResponse>(
      `/questions/${questionUUID}/invite-answer/${userUUID}`,
      null,
      authHeaders(token)
    );
  },
  async createReward(token: string, data: IRewardCreate) {
    return http.post<IReward>(`/rewards/`, data, authHeaders(token));
  },
  async claimReward(token: string, rewardId: number) {
    return http.post<IReward>(`/rewards/${rewardId}/claim`, null, authHeaders(token));
  },
  async refundReward(token: string, rewardId: number) {
    return http.post<IReward>(`/rewards/${rewardId}/refund`, null, authHeaders(token));
  },
  async getRewards(token: string) {
    return http.get<IReward[]>(`/rewards/`, authHeaders(token));
  },
  async checkWelcomeTestScoreAndClaimRewards(token: string, formResponseId: number) {
    return http.post<IClaimWelcomeTestScoreMsg>(
      `/claim-welcome-test-rewards/${formResponseId}`,
      null,
      authHeaders(token)
    );
  },
  async getAnswerDrafts(token: string) {
    return http.get<IAnswerPreview[]>(`/drafts/answers/`, authHeaders(token));
  },
  async getArticleDrafts(token: string) {
    return http.get<IArticlePreview[]>(`/drafts/articles/`, authHeaders(token));
  },
  async getPendingApplications(token: string) {
    return http.get<IApplication[]>(`/applications/pending/`, authHeaders(token));
  },
  async approveApplication(token: string, applicationId: number) {
    return http.put<IApplication>(
      `/applications/${applicationId}/approve`,
      null,
      authHeaders(token)
    );
  },
  async createInvitationLink(token: string, payload: IInvitationLinkCreate) {
    return http.post<IInvitationLink>(`/invitation-links/`, payload, authHeaders(token));
  },
  async joinSiteWithInvitationLink(token: string, uuid: string) {
    return http.post<IGenericResponse>(
      `/invitation-links/${uuid}/join`,
      null,
      authHeaders(token)
    );
  },
  async getInvitationLink(token: string | null, uuid: string) {
    return http.get<IInvitationLink>(`/invitation-links/${uuid}`, token ? authHeaders(token) : undefined);
  },
  async getAuditLogs(token: string) {
    return http.get<IAuditLog[]>(`/audit-logs/`, authHeaders(token));
  },
  async getCategoryTopics() {
    return http.get<ITopic[]>(`/category-topics/`);
  },
  async generateLinkPreview(url: string) {
    const params = new URLSearchParams();
    params.append('url', url);
    return http.get<Record<string, string>>(`/link-preview/`, { params });
  },
  async getFeedbackScreenshotBase64(token: string, feedbackId: number) {
    const r = await http.get(
      `/feedbacks/${feedbackId}/screenshot`,
      authHeadersArrayBuffer(token)
    );
    return Buffer.from(r.data, 'binary').toString('base64');
  },
  async createReport(token: string, payload: IReportCreate) {
    return http.post<IReport>(`/reports/`, payload, authHeaders(token));
  },
  async checkTokenValidity(token: string) {
    return http.post<IGenericResponse>(`/check-token-validity/`, `token=${token}`);
  },
};
