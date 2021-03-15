import axios from 'axios';
import { apiUrl } from '@/env';
import { authHeaders } from '../utils';
import {
  IChannel,
  ISite,
  IUserFollows,
  IUserProfile,
  IUserQuestionSubscription,
  IUserSiteProfile,
  IUserTopicSubscription,
  IUserUpdateMe,
  IQuestionPreview,
  IUserUpdateLoginPhoneNumber,
  IUserUpdateSecondaryEmails,
  IUserUpdatePrimaryEmail,
  IUserSubmissionSubscription,
  ISubmission,
} from '../interfaces';

export const apiMe = {
  async getMe(token: string) {
    return axios.get<IUserProfile>(`${apiUrl}/api/v1/me`, authHeaders(token));
  },
  async updateMe(token: string, data: IUserUpdateMe) {
    return axios.put<IUserProfile>(`${apiUrl}/api/v1/me`, data, authHeaders(token));
  },
  async updatePhoneNumber(token: string, data: IUserUpdateLoginPhoneNumber) {
    return axios.put<IUserProfile>(`${apiUrl}/api/v1/me/phone-number`, data, authHeaders(token));
  },
  async updatePrimaryEmail(token: string, data: IUserUpdatePrimaryEmail) {
    return axios.put<IUserProfile>(`${apiUrl}/api/v1/me/login`, data, authHeaders(token));
  },
  async updateSecondaryEmail(token: string, data: IUserUpdateSecondaryEmails) {
    return axios.put<IUserProfile>(
      `${apiUrl}/api/v1/me/secondary-emails`,
      data,
      authHeaders(token)
    );
  },
  async getUserFollows(token: string, userUUID: string) {
    return axios.get<IUserFollows>(`${apiUrl}/api/v1/me/follows/${userUUID}`, authHeaders(token));
  },
  async getUserSiteProfiles(token: string) {
    return axios.get<IUserSiteProfile[]>(`${apiUrl}/api/v1/me/site-profiles/`, authHeaders(token));
  },
  async followUser(token: string, userUUID: string) {
    return axios.post<IUserFollows>(
      `${apiUrl}/api/v1/me/follows/${userUUID}`,
      null,
      authHeaders(token)
    );
  },
  async cancelFollowUser(token: string, userUUID: string) {
    return axios.delete<IUserFollows>(
      `${apiUrl}/api/v1/me/follows/${userUUID}`,
      authHeaders(token)
    );
  },
  async getQuestionSubscription(token: string, questionUUID: string) {
    return axios.get<IUserQuestionSubscription>(
      `${apiUrl}/api/v1/me/question-subscriptions/${questionUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeQuestion(token: string, questionUUID: string) {
    return axios.delete<IUserQuestionSubscription>(
      `${apiUrl}/api/v1/me/question-subscriptions/${questionUUID}`,
      authHeaders(token)
    );
  },
  async subscribeQuestion(token: string, questionUUID: string) {
    return axios.post<IUserQuestionSubscription>(
      `${apiUrl}/api/v1/me/question-subscriptions/${questionUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getSubmissionSubscription(token: string, submissionUUID: string) {
    return axios.get<IUserSubmissionSubscription>(
      `${apiUrl}/api/v1/me/submission-subscriptions/${submissionUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeSubmission(token: string, submissionUUID: string) {
    return axios.delete<IUserSubmissionSubscription>(
      `${apiUrl}/api/v1/me/submission-subscriptions/${submissionUUID}`,
      authHeaders(token)
    );
  },
  async subscribeSubmission(token: string, submissionUUID: string) {
    return axios.post<IUserSubmissionSubscription>(
      `${apiUrl}/api/v1/me/submission-subscriptions/${submissionUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getTopicSubscription(token: string, topicUUID: string) {
    return axios.get<IUserTopicSubscription>(
      `${apiUrl}/api/v1/me/topic-subscriptions/${topicUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeTopic(token: string, topicUUID: string) {
    return axios.delete<IUserTopicSubscription>(
      `${apiUrl}/api/v1/me/topic-subscriptions/${topicUUID}`,
      authHeaders(token)
    );
  },
  async subscribeTopic(token: string, topicUUID: string) {
    return axios.post<IUserTopicSubscription>(
      `${apiUrl}/api/v1/me/topic-subscriptions/${topicUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getMyChannels(token: string) {
    return axios.get<IChannel[]>(`${apiUrl}/api/v1/me/channels/`, authHeaders(token));
  },
  async getModeratedSites(token: string) {
    return axios.get<ISite[]>(`${apiUrl}/api/v1/me/moderated-sites/`, authHeaders(token));
  },
  async getSubscribedQuestions(token: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/api/v1/me/question-subscriptions/`,
      authHeaders(token)
    );
  },
  async getSubscribedSubmissions(token: string) {
    return axios.get<ISubmission[]>(
      `${apiUrl}/api/v1/me/submission-subscriptions/`,
      authHeaders(token)
    );
  },
};
