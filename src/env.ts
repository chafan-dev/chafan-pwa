import dayjs from 'dayjs';

export const env = process.env.VUE_APP_ENV;

// Allowed API host patterns for security validation
const ALLOWED_HOST_PATTERNS = [
  /^api[_-]?\w*\.cha\.fan$/, // api.cha.fan, api_dev.cha.fan, etc.
  /^localhost(:\d+)?$/, // localhost with optional port for dev
  /^127\.0\.0\.1(:\d+)?$/, // 127.0.0.1 with optional port for dev
];

function validateApiHost(host: string): string {
  const isAllowed = ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(host));
  if (!isAllowed) {
    throw new Error(`Invalid API host: ${host}. Must match allowed patterns.`);
  }
  return host;
}

const apiHost = validateApiHost(process.env.VUE_APP_API || '');
const envApi = `https://${apiHost}`;
const envWs = `wss://${apiHost}`;

const apiVersionSuffix = '/api/v1';

export const apiUrl = envApi + apiVersionSuffix;
export const wsUrl = envWs + apiVersionSuffix;
export const appName = process.env.VUE_APP_NAME;
export const sentryDSN = process.env.VUE_APP_SENTRY_DSN;
export const enableCaptcha = false; // Turn off front end rate control - 2024 Dec 06
export const lambdaUrlBase = process.env.VUE_APP_LAMBDA;

export const defaultSiteUuid = '377cjuUDLMMdpH7dWutU';

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
