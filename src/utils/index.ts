// Barrel re-export for backwards compatibility.
// New code should import from specific modules instead.
export {
  getLocalValue,
  setLocalValue,
  getLocalToken,
  saveLocalToken,
  removeLocalToken,
  saveLocalEdit,
  loadLocalEdit,
  clearLocalEdit,
} from './local-storage';
export type { LocalEdit } from './local-storage';

export {
  authHeaders,
  authHeadersArrayBuffer,
  authHeadersFormData,
  authHeadersWithParams,
} from './auth-headers';

export {
  uuidv4,
  availableLocales,
  getBrowserLocale,
  setAppLocale,
  isDev,
  isProdDev,
  logDebug,
  rankComments,
  getRecentYears,
  deepCopy,
  delay,
} from './misc';

// getArticleDraft and IArticleDraft: import directly from '@/utils/drafts'
// to avoid circular chunk dependencies
