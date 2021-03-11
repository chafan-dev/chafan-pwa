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
import { authHeaders } from '@/utils';

export const apiPeople = {
  async getUserPublic(token: string, handle: string) {
    return axios.get<IUserPublic>(`${apiUrl}/api/v1/people/${handle}`, authHeaders(token));
  },
  async getUserFollowers(token: string, userUUID: string) {
    return axios.get<IUserPreview[]>(
      `${apiUrl}/api/v1/people/${userUUID}/followers/`,
      authHeaders(token)
    );
  },
  async getUserFollowed(token: string, userUUID: string) {
    return axios.get<IUserPreview[]>(
      `${apiUrl}/api/v1/people/${userUUID}/followed/`,
      authHeaders(token)
    );
  },
  async getQuestionsByAuthor(token: string, userUUID: string) {
    return axios.get<IQuestionPreview[]>(
      `${apiUrl}/api/v1/people/${userUUID}/questions/`,
      authHeaders(token)
    );
  },
  async getSubmissionsByAuthor(token: string, userUUID: string) {
    return axios.get<ISubmission[]>(
      `${apiUrl}/api/v1/people/${userUUID}/submissions/`,
      authHeaders(token)
    );
  },
  async getArticlesByAuthor(token: string, userUUID: string) {
    return axios.get<IArticlePreview[]>(
      `${apiUrl}/api/v1/people/${userUUID}/articles/`,
      authHeaders(token)
    );
  },
  async getAnswersByAuthor(token: string, userUUID: string) {
    return axios.get<IAnswerPreview[]>(
      `${apiUrl}/api/v1/people/${userUUID}/answers/`,
      authHeaders(token)
    );
  },
  async getUserEducationExperiences(token: string, userUUID: string) {
    return axios.get<IUserEducationExperience[]>(
      `${apiUrl}/api/v1/people/${userUUID}/edu-exps/`,
      authHeaders(token)
    );
  },
  async getUserWorkExperiences(token: string, userUUID: string) {
    return axios.get<IUserWorkExperience[]>(
      `${apiUrl}/api/v1/people/${userUUID}/work-exps/`,
      authHeaders(token)
    );
  },
};
