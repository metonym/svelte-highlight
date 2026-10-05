/**
 * HighlightStream's final pass once `done`: one full, canonicalizing
 * re-parse of everything fed so far, for the multi-line lookahead
 * (heredocs, etc.) the streaming parse can't resolve.
 *
 * The result is memoized on the fed code and language. The done pass can
 * re-run with neither changed: MarkdownStream re-renders its keyed
 * `{#each segments}` block on every chunk and hands each fence's
 * HighlightStream its `language` object again, which Svelte's legacy-mode
 * equality always treats as changed. Without the memo, every closed fence
 * re-parsed its whole code on every chunk streamed after it -
 * bench/stream-final-highlight.bench.ts.
 */

/**
 * @typedef {import("./engine.d.ts").StreamSession} StreamSession
 */

/**
 * @returns {{
 *   highlight: (session: StreamSession, fedCode: string, language: string) => string,
 * }}
 */
export function createFinalHighlighter() {
  /** @type {string | undefined} */
  let lastCode;
  /** @type {string | undefined} */
  let lastLanguage;
  let lastHtml = "";

  return {
    /**
     * @param {StreamSession} session Fed exactly `fedCode`.
     * @param {string} fedCode
     * @param {string} language
     * @returns {string}
     */
    highlight(session, fedCode, language) {
      // `finish({ canonicalize: true })` is a pure function of the fed code
      // and language - it re-parses from scratch and leaves the session
      // untouched - so an unchanged pair can reuse the last result.
      if (fedCode !== lastCode || language !== lastLanguage) {
        lastHtml = session.finish({ canonicalize: true }).value;
        lastCode = fedCode;
        lastLanguage = language;
      }
      return lastHtml;
    },
  };
}
