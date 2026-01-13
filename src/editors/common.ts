export const vditorCDN = 'https://cdn.jsdelivr.net/npm/@chafan/vditor@3.8.8-chafan.2';

export type editor_T =
  | 'tiptap'
  | 'wysiwyg'
  | 'markdown'
  | 'markdown_splitview'
  | 'markdown_realtime_rendering';

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
