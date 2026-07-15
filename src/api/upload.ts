import { http } from '@/api/client';
import { IUploadedImage } from '@/interfaces';
import { authHeadersFormData } from '@/utils';

export const apiUpload = {
  async uploadImage(token: string, payload: FormData) {
    return http.post<IUploadedImage>(`/upload/images/`, payload, authHeadersFormData(token));
  },
};
