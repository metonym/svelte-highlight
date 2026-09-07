/**
 * The staged-tail preview computation for HighlightStream: the current,
 * not-yet-newline-terminated line. Extracted from HighlightStream.svelte so
 * it can be benchmarked and unit-tested directly, and so the O(chunk)
 * checkpointing added on top of it has somewhere to live that isn't the
 * component itself.
 */
import { extendLines } from "./engine.js";

/**
 * @typedef {import("./engine.d.ts").Registry} Registry
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 */

/**
 * @param {{
 *   registry: Registry,
 *   language: string,
 *   session: StreamSession,
 *   fedCode: string,
 *   openScopes: string[],
 *   pendingHtml: string,
 *   cache: undefined,
 * }} params
 * @returns {{ previewLines: string[], cache: undefined }}
 */
export function computeStagedTailPreview({
  registry,
  language,
  session,
  fedCode,
  openScopes,
  pendingHtml,
}) {
  const snapshot = session.snapshot();
  if (snapshot.pos >= fedCode.length) {
    return { previewLines: [pendingHtml], cache: undefined };
  }

  const preview = registry.resume(fedCode, language, snapshot);
  const result = extendLines(preview.events, openScopes, pendingHtml);
  return {
    previewLines: [...result.completedLines, result.pendingHtml],
    cache: undefined,
  };
}
