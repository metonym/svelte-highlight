/**
 * Feed `text` into `onChunk` in randomly-sized pieces on an interval, so demos
 * can show `HighlightStream` without a real streaming backend (fetch,
 * WebSocket, SSE, ...). Returns a stop function; call it on replay/unmount to
 * clear the interval.
 * @param {string} text
 * @param {{
 *   onChunk: (chunk: string) => void;
 *   onDone?: () => void;
 *   intervalMs?: number;
 *   minChunk?: number;
 *   maxChunk?: number;
 * }} options
 * @returns {() => void}
 */
export function simulateStream(
  text,
  { onChunk, onDone, intervalMs = 35, minChunk = 1, maxChunk = 4 },
) {
  let i = 0;

  const id = setInterval(() => {
    if (i >= text.length) {
      clearInterval(id);
      onDone?.();
      return;
    }

    const size =
      minChunk + Math.floor(Math.random() * (maxChunk - minChunk + 1));
    onChunk(text.slice(i, i + size));
    i += size;
  }, intervalMs);

  return () => clearInterval(id);
}
