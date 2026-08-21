import { http } from '@/api/client';
import { IReport, IReportCreate } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiReports = {
  async createReport(token: string, payload: IReportCreate) {
    return http.post<IReport>(`/reports/`, payload, authHeaders(token));
  },
};
