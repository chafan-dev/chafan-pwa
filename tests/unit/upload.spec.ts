import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

vi.mock('@/env', () => ({
  apiUrl: 'https://api.test.cha.fan/api/v1',
  wsUrl: 'wss://api.test.cha.fan/api/v1',
  env: 'test',
}));

vi.mock('@/api/upload', () => ({
  apiUpload: { uploadImage: vi.fn() },
}));

// The canvas resize cannot run in jsdom; the point under test is only which
// blob reaches the API, so the fake makes the resized one recognizable.
vi.mock('@/imagelib', () => ({
  resizeImage: vi.fn(async () => ({
    dataUrl: 'data:image/jpeg;base64,',
    blob: new Blob(['resized'], { type: 'image/jpeg' }),
  })),
}));

vi.mock('@/api/me', () => ({
  apiMe: { getMe: vi.fn(), getModeratedSites: vi.fn(), updateMe: vi.fn() },
}));

vi.mock('@/utils', () => ({
  getLocalToken: vi.fn(() => null),
  saveLocalToken: vi.fn(),
  removeLocalToken: vi.fn(),
  isDev: false,
}));

vi.mock('@sentry/vue', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import {
  MAX_IMAGE_BYTES,
  MIN_KARMA_UPLOAD_IMAGE,
  UPLOAD_IMAGE_COST,
  UploadError,
  uploadErrorMessage,
  validateImageFile,
} from '@/upload';
import { vditorUploadOptions } from '@/editors/common';
import { useImageUpload } from '@/composables/useImageUpload';
import { apiUpload } from '@/api/upload';
import { resizeImage } from '@/imagelib';
import { useMainStore } from '@/stores/main';
import { useNotificationStore } from '@/stores/notifications';

function blobOfSize(size: number, type = 'image/png'): Blob {
  return new Blob([new Uint8Array(size)], { type });
}

function axiosError(status: number, detail?: string) {
  return {
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    response: { status, data: detail === undefined ? {} : { detail } },
  };
}

describe('validateImageFile', () => {
  it('accepts an image inside the cap', () => {
    expect(validateImageFile(blobOfSize(1000, 'image/jpeg'))).toBeNull();
  });

  it('rejects an empty file', () => {
    expect(validateImageFile(blobOfSize(0))).toBe('图片是空文件');
  });

  it('rejects a file over the cap', () => {
    const message = validateImageFile(blobOfSize(MAX_IMAGE_BYTES + 1));
    expect(message).toContain('图片太大');
  });

  it('rejects a format the server cannot decode', () => {
    expect(validateImageFile(blobOfSize(1000, 'image/bmp'))).toBe(
      '只支持 JPEG、PNG、GIF、WebP 图片'
    );
  });

  it('defers to the server when the blob has no type', () => {
    expect(validateImageFile(blobOfSize(1000, ''))).toBeNull();
  });
});

describe('uploadErrorMessage', () => {
  it('passes an already-translated UploadError through', () => {
    expect(uploadErrorMessage(new UploadError('图片是空文件'))).toBe('图片是空文件');
  });

  it('names the coin cost on 400', () => {
    expect(uploadErrorMessage(axiosError(400, 'Insufficient coins.'))).toContain(
      `${UPLOAD_IMAGE_COST} 枚硬币`
    );
  });

  it('names the karma gate on 403 rather than echoing the server number', () => {
    expect(uploadErrorMessage(axiosError(403, 'Uploading a figure requires 100 karma.'))).toBe(
      `上传插图需要 ${MIN_KARMA_UPLOAD_IMAGE} Karma`
    );
  });

  it('translates the format refusal on 415', () => {
    expect(uploadErrorMessage(axiosError(415, 'Unsupported or invalid image.'))).toContain(
      '不支持的图片格式'
    );
  });

  it('reads an oversize body out of the 422 from the Content-Length gate', () => {
    expect(uploadErrorMessage(axiosError(422))).toContain('图片太大');
  });

  it('explains a rate limit', () => {
    expect(uploadErrorMessage(axiosError(429, 'Rate limit exceeded: 20 per 1 hour'))).toBe(
      '上传太频繁了，请稍后再试'
    );
  });

  it('explains an unconfigured server', () => {
    expect(uploadErrorMessage(axiosError(503))).toContain('无法上传图片');
  });

  it('reports a lost connection', () => {
    expect(uploadErrorMessage({ isAxiosError: true, message: 'Network Error' })).toBe(
      '无法连接到服务器'
    );
  });

  it('translates an unrecognized detail', () => {
    expect(uploadErrorMessage(axiosError(409, 'Inactive user'))).toBe('账户已暂停');
  });

  it('falls back for anything that is not an upload failure', () => {
    expect(uploadErrorMessage(new Error('boom'))).toBe('图片上传失败');
  });
});

describe('useImageUpload', () => {
  const uploadImageApi = apiUpload.uploadImage as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    uploadImageApi.mockResolvedValue({ data: { url: 'https://uploads.cha.fan/abc.jpg' } });
  });

  function withProfile(karma: number) {
    const store = useMainStore();
    store.userProfile = { karma } as never;
    return store;
  }

  it('sends purpose=figure and the resized blob', async () => {
    withProfile(MIN_KARMA_UPLOAD_IMAGE);
    const { uploadImage } = useImageUpload();

    const url = await uploadImage(blobOfSize(1000, 'image/png'), 'figure');

    expect(url).toBe('https://uploads.cha.fan/abc.jpg');
    expect(resizeImage).toHaveBeenCalledTimes(1);
    const [, file, purpose] = uploadImageApi.mock.calls[0];
    expect(purpose).toBe('figure');
    expect(file.type).toBe('image/jpeg');
  });

  it('refuses a figure below the karma gate without calling the API', async () => {
    withProfile(MIN_KARMA_UPLOAD_IMAGE - 1);
    const { uploadImage } = useImageUpload();

    await expect(uploadImage(blobOfSize(1000), 'figure')).rejects.toThrow(
      `上传插图需要 ${MIN_KARMA_UPLOAD_IMAGE} Karma（当前 ${MIN_KARMA_UPLOAD_IMAGE - 1}）`
    );
    expect(uploadImageApi).not.toHaveBeenCalled();
  });

  it('exempts avatars from the karma gate', async () => {
    withProfile(0);
    const { uploadImage } = useImageUpload();

    await uploadImage(blobOfSize(1000), 'avatar');

    expect(uploadImageApi.mock.calls[0][2]).toBe('avatar');
  });

  it('never resizes a GIF, so the animation survives', async () => {
    withProfile(0);
    const { uploadImage } = useImageUpload();

    await uploadImage(blobOfSize(1000, 'image/gif'), 'avatar');

    expect(resizeImage).not.toHaveBeenCalled();
    expect(uploadImageApi.mock.calls[0][1].type).toBe('image/gif');
  });

  it('checks the size of what it actually sends', async () => {
    withProfile(0);
    const { uploadImage } = useImageUpload();

    await expect(
      uploadImage(blobOfSize(MAX_IMAGE_BYTES + 1, 'image/gif'), 'avatar', { resize: false })
    ).rejects.toThrow(UploadError);
    expect(uploadImageApi).not.toHaveBeenCalled();
  });

  it('translates a server refusal instead of leaking the AxiosError', async () => {
    withProfile(MIN_KARMA_UPLOAD_IMAGE);
    uploadImageApi.mockRejectedValue(axiosError(400, 'Insufficient coins.'));
    const { uploadImage } = useImageUpload();

    // An AxiosError escaping here would reach store.checkApiError, which logs
    // the user out on 401/403.
    await expect(uploadImage(blobOfSize(1000), 'figure')).rejects.toBeInstanceOf(UploadError);
  });

  it('notifies and returns undefined in the non-throwing variant', async () => {
    withProfile(MIN_KARMA_UPLOAD_IMAGE);
    uploadImageApi.mockRejectedValue(axiosError(415, 'Unsupported or invalid image.'));
    const { uploadImageOrNotify } = useImageUpload();

    const url = await uploadImageOrNotify(blobOfSize(1000), 'figure');

    expect(url).toBeUndefined();
    const notifications = useNotificationStore().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].content).toContain('不支持的图片格式');
    expect(notifications[0].color).toBe('error');
  });
});

