/**
 * HighlightStream's final pass once `done`: one full, canonicalizing
 * re-parse of the whole buffer, for the multi-line lookahead (heredocs,
 * etc.) the streaming parse can't resolve.
 *
 * It's a one-shot `registry.highlight` - exactly what
 * `session.finish({ canonicalize: true })` runs - so it needs no session.
 * HighlightStream drops its streaming session once the pass is done, and a
 * repeat pass doesn't build a new one.
 *
 * The result is memoized on the code and language. The done pass can
 * re-run with neither changed (a parent re-renders and hands over its
 * `language` object again, which Svelte's legacy-mode equality always
 * treats as changed). Without the memo, each re-run re-parsed the whole
 * code - bench/stream-final-highlight.bench.ts.
 */

/**
 * @typedef {{ highlight: (code: string, options: { language: string }) => { value: string } }} FinalRegistry
 */

/**
 * @returns {{
 *   highlight: (registry: FinalRegistry, code: string, language: string) => string,
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
     * @param {FinalRegistry} registry Has `language` registered.
     * @param {string} code
     * @param {string} language
     * @returns {string}
     */
    highlight(registry, code, language) {
      // A pure function of the code and language, so an unchanged pair can
      // reuse the last result.
      if (code !== lastCode || language !== lastLanguage) {
        lastHtml = registry.highlight(code, { language }).value;
        lastCode = code;
        lastLanguage = language;
      }
      return lastHtml;
    },
  };
}
