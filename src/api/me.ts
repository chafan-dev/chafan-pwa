import { http } from '@/api/client';
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
    return http.get<IUserProfile>(`/me`, authHeaders(token));
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
    return http.put<IUserProfile>(`/me`, data, authHeaders(token));
  },
  async updatePrimaryEmail(token: string, data: IUserUpdatePrimaryEmail) {
    return http.put<IUserProfile>(`/me/login`, data, authHeaders(token));
  },
  async updateSecondaryEmail(token: string, data: IUserUpdateSecondaryEmails) {
    return http.put<IUserProfile>(`/me/secondary-emails`, data, authHeaders(token));
  },
  async getUserFollows(token: string, userUUID: string) {
    return http.get<IUserFollows>(`/me/follows/${userUUID}`, authHeaders(token));
  },
  async getUserSiteProfiles(token: string) {
    return http.get<IUserSiteProfile[]>(`/me/site-profiles/`, authHeaders(token));
  },
  async followUser(token: string, userUUID: string) {
    return http.post<IUserFollows>(`/me/follows/${userUUID}`, null, authHeaders(token));
  },
  async cancelFollowUser(token: string, userUUID: string) {
    return http.delete<IUserFollows>(`/me/follows/${userUUID}`, authHeaders(token));
  },
  async getQuestionSubscription(token: string, questionUUID: string) {
    return http.get<IUserQuestionSubscription>(
      `/me/question-subscriptions/${questionUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeQuestion(token: string, questionUUID: string) {
    return http.delete<IUserQuestionSubscription>(
      `/me/question-subscriptions/${questionUUID}`,
      authHeaders(token)
    );
  },
  async subscribeQuestion(token: string, questionUUID: string) {
    return http.post<IUserQuestionSubscription>(
      `/me/question-subscriptions/${questionUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getSubmissionSubscription(token: string, submissionUUID: string) {
    return http.get<IUserSubmissionSubscription>(
      `/me/submission-subscriptions/${submissionUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeSubmission(token: string, submissionUUID: string) {
    return http.delete<IUserSubmissionSubscription>(
      `/me/submission-subscriptions/${submissionUUID}`,
      authHeaders(token)
    );
  },
  async subscribeSubmission(token: string, submissionUUID: string) {
    return http.post<IUserSubmissionSubscription>(
      `/me/submission-subscriptions/${submissionUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getTopicSubscription(token: string, topicUUID: string) {
    return http.get<IUserTopicSubscription>(
      `/me/topic-subscriptions/${topicUUID}`,
      authHeaders(token)
    );
  },
  async unsubscribeTopic(token: string, topicUUID: string) {
    return http.delete<IUserTopicSubscription>(
      `/me/topic-subscriptions/${topicUUID}`,
      authHeaders(token)
    );
  },
  async subscribeTopic(token: string, topicUUID: string) {
    return http.post<IUserTopicSubscription>(
      `/me/topic-subscriptions/${topicUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getMyChannels(token: string) {
    return http.get<IChannel[]>(`/me/channels/`, authHeaders(token));
  },
  async getModeratedSites(token: string) {
    return http.get<ISite[]>(`/me/moderated-sites/`, authHeaders(token));
  },
  async getSubscribedQuestions(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<(IQuestionPreview | null)[]>(
      `/me/question-subscriptions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getSubscribedSubmissions(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<(ISubmission | null)[]>(
      `/me/submission-subscriptions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getAnswerBookmarks(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<(IAnswerPreview | null)[]>(
      `/me/answer-bookmarks/`,
      authHeadersWithParams(token, params)
    );
  },
  async getAnswerBookmark(token: string, answerUUID: string) {
    return http.get<IUserAnswerBookmark>(
      `/me/answer-bookmarks/${answerUUID}`,
      authHeaders(token)
    );
  },
  async unbookmarkAnswer(token: string, answerUUID: string) {
    return http.delete<IUserAnswerBookmark>(
      `/me/answer-bookmarks/${answerUUID}`,
      authHeaders(token)
    );
  },
  async bookmarkAnswer(token: string, answerUUID: string) {
    return http.post<IUserAnswerBookmark>(
      `/me/answer-bookmarks/${answerUUID}`,
      null,
      authHeaders(token)
    );
  },
  async getArticleBookmarks(token: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IArticlePreview[]>(
      `/me/article-bookmarks/`,
      authHeadersWithParams(token, params)
    );
  },
  async getArticleBookmark(token: string, articleUUID: string) {
    return http.get<IUserArticleBookmark>(
      `/me/article-bookmarks/${articleUUID}`,
      authHeaders(token)
    );
  },
  async unbookmarkArticle(token: string, articleUUID: string) {
    return http.delete<IUserArticleBookmark>(
      `/me/article-bookmarks/${articleUUID}`,
      authHeaders(token)
    );
  },
  async bookmarkArticle(token: string, articleUUID: string) {
    return http.post<IUserArticleBookmark>(
      `/me/article-bookmarks/${articleUUID}`,
      null,
      authHeaders(token)
    );
  },
};
