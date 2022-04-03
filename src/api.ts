import axios from 'axios';
import { apiUrl } from '@/env';
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
  IUserPreview,
  IUserProfile,
  IUserProfileCreate,
  IUserProfileUpdate,
  IUserSiteProfile,
  IVerificationCodeRequest,
} from './interfaces';
import { authHeaders, authHeadersArrayBuffer } from './utils';
import { APIWrapper } from '@/apiWrapper';
import { CVue } from '@/common';

export const api = {
  async logInGetToken(username: string, password: string, hcaptcha_token?: string) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    if (hcaptcha_token) {
      params.append('hcaptcha_token', hcaptcha_token);
    }
    return axios.post(`${apiUrl}/login/access-token`, params);
  },
  async logInInvitedGetToken(inviteToken: string) {
    return axios.post(`${apiUrl}/login/access-token-for-invited`, {
      invite_token: inviteToken,
    });
  },
  async getUser(token: string, userId: number) {
    return axios.get<IUserProfile>(`${apiUrl}/users/${userId}`, authHeaders(token));
  },
  async getUsers(token: string) {
    return axios.get<IUserProfile[]>(`${apiUrl}/users/`, authHeaders(token));
  },
  async updateUser(token: string, userId: number, data: IUserProfileUpdate) {
    return axios.put(`${apiUrl}/users/${userId}`, data, authHeaders(token));
  },
  async createUser(token: string, data: IUserProfileCreate) {
    return axios.post(`${apiUrl}/users/`, data, authHeaders(token));
  },
  async passwordRecovery(email: string) {
    return axios.post(`${apiUrl}/password-recovery/${email}`);
  },
  async resetPassword(password: string, token: string) {
    return axios.post(`${apiUrl}/reset-password/`, {
      new_password: password,
      token,
    });
  },
  async getSiteMaps(token: string) {
    return axios.get<ISiteMaps>(`${apiUrl}/sitemaps/`, authHeaders(token));
  },
  async getUserSiteProfile(token: string, siteUUID: string, userUUID: string) {
    return axios.get<IUserSiteProfile>(
      `${apiUrl}/profiles/members/${siteUUID}/${userUUID}`,
      authHeaders(token)
    );
  },

  async getSiteProfiles(token: string, siteUUID: string) {
    return axios.get<IUserSiteProfile[]>(
      `${apiUrl}/profiles/members/${siteUUID}`,
      authHeaders(token)
    );
  },
  async getMyArticleColumns(token: string) {
    return axios.get<IArticleColumn[]>(`${apiUrl}/me/article-columns/`, authHeaders(token));
  },
  async createChannel(token: string, payload: IChannelCreate) {
    return axios.post<IChannel>(`${apiUrl}/channels/`, payload, authHeaders(token));
  },
  async getChannel(token: string, channelId: number) {
    return axios.get<IChannel>(`${apiUrl}/channels/${channelId}`, authHeaders(token));
  },
  async getChannelMessages(token: string, channelId: number) {
    return axios.get<IMessage[]>(`${apiUrl}/channels/${channelId}/messages/`, authHeaders(token));
  },
  async createMessage(token: string, payload: IMessageCreate) {
    return axios.post<IMessage>(`${apiUrl}/messages/`, payload, authHeaders(token));
  },
  async addUserToChannel(token: string, channelId: number, handle: string) {
    return axios.put<IUserPreview>(
      `${apiUrl}/channels/${channelId}`,
      { handle },
      authHeaders(token)
    );
  },
  async createTask(token: string, payload: ITaskDefinition) {
    return axios.post<ITask>(`${apiUrl}/tasks/`, payload, authHeaders(token));
  },
  async updateAnswerByMod(token: string, answerUUID: string, payload: IAnswerModUpdate) {
    return axios.put<IAnswer>(`${apiUrl}/answers/${answerUUID}/mod`, payload, authHeaders(token));
  },
  async sendVerificationCode(payload: IVerificationCodeRequest) {
    return axios.post<IGenericResponse>(`${apiUrl}/send-verification-code`, payload);
  },
  async openAccount(
    email: string,
    handle: string,
    code: string,
    password: string,
    invitation_link_uuid: string
  ) {
    return axios.post<IUserProfile>(`${apiUrl}/open-account`, {
      email,
      handle,
      password,
      code,
      invitation_link_uuid,
    });
  },
  async getQuestionAnswers(token: string, questionUUID: string) {
    return axios.get<IAnswerPreview[]>(
      `${apiUrl}/questions/${questionUUID}/answers/`,
      authHeaders(token)
    );
  },
  async getUnreadNotifications(token: string) {
    return axios.get<INotification[]>(`${apiUrl}/notifications/unread/`, authHeaders(token));
  },
  async updateNotification(token: string, notifId: number, payload: INotificationUpdate) {
    return axios.put<IGenericResponse>(
      `${apiUrl}/notifications/${notifId}`,
      payload,
      authHeaders(token)
    );
  },
  async getCoinPayments(token: string) {
    return axios.get<ICoinPayment[]>(`${apiUrl}/coin-payments/`, authHeaders(token));
  },
  async inviteAnswer(token: string, questionUUID: string, userUUID: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/questions/${questionUUID}/invite-answer/${userUUID}`,
      null,
      authHeaders(token)
    );
  },
  async createReward(token: string, data: IRewardCreate) {
    return axios.post<IReward>(`${apiUrl}/rewards/`, data, authHeaders(token));
  },
  async claimReward(token: string, rewardId: number) {
    return axios.post<IReward>(`${apiUrl}/rewards/${rewardId}/claim`, null, authHeaders(token));
  },
  async refundReward(token: string, rewardId: number) {
    return axios.post<IReward>(`${apiUrl}/rewards/${rewardId}/refund`, null, authHeaders(token));
  },
  async getRewards(token: string) {
    return axios.get<IReward[]>(`${apiUrl}/rewards/`, authHeaders(token));
  },
  async checkWelcomeTestScoreAndClaimRewards(token: string, formResponseId: number) {
    return axios.post<IClaimWelcomeTestScoreMsg>(
      `${apiUrl}/claim-welcome-test-rewards/${formResponseId}`,
      null,
      authHeaders(token)
    );
  },
  async getAnswerDrafts(token: string) {
    return axios.get<IAnswerPreview[]>(`${apiUrl}/drafts/answers/`, authHeaders(token));
  },
  async getArticleDrafts(token: string) {
    return axios.get<IArticlePreview[]>(`${apiUrl}/drafts/articles/`, authHeaders(token));
  },
  async getPendingApplications(token: string, siteUUID: string) {
    return axios.get<IApplication[]>(
      `${apiUrl}/applications/pending/${siteUUID}/`,
      authHeaders(token)
    );
  },
  async approveApplication(token: string, applicationId: number) {
    return axios.put<IApplication>(
      `${apiUrl}/applications/${applicationId}/approve`,
      null,
      authHeaders(token)
    );
  },
  async createInvitationLink(token: string, payload: IInvitationLinkCreate) {
    return axios.post<IInvitationLink>(`${apiUrl}/invitation-links/`, payload, authHeaders(token));
  },
  async joinSiteWithInvitationLink(token: string, uuid: string) {
    return axios.post<IGenericResponse>(
      `${apiUrl}/invitation-links/${uuid}/join`,
      null,
      authHeaders(token)
    );
  },
  async getInvitationLink(ctx: CVue, uuid: string, cb: (IInvitationLink) => void) {
    return new APIWrapper(ctx).get<IInvitationLink>(`${apiUrl}/invitation-links/${uuid}`, cb);
  },
  async getAuditLogs(token: string) {
    return axios.get<IAuditLog[]>(`${apiUrl}/audit-logs/`, authHeaders(token));
  },
  async getCategoryTopics() {
    return axios.get<ITopic[]>(`${apiUrl}/category-topics/`);
  },
  async generateLinkPreview(url: string) {
    const params = new URLSearchParams();
    params.append('url', url);
    return axios.get<Record<string, string>>(`${apiUrl}/link-preview/`, { params });
  },
  async getFeedbackScreenshotBase64(token: string, feedbackId: number) {
    const r = await axios.get(
      `${apiUrl}/feedbacks/${feedbackId}/screenshot`,
      authHeadersArrayBuffer(token)
    );
    return Buffer.from(r.data, 'binary').toString('base64');
  },
  async createReport(token: string, payload: IReportCreate) {
    return axios.post<IReport>(`${apiUrl}/reports/`, payload, authHeaders(token));
  },
  async checkTokenValidity(token: string) {
    return axios.post<IGenericResponse>(`${apiUrl}/check-token-validity`, {
      token,
    });
  },
};
