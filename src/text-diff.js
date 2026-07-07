const HIGH_SURROGATE_MIN = 0xd800;
const HIGH_SURROGATE_MAX = 0xdbff;
const LOW_SURROGATE_MIN = 0xdc00;
const LOW_SURROGATE_MAX = 0xdfff;

/** @param {number} code */
function isHighSurrogate(code) {
  return code >= HIGH_SURROGATE_MIN && code <= HIGH_SURROGATE_MAX;
}

/** @param {number} code */
function isLowSurrogate(code) {
  return code >= LOW_SURROGATE_MIN && code <= LOW_SURROGATE_MAX;
}

/**
 * Diffs two strings down to a common-prefix/suffix trim. Trims on Unicode
 * code points (never splitting a surrogate pair between the shared prefix
 * or suffix and the changed middle).
 * @param {string} before
 * @param {string} after
 * @returns {{ start: number; removed: string; inserted: string }}
 */
export function diffText(before, after) {
  const minLength = Math.min(before.length, after.length);

  let prefix = 0;
  while (prefix < minLength && before[prefix] === after[prefix]) prefix++;
  if (isHighSurrogate(before.charCodeAt(prefix - 1))) prefix--;

  let suffix = 0;
  const maxSuffix = minLength - prefix;
  while (
    suffix < maxSuffix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }
  if (isLowSurrogate(before.charCodeAt(before.length - suffix))) suffix--;

  return {
    start: prefix,
    removed: before.slice(prefix, before.length - suffix),
    inserted: after.slice(prefix, after.length - suffix),
  };
}
