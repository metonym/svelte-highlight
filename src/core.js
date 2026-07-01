import hljs from "highlight.js/lib/core";

/**
 * Register a highlight.js language if it hasn't been registered yet.
 * @param {import("./languages").LanguageType<string>} language
 */
export function registerLanguage(language) {
  if (!hljs.getLanguage(language.name)) {
    hljs.registerLanguage(language.name, language.register);
  }
}

/**
 * Register (if needed) and highlight `code` with the given language.
 * @param {import("./languages").LanguageType<string>} language
 * @param {any} code
 * @returns {string}
 */
export function highlightLanguage(language, code) {
  registerLanguage(language);
  return hljs.highlight(code, { language: language.name }).value;
}
