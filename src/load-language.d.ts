import type { LanguageName, LanguageType } from "./languages";

/**
 * Dynamically load a single highlight.js grammar by name.
 *
 * Use when the language is only known at runtime. When it is known at author
 * time, prefer a static import so the bundler can prune unused grammars.
 */
export declare function loadLanguage(
  name: LanguageName,
): Promise<LanguageType<string>>;
