import { http } from '@/api/client';
import { IFeedback, IGenericResponse } from '@/interfaces';
import { authHeadersArrayBuffer, authHeadersFormData } from '@/utils';

export const apiFeedback = {
  async uploadFeedback(token: string, payload: FormData) {
    return http.post<IGenericResponse>(`/feedbacks/`, payload, authHeadersFormData(token));
  },

  async getFeedbacks(token: string) {
    return http.get<IFeedback[]>(`/feedbacks/`, authHeadersFormData(token));
  },

  async getFeedbackScreenshotBase64(token: string, feedbackId: number) {
    const r = await http.get(
      `/feedbacks/${feedbackId}/screenshot`,
      authHeadersArrayBuffer(token)
    );
    return Buffer.from(r.data, 'binary').toString('base64');
  },
};
