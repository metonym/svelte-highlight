import type { LanguageName, LanguageType } from "./languages";

/**
 * Load a highlight.js grammar by name at runtime.
 * Prefer a static import when the language is known up front.
 */
export declare function loadLanguage(
  name: LanguageName,
): Promise<LanguageType<string>>;
