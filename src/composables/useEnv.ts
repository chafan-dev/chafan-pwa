import { isDev, isProdDev } from '@/utils';

/**
 * Composable for environment checks.
 * Replaces CVue's isDev and isProdDev properties.
 *
 * These are not reactive since environment doesn't change at runtime.
 */
export function useEnv() {
  return {
    isDev,
    isProdDev,
  };
}
