/** Wraps plain-text `ranges` of one highlighted line in `<span class>`. */
export function overlayRanges(
  html: string,
  ranges: Array<[number, number]>,
  className: string,
): string;

export function escapeText(text: string): string;
