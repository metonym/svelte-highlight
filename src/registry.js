import { createRegistry, registerAll } from "./engine.js";

/**
 * Shared engine registry: components register languages onto this one
 * instance on demand, same pattern as the shared `hljs.registerLanguage`
 * singleton it replaces.
 */
export const registry = createRegistry();

/**
 * Registers `language` (and any grammars it embeds via `subLanguage`, e.g.
 * astro's html/typescript/css/javascript) on the shared registry.
 * @param {import("./languages").LanguageType<string>} language
 */
export function ensureRegistered(language) {
  registerAll(registry, language);
}
