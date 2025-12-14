import dayjs from '@/dayjs';

/**
 * Composable for dayjs utilities.
 * Replaces CVue's fromNow method and this.$dayjs access.
 *
 * The dayjs instance is pre-configured with:
 * - UTC plugin
 * - relativeTime plugin
 * - zh-cn locale
 */
export function useDayjs() {
  /**
   * Converts a UTC datetime string to a relative time string (e.g., "2 hours ago")
   */
  function fromNow(datetime: string): string {
    return dayjs.utc(datetime).local().fromNow();
  }

  return {
    dayjs,
    fromNow,
  };
}
