/**
 * Reveal-progress curves for `Typewriter`'s `easing` prop: each maps an
 * elapsed-time fraction (0 to 1) to a revealed-fraction (0 to 1). Total
 * typing duration is always `speed * <visible character count>` regardless
 * of which curve is used -- only the pacing within that duration changes.
 * Formulas from easings.net.
 */

/** @param {number} t @returns {number} */
export function linear(t) {
  return t;
}

/** @param {number} t @returns {number} */
export function easeInQuad(t) {
  return t * t;
}

/** @param {number} t @returns {number} */
export function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

/** @param {number} t @returns {number} */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** @param {number} t @returns {number} */
export function easeInCubic(t) {
  return t * t * t;
}

/** @param {number} t @returns {number} */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/** @param {number} t @returns {number} */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** @param {number} t @returns {number} */
export function easeInSine(t) {
  return 1 - Math.cos((t * Math.PI) / 2);
}

/** @param {number} t @returns {number} */
export function easeOutSine(t) {
  return Math.sin((t * Math.PI) / 2);
}

/** @param {number} t @returns {number} */
export function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
