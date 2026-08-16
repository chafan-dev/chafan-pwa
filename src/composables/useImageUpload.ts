import { apiUpload } from '@/api/upload';
import { resizeImage } from '@/imagelib';
import { useMainStore } from '@/stores/main';
import {
  MIN_KARMA_UPLOAD_IMAGE,
  UploadError,
  UploadPurpose,
  uploadErrorMessage,
  validateImageFile,
} from '@/upload';

import { useAuth } from './useAuth';
import { useNotification } from './useNotification';

/** Longest edge of an image the client sends. The server clamps at 2000px. */
const MAX_DIMENSION = 500;

export interface UploadImageOptions {
  /** Downscale to MAX_DIMENSION first. Default true; GIFs are never resized. */
  resize?: boolean;
  /** Kept as `original_filename` on the server's upload row. */
  filename?: string;
}

/**
 * Uploading an image to `POST /upload/images/`, with the client-side share of
 * the contract in `@/upload`.
 *
 * Errors never travel as raw AxiosErrors: `store.checkApiError` logs the user
 * out on 403, and 403 is what the karma gate returns, so an upload refused for
 * lack of karma would otherwise end the session.
 */
export function useImageUpload() {
  const { token } = useAuth();
  const { notifyError } = useNotification();

  /**
   * The karma gate, checked before spending a round trip on bytes the server
   * will refuse. The profile in the store can be stale — a session outlives
   * the karma it was loaded with — so it is refetched before refusing, and a
   * profile we do not have at all defers to the server.
   */
  async function figureKarmaRefusal(): Promise<string | null> {
    const store = useMainStore();
    if (!store.userProfile || store.userProfile.karma >= MIN_KARMA_UPLOAD_IMAGE) {
      return null;
    }
    await store.getUserProfile();
    const karma = store.userProfile?.karma ?? 0;
    if (karma >= MIN_KARMA_UPLOAD_IMAGE) {
      return null;
    }
    return `上传插图需要 ${MIN_KARMA_UPLOAD_IMAGE} Karma（当前 ${karma}）`;
  }

  async function prepare(file: Blob, options?: UploadImageOptions): Promise<Blob> {
    // An animated GIF must not go through the canvas resize: it would come
    // back as a single JPEG frame.
    if (options?.resize === false || file.type === 'image/gif') {
      return file;
    }
    const resized = await resizeImage({ maxSize: MAX_DIMENSION, file });
    return resized.blob;
  }

  /** Upload and return the stored URL. Throws UploadError, message in Chinese. */
  async function uploadImage(
    file: Blob,
    purpose: UploadPurpose,
    options?: UploadImageOptions
  ): Promise<string> {
    if (purpose === 'figure') {
      const refusal = await figureKarmaRefusal();
      if (refusal) {
        throw new UploadError(refusal);
      }
    }
    let body: Blob;
    try {
      body = await prepare(file, options);
    } catch {
      throw new UploadError('无法读取图片');
    }
    const invalid = validateImageFile(body);
    if (invalid) {
      throw new UploadError(invalid);
    }
    try {
      const response = await apiUpload.uploadImage(token.value, body, purpose, options?.filename);
      return response.data.url;
    } catch (error: unknown) {
      throw new UploadError(uploadErrorMessage(error));
    }
  }

  /** Same, but shows the reason and returns undefined instead of throwing. */
  async function uploadImageOrNotify(
    file: Blob,
    purpose: UploadPurpose,
    options?: UploadImageOptions
  ): Promise<string | undefined> {
    try {
      return await uploadImage(file, purpose, options);
    } catch (error: unknown) {
      notifyError(uploadErrorMessage(error));
      return undefined;
    }
  }

  return {
    uploadImage,
    uploadImageOrNotify,
  };
}
