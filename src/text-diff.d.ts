/**
 * Diffs two strings down to a common-prefix/suffix trim, on Unicode code
 * point boundaries.
 */
export declare function diffText(
  before: string,
  after: string,
): { start: number; removed: string; inserted: string };
