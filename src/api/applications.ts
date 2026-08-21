import { http } from '@/api/client';
import { IApplication } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiApplications = {
  async getPendingApplications(token: string) {
    return http.get<IApplication[]>(`/applications/pending/`, authHeaders(token));
  },

  async approveApplication(token: string, applicationId: number) {
    return http.put<IApplication>(
      `/applications/${applicationId}/approve`,
      null,
      authHeaders(token)
    );
  },
};
