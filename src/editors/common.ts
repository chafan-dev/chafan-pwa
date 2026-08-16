import { ACCEPTED_IMAGE_TYPES_ATTR, MAX_IMAGE_BYTES, uploadErrorMessage } from '@/upload';

export const vditorCDN = 'https://cdn.jsdelivr.net/npm/vditor@3.11.2';

export type editor_T =
  | 'tiptap'
  | 'wysiwyg'
  | 'markdown'
  | 'markdown_splitview'
  | 'markdown_realtime_rendering';

export type VditorUploadFn = (file: File) => Promise<string>;

/** `]` and `)` in a filename would end the markdown link early. */
function altText(filename: string): string {
  return filename.replace(/[[\]()]/g, '') || '图片';
}

/**
 * Vditor upload options that send each image through `upload` and insert the
 * result with `insert`.
 *
 * Vditor's own uploader is not used at all. It POSTs a batch under one field
 * name to a single URL, which is not what `POST /upload/images/` accepts (one
 * `file`, plus a `purpose`), and the batch endpoint it was written against
 * (`/upload/vditor/`) no longer exists. Setting `handler` replaces that path
 * entirely: when one is present Vditor neither validates, uploads, nor inserts,
 * so all three happen here. A returned string is shown as the editor's tip;
 * null means handled.
 */
export function vditorUploadOptions(upload: VditorUploadFn, insert: (markdown: string) => void) {
  return {
    accept: ACCEPTED_IMAGE_TYPES_ATTR,
    max: MAX_IMAGE_BYTES,
    handler: async (files: File[]): Promise<string | null> => {
      for (const file of files) {
        try {
          const url = await upload(file);
          insert(`![${altText(file.name)}](${url})`);
        } catch (error: unknown) {
          return uploadErrorMessage(error);
        }
      }
      return null;
    },
  };
}

//https://stackoverflow.com/questions/38241480/detect-macos-ios-windows-android-and-linux-os-with-js
export function getOS() {
  const userAgent = window.navigator.userAgent,
    platform = window.navigator.platform,
    macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
    windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
    iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os: 'Mac OS' | 'iOS' | 'Windows' | 'Android' | 'Linux' | '' = '';

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}
