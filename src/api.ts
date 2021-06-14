import axios from 'axios';
import { apiUrl } from '@/env';
import {
  IUserProfile,
  IUserProfileUpdate,
  IUserProfileCreate,
  IAnswer,
  IAuditLog,
  IAnswerPreview,
  IUserSiteProfile,
  IChannel,
  IChannelCreate,
  IMessage,
  IMessageCreate,
  IUserPreview,
  IMsg,
  INotification,
  INotificationUpdate,
  ICoinPayment,
  IAnswerModUpdate,
  IArticleColumn,
  IVerificationCodeRequest,
  ISiteMaps,
  IRewardCreate,
  IReward,
  IClaimWelcomeTestScoreMsg,
  IArticlePreview,
  IApplication,
  IInvitationLinkCreate,
  IInvitationLink,
  ITask,
  ITaskDefinition,
  ITopic,
} from './interfaces';
import { authHeaders } from './utils';

export const api = {
  async logInGetToken(username: string, password: string, hcaptcha_token: string) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('hcaptcha_token', hcaptcha_token);
    return axios.post(`${apiUrl}/api/v1/login/access-token`, params);
  },
  async logInWithCodeGetToken(phoneNumber: string, code: string) {
    return axios.post(`${apiUrl}/api/v1/login-with-verification-code/access-token`, {
      phone_number: phoneNumber,
      code,
    });
  },
  async logInInvitedGetToken(inviteToken: string) {
    return axios.post(`${apiUrl}/api/v1/login/access-token-for-invited`, {
      invite_token: inviteToken,
    });
  },
  async getUser(token: string, userId: number) {
    return axios.get<IUserProfile>(`${apiUrl}/api/v1/users/${userId}`, authHeaders(token));
  },
  async getUsers(token: string) {
    return axios.get<IUserProfile[]>(`${apiUrl}/api/v1/users/`, authHeaders(token));
  },
  async updateUser(token: string, userId: number, data: IUserProfileUpdate) {
    return axios.put(`${apiUrl}/api/v1/users/${userId}`, data, authHeaders(token));
  },
  async createUser(token: string, data: IUserProfileCreate) {
    return axios.post(`${apiUrl}/api/v1/users/`, data, authHeaders(token));
  },
  async passwordRecovery(email: string) {
    return axios.post(`${apiUrl}/api/v1/password-recovery/${email}`);
  },
  async resetPassword(password: string, token: string) {
    return axios.post(`${apiUrl}/api/v1/reset-password/`, {
      new_password: password,
      token,
    });
  },
  async getSiteMaps(token: string) {
    return axios.get<ISiteMaps>(`${apiUrl}/api/v1/sitemaps/`, authHeaders(token));
  },
  async getUserSiteProfile(token: string, siteUUID: string, userUUID: string) {
    return axios.get<IUserSiteProfile>(
      `${apiUrl}/api/v1/profiles/members/${siteUUID}/${userUUID}`,
      authHeaders(token)
    );
  },

  async getSiteProfiles(token: string, siteUUID: string) {
    return axios.get<IUserSiteProfile[]>(
      `${apiUrl}/api/v1/profiles/members/${siteUUID}`,
      authHeaders(token)
    );
  },
  async getMyArticleColumns(token: string) {
    return axios.get<IArticleColumn[]>(`${apiUrl}/api/v1/me/article-columns/`, authHeaders(token));
  },
  async createChannel(token: string, payload: IChannelCreate) {
    return axios.post<IChannel>(`${apiUrl}/api/v1/channels/`, payload, authHeaders(token));
  },
  async getChannel(token: string, channelId: number) {
    return axios.get<IChannel>(`${apiUrl}/api/v1/channels/${channelId}`, authHeaders(token));
  },
  async getChannelMessages(token: string, channelId: number) {
    return axios.get<IMessage[]>(
      `${apiUrl}/api/v1/channels/${channelId}/messages/`,
      authHeaders(token)
    );
  },
  async createMessage(token: string, payload: IMessageCreate) {
    return axios.post<IMessage>(`${apiUrl}/api/v1/messages/`, payload, authHeaders(token));
  },
  async addUserToChannel(token: string, channelId: number, handle: string) {
    return axios.put<IUserPreview>(
      `${apiUrl}/api/v1/channels/${channelId}`,
      { handle },
      authHeaders(token)
    );
  },
  async createTask(token: string, payload: ITaskDefinition) {
    return axios.post<ITask>(`${apiUrl}/api/v1/tasks/`, payload, authHeaders(token));
  },
  async updateAnswerByMod(token: string, answerUUID: string, payload: IAnswerModUpdate) {
    return axios.put<IAnswer>(
      `${apiUrl}/api/v1/answers/${answerUUID}/mod`,
      payload,
      authHeaders(token)
    );
  },
  async sendVerificationCode(payload: IVerificationCodeRequest) {
    return axios.post<IMsg>(`${apiUrl}/api/v1/send-verification-code`, payload);
  },
  async openAccount(
    email: string,
    handle: string,
    code: string,
    password: string,
    invitation_link_uuid: string
  ) {
    return axios.post<IUserProfile>(`${apiUrl}/api/v1/open-account`, {
      email,
      handle,
      password,
      code,
      invitation_link_uuid,
    });
  },
  async getQuestionAnswers(token: string, questionUUID: string) {
    return axios.get<IAnswerPreview[]>(
      `${apiUrl}/api/v1/questions/${questionUUID}/answers/`,
      authHeaders(token)
    );
  },
  async getUnreadNotifications(token: string) {
    return axios.get<INotification[]>(`${apiUrl}/api/v1/notifications/unread/`, authHeaders(token));
  },
  async updateNotification(token: string, notifId: number, payload: INotificationUpdate) {
    return axios.put<IMsg>(
      `${apiUrl}/api/v1/notifications/${notifId}`,
      payload,
      authHeaders(token)
    );
  },
  async getCoinPayments(token: string) {
    return axios.get<ICoinPayment[]>(`${apiUrl}/api/v1/coin-payments/`, authHeaders(token));
  },
  async inviteAnswer(token: string, questionUUID: string, userUUID: string) {
    return axios.post<IMsg>(
      `${apiUrl}/api/v1/questions/${questionUUID}/invite-answer/${userUUID}`,
      null,
      authHeaders(token)
    );
  },
  async createReward(token: string, data: IRewardCreate) {
    return axios.post<IReward>(`${apiUrl}/api/v1/rewards/`, data, authHeaders(token));
  },
  async claimReward(token: string, rewardId: number) {
    return axios.post<IReward>(
      `${apiUrl}/api/v1/rewards/${rewardId}/claim`,
      null,
      authHeaders(token)
    );
  },
  async refundReward(token: string, rewardId: number) {
    return axios.post<IReward>(
      `${apiUrl}/api/v1/rewards/${rewardId}/refund`,
      null,
      authHeaders(token)
    );
  },
  async getRewards(token: string) {
    return axios.get<IReward[]>(`${apiUrl}/api/v1/rewards/`, authHeaders(token));
  },
  async checkWelcomeTestScoreAndClaimRewards(token: string, formResponseId: number) {
    return axios.post<IClaimWelcomeTestScoreMsg>(
      `${apiUrl}/api/v1/claim-welcome-test-rewards/${formResponseId}`,
      null,
      authHeaders(token)
    );
  },
  async getAnswerDrafts(token: string) {
    return axios.get<IAnswerPreview[]>(`${apiUrl}/api/v1/drafts/answers/`, authHeaders(token));
  },
  async getArticleDrafts(token: string) {
    return axios.get<IArticlePreview[]>(`${apiUrl}/api/v1/drafts/articles/`, authHeaders(token));
  },
  async getPendingApplications(token: string, siteUUID: string) {
    return axios.get<IApplication[]>(
      `${apiUrl}/api/v1/applications/pending/${siteUUID}/`,
      authHeaders(token)
    );
  },
  async approveApplication(token: string, applicationId: number) {
    return axios.put<IApplication>(
      `${apiUrl}/api/v1/applications/${applicationId}/approve`,
      null,
      authHeaders(token)
    );
  },
  async createInvitationLink(token: string, payload: IInvitationLinkCreate) {
    return axios.post<IInvitationLink>(
      `${apiUrl}/api/v1/invitation-links/`,
      payload,
      authHeaders(token)
    );
  },
  async joinSiteWithInvitationLink(token: string, uuid: string) {
    return axios.post<IMsg>(
      `${apiUrl}/api/v1/invitation-links/${uuid}/join`,
      null,
      authHeaders(token)
    );
  },
  async getInvitationLink(uuid: string) {
    return axios.get<IInvitationLink>(`${apiUrl}/api/v1/invitation-links/${uuid}`);
  },
  async getAuditLogs(token: string) {
    return axios.get<IAuditLog[]>(`${apiUrl}/api/v1/audit-logs/`, authHeaders(token));
  },
  async getCategoryTopics() {
    return axios.get<ITopic[]>(`${apiUrl}/api/v1/category-topics/`);
  },
  async generateLinkPreview(url: string) {
    const params = new URLSearchParams();
    params.append('url', url);
    return axios.get<Record<string, string>>(`${apiUrl}/api/v1/link-preview/`, { params });
  },
};
