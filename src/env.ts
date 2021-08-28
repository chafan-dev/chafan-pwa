import dayjs from 'dayjs';

export const env = process.env.VUE_APP_ENV;

let envApiUrl = '';
let envWsUrl = '';

if (env === 'production') {
  envApiUrl = `https://${process.env.VUE_APP_API}`;
  envWsUrl = `wss://${process.env.VUE_APP_API}`;
} else if (env === 'staging') {
  envApiUrl = `https://${process.env.VUE_APP_API}`;
  envWsUrl = `wss://${process.env.VUE_APP_API}`;
} else {
  envApiUrl = `http://${process.env.VUE_APP_API}`;
  envWsUrl = `ws://${process.env.VUE_APP_API}`;
}

export const isDev = env !== 'production';

export const apiUrl = envApiUrl;
export const wsUrl = envWsUrl;
export const appName = process.env.VUE_APP_NAME;
export const sentryDSN = process.env.VUE_APP_SENTRY_DSN;
export const adminUUID = process.env.VUE_APP_ADMIN_UUID;
export const hCaptchaSiteKey = process.env.VUE_APP_HCAPTCHA_SITEKEY;
export const enableCaptcha = process.env.VUE_APP_ENABLE_CAPTCHA === 'true';

/**
 * Information about this build.
 */
export const buildInfo = {
  /** Git commit ID */
  commitHash: process.env.VUE_APP_GIT_COMMIT as string,
  /** Git commit short ID */
  commitHashShort: (process.env.VUE_APP_GIT_COMMIT as string).substring(0, 8),
  /** Git branch */
  branch: process.env.VUE_APP_GIT_BRANCH as string,
  /** Git commit time, undefined if not available */
  commitTime: process.env.VUE_APP_GIT_COMMIT_TIME
    ? dayjs(process.env.VUE_APP_GIT_COMMIT_TIME)
    : undefined,
  /** Git tags applied to this commit */
  tags: (process.env.VUE_APP_GIT_TAGS as string).split('\n'),
};
