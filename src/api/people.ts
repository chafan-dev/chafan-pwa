import { http } from '@/api/client';
import {
  IAnswerPreview,
  IArticlePreview,
  IQuestionPreview,
  ISubmission,
  IUserEducationExperience,
  IUserPreview,
  IUserPublic,
  IUserSiteProfile,
  IUserWorkExperience,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiPeople = {
  async getUserPublic(token: string, handle: string) {
    return http.get<IUserPublic>(`/people/${handle}`, authHeaders(token));
  },
  async getUserSiteProfiles(token: string, userUUID: string) {
    const params = new URLSearchParams();
    return http.get<IUserSiteProfile[]>(
      `/people/${userUUID}/site-profiles/`,
      authHeadersWithParams(token, params)
    );
  },
  async getUserFollowers(token: string, userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IUserPreview[]>(
      `/people/${userUUID}/followers/`,
      authHeadersWithParams(token, params)
    );
  },
  async getUserFollowed(token: string, userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IUserPreview[]>(
      `/people/${userUUID}/followed/`,
      authHeadersWithParams(token, params)
    );
  },
  async getRelatedUsers(token: string, userUUID: string) {
    return http.get<IUserPreview[]>(`/people/${userUUID}/related/`, authHeaders(token));
  },
  async getQuestionsByAuthor(userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IQuestionPreview[]>(
      `/people/${userUUID}/questions/`,
      { params }
    );
  },
  async getSubmissionsByAuthor(userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<ISubmission[]>(
      `/people/${userUUID}/submissions/`,
      { params }
    );
  },
  async getArticlesByAuthor(userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IArticlePreview[]>(
      `/people/${userUUID}/articles/`,
      { params }
    );
  },
  async getAnswersByAuthor(userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return http.get<IAnswerPreview[]>(
      `/people/${userUUID}/answers/`,
      { params }
    );
  },
  async getUserEducationExperiences(token: string, userUUID: string) {
    return http.get<IUserEducationExperience[]>(
      `/people/${userUUID}/edu-exps/`,
      authHeaders(token)
    );
  },
  async getUserWorkExperiences(token: string, userUUID: string) {
    return http.get<IUserWorkExperience[]>(
      `/people/${userUUID}/work-exps/`,
      authHeaders(token)
    );
  },
};
