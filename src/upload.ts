/**
 * Client-side policy for image uploads.
 *
 * Every constant here mirrors one in the API (chafan-core) and is a
 * *pre*-check only: the server enforces all of it again, on bytes it has
 * sanitized itself. The point of duplicating the numbers is a message in
 * Chinese before a round trip, not security.
 *
 * Server side of the contract (`POST /upload/images/`):
 *   - multipart with `file` and `purpose` ("figure" | "avatar")
 *   - "figure" needs MIN_KARMA_UPLOAD_IMAGE karma; "avatar" is exempt
 *   - new bytes cost UPLOAD_IMAGE_COST coins; identical bytes are free
 *     (content-addressed by the sha256 of the *sanitized* bytes)
 *   - the response URL is `{UPLOADS_PUBLIC_URL_BASE}/{sha}.{ext}`
 */
import { AxiosError } from 'axios';

import { translateErrorMsgCN } from '@/i18n';

/** What the image is declared to be. Closed set: the server 422s anything else. */
export type UploadPurpose = 'figure' | 'avatar';

/**
 * chafan-core `common.MAX_UPLOAD_BYTES`. The server checks it against
 * Content-Length — the whole multipart body, not just the file — and the
 * check is strict (`lt`), so the client cap leaves room for the part headers
 * and the boundary.
 */
export const MAX_UPLOAD_BYTES = 5_000_000;
export const MAX_IMAGE_BYTES = 4_900_000;

/** chafan-core `image_sanitize._SUPPORTED_FORMATS`: anything else is a 415. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
/** For the `accept` attribute of a file input / the Vditor picker. */
export const ACCEPTED_IMAGE_TYPES_ATTR = ACCEPTED_IMAGE_TYPES.join(', ');

/**
 * The same list without GIF, for the still-avatar picker. A GIF chosen there
 * would bypass the canvas resize (`prepare` skips animated GIFs so they do not
 * flatten to one frame) and land as an animated avatar, which is what the
 * separate GIF avatar field already exists to do.
 */
export const ACCEPTED_STILL_IMAGE_TYPES_ATTR = ACCEPTED_IMAGE_TYPES.filter(
  (type) => type !== 'image/gif'
).join(', ');

/** chafan-core `rules.MIN_KARMA_UPLOAD_IMAGE`. */
export const MIN_KARMA_UPLOAD_IMAGE = 100;
/** chafan-core `rules.UPLOAD_IMAGE_COST`, burned per *new* image. */
export const UPLOAD_IMAGE_COST = 2;

/**
 * An upload that failed for a reason worth showing the user, with `message`
 * already translated. Distinct from a raw AxiosError so callers know the text
 * is safe to display and that it must not reach `store.checkApiError`, which
 * logs out on 403 — and 403 is exactly what the karma gate returns.
 */
export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

function megabytes(bytes: number): string {
  return `${Math.floor(bytes / 100_000) / 10} MB`;
}

/** A Chinese reason the file cannot be uploaded, or null when it can. */
export function validateImageFile(file: Blob): string | null {
  if (file.size === 0) {
    return '图片是空文件';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `图片太大（${megabytes(file.size)}），最大 ${megabytes(MAX_IMAGE_BYTES)}`;
  }
  // A Blob built by canvas always has a type; a File picked on an exotic
  // platform may not. An empty type is left to the server to sniff.
  if (file.type && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return '只支持 JPEG、PNG、GIF、WebP 图片';
  }
  return null;
}

function responseDetail(error: AxiosError): string | undefined {
  const data = error.response?.data as { detail?: unknown; error?: unknown } | undefined;
  const detail = data?.detail ?? data?.error;
  return typeof detail === 'string' ? detail : undefined;
}

/**
 * Turn an upload failure into a message to show the user.
 *
 * Keyed on status rather than on the detail string wherever the server's text
 * carries a number (the karma gate says "requires 100 karma"), so a change to
 * that number on the server does not silently fall through to English.
 */
export function uploadErrorMessage(error: unknown): string {
  if (error instanceof UploadError) {
    return error.message;
  }
  const axiosError = error as AxiosError;
  if (!axiosError?.isAxiosError) {
    return '图片上传失败';
  }
  if (!axiosError.response) {
    return '无法连接到服务器';
  }
  const detail = responseDetail(axiosError);
  switch (axiosError.response.status) {
    case 400:
      // The only 400 on this route is the coin balance. Re-uploading an image
      // the site already stores is free, so this is about *new* bytes.
      return `硬币不足，上传新图片需要 ${UPLOAD_IMAGE_COST} 枚硬币`;
    case 401:
      return '上传需要登录';
    case 403:
      return `上传插图需要 ${MIN_KARMA_UPLOAD_IMAGE} Karma`;
    case 413:
      return `图片太大，最大 ${megabytes(MAX_UPLOAD_BYTES)}`;
    case 415:
      return '不支持的图片格式，请上传 JPEG、PNG、GIF 或 WebP 图片';
    case 422:
      // The Content-Length gate is a header constraint, so an oversize body
      // is a validation error rather than a 413.
      return `图片太大或格式无效，最大 ${megabytes(MAX_UPLOAD_BYTES)}`;
    case 429:
      return '上传太频繁了，请稍后再试';
    case 503:
      return '本站暂时无法上传图片，请稍后再试';
    default:
      return detail ? translateErrorMsgCN(detail) : '图片上传失败';
  }
}
