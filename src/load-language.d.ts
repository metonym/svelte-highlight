import type { LanguageName, LanguageType } from "./languages";

/**
 * Thrown by `loadLanguage` for any grammar `import()` failure (unknown name
 * or failed chunk fetch). The original error is on `.cause`.
 */
export declare class LanguageLoadError extends Error {
  language: string;
  constructor(name: string, options?: ErrorOptions);
}

/**
 * Loads a grammar by name at runtime. Prefer a static import when the
 * language is known up front.
 */
export declare function loadLanguage(
  name: LanguageName,
): Promise<LanguageType<string>>;
