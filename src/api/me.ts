import axios from 'axios';
import { apiUrl } from '@/env';
import { authHeaders, authHeadersWithParams } from '../utils';
import {
  IAnswerPreview,
  IArticlePreview,
  IChannel,
  IQuestionPreview,
  ISite,
  ISubmission,
  IUserAnswerBookmark,
  IUserArticleBookmark,
  IUserFollows,
  IUserProfile,
  IUserQuestionSubscription,
  IUserSiteProfile,
  IUserSubmissionSubscription,
  IUserTopicSubscription,
  IUserUpdateMe,
  IUserUpdatePrimaryEmail,
  IUserUpdateSecondaryEmails,
} from '../interfaces';

function addSchemeToUrl(url: string | undefined) {
  if (!url) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return 'http://' + url;
}

export const apiMe = {
  async getMe(token: string) {
    return axios.get<IUserProfile>(`${apiUrl}/me`, authHeaders(token));
  },
  async updateMe(token: string, data: IUserUpdateMe) {
    data.zhihu_url = addSchemeToUrl(data.zhihu_url);
    data.homepage_url = addSchemeToUrl(data.homepage_url);
    data.linkedin_url = addSchemeToUrl(data.linkedin_url);
    // Empty string should not be sent as part of update data
    const dataRecord = data as Record<string, unknown>;
    for (const key of Object.keys(dataRecord)) {
      if (dataRecord[key] === '') {
        delete dataRecord[key];
      }
    }
    return axios.put<IUserProfile>(`${apiUrl}/me`, data, authHeaders(token));
  },
  async updatePrimaryEmail(token: string, data: IUserUpdatePrimaryEmail) {
    return axios.put<IUserProfile>(`${apiUrl}/me/login`, data, authHeaders(token));
  },
  async updateSecondaryEmail(token: string, data: IUserUpdateSecondaryEmails) {
    return axios.put<IUserProfile>(`${apiUrl}/me/secondary-emails`, data, authHeaders(token));
  },
  async getUserFollows(token: string, userUUID: string) {
    return axios.get<IUserFollows>(`${apiUrl}/me/follows/${userUUID}`, authHeaders(token));
  },
  async getUserSiteProfiles(token: string) {
    return axios.get<IUserSiteProfile[]>(`${apiUrl}/me/site-profiles/`, authHeaders(token));
  },
  async followUser(token: string, userUUID: string) {
    return axios.post<IUserFollows>(`${apiUrl}/me/follows/${userUUID}`, null, authHeaders(token));
  },
  async cancelFollowUser(token: string, userUUID: string) {
    return axios.delete<IUserFollows>(`${apiUrl}/me/follows/${userUUID}`, authHeaders(token));
  },
  async getQuestionSubscription(token: string, questionUUID: string) {
    return axios.get<IUserQuestionSubscription>(
      `${apiUrl}/me/question-subscriptions/${questionUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeQuestion(token: string, questionUUID: string) {
    return axios.delete<IUserQuestionSubscription>(
      `${apiUrl}/me/question-subscriptions/${questionUUID}`,
      authHeaders(token)
    );
  },
  async subscribeQuestion(token: string, questionUUID: string) {
    return axios.post<IUserQuestionSubscription>(
      `${apiUrl}/me/question-subscriptions/${questionUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getSubmissionSubscription(token: string, submissionUUID: string) {
    return axios.get<IUserSubmissionSubscription>(
      `${apiUrl}/me/submission-subscriptions/${submissionUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeSubmission(token: string, submissionUUID: string) {
    return axios.delete<IUserSubmissionSubscription>(
      `${apiUrl}/me/submission-subscriptions/${submissionUUID}`,
      authHeaders(token)
    );
  },
  async subscribeSubmission(token: string, submissionUUID: string) {
    return axios.post<IUserSubmissionSubscription>(
      `${apiUrl}/me/submission-subscriptions/${submissionUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getTopicSubscription(token: string, topicUUID: string) {
    return axios.get<IUserTopicSubscription>(
      `${apiUrl}/me/topic-subscriptions/${topicUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeTopic(token: string, topicUUID: string) {
    return axios.delete<IUserTopicSubscription>(
      `${apiUrl}/me/topic-subscriptions/${topicUUID}`,
      authHeaders(token)
    );
  },
  async subscribeTopic(token: string, topicUUID: string) {
    return axios.post<IUserTopicSubscription>(
      `${apiUrl}/me/topic-subscriptions/${topicUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getMyChannels(token: string) {
    return axios.get<IChannel[]>(`${apiUrl}/me/channels/`, authHeaders(token));
  },
  async getModeratedSites(token: string) {
    return axios.get<ISite[]>(`${apiUrl}/me/moderated-sites/`, authHeaders(token));
  },
  async getSubscribedQuestions(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<(IQuestionPreview | null)[]>(
      `${apiUrl}/me/question-subscriptions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getSubscribedSubmissions(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<(ISubmission | null)[]>(
      `${apiUrl}/me/submission-subscriptions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getAnswerBookmarks(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<(IAnswerPreview | null)[]>(
      `${apiUrl}/me/answer-bookmarks/`,
      authHeadersWithParams(token, params)
    );
  },
  async getAnswerBookmark(token: string, answerUUID: string) {
    return axios.get<IUserAnswerBookmark>(
      `${apiUrl}/me/answer-bookmarks/${answerUUID}`,
      authHeaders(token)
    );
  },
  async unbookmarkAnswer(token: string, answerUUID: string) {
    return axios.delete<IUserAnswerBookmark>(
      `${apiUrl}/me/answer-bookmarks/${answerUUID}`,
      authHeaders(token)
    );
  },
  async bookmarkAnswer(token: string, answerUUID: string) {
    return axios.post<IUserAnswerBookmark>(
      `${apiUrl}/me/answer-bookmarks/${answerUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getArticleBookmarks(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IArticlePreview[]>(
      `${apiUrl}/me/article-bookmarks/`,
      authHeadersWithParams(token, params)
    );
  },
  async getArticleBookmark(token: string, articleUUID: string) {
    return axios.get<IUserArticleBookmark>(
      `${apiUrl}/me/article-bookmarks/${articleUUID}`,
      authHeaders(token)
    );
  },
  async unbookmarkArticle(token: string, articleUUID: string) {
    return axios.delete<IUserArticleBookmark>(
      `${apiUrl}/me/article-bookmarks/${articleUUID}`,
      authHeaders(token)
    );
  },
  async bookmarkArticle(token: string, articleUUID: string) {
    return axios.post<IUserArticleBookmark>(
      `${apiUrl}/me/article-bookmarks/${articleUUID}`,
      null,
      authHeaders(token)
    );
  },
};
