const HIGH_SURROGATE_MIN = 0xd800;
const HIGH_SURROGATE_MAX = 0xdbff;
const LOW_SURROGATE_MIN = 0xdc00;
const LOW_SURROGATE_MAX = 0xdfff;
// Chunk sizes for galloping over a shared prefix/suffix (see commonPrefix).
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
 * Length of the shared prefix of `a` and `b`, capped at `max`.
 *
 * The first GALLOP_MIN characters are compared one at a time, so inputs
 * that differ early never pay for a slice. Past that, it gallops in native
 * string compares, from GALLOP_MAX-character chunks down to GALLOP_MIN,
 * instead of one JS iteration per character: the prefix is the whole
 * document on a pure append, the common case while typing. A larger step
 * fails at most once before shrinking, so each level after the first costs
 * O(step). text-diff.bench.ts: ~25x faster on a 50k-character append,
 * ~5x on a 1k one.
 * @param {string} a
 * @param {string} b
 * @param {number} max
 */
function commonPrefix(a, b, max) {
  // charCodeAt (not bracket indexing), so no 1-character string is
  // allocated per position compared.
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
 * Length of the shared suffix of `a` and `b`, capped at `max`. Mirrors
 * `commonPrefix`.
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
 * Diffs two strings down to a common-prefix/suffix trim. Trims on Unicode
 * code points (never splitting a surrogate pair between the shared prefix
 * or suffix and the changed middle).
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
