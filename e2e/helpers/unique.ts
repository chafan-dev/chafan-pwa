/** Unique suffix so each run creates identifiable content. */
export function uniqueTitle(prefix: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `[e2e] ${prefix} ${ts}`;
}
