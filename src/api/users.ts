import { http } from '@/api/client';
import {
  IGenericResponse,
  IUserInvite,
  IUserProfile,
  IUserProfileCreate,
  IUserProfileUpdate,
  IUserSiteProfile,
} from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiUsers = {
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

  async inviteUser(token: string, payload: IUserInvite) {
    return http.post<IGenericResponse>(`/users/invite`, payload, authHeaders(token));
  },
};
