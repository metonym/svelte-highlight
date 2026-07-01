/**
 * Shared reactive core behind `Highlight`, `HighlightAuto`, and
 * `HighlightSvelte`: derives a result from `compute` whenever its
 * dependencies change, and notifies `onHighlight` when that result changes.
 *
 * @template T
 * @param {() => T} compute
 * @param {(result: T) => void} [onHighlight]
 */
export function createHighlighter(compute, onHighlight) {
  const result = $derived.by(compute);

  $effect(() => {
    onHighlight?.(result);
  });

  return {
    get value() {
      return result;
    },
  };
}
