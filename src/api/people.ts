import axios from 'axios';
import { apiUrl } from '@/env';
import {
  IAnswerPreview,
  IArticlePreview,
  IQuestionPreview,
  ISubmission,
  IUserEducationExperience,
  IUserPreview,
  IUserPublic,
  IUserWorkExperience,
} from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiPeople = {
  async getUserPublic(token: string, handle: string) {
    return axios.get<IUserPublic>(`${apiUrl}/people/${handle}`, authHeaders(token));
  },
  async getUserFollowers(token: string, userUUID: string) {
    return axios.get<IUserPreview[]>(`${apiUrl}/people/${userUUID}/followers/`, authHeaders(token));
  },
  async getUserFollowed(token: string, userUUID: string) {
    return axios.get<IUserPreview[]>(`${apiUrl}/people/${userUUID}/followed/`, authHeaders(token));
  },
  async getRelatedUsers(token: string, userUUID: string) {
    return axios.get<IUserPreview[]>(`${apiUrl}/people/${userUUID}/related/`, authHeaders(token));
  },
  async getQuestionsByAuthor(token: string, userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/people/${userUUID}/questions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getSubmissionsByAuthor(token: string, userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<ISubmission[]>(
      `${apiUrl}/people/${userUUID}/submissions/`,
      authHeadersWithParams(token, params)
    );
  },
  async getArticlesByAuthor(token: string, userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IArticlePreview[]>(
      `${apiUrl}/people/${userUUID}/articles/`,
      authHeadersWithParams(token, params)
    );
  },
  async getAnswersByAuthor(token: string, userUUID: string, skip: number, limit: number) {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return axios.get<IAnswerPreview[]>(
      `${apiUrl}/people/${userUUID}/answers/`,
      authHeadersWithParams(token, params)
    );
  },
  async getUserEducationExperiences(token: string, userUUID: string) {
    return axios.get<IUserEducationExperience[]>(
      `${apiUrl}/people/${userUUID}/edu-exps/`,
      authHeaders(token)
    );
  },
  async getUserWorkExperiences(token: string, userUUID: string) {
    return axios.get<IUserWorkExperience[]>(
      `${apiUrl}/people/${userUUID}/work-exps/`,
      authHeaders(token)
    );
  },
};
