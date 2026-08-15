import { http } from '@/api/client';
import { IUploadedImage } from '@/interfaces';
import { UploadPurpose } from '@/upload';
import { authHeadersFormData } from '@/utils';

export const apiUpload = {
  /**
   * `purpose` is required in practice even though the server defaults it to
   * "figure": that default is the karma-gated one, so an avatar sent without
   * it is refused for any account under MIN_KARMA_UPLOAD_IMAGE.
   */
  async uploadImage(token: string, file: Blob, purpose: UploadPurpose, filename?: string) {
    const payload = new FormData();
    if (filename) {
      payload.append('file', file, filename);
    } else {
      payload.append('file', file);
    }
    payload.append('purpose', purpose);
    return http.post<IUploadedImage>(`/upload/images/`, payload, authHeadersFormData(token));
  },
};