describe('vditorUploadOptions', () => {
  const png = () => new File([new Uint8Array(10)], 'a.png', { type: 'image/png' });

  it('inserts each uploaded image as markdown and reports success with null', async () => {
    const inserted: string[] = [];
    const options = vditorUploadOptions(
      async () => 'https://uploads.cha.fan/abc.png',
      (markdown) => inserted.push(markdown)
    );

    await expect(options.handler([png()])).resolves.toBeNull();
    expect(inserted).toEqual(['![a.png](https://uploads.cha.fan/abc.png)']);
  });

  it('strips brackets out of the alt text so the link cannot end early', async () => {
    const inserted: string[] = [];
    const options = vditorUploadOptions(
      async () => 'https://uploads.cha.fan/abc.png',
      (markdown) => inserted.push(markdown)
    );

    await options.handler([new File([new Uint8Array(10)], 'a](x).png', { type: 'image/png' })]);

    expect(inserted).toEqual(['![ax.png](https://uploads.cha.fan/abc.png)']);
  });

  it('returns the reason as a string, which Vditor shows as a tip', async () => {
    const inserted: string[] = [];
    const options = vditorUploadOptions(
      async () => {
        throw new UploadError('硬币不足');
      },
      (markdown) => inserted.push(markdown)
    );

    await expect(options.handler([png()])).resolves.toBe('硬币不足');
    expect(inserted).toEqual([]);
  });
});
