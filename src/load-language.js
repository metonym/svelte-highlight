/**
 * Thrown by `loadLanguage` when `name` cannot be resolved to a shipped
 * grammar module. Catchable via `instanceof` regardless of how the
 * underlying dynamic `import()` failure is reported by the bundler.
 *
 * This still fires for *any* `import()` failure — a real typo, or a
 * network-fetched chunk failing — not only a genuine unknown name; it
 * doesn't validate `name` against the known-language list first, since
 * that would require importing the full 279-grammar catalog, defeating
 * the point of `loadLanguage`. What it provides: a stable,
 * `instanceof`-checkable type across bundlers, a `.language` field, and
 * the original failure on `.cause`.
 */
export class LanguageLoadError extends Error {
  /**
   * @param {string} name
   * @param {ErrorOptions} [options]
   */
  constructor(name, options) {
    super(`Unknown language: "${name}"`, options);
    this.name = "LanguageLoadError";
    this.language = name;
  }
}

/**
 * Load a highlight.js grammar by name at runtime.
 * Prefer a static import when the language is known up front.
 *
 * @param {import("./languages").LanguageName} name
 * @returns {Promise<import("./languages").LanguageType<string>>}
 */
export async function loadLanguage(name) {
  try {
    const module = await import(`./languages/${name}.js`);
    return module.default;
  } catch (cause) {
    throw new LanguageLoadError(name, { cause });
  }
}
