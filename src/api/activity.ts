import axios from 'axios';
import { apiUrl } from '@/env';
import { IActivity } from '@/interfaces';
import { authHeadersWithParams } from '@/utils';

export const apiActivity = {
  async getActivities(
    token: string,
    payload: { limit: number; before_activity_id?: number; subjectUserUUID?: number }
  ) {
    const params = new URLSearchParams();
    params.set('limit', payload.limit.toString());
    if (payload.before_activity_id !== undefined) {
      params.set('before_activity_id', payload.before_activity_id.toString());
    }
    if (payload.subjectUserUUID !== undefined) {
      params.set('subject_user_uuid', payload.subjectUserUUID.toString());
    }
    return axios.get<IActivity[]>(
      `${apiUrl}/api/v1/activities/`,
      authHeadersWithParams(token, params)
    );
  },
  async getNewActivities(token: string, payload: { limit: number; after_activity_id?: number }) {
    const params = new URLSearchParams();
    params.set('limit', payload.limit.toString());
    if (payload.after_activity_id !== undefined) {
      params.set('after_activity_id', payload.after_activity_id.toString());
    }
    return axios.get<IActivity[]>(
      `${apiUrl}/api/v1/activities/new/`,
      authHeadersWithParams(token, params)
    );
  },
};
