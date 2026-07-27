/**
 * Windowing math and probe-based line-height measurement shared by
 * components that render a scroll-position-driven slice of lines
 * (`HighlightVirtual`, `HighlightStream`'s `virtualize` mode).
 */

import { tick } from "svelte";

/**
 * The `[start, end)` line range to render for a given scroll position,
 * padded by `overscan` lines on each side and clamped to `[0, total]`.
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
 * Measures a hidden probe line's rendered height, once after the next tick
 * and again once webfonts finish loading (a late font swap can change line
 * height after the first measurement). Rounded to a whole pixel: the sizer
 * height and window `translateY` are both `lineCount * lineHeight` /
 * `start * lineHeight`, and a fractional line height makes those fall on a
 * different sub-pixel offset than the (always-integer) scroll position on
 * every repaint - harmless for a one-off scroll, but a visible 1px jitter
 * during continuous high-frequency repaints like streaming.
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
