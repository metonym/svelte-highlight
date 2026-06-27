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
    throw new Error(`Unknown language: "${name}"`, { cause });
  }
}
