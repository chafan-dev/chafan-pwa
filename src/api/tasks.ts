import { http } from '@/api/client';
import { ITask, ITaskDefinition } from '@/interfaces';
import { authHeaders } from '@/utils';

export const apiTasks = {
  async createTask(token: string, payload: ITaskDefinition) {
    return http.post<ITask>(`/tasks/`, payload, authHeaders(token));
  },
};
