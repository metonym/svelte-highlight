/** Diffs two strings by common-prefix/suffix trim, on code point boundaries. */
export declare function diffText(
  before: string,
  after: string,
): { start: number; removed: string; inserted: string };
