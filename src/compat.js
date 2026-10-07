// Not in the core bundle: imports highlight.js/lib/core (a peer dependency).
import { convertLanguage } from "./convert-language.js";

/** @typedef {import("./languages").LanguageType<string>} LanguageType */

/** @type {unknown} */
let hljs;

/**
 * @param {string} name
 * @param {(hljs: unknown) => object} languageFn
 * @param {string} [source]
 * @returns {Promise<LanguageType & { warnings: string[] }>}
 */
export async function fromHighlightJs(name, languageFn, source) {
  if (!hljs) {
    const { default: coreFactory } = await import("highlight.js/lib/core");
    hljs = coreFactory.newInstance();
  }
  const hl =
    /** @type {{ registerLanguage: (name: string, fn: unknown) => void }} */ (
      hljs
    );
  hl.registerLanguage(name, languageFn);
  const { ir, warnings } = convertLanguage(hljs, name, source);
  if (warnings.length > 0 && typeof console !== "undefined") {
    console.warn(
      `[svelte-highlight/compat] "${name}" uses hljs features with no declarative IR equivalent yet, and may not highlight identically to real hljs:\n${warnings.map((w) => `  - ${w}`).join("\n")}`,
    );
  }
  /** @type {LanguageType & { warnings: string[] }} */
  const language = { name: ir.name, register: ir, warnings };
  if (ir.aliases) language.aliases = ir.aliases;
  return language;
}
