/**
 * The staged-tail preview computation for HighlightStream: the current,
 * not-yet-newline-terminated line.
 *
 * The naive approach - resume tokenizing from the last completed newline on
 * every call - is O(line length) per call, O(n^2) over a stream with no
 * newline for a long stretch (streamed single-line JSON, minified code, a
 * long log line). Instead this keeps a mid-line checkpoint in `cache`: a
 * tokenizer snapshot at the end of the previously fed text, plus the
 * `extendLines` state (`openScopes`/`pendingHtml`) that snapshot corresponds
 * to. On a pure append that hasn't crossed a newline since the checkpoint was
 * taken, tokenizing resumes from there instead of from the newline, so each
 * call only does work proportional to the newly appended chunk.
 */
import { extendLines } from "./engine.js";

/**
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 * @typedef {import("./engine.d.ts").Snapshot} Snapshot
 */

/**
 * A grammar rule's `begin` match can depend on a lookahead assertion (e.g.
 * JSON's attr-vs-string distinction: `"key"` is only `attr` if a `:`
 * follows). Resolved with too little text visible, that decision can't be
 * revised later just by resuming past it - the tokenizer has already
 * committed to a scope. So the trailing `LOOKAHEAD_MARGIN` characters of
 * every checkpoint are always re-tokenized from the last safe position
 * instead of trusted outright, giving any such lookahead room to resolve
 * with more context before its result is cached. Comfortably larger than
 * any lookahead distance used by this engine's shipped grammars (a key name
 * plus separator whitespace, a heredoc marker, etc.); pathological content
 * exceeding it (e.g. hundreds of spaces before a JSON `:`) could still see a
 * stale preview classification until the line completes.
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

  // Valid only for a pure append since the checkpoint: the committed session
  // must not have advanced (no newline completed, so openScopes/pendingHtml
  // - the checkpoint's base state - are still current) and `fedCode` must
  // still start with the code the checkpoint was taken against.
  const canResume =
    cache !== undefined &&
    cache.committedPos === snapshot.pos &&
    fedCode.startsWith(cache.fedCode);

  const baseSnapshot = canResume ? cache.snapshot : snapshot;
  const baseOpenScopes = canResume ? cache.openScopes : openScopes;
  const basePendingHtml = canResume ? cache.pendingHtml : pendingHtml;

  // A fresh session resumed from the base checkpoint - the tokenizer work
  // here is O(chunk + LOOKAHEAD_MARGIN), not O(line length), since
  // `baseSnapshot` already covers everything up to the last checkpoint.
  const previewSession = registry.createSession(language, {
    from: { code: fedCode, snapshot: baseSnapshot },
  });

  // Advance only up to the safe boundary and cache *that* checkpoint - not
  // fedCode.length - so a lookahead-dependent match in the trailing margin
  // gets re-decided (with more of the line visible) on every later call
  // instead of being locked in early.
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

  // Continue through the margin to fedCode.length for display.
  previewSession.advance(fedCode.length);
  const tailEvents = previewSession.events().slice(safeEvents.length);
  const tail = extendLines(tailEvents, safe.openScopes, safe.pendingHtml);

  // Force-close any scopes still open at the end of the line, for display -
  // mirrors what a from-scratch highlight of the same prefix would show.
  // Not cached: closing is only valid at the current end of text, not at a
  // future checkpoint once more text has streamed in.
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
