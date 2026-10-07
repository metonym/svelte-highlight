// Wraps any import() failure (typo or failed chunk fetch): validating names
// up front would require importing the whole grammar catalog.
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
