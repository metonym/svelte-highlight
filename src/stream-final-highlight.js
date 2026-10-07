/**
 * HighlightStream's `done` pass: a full re-parse for multi-line lookahead
 * (heredocs, etc.) the streaming parse can't resolve. Memoized: the pass
 * re-runs whenever a parent re-passes the same `language` object, since
 * Svelte's legacy equality treats objects as always changed.
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
      if (code !== lastCode || language !== lastLanguage) {
        lastHtml = registry.highlight(code, { language }).value;
        lastCode = code;
        lastLanguage = language;
      }
      return lastHtml;
    },
  };
}
