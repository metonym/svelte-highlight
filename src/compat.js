/**
 * Runtime adapter for user-authored hljs-format grammars (`(hljs) => modeObject`).
 * Not in the core bundle: importing this pulls in highlight.js/lib/core (a peer
 * dependency you install yourself).
 *
 * Uses the same converter as scripts/convert-grammars.ts (convert-language.js),
 * against a fresh hljs instance instead of the build-time one.
 */
import { convertLanguage } from "./convert-language.js";

/** @typedef {import("./languages").LanguageType<string>} LanguageType */

/** @type {unknown} */
let hljs;

/**
 * @param {string} name
 * @param {(hljs: unknown) => object} languageFn hljs's `register(hljs)`
 *   shape: returns the grammar's root mode object.
 * @param {string} [source] raw source text of the grammar's own file (e.g.
 *   via a bundler's `?raw` import); recovers array-membership `on:begin`
 *   guards that the compiled callback alone can't expose.
 * @returns {Promise<LanguageType & { warnings: string[] }>} `warnings` lists
 *   hljs features with no IR equivalent; empty when the conversion is clean.
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
