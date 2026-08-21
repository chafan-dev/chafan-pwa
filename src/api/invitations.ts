import { http } from '@/api/client';
import { IGenericResponse, IInvitationLink, IInvitationLinkCreate } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiInvitations = {
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
    return http.get<IInvitationLink>(
      `/invitation-links/${uuid}`,
      token ? authHeaders(token) : undefined
    );
  },
};
