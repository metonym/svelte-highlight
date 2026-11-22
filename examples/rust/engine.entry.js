// Bundled into dist/engine.js for QuickJS: the engine and every grammar,
// behind a small global API that passes JSON strings across.

import { createRegistry, registerAll } from "svelte-highlight/engine";
import languages from "svelte-highlight/languages/all";

const registry = createRegistry();
for (const language of languages) registerAll(registry, language);

globalThis.svelteHighlight = {
  /** @param {string} code @param {string} language */
  tokenize: (code, language) =>
    JSON.stringify(registry.tokenize(code, language).events),
  /** @param {string} code */
  detect(code) {
    const { language, relevance, events } = registry.tokenizeAuto(code);
    return JSON.stringify({ language: language ?? null, relevance, events });
  },
  /** @param {string} code @param {string} language */
  html: (code, language) => registry.highlight(code, { language }).value,
};
