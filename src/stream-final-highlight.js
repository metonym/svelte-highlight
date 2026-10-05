/**
 * HighlightStream's final pass once `done`: one full, canonicalizing
 * re-parse of everything fed so far, for the multi-line lookahead
 * (heredocs, etc.) the streaming parse can't resolve.
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
  return {
    /**
     * @param {StreamSession} session
     * @returns {string}
     */
    highlight(session) {
      return session.finish({ canonicalize: true }).value;
    },
  };
}
