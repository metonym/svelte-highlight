import { createRegistry, registerAll } from "./engine.js";

export const registry = createRegistry();

/**
 * Registers `language` and any grammars it embeds via `subLanguage`.
 * @param {import("./languages").LanguageType<string>} language
 */
export function ensureRegistered(language) {
  registerAll(registry, language);
}
