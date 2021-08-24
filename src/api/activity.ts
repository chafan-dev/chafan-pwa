import axios from 'axios';
import { apiUrl } from '@/env';
import { IActivity, IFeedSequence, IMsg, IUpdateOrigins, IUserFeedSettings } from '@/interfaces';
import { authHeaders, authHeadersWithParams } from '@/utils';

export const apiActivity = {
  async getFeedSequence(
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
    return axios.get<IFeedSequence>(
      `${apiUrl}/api/v1/activities/`,
      authHeadersWithParams(token, params)
    );
  },
  async getSettings(token: string) {
    return axios.get<IUserFeedSettings>(
      `${apiUrl}/api/v1/activities/settings/`,
      authHeaders(token)
    );
  },
  async updateOrigins(token: string, payload: IUpdateOrigins) {
    return axios.put<IMsg>(
      `${apiUrl}/api/v1/activities/settings/blocked-origins/`,
      payload,
      authHeaders(token)
    );
  },
};
