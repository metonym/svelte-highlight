import { tick } from "svelte";

/**
 * The `[start, end)` line range to render, padded by `overscan` and clamped
 * to `[0, total]`.
 * @param {{
 *   scrollTop: number,
 *   clientHeight: number,
 *   lineHeight: number,
 *   overscan: number,
 *   total: number,
 * }} params
 * @returns {{ start: number, end: number }}
 */
export function windowRange({
  scrollTop,
  clientHeight,
  lineHeight,
  overscan,
  total,
}) {
  const first = Math.max(0, Math.floor(scrollTop / lineHeight) - overscan);
  const last = Math.min(
    total,
    Math.ceil((scrollTop + clientHeight) / lineHeight) + overscan,
  );
  const start = Math.min(first, total);
  const end = Math.max(start, last);
  return { start, end };
}

/**
 * Measures the probe line's height after the next tick and again once
 * webfonts load. Rounded: a fractional height misaligns the sizer/translateY
 * with the integer scrollTop, causing 1px jitter during streaming repaints.
 * @param {() => HTMLElement | undefined} getProbe
 * @param {() => number} getLineHeight
 * @param {(height: number) => void} setLineHeight
 */
export async function watchLineHeight(getProbe, getLineHeight, setLineHeight) {
  await tick();
  const probe = getProbe();
  if (probe) {
    const height = Math.round(probe.getBoundingClientRect().height);
    if (height > 0) setLineHeight(height);
  }
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(async () => {
      await tick();
      const p = getProbe();
      if (!p) return;
      const height = Math.round(p.getBoundingClientRect().height);
      if (height > 0 && height !== getLineHeight()) setLineHeight(height);
    });
  }
}
