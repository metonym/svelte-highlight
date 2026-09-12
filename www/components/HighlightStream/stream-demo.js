/**
 * Feed `text` into `onChunk` in randomly-sized pieces on an interval, so demos
 * can show `HighlightStream` without a real streaming backend (fetch,
 * WebSocket, SSE, ...). Returns a stop function (call it on replay/unmount to
 * clear the interval for good); the same function also carries `.pause()`
 * and `.resume()` for demos that want to freeze mid-stream without losing
 * position, then continue from where they left off.
 * @param {string} text
 * @param {{
 *   onChunk: (chunk: string) => void;
 *   onDone?: () => void;
 *   intervalMs?: number;
 *   minChunk?: number;
 *   maxChunk?: number;
 * }} options
 * @returns {(() => void) & { pause(): void; resume(): void }}
 */
export function simulateStream(
  text,
  { onChunk, onDone, intervalMs = 35, minChunk = 1, maxChunk = 4 },
) {
  let i = 0;
  let paused = false;

  const id = setInterval(() => {
    if (paused) return;
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

  const stop = () => clearInterval(id);
  stop.pause = () => {
    paused = true;
  };
  stop.resume = () => {
    paused = false;
  };
  return stop;
}

// A line that could still grow into a fence delimiter (` ``` `/`~~~`,
// optionally followed by a language word) or inline code -- anything
// starting with a backtick or tilde.
const FENCE_CANDIDATE_LINE_RE = /^ {0,3}[`~]/;
// Bails out of holding a line back if it never gets a newline (so a
// legitimately long line starting with a backtick/tilde still streams).
const MAX_HELD_LINE_LENGTH = 80;

/**
 * Wraps a `simulateStream` `onChunk` callback so a line that could still be
 * a Markdown fence opener isn't flushed mid-marker before it's complete,
 * which would flash the raw syntax as plain text for a few frames before
 * `createFenceSplitter` recognizes the completed line as a fence. Complete
 * lines pass through immediately; a trailing, not-yet-terminated line is
 * held back only while it still looks like a fence/inline-code candidate,
 * and released whole once its newline arrives. Call `.flush()` once the
 * source stream ends, in case its very last line was held back.
 * @param {(chunk: string) => void} onFlush
 * @returns {((chunk: string) => void) & { flush(): void }}
 */
export function createFenceAwareAppender(onFlush) {
  /** @type {string} */
  let buffer = "";

  const release = () => {
    if (buffer === "") return;
    onFlush(buffer);
    buffer = "";
  };

  /** @param {string} chunk */
  const onChunk = (chunk) => {
    buffer += chunk;

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      onFlush(buffer.slice(0, newlineIndex + 1));
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf("\n");
    }

    if (
      buffer.length > MAX_HELD_LINE_LENGTH ||
      !FENCE_CANDIDATE_LINE_RE.test(buffer)
    ) {
      release();
    }
  };

  onChunk.flush = release;
  return onChunk;
}
