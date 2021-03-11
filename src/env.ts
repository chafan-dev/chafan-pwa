import dayjs from 'dayjs';

export const env = process.env.VUE_APP_ENV;

let envApiUrl = '';
let envWsUrl = '';

if (env === 'production') {
  envApiUrl = `https://${process.env.VUE_APP_DOMAIN_PROD}`;
  envWsUrl = `wss://${process.env.VUE_APP_DOMAIN_PROD}`;
} else if (env === 'staging') {
  envApiUrl = `https://${process.env.VUE_APP_DOMAIN_STAG}`;
  envWsUrl = `wss://${process.env.VUE_APP_DOMAIN_STAG}`;
} else {
  envApiUrl = `http://${process.env.VUE_APP_DOMAIN_DEV}`;
  envWsUrl = `ws://${process.env.VUE_APP_DOMAIN_DEV}`;
}

export const apiUrl = envApiUrl;
export const wsUrl = envWsUrl;
export const appName = process.env.VUE_APP_NAME;
export const sentryDSN = process.env.VUE_APP_SENTRY_DSN;
export const prodStateJsonURL = process.env.VUE_APP_PROD_STATE_JSON_URL;
export const adminUUID = process.env.VUE_APP_ADMIN_UUID;
export const buildInfo = {
  commitHash: process.env.VUE_APP_GIT_COMMIT,
  commitHashShort: process.env.VUE_APP_GIT_COMMIT.substring(0, 7),
  branch: process.env.VUE_APP_GIT_BRANCH,
  commitTime: dayjs(process.env.VUE_APP_GIT_COMMIT_TIME),
};
