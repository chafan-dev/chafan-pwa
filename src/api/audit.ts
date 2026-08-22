import { http } from '@/api/client';
import { IAuditLog } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiAudit = {
  async getAuditLogs(token: string) {
    return http.get<IAuditLog[]>(`/audit-logs/`, authHeaders(token));
  },
};
