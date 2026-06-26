/**
 * Dynamically load a single highlight.js grammar by name.
 *
 * Ergonomic, name-keyed wrapper over the per-language dynamic imports the
 * package already supports (`import("svelte-highlight/languages/<name>")`).
 * Use this when the language is only known at runtime (e.g. from a markdown
 * fence, an API field, or a user selection). When the language is known at
 * author time, prefer a static `import`/`await import` so the bundler can ship
 * only the grammars you reference.
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
