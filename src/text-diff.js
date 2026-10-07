const HIGH_SURROGATE_MIN = 0xd800;
const HIGH_SURROGATE_MAX = 0xdbff;
const LOW_SURROGATE_MIN = 0xdc00;
const LOW_SURROGATE_MAX = 0xdfff;
const GALLOP_MAX = 4096;
const GALLOP_MIN = 16;

/** @param {number} code */
function isHighSurrogate(code) {
  return code >= HIGH_SURROGATE_MIN && code <= HIGH_SURROGATE_MAX;
}

/** @param {number} code */
function isLowSurrogate(code) {
  return code >= LOW_SURROGATE_MIN && code <= LOW_SURROGATE_MAX;
}

/**
 * Length of the shared prefix, capped at `max`. After GALLOP_MIN single-char
 * compares (so early differences never slice), gallops in native string
 * compares with shrinking chunks: on a pure append the prefix is the whole
 * document.
 * @param {string} a
 * @param {string} b
 * @param {number} max
 */
function commonPrefix(a, b, max) {
  // charCodeAt avoids allocating a 1-character string per compare.
  let n = 0;
  while (n < GALLOP_MIN && n < max && a.charCodeAt(n) === b.charCodeAt(n)) n++;
  if (n < GALLOP_MIN) return n;
  for (let step = GALLOP_MAX; step >= GALLOP_MIN; step >>= 2) {
    while (n + step <= max && b.startsWith(a.slice(n, n + step), n)) {
      n += step;
    }
  }
  while (n < max && a.charCodeAt(n) === b.charCodeAt(n)) n++;
  return n;
}

/**
 * @param {string} a
 * @param {string} b
 * @param {number} max
 */
function commonSuffix(a, b, max) {
  const aEnd = a.length - 1;
  const bEnd = b.length - 1;
  let n = 0;
  while (
    n < GALLOP_MIN &&
    n < max &&
    a.charCodeAt(aEnd - n) === b.charCodeAt(bEnd - n)
  ) {
    n++;
  }
  if (n < GALLOP_MIN) return n;
  for (let step = GALLOP_MAX; step >= GALLOP_MIN; step >>= 2) {
    while (
      n + step <= max &&
      b.endsWith(a.slice(a.length - n - step, a.length - n), b.length - n)
    ) {
      n += step;
    }
  }
  while (n < max && a.charCodeAt(aEnd - n) === b.charCodeAt(bEnd - n)) n++;
  return n;
}

/**
 * Common-prefix/suffix trim that never splits a surrogate pair.
 * @param {string} before
 * @param {string} after
 * @returns {{ start: number; removed: string; inserted: string }}
 */
export function diffText(before, after) {
  const minLength = Math.min(before.length, after.length);

  let prefix = commonPrefix(before, after, minLength);
  if (isHighSurrogate(before.charCodeAt(prefix - 1))) prefix--;

  let suffix = commonSuffix(before, after, minLength - prefix);
  if (isLowSurrogate(before.charCodeAt(before.length - suffix))) suffix--;

  return {
    start: prefix,
    removed: before.slice(prefix, before.length - suffix),
    inserted: after.slice(prefix, after.length - suffix),
  };
}
