/**
 * HighlightStream's preview of the current, unterminated line. `cache` holds a
 * mid-line checkpoint so a long newline-free stream (single-line JSON,
 * minified code) costs O(chunk) per call instead of O(line length).
 */
import { extendLines } from "./engine.js";

/**
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 */

/**
 * Trailing characters re-tokenized on every call rather than checkpointed, so
 * lookahead-dependent matches (JSON `"key"` is `attr` only if `:` follows)
 * aren't locked in before enough text arrives. Lookahead beyond this can show
 * a stale preview until the line completes.
 */
const LOOKAHEAD_MARGIN = 256;

/**
 * @typedef {{
 *   fedCode: string,
 *   committedPos: number,
 *   snapshot: Snapshot,
 *   openScopes: string[],
 *   pendingHtml: string,
 * }} PreviewCache
 */

/**
 * @param {{
 *   registry: Registry,
 *   language: string,
 *   session: StreamSession,
 *   fedCode: string,
 *   openScopes: string[],
 *   pendingHtml: string,
 *   cache: PreviewCache | undefined,
 * }} params
 * @returns {{ previewLines: string[], cache: PreviewCache | undefined }}
 */
export function computeStagedTailPreview({
  registry,
  language,
  session,
  fedCode,
  openScopes,
  pendingHtml,
  cache,
}) {
  const snapshot = session.snapshot();
  if (snapshot.pos >= fedCode.length) {
    return { previewLines: [pendingHtml], cache: undefined };
  }

  // Valid only for a pure append with no newline committed since. Compare
  // only past the committed position: a whole-buffer compare is O(stream).
  const canResume =
    cache !== undefined &&
    cache.committedPos === snapshot.pos &&
    fedCode.length >= cache.fedCode.length &&
    fedCode.startsWith(cache.fedCode.slice(snapshot.pos), snapshot.pos);

  const baseSnapshot = canResume ? cache.snapshot : snapshot;
  const baseOpenScopes = canResume ? cache.openScopes : openScopes;
  const basePendingHtml = canResume ? cache.pendingHtml : pendingHtml;

  const previewSession = registry.createSession(language, {
    from: { code: fedCode, snapshot: baseSnapshot },
  });

  // Checkpoint at the safe boundary, not fedCode.length (see LOOKAHEAD_MARGIN).
  const safeBoundary = Math.max(
    baseSnapshot.pos,
    fedCode.length - LOOKAHEAD_MARGIN,
  );
  previewSession.advance(safeBoundary);
  // Copy before further advance()/finish() calls append to this same array.
  const safeEvents = previewSession.events().slice();
  const safe = extendLines(safeEvents, baseOpenScopes, basePendingHtml);

  const nextCache = {
    fedCode,
    committedPos: snapshot.pos,
    snapshot: previewSession.snapshot(),
    openScopes: safe.openScopes,
    pendingHtml: safe.pendingHtml,
  };

  previewSession.advance(fedCode.length);
  const tailEvents = previewSession.events().slice(safeEvents.length);
  const tail = extendLines(tailEvents, safe.openScopes, safe.pendingHtml);

  // Close open scopes for display only; not cached, since it's valid only at
  // the current end of text.
  const closed = previewSession.finish({ canonicalize: false });
  const closingEvents = closed.events.slice(
    safeEvents.length + tailEvents.length,
  );
  const result = extendLines(closingEvents, tail.openScopes, tail.pendingHtml);

  return {
    previewLines: [
      ...safe.completedLines,
      ...tail.completedLines,
      ...result.completedLines,
      result.pendingHtml,
    ],
    cache: nextCache,
  };
}
